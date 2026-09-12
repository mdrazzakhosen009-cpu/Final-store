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
const GOOGLE_SEARCH_API_KEY=process.env.GOOGLE_SEARCH_API_KEY||'';
const GOOGLE_SEARCH_CX=process.env.GOOGLE_SEARCH_CX||'';
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
function normalizeDigits(s){return String(s||'').replace(/[০-৯]/g,d=>String('০১২৩৪৫৬৭৮৯'.indexOf(d)))}
function localAssistant(message,cart=[],history=[]){
 const raw=String(message||'').trim(); const m=normalizeDigits(raw).toLowerCase();
 const catSyn={fashion:['fashion','clothing','shirt','tshirt','t-shirt','polo','jacket','dress','panjabi','kurti','saree','jama','kapor','জামা','কাপড়'],electronics:['electronics','gadget','phone','mobile','earbud','headphone','laptop','keyboard','gadget'],beauty:['beauty','skin','skincare','cosmetic','makeup','serum','cream','sunscreen'],home:['home','living','lamp','furniture','decor'],grocery:['grocery','food','coffee','snack','chocolate','rice','food'],jewelry:['jewelry','jewellery','watch','gold','diamond','ring'],shoes:['shoe','shoes','bag','bags','wallet'],sports:['sport','sports','fitness','gym','training','sneaker'],kids:['kids','baby','children','child'],books:['book','books','notebook','stationery'],automotive:['car','auto','automotive','bike','vehicle','key'],health:['health','wellness','vitamin','care','bottle'],pets:['pet','dog','cat','animal'],services:['service','services','consulting','design','marketing','keyboard'],digital:['digital','template','ebook','course','software','perfume'],other:['other','custom','sunglass','sunglasses']};
 let category=null; for(const [k,arr] of Object.entries(catSyn)){if(arr.some(x=>m.includes(x))){category=k;break}}
 const colorSyn=[['black',['black','kalo','কালো']],['navy',['navy']],['blue',['blue','neel','নীল']],['gold',['gold','sonali','সোনালী']],['pink',['pink','golapi','গোলাপি']],['green',['green','shobuj','সবুজ']],['brown',['brown','badami']],['cream',['cream']],['amber',['amber']]];
 let color=null; for(const [k,a] of colorSyn)if(a.some(x=>m.includes(x))){color=k;break}
 const budgetPatterns=[/(?:under|below|within|less than|up to|moddhe|er moddhe|budget|কম|ভিতরে)\s*(?:৳|tk|taka|টাকা)?\s*(\d{3,7})/i,/(\d{3,7})\s*(?:tk|taka|টাকা)/i]; let budget=null; for(const re of budgetPatterns){const z=m.match(re);if(z){budget=Number(z[1]);break}}
 const size=(m.match(/\b(xxl|xl|l|m|s)\b/i)||[])[1]?.toUpperCase()||null;
 const asksQuality=/\b(kemon|kmn|good|best|worth|review|quality|ভালো|কেমন|কী রকম|কেমন হবে)\b/i.test(m);
 const asksStock=/\b(stock|available|ase|আছে|স্টক)\b/i.test(m);
 const asksPrice=/\b(price|dam|দাম|মূল্য|cost|koto|কত)\b/i.test(m);
 const all=db.products; let products=all.filter(p=>(!category||p.category===category)&&(!color||p.color.toLowerCase().includes(color))&&(!budget||p.price<=budget)&&(!size||p.sizes.includes(size)));
 const previousIds=(Array.isArray(history)?history.slice().reverse():[]).flatMap(x=>Array.isArray(x.products)?x.products.map(p=>p.id):[]);
 if(!products.length && !category && !color && !budget && !size && (asksQuality||asksPrice||asksStock) && previousIds.length) products=all.filter(p=>previousIds.includes(p.id));
 if(!products.length && (category||color||budget||size)) products=all.filter(p=>(!budget||p.price<=budget)&&(!size||p.sizes.includes(size))).slice(0,6);
 products=products.slice(0,6);
 if(asksQuality && previousIds.length) products=products.slice(0,1);
 const greet=/^(hi|hello|hey|salam|assalamu|assalamualaikum|হাই|হ্যালো|আসসালামু)/i.test(m);
 const wantsOrder=/\b(order|buy|purchase|kinbo|kinde|nibo|order korbo|নেব|কিনব|অর্ডার)\b/i.test(m);
 const asksHow=/\b(how|kivabe|ki vabe|কিভাবে|কীভাবে)\b/i.test(m);
 const asksDelivery=/delivery|shipping|courier|কুরিয়ার|ডেলিভারি/i.test(m);
 const asksPayment=/payment|bkash|nagad|rocket|cash|cod|পেমেন্ট|বিকাশ|নগদ|রকেট/i.test(m);
 if(greet)return {text:`Assalamu alaikum 👋 Welcome to ${db.settings.name}. আপনি কী খুঁজছেন বলুন—আমি product, budget, color, size বা use-case অনুযায়ী help করতে পারি।`,products:[]};
 if(asksDelivery)return {text:`জি। ${db.settings.deliveryText}. আপনার location বললে delivery নিয়ে আরও specificভাবে guide করতে পারি।`,products:[]};
 if(asksPayment)return {text:`Payment হিসেবে ${db.settings.cod?'Cash on Delivery, ':''}${db.settings.bkash?'bKash, ':''}${db.settings.nagad?'Nagad, ':''}${db.settings.rocket?'Rocket':''} available. Online payment হলে transaction ID লাগবে।`,products:[]};
 if(asksStock&&products.length)return {text:`জি, ${products[0].name} এখন ${products[0].stock>0?'in stock':'out of stock'}। চাইলে আমি available alternatives-ও দেখাতে পারি।`,products:products.map(safeProduct)};
 if(asksPrice&&products.length===1)return {text:`${products[0].name}-এর বর্তমান দাম ${db.settings.currency}${products[0].price.toLocaleString()}। চাইলে আমি details বা similar options দেখাতে পারি।`,products:products.map(safeProduct)};
 if(asksQuality&&products.length){const p=products[0];return {text:`${p.name} সম্পর্কে store information অনুযায়ী ${p.description}। এটা আপনার জন্য ঠিক হবে কিনা বলতে আপনার budget বা কী কাজে ব্যবহার করবেন সেটা বললে আরও ভালোভাবে compare করে দিতে পারি।`,products:products.map(safeProduct)}}
 if(products.length){let text=`বুঝেছি। ${products.length}টা option পেয়েছি`;if(category)text+=` ${category} category-তে`;if(color)text+=` ${color} color-এ`;if(budget)text+=` ${db.settings.currency}${budget.toLocaleString()} এর মধ্যে`;if(size)text+=` size ${size}-এর জন্য`;text+='। কোনটা পছন্দ হলে “order” বলুন, আমি step-by-step handle করব।';return {text,products:products.map(safeProduct),startOrder:wantsOrder}}
 if(asksHow)return {text:`অবশ্যই। আপনি কী করতে চান সেটা বলুন—product খুঁজবেন, compare করবেন, order করবেন, নাকি delivery/payment জানতে চান? আমি ধাপে ধাপে guide করব।`,products:[]};
 return {text:`আমি বুঝতে চাই আপনি ঠিক কী খুঁজছেন 😊 Product name, category, budget, color, size বা প্রয়োজনটা একটু বলুন। যেমন: “২০০০ টাকার মধ্যে black ভালো কিছু দেখাও”।`,products:[]};
}

