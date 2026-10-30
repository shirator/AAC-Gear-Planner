const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const newId=(len=6)=>Array.from({length:len},()=>alphabet[crypto.randomInt(alphabet.length)]).join('');
function sqliteStore(file){
 const {DatabaseSync}=require('node:sqlite');
 fs.mkdirSync(path.dirname(file),{recursive:true});
 const db=new DatabaseSync(file);
 db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS shared_builds (id TEXT PRIMARY KEY, hash TEXT NOT NULL UNIQUE, build TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE TABLE IF NOT EXISTS user_builds (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL, build TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE INDEX IF NOT EXISTS idx_user_builds_user ON user_builds(user_id, updated_at DESC);');
 return {
  async save(build){
   const body=JSON.stringify(build),hash=crypto.createHash('sha256').update(body).digest('hex');
   const existing=db.prepare('SELECT id FROM shared_builds WHERE hash=?').get(hash);
   if(existing)return existing.id;
   for(let n=0;n<12;n++){
    const id=newId(6);
    const result=db.prepare('INSERT OR IGNORE INTO shared_builds(id,hash,build) VALUES(?,?,?)').run(id,hash,body);
    if(result.changes)return id;
    const duplicate=db.prepare('SELECT id FROM shared_builds WHERE hash=?').get(hash);
    if(duplicate)return duplicate.id;
   }
   throw Error('ID allocation failed');
  },
  async get(id){
   const row=db.prepare('SELECT build FROM shared_builds WHERE id=?').get(id);
   return row?JSON.parse(row.build):null;
  },
  async recent(limit=10,offset=0){
   return db.prepare('SELECT id,build,created_at FROM shared_builds ORDER BY created_at DESC,rowid DESC LIMIT ? OFFSET ?').all(limit,offset).map(row=>({...row,build:JSON.parse(row.build)}));
  },
  async listUserBuilds(userId){
   return db.prepare('SELECT id,name,build,created_at,updated_at FROM user_builds WHERE user_id=? ORDER BY updated_at DESC,rowid DESC LIMIT 50').all(String(userId)).map(row=>({id:row.id,name:row.name,build:JSON.parse(row.build),createdAt:row.created_at,updatedAt:row.updated_at}));
  },
  async saveUserBuild(userId,build,id=null){
   const uid=String(userId),name=String(build.name||'Unnamed build').slice(0,80),body=JSON.stringify({...build,name});
   if(id){
    const res=db.prepare("UPDATE user_builds SET name=?, build=?, updated_at=datetime('now') WHERE id=? AND user_id=?").run(name,body,String(id),uid);
    if(!res.changes)throw Error('Saved build not found.');
    const row=db.prepare('SELECT id,name,build,created_at,updated_at FROM user_builds WHERE id=? AND user_id=?').get(String(id),uid);
    return {id:row.id,name:row.name,build:JSON.parse(row.build),createdAt:row.created_at,updatedAt:row.updated_at};
   }
   const count=db.prepare('SELECT COUNT(*) AS c FROM user_builds WHERE user_id=?').get(uid)?.c||0;
   if(count>=50)throw Error('Limit of 50 saved builds reached. Delete an older build first.');
   for(let n=0;n<12;n++){
    const newBuildId=newId(8);
    const res=db.prepare('INSERT OR IGNORE INTO user_builds(id,user_id,name,build) VALUES(?,?,?,?)').run(newBuildId,uid,name,body);
    if(res.changes){
     const row=db.prepare('SELECT id,name,build,created_at,updated_at FROM user_builds WHERE id=?').get(newBuildId);
     return {id:row.id,name:row.name,build:JSON.parse(row.build),createdAt:row.created_at,updatedAt:row.updated_at};
    }
   }
   throw Error('ID allocation failed');
  },
  async deleteUserBuild(userId,id){
   const res=db.prepare('DELETE FROM user_builds WHERE id=? AND user_id=?').run(String(id),String(userId));
   return res.changes>0;
  },
  async close(){db.close();}
 };
}
async function postgresStore(connectionString){
 const {Pool}=require('pg');
 const url=new URL(connectionString);
 if(['require','prefer'].includes(url.searchParams.get('sslmode')))url.searchParams.set('sslmode','verify-full');
 const pool=new Pool({connectionString:url.href,max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:15000,statement_timeout:15000});
 pool.on('error',()=>console.error('Build database connection interrupted.'));
 try{
  await pool.query('CREATE TABLE IF NOT EXISTS shared_builds (id VARCHAR(6) PRIMARY KEY, hash CHAR(64) NOT NULL UNIQUE, build JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()); CREATE TABLE IF NOT EXISTS user_builds (id VARCHAR(12) PRIMARY KEY, user_id VARCHAR(64) NOT NULL, name VARCHAR(80) NOT NULL, build JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()); CREATE INDEX IF NOT EXISTS idx_user_builds_user ON user_builds(user_id, updated_at DESC);');
 }catch(e){await pool.end();throw e;}
 return {
  async save(build){
   const body=JSON.stringify(build),hash=crypto.createHash('sha256').update(body).digest('hex');
   const existing=await pool.query('SELECT id FROM shared_builds WHERE hash=$1',[hash]);
   if(existing.rows.length)return existing.rows[0].id;
   for(let n=0;n<12;n++){
    const id=newId(6),result=await pool.query('INSERT INTO shared_builds(id,hash,build) VALUES($1,$2,$3::jsonb) ON CONFLICT DO NOTHING RETURNING id',[id,hash,body]);
    if(result.rows.length)return result.rows[0].id;
    const duplicate=await pool.query('SELECT id FROM shared_builds WHERE hash=$1',[hash]);
    if(duplicate.rows.length)return duplicate.rows[0].id;
   }
   throw Error('ID allocation failed');
  },
  async get(id){
   const result=await pool.query('SELECT build FROM shared_builds WHERE id=$1',[id]);
   return result.rows[0]?.build||null;
  },
  async recent(limit=10,offset=0){
   const result=await pool.query('SELECT id,build,created_at FROM shared_builds ORDER BY created_at DESC,id DESC LIMIT $1 OFFSET $2',[limit,offset]);
   return result.rows;
  },
  async listUserBuilds(userId){
   const result=await pool.query('SELECT id,name,build,created_at,updated_at FROM user_builds WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 50',[String(userId)]);
   return result.rows.map(row=>({id:row.id,name:row.name,build:row.build,createdAt:row.created_at,updatedAt:row.updated_at}));
  },
  async saveUserBuild(userId,build,id=null){
   const uid=String(userId),name=String(build.name||'Unnamed build').slice(0,80),payload={...build,name},body=JSON.stringify(payload);
   if(id){
    const result=await pool.query('UPDATE user_builds SET name=$1, build=$2::jsonb, updated_at=NOW() WHERE id=$3 AND user_id=$4 RETURNING id,name,build,created_at,updated_at',[name,body,String(id),uid]);
    if(!result.rows.length)throw Error('Saved build not found.');
    const row=result.rows[0];
    return {id:row.id,name:row.name,build:row.build,createdAt:row.created_at,updatedAt:row.updated_at};
   }
   const countRes=await pool.query('SELECT COUNT(*)::int AS c FROM user_builds WHERE user_id=$1',[uid]);
   if((countRes.rows[0]?.c||0)>=50)throw Error('Limit of 50 saved builds reached. Delete an older build first.');
   for(let n=0;n<12;n++){
    const newBuildId=newId(8),result=await pool.query('INSERT INTO user_builds(id,user_id,name,build) VALUES($1,$2,$3,$4::jsonb) ON CONFLICT DO NOTHING RETURNING id,name,build,created_at,updated_at',[newBuildId,uid,name,body]);
    if(result.rows.length){
     const row=result.rows[0];
     return {id:row.id,name:row.name,build:row.build,createdAt:row.created_at,updatedAt:row.updated_at};
    }
   }
   throw Error('ID allocation failed');
  },
  async deleteUserBuild(userId,id){
   const result=await pool.query('DELETE FROM user_builds WHERE id=$1 AND user_id=$2',[String(id),String(userId)]);
   return result.rowCount>0;
  },
  async close(){await pool.end();}
 };
}
async function configuredStore(){if(process.env.DATABASE_URL)return postgresStore(process.env.DATABASE_URL);if(process.env.RENDER)throw Error('Configure DATABASE_URL for persistent sharing.');return sqliteStore(process.env.BUILD_DB_PATH||path.join(__dirname,'.local','builds.sqlite'));}
module.exports={sqliteStore,postgresStore,configuredStore};
