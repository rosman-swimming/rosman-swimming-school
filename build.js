const fs=require('fs');
const d=JSON.parse(fs.readFileSync('content/site.json','utf8'));
const e=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const w='https://wa.me/'+String(d.whatsappPhone).replace(/\D/g,'')+'?text='+encodeURIComponent(d.whatsappMessage);
const detail=(title,sub,body)=>'<details><summary><strong>'+title+'</strong><small>'+sub+'</small></summary><div class="inside">'+body+'</div></details>';
const nl=s=>e(s).replace(/\n/g,'<br>');
const lessonLegacy='<h3>בריכה פרטית ומחוממת ב'+e(d.location)+'</h3><p>'+e(d.lessonIntroduction)+'</p><p>'+e(d.lessonType)+'</p><div class="prices"><div>שיעור פרטי<b>'+e(d.privatePrice)+' ₪</b></div><div>שיעור זוגי<b>'+e(d.pairPrice)+' ₪</b></div></div><p>משך כל שיעור: '+e(d.duration)+' דקות</p><p>באמצע השבוע: '+e(d.weekdayHours)+'<br>יום שישי: '+e(d.fridayHours)+'</p><p>'+e(d.pairDescription)+'</p><p>'+e(d.poolNotes)+'</p>';
const insuranceLegacy='<p>'+e(d.insuranceIntro)+'</p><p>'+e(d.insuranceDetails)+'</p><h3>בדרך כלל נדרשים:</h3><ul>'+String(d.insuranceDocuments).split('\n').map(x=>'<li>'+e(x)+'</li>').join('')+'</ul>';
const lesson=d.lessonBody?'<p>'+nl(d.lessonBody)+'</p><div class="prices"><div>שיעור פרטי<b>'+e(d.privatePrice)+' ₪</b></div><div>שיעור זוגי<b>'+e(d.pairPrice)+' ₪</b></div></div><p>משך כל שיעור: '+e(d.duration)+' דקות</p><p>באמצע השבוע: '+e(d.weekdayHours)+'<br>יום שישי: '+e(d.fridayHours)+'</p>':lessonLegacy;
const insurance=d.insuranceBody?'<p>'+nl(d.insuranceBody)+'</p>':insuranceLegacy;
const css='*{box-sizing:border-box}body{margin:0;background:#ebe1d9;font-family:Arial,sans-serif;color:#263e48}main{max-width:680px;margin:auto;background:white}.flyer{position:relative}.flyer img{width:100%;display:block}.tap{position:absolute;left:50.2%;top:90.4%;width:27.3%;height:3.3%}.content{padding:20px 16px}h1{text-align:center;font-size:22px}.sub{text-align:center;color:#71818a}details{border:1px solid #dae5e8;border-radius:15px;margin:14px 0;overflow:hidden}summary{cursor:pointer;padding:18px;display:flex;justify-content:space-between;gap:10px}summary small{color:#71818a}summary:after{content:"⌄"}.inside{padding:14px 17px;line-height:1.7;border-top:1px solid #dae5e8}h3{font-size:17px}.prices{display:grid;grid-template-columns:1fr 1fr;gap:10px}.prices div{background:#f0f6f8;border-radius:12px;padding:12px}.prices b{display:block;font-size:25px}.button{display:block;margin:14px 16px 25px;padding:15px;border-radius:12px;text-decoration:none;background:#168b52;text-align:center;color:white;font-weight:bold}';
const html='<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta property="og:title" content="'+e(d.businessName)+' | '+e(d.owner)+'"><meta property="og:description" content="'+e(d.pageDescription)+'"><meta property="og:url" content="https://rosman-swim.netlify.app/"><meta property="og:image" content="https://rosman-swim.netlify.app/og.jpg"><meta property="og:image:type" content="image/jpeg"><title>'+e(d.businessName)+'</title><style>'+css+'</style></head><body><main><div class="flyer"><img src="/flyer.jpg" alt="פלייר בית הספר לשחייה"><a href="'+e(w)+'" class="tap" aria-label="פתיחת וואטסאפ"></a></div><section class="content"><h1>'+e(d.businessName)+'</h1><p class="sub">כל המידע על השיעורים במקום אחד</p>'+detail('שיעורי שחייה, שעות ומחירים','כל המידע לפני שמתחילים',lesson)+detail('הידרותרפיה והחזרים מביטוח','כיסוי אפשרי ומסמכים נדרשים',insurance)+'</section><a class="button" href="'+e(w)+'">שליחת הודעה ב־WhatsApp</a></main></body></html>';
fs.mkdirSync('dist',{recursive:true});fs.writeFileSync('dist/index.html',html);fs.mkdirSync('dist/admin',{recursive:true});for(const f of ['flyer.jpg','og.jpg'])if(fs.existsSync(f))fs.copyFileSync(f,'dist/'+f);if(fs.existsSync('uploads'))fs.cpSync('uploads','dist/uploads',{recursive:true});
// Only the dedicated admin is published; legacy CMS files remain out of dist.
fs.copyFileSync('admin/custom.html','dist/admin/index.html');
fs.copyFileSync('admin/favicon.svg','dist/admin/favicon.svg');
// Generate a small, dependency-free PNG for WhatsApp sharing.
const zlib=require('zlib');
function makeEditIcon(){
  const n=256, pixels=Buffer.alloc(n*n*4), bg=[8,125,134,255], white=[255,255,255,255];
  function set(x,y,c){if(x<0||y<0||x>=n||y>=n)return;const i=(y*n+x)*4;for(let k=0;k<4;k++)pixels[i+k]=c[k]}
  function rect(x0,y0,x1,y1,c){for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)set(x,y,c)}
  function line(x0,y0,x1,y1,w,c){const dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy);for(let t=0;t<=d;t+=.35){const cx=x0+dx*t/d,cy=y0+dy*t/d;for(let j=-w/2;j<=w/2;j++)for(let k=-w/2;k<=w/2;k++)if(j*j+k*k<=w*w/4)set(Math.round(cx+j),Math.round(cy+k),c)}}
  rect(0,0,n,n,bg);
  // Outline of a document; the top-right edge stays open for the pencil.
  line(51,60,172,60,10,white);line(51,60,51,201,10,white);line(51,201,173,201,10,white);
  // White pencil diagonal, with a distinct pointed tip.
  line(112,158,199,71,19,white);line(111,158,103,180,9,white);
  line(190,62,208,80,10,white);
  const signature=Buffer.from([137,80,78,71,13,10,26,10]);
  const crcTable=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0});
  function chunk(type,data){const name=Buffer.from(type),crcInput=Buffer.concat([name,data]);let crc=0xffffffff;for(const byte of crcInput)crc=crcTable[(crc^byte)&255]^(crc>>>8);const len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([len,name,data,sum])}
  const hdr=Buffer.alloc(13);hdr.writeUInt32BE(n,0);hdr.writeUInt32BE(n,4);hdr[8]=8;hdr[9]=6;
  const rows=Buffer.alloc(n*(1+n*4));for(let y=0;y<n;y++)pixels.copy(rows,y*(1+n*4)+1,y*n*4,(y+1)*n*4);
  return Buffer.concat([signature,chunk('IHDR',hdr),chunk('IDAT',zlib.deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
fs.writeFileSync('dist/admin/edit-icon.png',makeEditIcon());

