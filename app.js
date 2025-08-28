
function updateStickyTabsOffset(){
  try{
    const h=document.querySelector('.app-header');
    if(h){ document.documentElement.style.setProperty('--tabs-top', (h.offsetHeight||56)+'px'); }
  }catch(e){}
}

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], money=v=>'₸'+Math.round(v||0).toLocaleString('ru-RU');
const hav=(a,b)=>{const R=6371,toRad=x=>x*Math.PI/180;const dLat=toRad(b.lat-a.lat),dLon=toRad(b.lng-a.lng);const s=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(s));};

const state={items:[],categories:[],cart:JSON.parse(localStorage.getItem('wingo.cart')||'[]'),activeCategory:null,sheetItem:null,sheetQty:1,select:{flavors:[],garnish:null,dipQty:0},conf:null,geo:{status:'unknown',distanceKm:null,inside:false},mode:'delivery'};

const el={tabs:$('#tabs'),grid:$('#grid'),
sheet:$('#sheet'),sheetBackdrop:$('#sheetBackdrop'),sheetClose:$('#sheetClose'),sheetImg:$('#sheetImg'),sheetTitle:$('#sheetTitle'),sheetPrice:$('#sheetPrice'),sheetDesc:$('#sheetDesc'),
flavorBlock:$('#flavorBlock'),flavorOptions:$('#flavorOptions'),flavorMax:$('#flavorMax'),flavorHint:$('#flavorHint'),
garnishBlock:$('#garnishBlock'),garnishOptions:$('#garnishOptions'),
dipsBlock:$('#dipsBlock'),dipsInfo:$('#dipsInfo'),dipMinus:$('#dipMinus'),dipPlus:$('#dipPlus'),dipQty:$('#dipQty'),dipPriceView:$('#dipPriceView'),
qtyMinus:$('#qtyMinus'),qtyPlus:$('#qtyPlus'),qtyValue:$('#qtyValue'),addToCart:$('#addToCart'),
cartBar:$('#cartBar'),cartOpenArea:$('#cartOpenArea'),cartCount:$('#cartCount'),cartTotal:$('#cartTotal'),openCheckout:$('#openCheckout'),
checkout:$('#checkout'),coBackdrop:$('#coBackdrop'),coClose:$('#coClose'),
coName:$('#coName'),coPhone:$('#coPhone'),
addressGroup:$('#addressGroup'),coStreet:$('#coStreet'),coHouse:$('#coHouse'),coFloor:$('#coFloor'),coApt:$('#coApt'),coNote:$('#coNote'),
coSummary:$('#coSummary'),coTotal:$('#coTotal'),coWhatsApp:$('#coWhatsApp'),
hoursState:$('#hoursState'),geoBtn:$('#geoBtn'),geoBanner:$('#geoBanner'),deliveryMode:$('#deliveryMode'),modeSegment:$('#modeSegment')};

async function loadAll(){
  const[m,c]=await Promise.all([fetch('menu.json?v=24'),fetch('config.json')]);
  state.items=(await m.json()).items||[]; state.conf=await c.json();
  setupHours(); buildCategories(); updateStickyTabsOffset(); render(); updateCartBar(); updateGeoUI();
}
function setupHours(){
  const n=new Date(), o=state.conf.business_hours.daily.open.split(':').map(Number), c=state.conf.business_hours.daily.close.split(':').map(Number);
  const s=new Date(n); s.setHours(o[0],o[1],0,0); const e=new Date(n); e.setHours(c[0],c[1],0,0);
  el.hoursState.textContent=(n>=s&&n<=e)?`Открыто · ${state.conf.business_hours.daily.open}–${state.conf.business_hours.daily.close}`:`Закрыто · ${state.conf.business_hours.daily.open}–${state.conf.business_hours.daily.close}`;
}
function buildCategories(){
  const set=new Set(state.items.map(i=>i.category)); state.categories=[...set]; el.tabs.innerHTML='';
  state.categories.forEach((cat,i)=>{
    const a=document.createElement('a'); a.href='#'; a.textContent=cat; a.className='tab'+((state.activeCategory===cat)||(!state.activeCategory&&i===0)?' active':'');
    a.onclick=e=>{e.preventDefault(); state.activeCategory=cat; render(); $$('#tabs a').forEach(n=>n.classList.toggle('active',n.textContent===cat)); };
    el.tabs.appendChild(a);
  });
}
function render(){
  const base=state.activeCategory?state.items.filter(i=>i.category===state.activeCategory):state.items;
  el.grid.innerHTML=''; const f=document.createDocumentFragment();
  base.forEach(item=>{
    const card=document.createElement('div'); card.className='card';
    const img=document.createElement('img'); img.className='thumb'; img.src=item.image||'images/placeholder.png'; img.alt=item.name;
    const body=document.createElement('div'); body.className='card-body';
    const title=document.createElement('div'); title.className='title'; title.textContent=item.name;
    const actions=document.createElement('div'); actions.className='actions';
    const price=document.createElement('div'); price.className='price'; price.textContent=money(item.price);
    const btn=document.createElement('button'); btn.className='btn'; btn.textContent='Выбрать'; btn.onclick=()=>openSheet(item);
    actions.appendChild(price); actions.appendChild(btn); body.appendChild(title); body.appendChild(actions);
    card.appendChild(img); card.appendChild(body); card.onclick=()=>openSheet(item); f.appendChild(card);
  }); el.grid.appendChild(f);
}

