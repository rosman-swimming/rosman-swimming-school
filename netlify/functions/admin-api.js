const crypto=require('node:crypto');
const REPO='rosman-swimming/rosman-swimming-school';
// Production edits main; the isolated test site edits its own deployed branch.
function contentBranch(event){const host=(event.headers.host||'').toLowerCase();if(host==='rosman-swim-test.netlify.app')return 'custom-admin';if(host==='rosman-swim.netlify.app')return 'main';return null}
const USERNAME='gilrosman';
function sessionKey(){return crypto.createHash('sha256').update('rosman-session-v1:').update(env('ADMIN_PASSWORD')).digest()}
// Netlify-managed edge throttling: applies across function instances, unlike an in-memory counter.
exports.config={path:'/.netlify/functions/admin-api',rateLimit:{windowLimit:20,windowSize:60,aggregateBy:['ip','domain']}};
function json(status,data,headers={}){return {statusCode:status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...headers},body:JSON.stringify(data)}}
function env(key){return process.env[key]||''}
function sameOrigin(event){const origin=event.headers.origin;const host=event.headers.host||event.headers['x-forwarded-host'];try{return !!origin&&!!host&&new URL(origin).host===host&&new URL(origin).protocol==='https:'}catch{return false}}
function makeSession(){const payload=Buffer.from(JSON.stringify({exp:Date.now()+8*3600*1000,nonce:crypto.randomBytes(16).toString('hex')})).toString('base64url');const sig=crypto.createHmac('sha256',sessionKey()).update(payload).digest('base64url');return payload+'.'+sig}
function authorized(event){const cookie=(event.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('rosman_session='));if(!cookie||!env('ADMIN_PASSWORD'))return false;const token=cookie.slice(15),parts=token.split('.');if(parts.length!==2)return false;const s=crypto.createHmac('sha256',sessionKey()).update(parts[0]).digest('base64url');const a=Buffer.from(s),b=Buffer.from(parts[1]);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return false;try{return JSON.parse(Buffer.from(parts[0],'base64url')).exp>Date.now()}catch{return false}}
function validatePassword(p){const secret=env('ADMIN_PASSWORD');if(!secret)return false;const a=crypto.createHash('sha256').update(p).digest(),b=crypto.createHash('sha256').update(secret).digest();return crypto.timingSafeEqual(a,b)}
function config(){return env('ADMIN_PASSWORD').length>=8&&!!env('GITHUB_WRITE_TOKEN')}
async function github(path,method='GET',data){const url='https://api.github.com/repos/'+REPO+'/contents/'+path;const r=await fetch(url,{method,headers:{authorization:'Bearer '+env('GITHUB_WRITE_TOKEN'),accept:'application/vnd.github+json','x-github-api-version':'2022-11-28','content-type':'application/json','user-agent':'rosman-site-admin'},body:data?JSON.stringify(data):undefined});if(!r.ok)throw new Error('GitHub error '+r.status);return r.json()}
exports.handler=async event=>{try{
if(!config()){const missing=[];if(!env('ADMIN_PASSWORD'))missing.push('ADMIN_PASSWORD חסר');else if(env('ADMIN_PASSWORD').length<8)missing.push('ADMIN_PASSWORD קצר מ־8 תווים');if(!env('GITHUB_WRITE_TOKEN'))missing.push('GITHUB_WRITE_TOKEN חסר');return json(503,{error:'הגדרת הניהול אינה מלאה',details:missing.join('; ')}); }
if((event.body||'').length>25000)return json(413,{error:'הבקשה ארוכה מדי'});
if(event.httpMethod==='POST'&&!sameOrigin(event))return json(403,{error:'בקשה לא מורשית'});
const CONTENT_BRANCH=contentBranch(event);if(!CONTENT_BRANCH)return json(403,{error:'כתובת אתר לא מאושרת לניהול'});
const action=(event.queryStringParameters||{}).action;
if(action==='login'&&event.httpMethod==='POST'){
const b=JSON.parse(event.body||'{}');
const username=typeof b.username==='string'?b.username:'',pass=typeof b.password==='string'?b.password:'';
if(username.length>100||pass.length>1024)return json(400,{error:'פרטי התחברות ארוכים מדי'});
const a=Buffer.from(username),c=Buffer.from(USERNAME);const ok=a.length===c.length&&crypto.timingSafeEqual(a,c)&&validatePassword(pass);
if(!ok)return json(401,{error:'שם משתמש או סיסמה שגויים'});
return json(200,{ok:true},{'set-cookie':'rosman_session='+makeSession()+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800'});
}
if(action==='logout'&&event.httpMethod==='POST')return json(200,{ok:true},{'set-cookie':'rosman_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'});
if(action==='session'&&event.httpMethod==='GET')return json(200,{authenticated:authorized(event)});
if(!authorized(event))return json(401,{error:'יש להתחבר'});
if(action==='read'&&event.httpMethod==='GET'){
const f=await github('content/site.json?ref='+CONTENT_BRANCH);return json(200,{data:JSON.parse(Buffer.from(f.content,'base64').toString('utf8')),sha:f.sha});
}
if(action==='save'&&event.httpMethod==='POST'){
if((event.body||'').length>25000)return json(413,{error:'הטקסט ארוך מדי'});
const body=JSON.parse(event.body||'{}');if(typeof body.sha!=='string')return json(400,{error:'נדרשת גרסה'});
const allowed=['privatePrice','pairPrice','contactEmail','whatsappPhone','whatsappMessage','lessonBody','insuranceBody','location','weekdayHours','fridayHours','poolNotes'];
const f=await github('content/site.json?ref='+CONTENT_BRANCH);if(body.sha!==f.sha)return json(409,{error:'התוכן השתנה בינתיים. רעננו את העמוד'});
const d=JSON.parse(Buffer.from(f.content,'base64').toString('utf8'));
for(const k of allowed)if(Object.hasOwn(body.data||{},k)){
 const v=body.data[k];if(k==='privatePrice'||k==='pairPrice'){if(!Number.isInteger(v)||v<0||v>99999)return json(400,{error:'מחיר לא תקין'})}
 else if(typeof v!=='string'||v.length>4500)return json(400,{error:'שדה לא תקין: '+k});
 if(k==='whatsappPhone'&&!/^9725\d{8}$/.test(v))return json(400,{error:'מספר וואטסאפ לא תקין'});
 if(k==='contactEmail'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))return json(400,{error:'כתובת מייל לא תקינה'});
 d[k]=v;
}
if(JSON.stringify(d)===JSON.stringify(JSON.parse(Buffer.from(f.content,'base64').toString('utf8'))))return json(200,{ok:true,sha:f.sha,unchanged:true});
const updated=await github('content/site.json','PUT',{message:'Update business information via admin',content:Buffer.from(JSON.stringify(d,null,2)+'\n').toString('base64'),sha:f.sha,branch:CONTENT_BRANCH});return json(200,{ok:true,sha:updated.content.sha});
}
return json(404,{error:'פעולה לא קיימת'});
}catch(e){console.error('admin request failed',e.message);return json(500,{error:'הפעולה נכשלה. נסו שוב'})}
};
