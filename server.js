const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {URL}=require('url');

const ROOT=__dirname;
const PUBLIC=path.join(ROOT,'public');
const DATA=path.join(ROOT,'data.json');
const PORT=Number(process.env.PORT||10000);
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'nexora-admin-123';
const OPENAI_API_KEY=process.env.OPENAI_API_KEY||'';
const OPENAI_MODEL=process.env.OPENAI_MODEL||'gpt-5-mini';
let db=JSON.parse(fs.readFileSync(DATA,'utf8'));
let sessions=new Map();

function save(){fs.writeFileSync(DATA,JSON.stringify(db,null,2));}
function send(res,status,data,type='application/json'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});res.end(type==='application/json'?JSON.stringify(data):data)}
function parseCookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i).trim(),decodeURIComponent(x.slice(i+1))]}))}
function auth(req){const s=parseCookies(req).nexora_admin;return s&&sessions.has(s)}
function jsonBody(req){return new Promise((resolve,reject)=>{let b='';req.on('data',c=>{b+=c;if(b.length>2e6)req.destroy()});req.on('end',()=>{try{resolve(b?JSON.parse(b):{})}catch(e){reject(e)}});req.on('error',reject)})}
function id(prefix){return prefix+crypto.randomBytes(5).toString('hex')}
function nextOrder(){return 'SR-'+String(db.orders.length+1).padStart(6,'0')}
function safeProduct(p){return {...p}}
function productContext(){return db.products.map(p=>({id:p.id,name:p.name,category:p.category,price:p.price,color:p.color,sizes:p.sizes,stock:p.stock,description:p.description}));}
function localAssistant(message,cart=[]){
 const m=String(message||'').toLowerCase().replace(/[০-৯]/g,d=>String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
 const catSyn={fashion:['fashion','clothing','shirt','tshirt','t-shirt','polo','jacket','dress','panjabi','kurti','saree','jama','kapor','জামা','কাপড়'],electronics:['electronics','gadget','phone','mobile','earbud','headphone','laptop','gadget'],beauty:['beauty','skin','skincare','cosmetic','makeup','serum','cream'],home:['home','living','lamp','furniture','decor'],grocery:['grocery','food','coffee','snack','rice','food'],jewelry:['jewelry','jewellery','watch','gold','diamond','ring'],shoes:['shoe','shoes','bag','bags','wallet'],sports:['sport','sports','fitness','gym','training'],kids:['kids','baby','children','child'],books:['book','books','notebook','stationery'],automotive:['car','auto','automotive','bike','vehicle'],health:['health','wellness','vitamin','care'],pets:['pet','dog','cat','animal'],services:['service','services','consulting','design','marketing'],digital:['digital','template','ebook','course','software'],other:['other','custom']};
 let category=null; for(const [k,arr] of Object.entries(catSyn)) if(arr.some(x=>m.includes(x))){category=k;break}
 const colors=[['black',['black','kalo','কালো']],['navy',['navy','blue','neel','নীল']],['gold',['gold','sonali','সোনালী']],['pink',['pink','golapi','গোলাপি']],['green',['green','shobuj','সবুজ']],['brown',['brown','badami']],['rose',['rose']],['teal',['teal']]];
 let color=null; for(const [k,a] of colors) if(a.some(x=>m.includes(x))){color=k;break}
 const num=m.match(/(?:under|below|within|moddhe|er moddhe|less than|কম|ভিতরে)\s*(?:৳|tk|taka)?\s*(\d{3,6})/i); let budget=num?Number(num[1]):null;
 const size=(m.match(/\b(xxl|xl|l|m|s)\b/i)||[])[1]?.toUpperCase()||null;
 let products=db.products.filter(p=>!category||p.category===category).filter(p=>!color||p.color.toLowerCase().includes(color)).filter(p=>!budget||p.price<=budget).filter(p=>!size||p.sizes.includes(size));
 if(!products.length && (category||color||budget||size)) products=db.products.filter(p=>(!budget||p.price<=budget)&&(!size||p.sizes.includes(size)));
 if(products.length>6) products=products.slice(0,6);
 const wantsOrder=/\b(order|buy|purchase|kinbo|kinde|nibo|order korbo|নেব|কিনব|অর্ডার)\b/i.test(m);
 const wantsCart=/\b(cart|add|jabe|dao|দাও|কার্ট)\b/i.test(m);
 if(/^(hi|hello|hey|assalamu|salam|হাই|হ্যালো|আসসালামু)/i.test(m)) return {text:`Welcome to ${db.settings.name}. বলুন আপনি কী খুঁজছেন—category, color, size বা budget অনুযায়ী আমি product দেখাতে পারি।`,products:[]};
 if(/delivery|shipping|delivery charge|কুরিয়ার|ডেলিভারি/i.test(m)) return {text:`${db.settings.deliveryText}. Delivery details can be configured from the admin panel.`,products:[]};
 if(/payment|bkash|nagad|rocket|cash|cod|পেমেন্ট|বিকাশ|নগদ|রকেট/i.test(m)) return {text:`Available payment options: ${db.settings.cod?'Cash on Delivery, ':''}${db.settings.bkash?'bKash, ':''}${db.settings.nagad?'Nagad, ':''}${db.settings.rocket?'Rocket':''}.`,products:[]};
 if(products.length) return {text:`I found ${products.length} matching item${products.length>1?'s':''}${category?' in this category':''}${budget?' within your budget':''}${size?' for size '+size:''}.`,products:products.map(safeProduct),startOrder:wantsOrder,startCart:wantsCart};
 if(/help|suggest|recommend|ki nibo|কি নেব/i.test(m)) return {text:'অবশ্যই। আপনি category, color, size বা budget বলুন—যেমন “2500 টাকার মধ্যে black কিছু দেখাও”।',products:[]};
 return {text:`আমি product, category, color, size, budget, stock, delivery, payment এবং order নিয়ে সাহায্য করতে পারি। উদাহরণ: “২০০০ টাকার মধ্যে black কিছু দেখাও”।`,products:[]};
}
async function openAI(message,history){
 if(!OPENAI_API_KEY) return null;
 const system=`You are the shopping assistant for ${db.settings.name}. Answer in Bangla, English, or Banglish based on the customer. Be concise, friendly and sales-helpful. You may only discuss store shopping, products, categories, stock, delivery, payment and ordering. Product catalog: ${JSON.stringify(productContext())}. If asked to order, gather name, phone, full address, product, size/color if relevant, payment method, and transaction ID for online payment. Never invent stock or prices.`;
 const body={model:OPENAI_MODEL,input:[{role:'system',content:system},...(history||[]).slice(-8).map(x=>({role:x.role,content:x.content})),{role:'user',content:message}]};
 const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+OPENAI_API_KEY},body:JSON.stringify(body)});
 if(!r.ok) throw new Error('OpenAI request failed');
 const j=await r.json(); return j.output_text||j.output?.flatMap(x=>x.content||[]).map(x=>x.text||'').join('')||null;
}