function openSheet(item){
  state.sheetItem=item; state.sheetQty=1; state.select={flavors:[],garnish:null,dipQty:0};
  el.sheetImg.src=item.image||'images/placeholder.png'; el.sheetTitle.textContent=item.name; el.sheetPrice.textContent=money(item.price); el.sheetDesc.textContent=item.description||''; el.qtyValue.textContent=state.sheetQty;

  if(item.flavors_max){
    el.flavorBlock.style.display=''; el.flavorMax.textContent=item.flavors_max; el.flavorOptions.innerHTML='';
    (state.conf.cooking_flavors||[]).forEach(fl=>{
      const o=document.createElement('button'); o.className='opt'; o.textContent=fl;
      o.onclick=()=>{const i=state.select.flavors.indexOf(fl); if(i>=0){state.select.flavors.splice(i,1); o.classList.remove('active');}
        else if(state.select.flavors.length<item.flavors_max){state.select.flavors.push(fl); o.classList.add('active');} updateFlavorHint(item); };
      el.flavorOptions.appendChild(o);
    }); updateFlavorHint(item);
  } else { el.flavorBlock.style.display='none'; }

  if(item.garnish&&item.garnish.options&&item.garnish.options.length){
    el.garnishBlock.style.display=''; el.garnishOptions.innerHTML='';
    item.garnish.options.forEach((g,i)=>{ const o=document.createElement('button'); o.className='opt'+(i===0?' active':''); o.textContent=g; if(i===0) state.select.garnish=g;
      o.onclick=()=>{ state.select.garnish=g; [...el.garnishOptions.children].forEach(n=>n.classList.toggle('active',n===o)); };
      el.garnishOptions.appendChild(o);
    });
  } else { el.garnishBlock.style.display='none'; }

  if(typeof item.dips_included==='number'){
    el.dipsBlock.style.display=''; el.dipsInfo.textContent = `Входит: ${item.dips_included} дип` + (item.dips_included===1?'':'ов');
    state.select.dipQty=0; el.dipQty.textContent='0'; el.dipPriceView.textContent=state.conf.dip_unit_price?`+ ${money(state.conf.dip_unit_price)} за шт.`:'';
  } else { el.dipsBlock.style.display='none'; }

  el.cartBar.classList.add('hidden');
  el.sheet.classList.add('show'); el.sheet.setAttribute('aria-hidden','false');
}
function updateFlavorHint(item){ const max=item.flavors_max||1, cnt=state.select.flavors.length; el.flavorHint.textContent=`Выбрано ${cnt} из ${max}`; }
function closeSheet(){ el.sheet.classList.remove('show'); el.sheet.setAttribute('aria-hidden','true'); el.cartBar.classList.remove('hidden'); }
el.sheetBackdrop.onclick=closeSheet;
el.sheetClose.onclick=closeSheet;

el.qtyMinus.onclick=()=>{ if(state.sheetQty>1){ state.sheetQty--; el.qtyValue.textContent=state.sheetQty; } };
el.qtyPlus.onclick=()=>{ state.sheetQty++; el.qtyValue.textContent=state.sheetQty; };
if(el.dipMinus){ el.dipMinus.onclick=()=>{ if(state.select.dipQty>0){ state.select.dipQty--; } el.dipQty.textContent=state.select.dipQty; } };
if(el.dipPlus){ el.dipPlus.onclick=()=>{ state.select.dipQty++; } el.dipQty.textContent=state.select.dipQty; };

