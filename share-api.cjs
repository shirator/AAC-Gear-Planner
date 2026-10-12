const P=require('./core.js');
const fs=require('node:fs'),path=require('node:path');
const db=Object.fromEntries(['items','buffs','skills'].map(k=>[k,JSON.parse(fs.readFileSync(path.join(__dirname,'data',k+'.json')))]));const rules=JSON.parse(fs.readFileSync(path.join(__dirname,'data/rules.json')));
function reply(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));}
function sharingHandler(options={}){let storePromise;const getStore=()=>storePromise??=options.buildStore?Promise.resolve(options.buildStore):require('./build-store.cjs').configuredStore();const limits=new Map();let saves=0,start=Date.now();
 const handle=async(req,res,url)=>{if(!url.pathname.startsWith('/api/builds'))return false;
 const route=url.pathname,match=route.match(/^\/api\/builds\/([A-Za-z0-9]{6})$/);if(route!=='/api/builds'&&!match){reply(res,404,{error:'Build not found.'});return true;}
 const method=req.method;if((match&&method!=='GET')||(!match&&method!=='POST')){reply(res,405,{error:'Method not allowed.'});return true;}
 const now=Date.now();if(now-start>=3600000){saves=0;start=now;limits.clear();}const ip=req.socket.remoteAddress||'unknown';const bucket=limits.get(ip)||{reads:0,saves:0};limits.set(ip,bucket);
 if(++bucket.reads>1200||(!match&&(++bucket.saves>60||++saves>1000))){reply(res,429,{error:'Too many requests. Try again later.'});return true;}
 if(match){try{const saved=await(await getStore()).get(match[1]);if(!saved){reply(res,404,{error:'This build link was not found.'});return true;}reply(res,200,{id:match[1],build:P.validate(saved,db,rules)});}catch{reply(res,503,{error:'Build storage is unavailable. Try again later.'});}return true;}
 if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host){reply(res,403,{error:'Invalid request origin.'});return true;}}catch{reply(res,403,{error:'Invalid request origin.'});return true;}}
 if(!req.headers['content-type']?.startsWith('application/json')){reply(res,415,{error:'Expected JSON.'});return true;}
 let size=0,chunks=[];try{for await(const chunk of req){size+=chunk.length;if(size>100000){reply(res,413,{error:'Build is too large.'});return true;}chunks.push(chunk);}}catch{reply(res,400,{error:'Invalid request.'});return true;}
 let build;try{build=P.validate(JSON.parse(Buffer.concat(chunks).toString('utf8')).build,db,rules);}catch{reply(res,400,{error:'Invalid build data.'});return true;}
 try{const id=await(await getStore()).save(build);reply(res,201,{id});}catch{reply(res,503,{error:'Build storage is unavailable. Use the backup code or configure DATABASE_URL.'});}return true;
 };handle.close=async()=>{if(storePromise){try{await(await storePromise).close();}catch{}}};return handle;
}
module.exports={sharingHandler};