async function googleSearch(query){
 if(!GOOGLE_SEARCH_API_KEY||!GOOGLE_SEARCH_CX)return [];
 const url='https://www.googleapis.com/customsearch/v1?key='+encodeURIComponent(GOOGLE_SEARCH_API_KEY)+'&cx='+encodeURIComponent(GOOGLE_SEARCH_CX)+'&num=5&q='+encodeURIComponent(query);
 const r=await fetch(url); if(!r.ok) return []; const j=await r.json();
 return (j.items||[]).map(x=>({title:x.title,snippet:x.snippet,link:x.link}));
}
async function openAI(message,history){
 if(!OPENAI_API_KEY) return null;
 const externalIntent=/(check|google|online|web|internet|review|kemon|কেমন|ভালো|quality|specification|specs)/i.test(message);
 let webContext=''; if(externalIntent){try{const results=await googleSearch(message); if(results.length) webContext='\nVerified web search results:\n'+results.map((x,i)=>`${i+1}. ${x.title} — ${x.snippet} — ${x.link}`).join('\n')}catch(e){}}
 const system=`You are Nexora Assistant, a warm human-like shopping concierge for ${db.settings.name}. Speak naturally like a helpful Bangladeshi store representative. Match the customer's language: Bangla, Banglish or English. Do not sound robotic, do not repeat the same template, and do not dump a list unless it helps. Remember the conversation context. Ask one useful follow-up question when the customer's need is unclear. Help with discovery, recommendations, comparisons, product details, stock, price, color, size, delivery, payment, returns and ordering. If the customer asks “eita kemon?”, “is it good?”, “review?”, “should I buy?”, “check online/Google”, or asks for current/external information, use web search when available and clearly separate verified web information from store information. Never invent stock, price, reviews, specifications or web findings. Product catalog: ${JSON.stringify(productContext())}. If the customer wants to order, guide them conversationally through product, quantity, size/color where relevant, name, phone, full address, payment method and transaction ID for online payment, then ask for confirmation before claiming an order is placed. You do not have permission to claim an order was placed unless the website order API confirms it. ${webContext}`;
 const body={model:OPENAI_MODEL,input:[{role:'system',content:system},...(history||[]).slice(-12).map(x=>({role:x.role,content:x.content})),{role:'user',content:message}],tools:[{type:'web_search_preview'}]};
 const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+OPENAI_API_KEY},body:JSON.stringify(body)});
 if(!r.ok) throw new Error('OpenAI request failed');
 const j=await r.json(); return j.output_text||j.output?.flatMap(x=>x.content||[]).map(x=>x.text||'').join('')||null;
}