function addToCart(){
  const it=state.sheetItem; if(!it) return;
  if(it.flavors_max && state.select.flavors.length===0){ alert('Выберите хотя бы 1 вкус'); return; }
  const key=[it.id||it.name,(state.select.flavors||[]).join('+'),state.select.garnish||''].join('|');
  const ex=state.cart.find(c=>c.key===key);
  if(ex){ ex.qty+=state.sheetQty; ex.extraDipQty=(ex.extraDipQty||0)+state.select.dipQty; }
  else { state.cart.push({key,id:it.id||it.name,name:it.name,basePrice:it.price,qty:state.sheetQty,flavors:[...state.select.flavors],garnish:state.select.garnish,dips_included:it.dips_included||0,extraDipQty:state.select.dipQty}); }
  localStorage.setItem('wingo.cart',JSON.stringify(state.cart));
  updateCartBar(); closeSheet();
}
el.addToCart.onclick=addToCart;

function updateCartBar(){
  const count=state.cart.reduce((a,c)=>a+c.qty,0);
  const total=state.cart.reduce((a,c)=>a+c.qty*(c.basePrice+(c.extraDipQty||0)*(state.conf.dip_unit_price||0)),0);
  el.cartCount.textContent=count+' поз.'; el.cartTotal.textContent=money(total);
}
el.openCheckout.onclick=()=>openCheckout();
el.cartOpenArea.onclick=()=>openCheckout();

function openCheckout(){
  state.mode = state.geo.inside ? 'delivery' : 'pickup';
  updateModeUI();
  if(!el.coPhone.value){ el.coPhone.value = '+7'; }
  el.checkout.classList.add('show'); el.checkout.setAttribute('aria-hidden','false');
  renderCoSummary();
}
el.coClose.onclick=()=>{ el.checkout.classList.remove('show'); el.checkout.setAttribute('aria-hidden','true'); };
el.coBackdrop.onclick=()=>{ el.checkout.classList.remove('show'); el.checkout.setAttribute('aria-hidden','true'); };

el.modeSegment.addEventListener('click', (e)=>{
  const btn = e.target.closest('.seg'); if(!btn) return;
  const mode = btn.getAttribute('data-mode');
  if(mode==='delivery' && state.geo.status==='outside'){ alert('Вы вне зоны доставки. Доступен самовывоз.'); return; }
  state.mode = mode; updateModeUI();
});
function updateModeUI(){
  if(state.mode==='delivery'){ el.deliveryMode.textContent='Режим: Доставка'; el.addressGroup.style.display=''; }
  else { el.deliveryMode.textContent='Режим: Самовывоз — '+state.conf.pickup.address; el.addressGroup.style.display='none'; }
  $$('#modeSegment .seg').forEach(b=>b.classList.toggle('active', b.getAttribute('data-mode')===state.mode));
}

function renderCoSummary(){
  if(state.cart.length===0){ el.coSummary.innerHTML='<em>Корзина пуста</em>'; el.coTotal.textContent=money(0); return; }
  const lines = state.cart.map(c=>{
    const extras=[];
    if(c.flavors&&c.flavors.length) extras.push('вкус: '+c.flavors.join(' + '));
    if(c.garnish) extras.push('гарнир: '+c.garnish);
    if(c.dips_included) extras.push('входит дипов: '+c.dips_included);
    if(c.extraDipQty) extras.push('доп. дипов: '+c.extraDipQty);
    const sum=c.qty*(c.basePrice+(c.extraDipQty||0)*(state.conf.dip_unit_price||0));
    return `<div class="co-item" data-key="${c.key}">
      <div class="co-title">${c.name}${extras.length?' ('+extras.join(', ')+')':''}</div>
      <div class="co-controls">
        <button class="co-qtybtn co-minus" aria-label="минус">−</button>
        <span>${c.qty}</span>
        <button class="co-qtybtn co-plus" aria-label="плюс">+</button>
        <button class="co-delete">Удалить</button>
        <div class="co-sum">${money(sum)}</div>
      </div>
    </div>`;
  }).join('');
  const total = state.cart.reduce((a,c)=>a+c.qty*(c.basePrice+(c.extraDipQty||0)*(state.conf.dip_unit_price||0)),0);
  el.coSummary.innerHTML = lines; el.coTotal.textContent = money(total);
}
el.coSummary.addEventListener('click', (e)=>{
  const row = e.target.closest('.co-item'); if(!row) return;
  const key = row.getAttribute('data-key');
  const item = state.cart.find(x=>x.key===key); if(!item) return;
  if(e.target.classList.contains('co-minus')){ if(item.qty>1) item.qty--; else state.cart = state.cart.filter(x=>x.key!==key); }
  else if(e.target.classList.contains('co-plus')){ item.qty++; }
  else if(e.target.classList.contains('co-delete')){ state.cart = state.cart.filter(x=>x.key!==key); }
  localStorage.setItem('wingo.cart', JSON.stringify(state.cart));
  renderCoSummary(); updateCartBar();
});

