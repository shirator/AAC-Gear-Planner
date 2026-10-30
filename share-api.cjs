const P=require('./core.js'),C=require('./calculator.js');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
try{if(fs.existsSync(path.join(__dirname,'.env')))process.loadEnvFile?.(path.join(__dirname,'.env'));}catch{}
const db=Object.fromEntries(['items','buffs','skills'].map(k=>[k,JSON.parse(fs.readFileSync(path.join(__dirname,'data',k+'.json')))]));
const rules=JSON.parse(fs.readFileSync(path.join(__dirname,'data/rules.json')));
function reply(res,status,body,extraHeaders={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extraHeaders});res.end(JSON.stringify(body));}
function parseCookies(req){const out={};for(const part of (req.headers.cookie||'').split(';')){const idx=part.indexOf('=');if(idx>0)out[part.slice(0,idx).trim()]=decodeURIComponent(part.slice(idx+1).trim());}return out;}
function sessionSecret(){return process.env.SESSION_SECRET||process.env.DISCORD_CLIENT_SECRET||'aac-local-dev-session-secret-key';}
function signToken(payload){const data=Buffer.from(JSON.stringify(payload)).toString('base64url');const sig=crypto.createHmac('sha256',sessionSecret()).update(data).digest('base64url');return data+'.'+sig;}
function verifyToken(token){if(!token||typeof token!=='string')return null;const [data,sig]=token.split('.');if(!data||!sig)return null;const expected=crypto.createHmac('sha256',sessionSecret()).update(data).digest('base64url');try{if(!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;const payload=JSON.parse(Buffer.from(data,'base64url').toString('utf8'));if(!payload.exp||Date.now()>payload.exp)return null;return payload;}catch{return null;}}
function isSecureReq(req){return req.headers['x-forwarded-proto']==='https'||Boolean(req.socket?.encrypted);}
function reqOrigin(req){const proto=isSecureReq(req)?'https':'http';return `${proto}://${req.headers.host||'localhost:3000'}`;}
function isLocalhostReq(req){const host=(req.headers.host||'').split(':')[0];return host==='localhost'||host==='127.0.0.1';}
function discordConfigured(){return Boolean(process.env.DISCORD_CLIENT_ID&&process.env.DISCORD_CLIENT_SECRET);}
function checkSameOrigin(req,res){if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host){reply(res,403,{error:'Invalid request origin.'});return false;}}catch{reply(res,403,{error:'Invalid request origin.'});return false;}}return true;}
async function readJsonBody(req,res){if(!req.headers['content-type']?.startsWith('application/json')){reply(res,415,{error:'Expected JSON.'});return null;}let size=0,chunks=[];try{for await(const chunk of req){size+=chunk.length;if(size>100000){reply(res,413,{error:'Build is too large.'});return null;}chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{reply(res,400,{error:'Invalid JSON payload.'});return null;}}
function formatUserBuild(row){const validated=P.validate(row.build,db,rules);return {id:row.id,name:row.name||validated.name||'Unnamed build',classes:validated.classes||[],equipmentPoints:C.equipmentScore(validated,db.items,rules).total,build:validated,createdAt:row.createdAt,updatedAt:row.updatedAt};}

function sharingHandler(options={}){
 let storePromise;
 const getStore=()=>storePromise??=options.buildStore?Promise.resolve(options.buildStore):require('./build-store.cjs').configuredStore();
 const limits=new Map();let saves=0,start=Date.now();
 const handle=async(req,res,url)=>{
  const route=url.pathname;
  if(route.startsWith('/api/auth/')){
   const cookies=parseCookies(req);
   const user=verifyToken(cookies.aac_session);
   if(route==='/api/auth/me'&&req.method==='GET'){
    reply(res,200,{authenticated:Boolean(user),configured:discordConfigured(),isLocalhost:isLocalhostReq(req),user:user?{id:user.id,username:user.username,displayName:user.displayName,avatarUrl:user.avatarUrl}:null});
    return true;
   }
   if(route==='/api/auth/logout'&&req.method==='POST'){
    if(!checkSameOrigin(req,res))return true;
    reply(res,200,{ok:true},{'Set-Cookie':'aac_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'});
    return true;
   }
   if(route==='/api/auth/discord'&&req.method==='GET'){
    if(!discordConfigured()){
     if(isLocalhostReq(req)&&url.searchParams.get('dev')==='1'){
      const token=signToken({id:'local-discord-preview',username:'local_adventurer',displayName:'Local Discord Account',avatarUrl:null,exp:Date.now()+30*86400000});
      res.writeHead(302,{'Location':'/?tab=builds','Set-Cookie':`aac_session=${encodeURIComponent(token)}; Path=/; Max-Age=${30*86400}; HttpOnly; SameSite=Lax`});
      res.end();return true;
     }
     reply(res,503,{error:'Discord OAuth is not configured yet. Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in .env or Render Environment.'});
     return true;
    }
    const state=crypto.randomBytes(16).toString('hex');
    const redirectUri=process.env.DISCORD_REDIRECT_URI||`${reqOrigin(req)}/api/auth/discord/callback`;
    const authUrl=new URL('https://discord.com/oauth2/authorize');
    authUrl.searchParams.set('client_id',process.env.DISCORD_CLIENT_ID);
    authUrl.searchParams.set('response_type','code');
    authUrl.searchParams.set('redirect_uri',redirectUri);
    authUrl.searchParams.set('scope','identify');
    authUrl.searchParams.set('state',state);
    authUrl.searchParams.set('prompt','none');
    const secure=isSecureReq(req)?'; Secure':'';
    res.writeHead(302,{'Location':authUrl.href,'Set-Cookie':`aac_oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; SameSite=Lax${secure}`});
    res.end();return true;
   }
   if(route==='/api/auth/discord/callback'&&req.method==='GET'){
    const code=url.searchParams.get('code'),state=url.searchParams.get('state');
    if(!code||!state||state!==cookies.aac_oauth_state||!discordConfigured()){
     res.writeHead(302,{'Location':'/?auth_error=invalid_state'});res.end();return true;
    }
    try{
     const redirectUri=process.env.DISCORD_REDIRECT_URI||`${reqOrigin(req)}/api/auth/discord/callback`;
     const body=new URLSearchParams({client_id:process.env.DISCORD_CLIENT_ID,client_secret:process.env.DISCORD_CLIENT_SECRET,grant_type:'authorization_code',code,redirect_uri:redirectUri});
     const tokenRes=await fetch('https://discord.com/api/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,signal:AbortSignal.timeout(12000)});
     if(!tokenRes.ok)throw Error('Token exchange failed');
     const tokenData=await tokenRes.json();
     const userRes=await fetch('https://discord.com/api/users/@me',{headers:{'Authorization':`Bearer ${tokenData.access_token}`},signal:AbortSignal.timeout(12000)});
     if(!userRes.ok)throw Error('Discord profile fetch failed');
     const profile=await userRes.json();
     const avatarUrl=profile.avatar?`https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=64`:null;
     const session=signToken({id:String(profile.id),username:profile.username,displayName:profile.global_name||profile.username,avatarUrl,exp:Date.now()+30*86400000});
     const secure=isSecureReq(req)?'; Secure':'';
     res.writeHead(302,{'Location':'/?tab=builds','Set-Cookie':[`aac_session=${encodeURIComponent(session)}; Path=/; Max-Age=${30*86400}; HttpOnly; SameSite=Lax${secure}`,`aac_oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`]});
     res.end();return true;
    }catch{
     res.writeHead(302,{'Location':'/?auth_error=discord_failed'});res.end();return true;
    }
   }
   reply(res,404,{error:'Auth endpoint not found.'});return true;
  }

  if(route==='/api/my-builds'||route.startsWith('/api/my-builds/')){
   const user=verifyToken(parseCookies(req).aac_session);
   if(!user){reply(res,401,{error:'Sign in with Discord to manage account builds.'});return true;}
   const idMatch=route.match(/^\/api\/my-builds\/([A-Za-z0-9]{6,12})$/);
   if(route==='/api/my-builds'&&req.method==='GET'){
    try{
     const store=await getStore();
     const rows=await store.listUserBuilds(user.id);
     reply(res,200,{builds:rows.map(formatUserBuild)});
    }catch{reply(res,503,{error:'Could not load account builds.'});}
    return true;
   }
   if(route==='/api/my-builds'&&req.method==='POST'){
    if(!checkSameOrigin(req,res))return true;
    const payload=await readJsonBody(req,res);if(!payload)return true;
    let build;try{build=P.validate(payload.build,db,rules);}catch{reply(res,400,{error:'Invalid build data.'});return true;}
    try{
     const saved=await(await getStore()).saveUserBuild(user.id,build,null);
     reply(res,201,{build:formatUserBuild(saved)});
    }catch(e){reply(res,400,{error:e.message||'Could not save build.'});}
    return true;
   }
   if(idMatch&&req.method==='PUT'){
    if(!checkSameOrigin(req,res))return true;
    const payload=await readJsonBody(req,res);if(!payload)return true;
    let build;try{build=P.validate(payload.build,db,rules);}catch{reply(res,400,{error:'Invalid build data.'});return true;}
    try{
     const saved=await(await getStore()).saveUserBuild(user.id,build,idMatch[1]);
     reply(res,200,{build:formatUserBuild(saved)});
    }catch(e){reply(res,404,{error:e.message||'Saved build not found.'});}
    return true;
   }
   if(idMatch&&req.method==='DELETE'){
    if(!checkSameOrigin(req,res))return true;
    try{
     const deleted=await(await getStore()).deleteUserBuild(user.id,idMatch[1]);
     if(!deleted){reply(res,404,{error:'Saved build not found.'});return true;}
     reply(res,200,{ok:true});
    }catch{reply(res,503,{error:'Could not delete saved build.'});}
    return true;
   }
   reply(res,405,{error:'Method not allowed.'});return true;
  }

  if(!route.startsWith('/api/builds'))return false;
  const match=route.match(/^\/api\/builds\/([A-Za-z0-9]{6})$/);const recent=route==='/api/builds/recent';if(route!=='/api/builds'&&!match&&!recent){reply(res,404,{error:'Build not found.'});return true;}
  const method=req.method;if(((match||recent)&&method!=='GET')||(!match&&!recent&&method!=='POST')){reply(res,405,{error:'Method not allowed.'});return true;}
  const now=Date.now();if(now-start>=3600000){saves=0;start=now;limits.clear();}const ip=req.socket.remoteAddress||'unknown';const bucket=limits.get(ip)||{reads:0,saves:0};limits.set(ip,bucket);
  if(++bucket.reads>1200||(!match&&!recent&&(++bucket.saves>60||++saves>1000))){reply(res,429,{error:'Too many requests. Try again later.'});return true;}
  if(recent){const offset=Number(url.searchParams.get('offset')||0);if(!Number.isSafeInteger(offset)||offset<0||offset>10000){reply(res,400,{error:'Invalid page.'});return true;}try{const rows=await(await getStore()).recent(11,offset);reply(res,200,{hasMore:rows.length>10,builds:rows.slice(0,10).map(row=>({id:row.id,name:row.build.name||'Unnamed build',classes:row.build.classes||[],equipmentPoints:C.equipmentScore(row.build,db.items,rules).total,createdAt:row.created_at}))});}catch{reply(res,503,{error:'Recent builds are unavailable.'});}return true;}
  if(match){try{const saved=await(await getStore()).get(match[1]);if(!saved){reply(res,404,{error:'This build link was not found.'});return true;}reply(res,200,{id:match[1],build:P.validate(saved,db,rules)});}catch{reply(res,503,{error:'Build storage is unavailable. Try again later.'});}return true;}
  if(!checkSameOrigin(req,res))return true;
  const payload=await readJsonBody(req,res);if(!payload)return true;
  let build;try{build=P.validate(payload.build,db,rules);}catch{reply(res,400,{error:'Invalid build data.'});return true;}
  try{const id=await(await getStore()).save(build);reply(res,201,{id});}catch{reply(res,503,{error:'Build storage is unavailable. Use the backup code or configure DATABASE_URL.'});}return true;
 };
 handle.close=async()=>{if(storePromise){try{await(await storePromise).close();}catch{}}};
 return handle;
}
module.exports={sharingHandler};