async function api(req,res,u){
 if(u.pathname==='/api/store') return send(res,200,{settings:db.settings,categories:db.categories,products:db.products,reviews:db.reviews,faqs:db.faqs});
 if(u.pathname==='/api/chat'&&req.method==='POST'){
  try{const b=await jsonBody(req); let ai=null; try{ai=await openAI(b.message,b.history)}catch(e){} const local=localAssistant(b.message,b.cart||[],b.history||[]); return send(res,200,{text:ai||local.text,products:local.products,startOrder:local.startOrder,startCart:local.startCart,ai:!!ai});}catch(e){return send(res,400,{error:'Invalid request'})}
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

function staticFile(req,res,u){let p=u.pathname==='/'?'/index.html':(u.pathname==='/admin'||u.pathname==='/admin/'||u.pathname==='/admin.html')?'/admin.html':u.pathname; p=path.normalize(p).replace(/^\.\.(\/|\\)/,'');const file=path.join(PUBLIC,p);if(!file.startsWith(PUBLIC)||!fs.existsSync(file)||fs.statSync(file).isDirectory())return send(res,404,'Not found','text/plain');const ext=path.extname(file).toLowerCase();const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.txt':'text/plain'};res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});fs.createReadStream(file).pipe(res)}

const server=http.createServer(async(req,res)=>{const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);if(u.pathname.startsWith('/api/')){try{return await api(req,res,u)}catch(e){console.error(e);return send(res,500,{error:'Server error'})}}staticFile(req,res,u)});
server.listen(PORT,()=>console.log(`${db.settings.name} running on ${PORT}`));