function updateGeoUI(){
  const b=$('#geoBanner');
  if(state.geo.status==='inside'){ b.className='geo-banner ok'; b.textContent=`Доставляем к вам! Вы в зоне (≈ ${state.geo.distanceKm.toFixed(2)} км от нас)`; }
  else if(state.geo.status==='outside'){ b.className='geo-banner bad'; b.textContent=`Вне зоны доставки (≈ ${state.geo.distanceKm.toFixed(2)} км). Доступен самовывоз: ${state.conf.pickup.address}`; }
  else if(state.geo.status==='denied'){ b.className='geo-banner bad'; b.textContent='Геолокация отключена. Можно оформить самовывоз или попробовать ещё раз.'; }
  else { b.className='geo-banner'; b.style.display='none'; return; }
  b.style.display='block';
}
function doGeocheck(){
  if(!navigator.geolocation){ state.geo.status='denied'; updateGeoUI(); return; }
  el.geoBtn.disabled=true; el.geoBtn.textContent='Определяем...';
  navigator.geolocation.getCurrentPosition(pos=>{
    const user={lat:pos.coords.latitude,lng:pos.coords.longitude};
    const center=state.conf.delivery.center; const r=state.conf.delivery.radius_km||1.5;
    const dist=hav(center,user); state.geo.distanceKm=dist; state.geo.inside=dist<=r;
    state.geo.status=state.geo.inside?'inside':'outside';
    localStorage.setItem('wingo.geo', JSON.stringify(state.geo));
    updateGeoUI();
    el.geoBtn.disabled=false; el.geoBtn.textContent='Проверить доставку';
  }, err=>{
    state.geo.status='denied'; state.geo.inside=false; updateGeoUI();
    el.geoBtn.disabled=false; el.geoBtn.textContent='Проверить доставку';
  }, {enableHighAccuracy:true, timeout:7000, maximumAge:30000});
}
el.geoBtn.onclick=doGeocheck;

function makeWAOrderLink(){
  const phone=state.conf.whatsapp_number;
  const lines=state.cart.map(c=>{
    const extras=[]; if(c.flavors&&c.flavors.length) extras.push('вкус: '+c.flavors.join(' + '));
    if(c.garnish) extras.push('гарнир: '+c.garnish);
    if(c.dips_included) extras.push('входит дипов: '+c.dips_included);
    if(c.extraDipQty) extras.push('доп. дипов: '+c.extraDipQty);
    const sum=Math.round(c.qty*(c.basePrice+(c.extraDipQty||0)*(state.conf.dip_unit_price||0)));
    return `- ${c.name}${extras.length?' ('+extras.join(' + ')+')':''} × ${c.qty} = ${sum} ₸`;
  }).join('%0A');
  const total=Math.round(state.cart.reduce((a,c)=>a+c.qty*(c.basePrice+(c.extraDipQty||0)*(state.conf.dip_unit_price||0)),0));

  let addr=''; if(state.mode==='delivery'){
    const street=(el.coStreet.value||'').trim();
    const house=(el.coHouse.value||'').trim();
    const floor=(el.coFloor.value||'').trim();
    const apt=(el.coApt.value||'').trim();
    if(!street||!house){
      alert('Пожалуйста, укажите улицу и дом.');
      throw new Error('Address street/house required');
    }
    addr=`ул. ${street}, дом ${house}` + (floor?`, этаж ${floor}`:'') + (apt?`, кв. ${apt}`:'');
  }

  const name=encodeURIComponent((el.coName.value||'').trim());
  if(!el.coPhone.value) el.coPhone.value='+7';
  if(!el.coPhone.value.startsWith('+7')) el.coPhone.value='+7'+el.coPhone.value.replace(/^\+?/,'');
  const phoneText=encodeURIComponent((el.coPhone.value||'').trim());
  const mode= state.mode==='delivery' ? 'Доставка' : ('Самовывоз — '+state.conf.pickup.address);
  const addrEnc=encodeURIComponent(addr);
  const note=(el.coNote.value||'').trim();
  const noteEnc=encodeURIComponent(note);
  const text=`Заказ WINGO:%0A${lines}%0AИтого: ${total} ₸%0AРежим: ${mode}%0AИмя: ${name}%0AТел: ${phoneText}%0AАдрес: ${addrEnc}%0AКомментарий: ${noteEnc}`;
  return `https://wa.me/${phone}?text=${text}${state.conf.utm}`;
}
el.coWhatsApp.onclick=()=>{
  if(state.cart.length===0){ alert('Сначала добавьте позиции в корзину'); return; }
  try{ window.open(makeWAOrderLink(),'_blank','noopener'); }catch(e){}
};

loadAll();

window.addEventListener('resize', updateStickyTabsOffset);