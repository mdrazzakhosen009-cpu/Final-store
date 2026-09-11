let D=null,cart=JSON.parse(localStorage.getItem('srstyleCart')||'[]'),selectedProduct=null,selectedSize='',selectedColor='',chatOrder=JSON.parse(localStorage.getItem('srstyleChatOrder')||'null');
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const money=n=>'৳'+Number(n||0).toLocaleString('en-BD');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
async function boot(){try{D=await fetch('/api/content').then(r=>r.json());apply();render();assistantBoot()}catch(e){console.error(e)}}
function apply(){
  const set=(id,v)=>{const e=$(id);if(e)e.textContent=v??''}; const src=(id,v)=>{const e=$(id);if(e)e.src=v||''}; const href=(id,v)=>{const e=$(id);if(e)e.href=v||'#'};
  set('#announcement',D.settings.announcement);src('#brandLogo',D.settings.logo);src('#drawerLogo',D.settings.logo);src('#footerLogo',D.settings.logo);src('#heroImg',D.settings.heroImage);src('#aboutImg',D.settings.aboutImage);href('#headerWa','https://wa.me/88'+String(D.settings.whatsapp).replace(/\D/g,''));href('#drawerWa','https://wa.me/88'+String(D.settings.whatsapp).replace(/\D/g,''));href('#waFoot','https://wa.me/88'+String(D.settings.whatsapp).replace(/\D/g,''));
  href('#fb',D.settings.facebook);href('#ig',D.settings.instagram);href('#tt',D.settings.tiktok);href('#drawerFb',D.settings.facebook);href('#drawerIg',D.settings.instagram);href('#drawerTt',D.settings.tiktok);href('#drawerYt',D.settings.youtube||'#');
  set('#phone',D.settings.phone);set('#aboutText',D.settings.aboutText);set('#email',D.settings.email);set('#address',D.settings.address);const desc=$('#desc');if(desc)desc.content=D.settings.seoDescription||'';
  const hb=$('#heroBtn');if(hb)hb.textContent=D.settings.heroButton||'Shop Now →';
}
function render(){renderCats();renderProducts('all','');renderReviews();updateCart();sectionVisibility()}
function sectionVisibility(){Object.keys(D.sections||{}).forEach(k=>{const e=document.getElementById(k);if(e)e.style.display=D.sections[k]?'':'none'})}
function renderCats(){const h=(D.categories||[]).filter(c=>c.active!==false).map(c=>`<div class="cat" data-category="${esc(c.name)}"><img src="${esc(c.image)}" alt="${esc(c.name)}"><b>${esc(c.name)}</b></div>`).join('');const a=$('#categoriesGrid');if(a)a.innerHTML=h;const b=$('#drawerCats');if(b)b.innerHTML=h}
function renderProducts(filter,q){let a=(D.products||[]).filter(p=>p.active!==false);const z=String(q||'').toLowerCase().trim();if(z)a=a.filter(p=>(p.name+' '+p.category+' '+(p.colors||[]).join(' ')+' '+(p.sizes||[]).join(' ')).toLowerCase().includes(z));if(filter==='new')a=a.filter(p=>/new/i.test(p.badge||''));if(filter==='sale')a=a.filter(p=>Number(p.oldPrice)>Number(p.price));const g=$('#productGrid');if(g)g.innerHTML=a.map(card).join('')||'<div class="notice">No products found.</div>'}
function card(p){return `<article class="product" onclick="openProduct('${p.id}')"><div class="pImg"><img src="${esc(p.image)}" alt="${esc(p.name)}"><span class="badge">${esc(p.badge||'NEW')}</span></div><div class="pBody"><h3>${esc(p.name)}</h3><span class="price">${money(p.price)}</span> <span class="old">${money(p.oldPrice)}</span><div class="stars">★★★★★ <small>(${Math.max(18,Math.min(99,18+Number(p.stock||0)))})</small></div><button onclick="event.stopPropagation();quickAdd('${p.id}')">Add to Cart</button></div></article>`}
function renderReviews(){const h=(D.reviews||[]).map(r=>`<div class="review"><img src="${esc(r.image)}" alt="${esc(r.name)}"><div><b>${esc(r.name)}</b><small>${esc(r.location)}</small><div class="stars">★★★★★</div><p>“${esc(r.text)}”</p></div></div>`).join('');const e=$('#reviewsTrack');if(e)e.innerHTML=h}
function openProduct(id){const p=(D.products||[]).find(x=>x.id===id);if(!p)return;selectedProduct=p;selectedSize=p.sizes?.[0]||'';selectedColor=p.colors?.[0]||'';$('#modalRoot').innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="modalCard"><div class="detail"><div class="detailImg"><img src="${esc(p.image)}" alt="${esc(p.name)}"></div><div class="detailBody"><button class="close" onclick="closeModal()">×</button><span class="eyebrow">${esc(p.category)}</span><h2>${esc(p.name)}</h2><div><span class="price" style="font-size:21px">${money(p.price)}</span> <span class="old">${money(p.oldPrice)}</span></div><div class="stars">★★★★★</div><p style="color:#756267;line-height:1.7;font-size:11px">${esc(p.description)}</p><div class="choice"><label>SIZE</label><div class="choices">${(p.sizes||[]).map(s=>`<button class="${s===selectedSize?'selected':''}" onclick="chooseSize('${esc(s)}',this)">${esc(s)}</button>`).join('')}</div><label>COLOR</label><div class="choices">${(p.colors||[]).map(c=>`<button class="${c===selectedColor?'selected':''}" onclick="chooseColor('${esc(c)}',this)">${esc(c)}</button>`).join('')}</div><label>AVAILABLE STOCK</label><div style="color:#2b7c51;font-size:9px">${p.stock} pieces available</div><div class="qty"><button onclick="qty(-1)">−</button><b id="qty">1</b><button onclick="qty(1)">＋</button></div><div class="detailActions"><button class="secondary" onclick="addCart()">Add to Cart</button><button class="primary" onclick="orderNow()">Order Now</button></div><div style="border-top:1px solid #eee;margin-top:18px;padding-top:10px;font-size:8px;color:#7e6e72">Category: ${esc(p.category)} · Sizes: ${esc((p.sizes||[]).join(', '))} · Colors: ${esc((p.colors||[]).join(', '))}</div></div></div></div></div>`}
function closeModal(){$('#modalRoot').innerHTML=''}
function chooseSize(v,b){selectedSize=v;[...b.parentElement.children].forEach(x=>x.classList.remove('selected'));b.classList.add('selected')}
function chooseColor(v,b){selectedColor=v;[...b.parentElement.children].forEach(x=>x.classList.remove('selected'));b.classList.add('selected')}
function qty(n){const e=$('#qty');if(!e||!selectedProduct)return;e.textContent=Math.max(1,Math.min(Number(selectedProduct.stock||1),Number(e.textContent)+n))}
function item(){return {productId:selectedProduct.id,name:selectedProduct.name,price:Number(selectedProduct.price),image:selectedProduct.image,size:selectedSize,color:selectedColor,qty:Number($('#qty').textContent)}}
function addCart(){if(!selectedProduct||selectedProduct.stock<1)return toast('This product is out of stock');const it=item(),f=cart.find(x=>x.productId===it.productId&&x.size===it.size&&x.color===it.color);if(f)f.qty=Math.min(selectedProduct.stock,f.qty+it.qty);else cart.push(it);saveCart();closeModal();toast('Added to cart')}
function quickAdd(id){const p=D.products.find(x=>x.id===id);if(!p||p.stock<1)return toast('This product is out of stock');const size=p.sizes?.[0]||'',color=p.colors?.[0]||'',f=cart.find(x=>x.productId===id&&x.size===size&&x.color===color);if(f)f.qty=Math.min(p.stock,f.qty+1);else cart.push({productId:id,name:p.name,price:Number(p.price),image:p.image,size,color,qty:1});saveCart();toast('Added to cart')}
function orderNow(){if(!selectedProduct)return;cart=[item()];saveCart();closeModal();checkout()}
async function sendChat(){
  const input=$('#chatInput'); if(!input)return;
  const text=input.value.trim(); if(!text)return;
  const history=JSON.parse(localStorage.getItem('srstyleChat')||'[]').slice(-12);
  input.value=''; chatMsg('user',esc(text));
  const send=$('#chatSend'); if(send){send.disabled=true;send.textContent='…'}
  try{
    if(await handleChatOrder(text)) return;
    const r=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history,products:D?.products||[],settings:D?.settings||{}})});
    const j=await r.json();
    if(!r.ok)throw Error(j.error||'Assistant unavailable');
    if(j.reply) bot(esc(j.reply).replace(/\n/g,'<br>'));
    else reply(text);
  }catch(e){ reply(text); }
  finally{if(send){send.disabled=false;send.textContent='➤'}input.focus()}
}
function quickOrder(id){const p=D.products.find(x=>x.id===id);if(!p||p.stock<1)return toast('This product is out of stock');selectedProduct=p;selectedSize=p.sizes?.[0]||'';selectedColor=p.colors?.[0]||'';cart=[{productId:p.id,name:p.name,price:Number(p.price),image:p.image,size:selectedSize,color:selectedColor,qty:1}];saveCart();checkout()}
function saveCart(){localStorage.setItem('srstyleCart',JSON.stringify(cart));updateCart()}
function updateCart(){const e=$('#cartCount');if(e)e.textContent=cart.reduce((a,x)=>a+Number(x.qty||0),0)}
function openCart(){if(!cart.length)return toast('Your cart is empty');const total=cart.reduce((a,x)=>a+x.price*x.qty,0);$('#modalRoot').innerHTML=`<div class="modal"><div class="modalCard checkout"><button class="close" onclick="closeModal()">×</button><span class="eyebrow">— YOUR CART</span><h2>Shopping Cart</h2>${cart.map((x,i)=>`<div style="display:flex;gap:9px;border-bottom:1px solid #eee;padding:9px 0"><img src="${esc(x.image)}" style="width:52px;height:65px;object-fit:cover;border-radius:7px"><div style="flex:1;font-size:9px"><b>${esc(x.name)}</b><div>${esc(x.size)} · ${esc(x.color)} · ×${x.qty}</div><b class="price">${money(x.price*x.qty)}</b></div><button onclick="cart.splice(${i},1);saveCart();openCart()" style="border:0;background:none;font-size:18px">×</button></div>`).join('')}<div class="summary"><b>Total: ${money(total)}</b></div><button class="primary" style="width:100%" onclick="closeModal();checkout()">Proceed to Checkout</button></div></div>`}
function checkout(){if(!cart.length)return toast('Your cart is empty');const total=cart.reduce((a,x)=>a+x.price*x.qty,0);$('#modalRoot').innerHTML=`<div class="modal"><div class="modalCard checkout"><button class="close" onclick="closeModal()">×</button><span class="eyebrow">— SECURE CHECKOUT</span><h2>Complete Your Order</h2><div class="summary">${cart.map(x=>`<div style="display:flex;justify-content:space-between;margin:5px 0"><span>${esc(x.name)} · ${esc(x.size)} · ${esc(x.color)} ×${x.qty}</span><b>${money(x.price*x.qty)}</b></div>`).join('')}<hr><b>Total: ${money(total)}</b></div><form id="orderForm"><div class="checkoutGrid"><input name="name" placeholder="Full name" required><input name="phone" placeholder="Phone number" required><input name="address" placeholder="Delivery address" required><select name="payment"><option>Cash on Delivery</option><option>bKash</option><option>Nagad</option><option>Rocket</option></select><textarea name="note" placeholder="Order note (optional)"></textarea></div><button class="primary" style="width:100%;margin-top:12px">Place Order</button></form></div></div>`;$('#orderForm').onsubmit=placeOrder}
async function placeOrder(e){e.preventDefault();const f=new FormData(e.target),o={customer:Object.fromEntries(f.entries()),items:cart,total:cart.reduce((a,x)=>a+x.price*x.qty,0)};const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)}),j=await r.json();if(!r.ok)return toast(j.error||'Order failed');cart=[];saveCart();const wa='https://wa.me/88'+String(D.settings.whatsapp).replace(/\D/g,'')+'?text='+encodeURIComponent('My order ID is '+j.id);$('#modalRoot').innerHTML=`<div class="modal"><div class="modalCard checkout"><span class="eyebrow">ORDER CONFIRMED</span><h2>Thank you for your order.</h2><p style="font-size:11px;color:#756267">Your order ID is <b>${esc(j.id)}</b>. Our team will contact you shortly.</p><a class="primary" target="_blank" rel="noopener" href="${wa}">Contact on WhatsApp</a></div></div>`}

function saveChatOrder(){localStorage.setItem('srstyleChatOrder',JSON.stringify(chatOrder))}
function clearChatOrder(){chatOrder=null;localStorage.removeItem('srstyleChatOrder')}
function normalizePhone(v){return String(v||'').replace(/[^0-9+]/g,'')}
function isValidPhone(v){const n=normalizePhone(v).replace(/^\+88/,'').replace(/^88/,'');return /^01[3-9]\d{8}$/.test(n)}
function findOrderProduct(text){
  const r=assistantProducts(text);
  if(r.items.length && r.items[0]) return r.items[0];
  const q=cleanChat(text);
  return (D?.products||[]).find(p=>q.includes(cleanChat(p.name)))||null;
}
function startChatOrder(id){
  const p=(D?.products||[]).find(x=>x.id===id); if(!p||Number(p.stock||0)<1)return toast('This product is out of stock');
  chatOrder={active:true,stage:'size',items:[{productId:p.id,name:p.name,price:Number(p.price),image:p.image,qty:1}],customer:{},product:p};
  saveChatOrder(); $('#assistant').classList.add('open'); bot(`Great choice 😊 <b>${esc(p.name)}</b> select korechi. Apnar <b>size</b> bolun: ${esc((p.sizes||[]).join(' / '))}`);
  if(p.colors?.length) bot(`Color-o select korte hobe. Available: <b>${esc(p.colors.join(' / '))}</b>`);
}
async function handleChatOrder(raw){
  const text=cleanChat(raw); if(!text)return false;
  const lower=text;
  if(chatOrder?.active){
    if(/cancel|বাতিল|না order|order korbo na/.test(lower)){clearChatOrder();bot('Order process cancel kore dilam 😊');return true}
    if(chatOrder.stage==='size'){
      const size=extractSize(text); const p=chatOrder.product;
      if(!size || !(p.sizes||[]).some(x=>x.toLowerCase()===size)){bot(`Apnar size ta bolun: <b>${esc((p.sizes||[]).join(' / '))}</b> 😊`);return true}
      chatOrder.items[0].size=size; chatOrder.stage='color';saveChatOrder();
      if((p.colors||[]).length>1) bot(`Nice! Ebar <b>color</b> bolun: ${esc(p.colors.join(' / '))}`); else {chatOrder.items[0].color=p.colors?.[0]||'';chatOrder.stage='name';saveChatOrder();bot('Great 😊 Ekhon apnar <b>full name</b> din.');}
      return true;
    }
    if(chatOrder.stage==='color'){
      const p=chatOrder.product; const found=(p.colors||[]).find(c=>cleanChat(c)===text||text.includes(cleanChat(c))||cleanChat(c).includes(text));
      if(!found){bot(`Available color: <b>${esc((p.colors||[]).join(' / '))}</b>. Kon color niben?`);return true}
      chatOrder.items[0].color=found;chatOrder.stage='name';saveChatOrder();bot('Perfect 😊 Ekhon apnar <b>full name</b> din.');return true;
    }
    if(chatOrder.stage==='name'){
      if(text.length<2){bot('Please apnar full name ta din 😊');return true}
      chatOrder.customer.name=String(raw).trim();chatOrder.stage='phone';saveChatOrder();bot('Dhonnobad ❤️ Ekhon apnar <b>mobile number</b> din.');return true;
    }
    if(chatOrder.stage==='phone'){
      if(!isValidPhone(raw)){bot('Valid Bangladesh mobile number din, example: <b>01753519603</b> 😊');return true}
      chatOrder.customer.phone=normalizePhone(raw).replace(/^\+?88/,'');chatOrder.stage='address';saveChatOrder();bot('Ekhon <b>full delivery address</b> din (area + district shoho).');return true;
    }
    if(chatOrder.stage==='address'){
      if(text.length<8){bot('Please full delivery address ta din 😊');return true}
      chatOrder.customer.address=String(raw).trim();chatOrder.stage='payment';saveChatOrder();bot('Payment method select korun: <b>Cash on Delivery</b>, <b>bKash</b>, <b>Nagad</b> ba <b>Rocket</b>.');return true;
    }
    if(chatOrder.stage==='payment'){
      let payment='';
      if(/cash|cod|cash on delivery|ক্যাশ|হাতে/.test(lower))payment='Cash on Delivery';
      else if(/bkash|বিকাশ/.test(lower))payment='bKash';
      else if(/nagad|নগদ/.test(lower))payment='Nagad';
      else if(/rocket|রকেট/.test(lower))payment='Rocket';
      if(!payment){bot('Payment method ta bolun: <b>Cash on Delivery / bKash / Nagad / Rocket</b>');return true}
      chatOrder.customer.payment=payment;
      if(payment==='Cash on Delivery'){chatOrder.stage='confirm';saveChatOrder();showChatOrderSummary();}
      else {chatOrder.stage='transaction';saveChatOrder();bot(`${payment} selected ✅ Ekhon payment korar por <b>Transaction ID</b> din.`)}
      return true;
    }
    if(chatOrder.stage==='transaction'){
      if(text.length<4){bot('Valid Transaction ID ta din 😊');return true}
      chatOrder.customer.transactionId=String(raw).trim();chatOrder.stage='confirm';saveChatOrder();showChatOrderSummary();return true;
    }
    if(chatOrder.stage==='confirm'){
      if(/^(yes|confirm|confirmed|ha|hya|হ্যাঁ|জি|ঠিক আছে|confirm order|অর্ডার confirm)$/i.test(text)||/confirm|নিশ্চিত|অর্ডার দিন|order den/.test(text)){
        await submitChatOrder();return true;
      }
      bot('Order submit korte <b>Confirm</b> bolun. Change korte chaile bolun kon information change korte chan.');return true;
    }
  }
  const intent=findKey(SYN.intent,text);
  const wantsOrder= intent==='order' || /order now|order korbo|order korte|kinbo|kinte chai|buy korte|অর্ডার/.test(text);
  if(wantsOrder){
    const p=findOrderProduct(text);
    if(p){startChatOrder(p.id);return true}
    const r=assistantProducts(text);
    if(r.items.length){bot('Obosshoi 😊 Kon product ta order korte chan? Nicher product theke <b>Order in Chat</b> press korun.');r.items.slice(0,4).forEach(p=>bot(chatCard(p)));return true}
    bot('Obosshoi 😊 Kon product ta order korte chan? Product-er naam/color/category bolun.');return true;
  }
  // Allow “this one” after product cards by using the last selected/first matching product.
  if(/this one|eta|ei ta|এইটা|এটা/.test(text) && window.lastChatProductId){startChatOrder(window.lastChatProductId);return true}
  return false;
}
function showChatOrderSummary(){
  const x=chatOrder.items[0],c=chatOrder.customer,total=x.price*x.qty;
  bot(`<div class="chatOrderSummary"><b>Order Summary 🛍️</b><div>${esc(x.name)} · ${esc(x.size)} · ${esc(x.color)} ×${x.qty}</div><div>Total: <b>${money(total)}</b></div><hr><div>Name: ${esc(c.name)}</div><div>Phone: ${esc(c.phone)}</div><div>Address: ${esc(c.address)}</div><div>Payment: ${esc(c.payment)}${c.transactionId?` · TXN: ${esc(c.transactionId)}`:''}</div><p style="margin:8px 0 0">সব ঠিক থাকলে <b>Confirm</b> লিখুন.</p></div>`);
}
async function submitChatOrder(){
  const o={customer:{...chatOrder.customer},items:chatOrder.items.map(x=>({...x})),total:chatOrder.items.reduce((a,x)=>a+Number(x.price)*Number(x.qty),0)};
  try{
    const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});const j=await r.json();
    if(!r.ok)throw Error(j.error||'Order failed');
    clearChatOrder();bot(`🎉 <b>Order confirmed!</b><br>Your Order ID: <b>${esc(j.id)}</b><br>Our team will contact you shortly. Thank you for shopping with Made by Nexora WEB ❤️`);
  }catch(e){bot('Order submit korte problem hoyeche. Please abar try korun ba WhatsApp-e contact korun.');}
}
function assistantBoot(){const chat=$('#chat'),input=$('#chatInput'),send=$('#chatSend');if(!chat||!input||!send)return;chat.innerHTML='';let h=JSON.parse(localStorage.getItem('srstyleChat')||'[]');h=h.filter((x,i,a)=>i===0||x.t!==a[i-1].t||x.c!==a[i-1].c);if(h.length){h.forEach(x=>chatMsg(x.t,x.c,false));localStorage.setItem('srstyleChat',JSON.stringify(h.slice(-50)))}else{bot('Hello! 👋 Ami Made by Nexora WEB-er personal shopping assistant. Bangla, English ba Banglish—jeibhabei bolen, ami bujhar chesta korbo. Product, size, color, budget, stock, delivery, payment ba order niye help korte parbo.')}send.onclick=sendChat;input.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat()}}}
function bot(t,save=true){chatMsg('bot',t,save)}
function chatMsg(t,c,save=true){const d=document.createElement('div');d.className='msg '+t;d.innerHTML=c;const chat=$('#chat');if(chat){chat.appendChild(d);requestAnimationFrame(()=>chat.scrollTo({top:chat.scrollHeight,behavior:'smooth'}))}if(save){const h=JSON.parse(localStorage.getItem('srstyleChat')||'[]');h.push({t,c});localStorage.setItem('srstyleChat',JSON.stringify(h.slice(-50)))}}
function cleanChat(v){return bnDigits(String(v).toLowerCase()).replace(/[!?.,;:(){}\[\]"']/g,' ').replace(/\s+/g,' ').trim()}
function bnDigits(v){return String(v).replace(/[০-৯]/g,d=>String('০১২৩৪৫৬৭৮৯'.indexOf(d)))}
const SYN={
 category:{formal:['formal','shirt','oxford','office','ফরমাল','শার্ট'],tshirt:['t shirt','t-shirt','tee','টি শার্ট','টিশার্ট'],polo:['polo','পোলো'],jacket:['jacket','জ্যাকেট'],set:['set','ensemble','সেট'],traditional:['traditional','ethnic','panjabi','kurta','traditional wear','ট্রাডিশনাল','পাঞ্জাবি'],new:['new','new arrival','notun','নতুন','নিউ'],signature:['signature','premium','luxury','সিগনেচার','প্রিমিয়াম']},
 color:{navy:['navy','deep blue','neel','নীল'],champagne:['champagne','ivory','cream','ক্রিম','চ্যাম্পেন'],green:['green','emerald','shobuj','সবুজ'],burgundy:['burgundy','maroon','wine','মেরুন','বারগান্ডি'],pink:['pink','rose','golapi','গোলাপি'],black:['black','kalo','কালো'],gold:['gold','sonali','সোনালি']},
 intent:{greet:['hi','hello','hey','salam','assalamualaikum','হাই','হ্যালো','সালাম'],thanks:['thanks','thank you','ধন্যবাদ'],delivery:['delivery','shipping','courier','ডেলিভারি','কুরিয়ার'],payment:['payment','bkash','বিকাশ','nagad','নগদ','rocket','রকেট','cod','cash on delivery'],order:['order','buy','purchase','kinbo','kinte chai','কিনবো','কিনতে চাই','অর্ডার'],help:['help','suggest','recommend','suggestion','help me','সাজেস্ট','পরামর্শ','সাহায্য']}
};
function findKey(map,text){return Object.entries(map).find(([k,arr])=>arr.some(w=>text.includes(w)))?.[0]||null}
function extractSize(text){const m=text.match(/(?:size|সাইজ|মাপ)?\s*(xxl|xl|large|l|medium|m|small|s)\b/);if(!m)return null;return ({small:'s',medium:'m',large:'l'}[m[1]]||m[1]).toLowerCase()}
function extractBudget(text){const nums=[...text.matchAll(/\b\d{3,6}\b/g)];for(const m of nums){const around=text.slice(Math.max(0,m.index-40),m.index+40);if(/under|below|less|within|budget|max|under|moddhe|maddhe|er moddhe|এর মধ্যে|কম|ভিতরে|টাকার মধ্যে/.test(around))return Number(m[0])}return null}
function scoreProduct(p,q){const t=q.toLowerCase(), hay=(p.name+' '+p.category+' '+(p.colors||[]).join(' ')+' '+(p.description||'')).toLowerCase();let score=0;for(const w of t.split(/\s+/)){if(w.length>2&&hay.includes(w))score+=1}return score}
function assistantProducts(q){const text=cleanChat(q),all=D.products.filter(p=>p.active!==false);let out=[...all];const cat=findKey(SYN.category,text),color=findKey(SYN.color,text),size=extractSize(text),max=extractBudget(text);if(cat){const map={formal:'Formal Shirts',tshirt:'Premium T-Shirts',polo:'Polo Shirts',jacket:'Jackets',set:'Premium Sets',traditional:'Traditional Wear',new:'New Arrivals',signature:'Signature Edit'};out=out.filter(p=>p.category===map[cat]||p.name.toLowerCase().includes(cat))}if(color)out=out.filter(p=>(p.colors||[]).some(c=>SYN.color[color].some(w=>c.toLowerCase().includes(w))));if(size)out=out.filter(p=>(p.sizes||[]).some(x=>x.toLowerCase()===size));if(max)out=out.filter(p=>Number(p.price)<=max);const exact=all.filter(p=>text.includes(p.name.toLowerCase()));if(exact.length)out=exact;out.sort((a,b)=>scoreProduct(b,text)-scoreProduct(a,text));return{items:out,cat,color,size,max,text}}
function reply(v){const q=cleanChat(v);if(!q)return;const r=assistantProducts(q), intent=findKey(SYN.intent,q), show=/show|dekhaw|dekhao|dekhte|দেখাও|দেখতে|দেখান|দেখাও/.test(q), sizeAsk=/size|sizing|measurement|সাইজ|মাপ/.test(q), colorAsk=/color|colour|রং|কালার/.test(q), priceAsk=/price|দাম|budget|cheap|কম দামে|কত টাকা/.test(q), stockAsk=/stock|available|ache|আছে|pawa jabe|পাওয়া যাবে/.test(q);
if(intent==='greet'){bot('Hello! 👋 Welcome to Made by Nexora WEB. Apni ki khujchen—product, color, size, budget, delivery naki order help?');return}
if(intent==='thanks'){bot('You’re very welcome! 😊 Aro kichu dorkar hole just bolben.');return}
if(intent==='delivery'){bot('Yes 😊 Bangladesh-wide delivery support ache. Checkout-e apnar naam, phone ar full address dile order submit korte parben.');return}
if(intent==='payment'){bot('Checkout-e Cash on Delivery, bKash, Nagad and Rocket option ache.');return}
if(r.items.length&&(r.cat||r.color||r.size||r.max||show||sizeAsk||colorAsk||priceAsk||stockAsk)){let intro='';if(r.cat)intro=`${r.cat.replace(/([A-Z])/g,' $1')} collection theke best matches dilam ✨`;else if(r.color)intro=`${r.color} tone-er matching pieces dilam ✨`;else if(r.size)intro=`${r.size.toUpperCase()} size available emon products dilam ✨`;else if(r.max)intro=`${money(r.max)} er moddhe best options dilam ✨`;else if(priceAsk)intro='Price-wise kichu best options dilam—jeta pochondo hoy details open korun 😊';else if(stockAsk)intro='Stock-e available options gula dekhalen 😊';else intro='Apnar kothar sathe closest products-gula dilam 😊';bot(intro);r.items.slice(0,6).forEach(p=>bot(chatCard(p)));return}
if(intent==='order'){bot('Obosshoi 😊 Nicher product theke <b>Order in Chat</b> press korlei ami naam, phone, address, payment niye order complete kore dibo.');r.items.slice(0,4).forEach(p=>bot(chatCard(p)));return}
if(intent==='help'){bot('Ami product name/category/color/size/budget diye search kore suggest korte pari. Example: “black er kichu dekhaw”, “2000 er moddhe”, “M size ache?”, “jacket dekhaw”.');return}
bot('Ami bujhte parchi je apni shopping niye help chacchen 😊 Product-er naam, category, color, size ba budget-er sathe kotha bolun—ami matching options dekhiye dibo.');}
function chatCard(p){window.lastChatProductId=p.id;return `<div class="chatProduct"><img src="${esc(p.image)}" alt="${esc(p.name)}"><div class="chatProductBody"><b>${esc(p.name)}</b><small>${esc(p.category)} · ${money(p.price)}</small><small>${esc((p.sizes||[]).join(' / '))} · ${esc((p.colors||[]).join(' / '))}</small><div class="chatBtns"><button onclick="openProduct('${p.id}')">View</button><button onclick="quickAdd('${p.id}')">Add to Cart</button><button onclick="startChatOrder('${p.id}')">Order in Chat</button></div></div></div>`}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1600)}
$('#cartBtn').onclick=openCart;$('#assistantFab').onclick=()=>$('#assistant').classList.add('open');$('#assistantClose').onclick=()=>$('#assistant').classList.remove('open');
$('#menuBtn').onclick=()=>{$('#drawer').classList.add('open');$('#backdrop').classList.add('show')};$('#drawerClose').onclick=closeDrawer;$('#backdrop').onclick=closeDrawer;function closeDrawer(){$('#drawer').classList.remove('open');$('#backdrop').classList.remove('show')}
$('#searchBtn').onclick=()=>{location.hash='shop';renderProducts('all',$('#search').value)};$('#search').onkeydown=e=>{if(e.key==='Enter')$('#searchBtn').click()};$('#drawerSearchInput').oninput=e=>renderProducts('all',e.target.value);$('#drawerSearchInput').onkeydown=e=>{if(e.key==='Enter'){closeDrawer();location.hash='shop';renderProducts('all',e.target.value)}};
$$('.filters button').forEach(b=>b.onclick=()=>{$$('.filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProducts(b.dataset.filter,'')});
document.addEventListener('click',e=>{const c=e.target.closest('.cat');if(c){const q=c.dataset.category;$('#search').value=q;location.hash='shop';renderProducts('all',q);closeDrawer()}});
const rt=$('#reviewsTrack');setInterval(()=>{if(rt&&rt.scrollHeight>rt.clientHeight){rt.scrollBy({top:170,behavior:'smooth'});if(rt.scrollTop+rt.clientHeight>=rt.scrollHeight-8)rt.scrollTo({top:0,behavior:'smooth'})}},3200);
boot();