async function api(req,res,u){
 if(u.pathname==='/api/store') return send(res,200,{settings:db.settings,categories:db.categories,products:db.products,reviews:db.reviews,faqs:db.faqs});
 if(u.pathname==='/api/chat'&&req.method==='POST'){
  try{const b=await jsonBody(req); let ai=null; try{ai=await openAI(b.message,b.history)}catch(e){} const local=localAssistant(b.message,b.cart||[]); return send(res,200,{text:ai||local.text,products:local.products,startOrder:local.startOrder,startCart:local.startCart,ai:!!ai});}catch(e){return send(res,400,{error:'Invalid request'})}
 }
 if(u.pathname==='/api/orders'&&req.method==='POST'){
  try{const b=await jsonBody(req); if(!b.customer?.name||!b.customer?.phone||!b.customer?.address||!b.items?.length) return send(res,422,{error:'Name, phone, address and items are required'}); const order={id:nextOrder(),createdAt:new Date().toISOString(),status:'Pending',payment:b.payment||'Cash on Delivery',transactionId:b.transactionId||'',customer:b.customer,items:b.items,total:Number(b.total||0)}; db.orders.push(order); for(const item of b.items){const p=db.products.find(x=>x.id===item.id);if(p&&Number.isFinite(p.stock)&&p.stock<900)p.stock=Math.max(0,p.stock-Number(item.qty||1));} save(); return send(res,201,{order});}catch(e){return send(res,400,{error:'Invalid order'})}
 }
 if(u.pathname==='/api/admin/login'&&req.method==='POST'){const b=await jsonBody(req);const pass=b.password||'';const ok=pass===(db.auth.password||ADMIN_PASSWORD);if(!ok)return send(res,401,{error:'Invalid password'});const token=crypto.randomBytes(24).toString('hex');sessions.set(token,Date.now()+86400000);res.setHeader('Set-Cookie',`nexora_admin=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`);return send(res,200,{ok:true})}
 if(u.pathname.startsWith('/api/admin/')&&!auth(req)) return send(res,401,{error:'Unauthorized'});
 if(u.pathname==='/api/admin/data') return send(res,200,{settings:db.settings,categories:db.categories,products:db.products,reviews:db.reviews,faqs:db.faqs,orders:db.orders});
 if(u.pathname==='/api/admin/settings'&&req.method==='PUT'){db.settings={...db.settings,...(await jsonBody(req))};save();return send(res,200,db.settings)}
 if(u.pathname==='/api/admin/products'&&req.method==='POST'){const p=await jsonBody(req);p.id=p.id||id('p');p.price=Number(p.price||0);p.stock=Number(p.stock||0);p.sizes=Array.isArray(p.sizes)?p.sizes:[];db.products.push(p);save();return send(res,201,p)}
 if(u.pathname.startsWith('/api/admin/products/')&&req.method==='PUT'){const x=db.products.find(p=>p.id===u.pathname.split('/').pop());if(!x)return send(res,404,{error:'Not found'});Object.assign(x,await jsonBody(req));save();return send(res,200,x)}
 if(u.pathname.startsWith('/api/admin/products/')&&req.method==='DELETE'){db.products=db.products.filter(p=>p.id!==u.pathname.split('/').pop());save();return send(res,204,{})}
 if(u.pathname==='/api/admin/categories'&&req.method==='POST'){const c=await jsonBody(req);c.id=c.id||id('c');db.categories.push(c);save();return send(res,201,c)}
 if(u.pathname.startsWith('/api/admin/categories/')&&req.method==='DELETE'){db.categories=db.categories.filter(c=>c.id!==u.pathname.split('/').pop());save();return send(res,204,{})}
 if(u.pathname==='/api/admin/reviews'&&req.method==='POST'){const x=await jsonBody(req);x.id=x.id||id('r');db.reviews.unshift(x);save();return send(res,201,x)}
 if(u.pathname.startsWith('/api/admin/reviews/')&&req.method==='DELETE'){db.reviews=db.reviews.filter(x=>x.id!==u.pathname.split('/').pop());save();return send(res,204,{})}
 if(u.pathname==='/api/admin/faqs'&&req.method==='POST'){const x=await jsonBody(req);x.id=x.id||id('f');db.faqs.push(x);save();return send(res,201,x)}
 if(u.pathname.startsWith('/api/admin/faqs/')&&req.method==='DELETE'){db.faqs=db.faqs.filter(x=>x.id!==u.pathname.split('/').pop());save();return send(res,204,{})}
 if(u.pathname.startsWith('/api/admin/orders/')&&u.pathname.endsWith('/status')&&req.method==='PUT'){const oid=u.pathname.split('/')[4];const o=db.orders.find(x=>x.id===oid);if(!o)return send(res,404,{error:'Not found'});o.status=(await jsonBody(req)).status||o.status;save();return send(res,200,o)}
 if(u.pathname==='/api/admin/change-password'&&req.method==='POST'){const b=await jsonBody(req);if(!b.password||b.password.length<8)return send(res,422,{error:'Minimum 8 characters'});db.auth.password=b.password;save();return send(res,200,{ok:true})}
 return send(res,404,{error:'Not found'});
}

function staticFile(req,res,u){let p=u.pathname==='/'?'/index.html':u.pathname==='/admin'?'/admin.html':u.pathname; p=path.normalize(p).replace(/^\.\.(\/|\\)/,'');const file=path.join(PUBLIC,p);if(!file.startsWith(PUBLIC)||!fs.existsSync(file)||fs.statSync(file).isDirectory())return send(res,404,'Not found','text/plain');const ext=path.extname(file).toLowerCase();const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.txt':'text/plain'};res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});fs.createReadStream(file).pipe(res)}

const server=http.createServer(async(req,res)=>{const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);if(u.pathname.startsWith('/api/')){try{return await api(req,res,u)}catch(e){console.error(e);return send(res,500,{error:'Server error'})}}staticFile(req,res,u)});
server.listen(PORT,()=>console.log(`${db.settings.name} running on ${PORT}`));
