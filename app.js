'use strict';

const state = {
  conf: null,
  menu: null,
  cart: [],
  mode: 'pickup',
  geo: { status: 'unknown', distance_km: null },
  sheetItem: null,
  sheetQty: 1,
  select: { flavors: [], dipCounts: {}, drinkCounts: {} }
};

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const money = v => '₸' + (v||0).toLocaleString('ru-RU');

async function loadAll(){
  const [conf, menu] = await Promise.all([
    fetch('./config.json').then(r=>r.json()),
    fetch('./menu.json').then(r=>r.json())
  ]);
  state.conf = conf;
  state.menu = menu;
}

function uniq(arr){ return [...new Set(arr)]; }
function buildTabs(){
  const cats = uniq((state.menu.items||[]).map(i=>i.category||'Меню'));
  const tabs = $('#tabs'); tabs.innerHTML='';
  cats.forEach((c,idx)=>{
    const b=document.createElement('button');
    b.className='tab'+(idx===0?' active':'');
    b.textContent=c;
    b.onclick=()=>selectTab(c);
    tabs.appendChild(b);
  });
}
function selectTab(cat){
  $$('#tabs .tab').forEach(t=>t.classList.toggle('active', t.textContent===cat));
  const items = (state.menu.items||[]).filter(i=>(i.category||'Меню')===cat);
  renderGrid(items);
}
function renderGrid(items){
  const g=$('#grid'); g.innerHTML='';
  items.forEach((it,idx)=>{
    const card=document.createElement('article'); card.className='card';
    const imgBox=document.createElement('div'); imgBox.className='img';
    const ph=document.createElement('div'); ph.className='ph'; imgBox.appendChild(ph);
    const im=new Image(); im.style.display='none'; im.onload=()=>{ im.style.display='block'; ph.remove(); };
    const seq = idx+1;
    const cands = [it.image, `images/${it.id||seq}.jpg`, `images/${it.id||seq}.png`, `images/${it.id||seq}.webp`].filter(Boolean);
    (function tryNext(i){ if(i>=cands.length){return;} im.src=cands[i]; im.onerror=()=>tryNext(i+1); })(0);
    imgBox.appendChild(im);
    const text=document.createElement('div'); text.className='text';
    const name=document.createElement('h3'); name.className='name'; name.textContent=it.name;
    const price=document.createElement('div'); price.className='price'; price.textContent=money(it.price);
    text.appendChild(name); text.appendChild(price);
    card.appendChild(imgBox); card.appendChild(text);
    card.onclick=()=>openSheet(it);
    g.appendChild(card);
  });
}

// SHEET
function openSheet(it){
  state.sheetItem=it; state.sheetQty=1; state.select={flavors:[], dipCounts:{}, drinkCounts:{}};
  $('#sheetTitle').textContent = it.name;
  $('#sheetDesc').textContent  = it.description||'';
  $('#sheetPrice').textContent = money(it.price||0);
  $('#qtyValue').textContent   = '1';
  $('#sheetImg').style.display='none'; $('#sheetPh').style.display='block';
  const im=$('#sheetImg'); im.onload=()=>{ im.style.display='block'; $('#sheetPh').style.display='none'; };
  im.src = it.image || `images/${it.id||''}.jpg`;
  renderFlavors(it); renderDips(it); renderDrinks(it);
  $('#sheet').showModal();
}
function renderFlavors(item){
  const box = $('#flavorOptions'); const hint=$('#flavorHint'); box.innerHTML='';
  if(!item.flavors_max){ $('#flavorBlock').style.display='none'; return; }
  $('#flavorBlock').style.display='';
  (state.conf.cooking_flavors||[]).forEach(fl=>{
    const name = typeof fl==='string'? fl : (fl.name||'');
    const heat = typeof fl==='object' && fl.heat!=null ? fl.heat : 0;
    const color= typeof fl==='object' && fl.color ? fl.color : '#e3e3e3';
    const b=document.createElement('button'); b.className='opt flavor';
    const peppers='🌶'.repeat(Math.min(3,Math.max(0,heat)));
    b.innerHTML = `<span class="left"><span class="dot" style="background:${color}"></span><span>${name}</span></span><span class="peppers">${peppers}</span>`;
    b.onclick=()=>{
      const i = state.select.flavors.indexOf(name);
      if(i>=0){ state.select.flavors.splice(i,1); b.classList.remove('active'); }
      else if(state.select.flavors.length < (item.flavors_max||1)){ state.select.flavors.push(name); b.classList.add('active'); }
      updateFlavorHint(item);
    };
    box.appendChild(b);
  });
  updateFlavorHint(item);
}
function updateFlavorHint(item){
  const cnt=state.select.flavors.length;
  $('#flavorHint').innerHTML = `Выбрано ${cnt} из ${item.flavors_max||1}. <span class="muted">🌶 0 — неострое · 1 — средняя · 3 — острое</span>`;
}
function fillChoiceList(rootSel, names, key, included, hintSel, infoSel, noun){
  const root=$(rootSel); const hint=$(hintSel); const info=$(infoSel);
  if(!included){ root.parentElement.style.display='none'; return; }
  root.parentElement.style.display='';
  info.textContent = `Входит: ${included} ${noun}` + (included===1?'':'ов');
  root.innerHTML='';
  state.select[key] = {}; names.forEach(n=>state.select[key][n]=0);
  const update=()=>{
    const used = Object.values(state.select[key]).reduce((a,b)=>a+b,0);
    hint.textContent = used<included ? `Осталось распределить: ${included-used}` : 'Распределено полностью';
    root.querySelectorAll('.chip .qty').forEach(span=>{ span.textContent = state.select[key][span.dataset.name]; });
  };
  names.forEach(n=>{
    const row=document.createElement('button'); row.className='chip';
    row.innerHTML = `<span class="nm">${n}</span><span class="qty" data-name="${n}">0</span>`;
    row.onclick=(e)=>{ e.preventDefault(); const used = Object.values(state.select[key]).reduce((a,b)=>a+b,0); if(used<included){ state.select[key][n]++; } else if(state.select[key][n]>0){ state.select[key][n]--; } update(); };
    root.appendChild(row);
  });
  update();
}
function renderDips(item){
  const dips = (state.conf.dip_flavors||[]);
  fillChoiceList('#dipsChoice', dips, 'dipCounts', item.dips_included||0, '#dipsLeftHint', '#dipsInfo', 'дип');
}
function renderDrinks(item){
  const drinks = (state.conf.drink_flavors||[]);
  fillChoiceList('#drinksChoice', drinks, 'drinkCounts', item.drinks_included||0, '#drinksLeftHint', '#drinksInfo', 'напиток');
}

$('#qtyMinus').addEventListener('click', ()=>{ if(state.sheetQty>1){ state.sheetQty--; $('#qtyValue').textContent=state.sheetQty; } });
$('#qtyPlus').addEventListener('click', ()=>{ state.sheetQty++; $('#qtyValue').textContent=state.sheetQty; });
$('#addBtn').addEventListener('click', ()=>{
  const it = state.sheetItem; if(!it) return;
  const entry = {
    id: it.id||it.name, name: it.name, base: it.price||0, qty: state.sheetQty,
    flavors: [...state.select.flavors],
    dips_included: it.dips_included||0, dips: {...state.select.dipCounts},
    drinks_included: it.drinks_included||0, drinks: {...state.select.drinkCounts}
  };
  state.cart.push(entry);
  $('#sheet').close();
  updateCartBar();
});
$('#sheetClose').addEventListener('click', ()=>$('#sheet').close());

function updateCartBar(){
  const total=state.cart.reduce((s,c)=>s+c.base*c.qty,0);
  const count=state.cart.reduce((s,c)=>s+c.qty,0);
  $('#cartText').textContent = `Корзина · ${count} поз. · `+money(total);
}
$('#checkoutBtn').addEventListener('click', openCheckout);
$('#coClose').addEventListener('click', ()=>$('#checkout').close());

function openCheckout(){
  const list=$('#cartList'); list.innerHTML='';
  state.cart.forEach(c=>{
    const extras=[];
    if(c.flavors?.length) extras.push('вкус: '+c.flavors.join(', '));
    const dPairs = Object.entries(c.dips||{}).filter(([k,v])=>v>0).map(([k,v])=>`${k}×${v}`);
    if(c.dips_included) extras.push('дипы: '+(dPairs.join(', ')||`входит ${c.dips_included}`));
    const drPairs = Object.entries(c.drinks||{}).filter(([k,v])=>v>0).map(([k,v])=>`${k}×${v}`);
    if(c.drinks_included) extras.push('напитки: '+(drPairs.join(', ')||`входит ${c.drinks_included}`));
    const row=document.createElement('div');
    row.style='display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #0001';
    row.innerHTML = `<div><div><b>${c.name}</b> × ${c.qty}</div><div class="muted">${extras.join('; ')}</div></div><div>${money(c.base*c.qty)}</div>`;
    list.appendChild(row);
  });
  $('#totalText').textContent = 'Итого: ' + money(state.cart.reduce((s,c)=>s+c.base*c.qty,0));
  $('#checkout').showModal();
}

// GEO
function haversine(lat1,lon1,lat2,lon2){
  const toRad = d=>d*Math.PI/180;
  const R=6371; const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
async function doGeocheck(){
  try{
    const pos = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true,timeout:10000}));
    const lat = pos.coords.latitude, lon = pos.coords.longitude;
    const shop = state.conf.delivery && state.conf.delivery.shop ? state.conf.delivery.shop : {lat:0,lon:0};
    const d = haversine(lat,lon,shop.lat,shop.lon);
    state.geo.distance_km = d;
    state.geo.status = d <= (state.conf.delivery.radius_km||1.5) ? 'inside' : 'outside';
  }catch(e){
    state.geo.status = 'denied';
  }
  updateGeoUI(); updateGeoInline();
}
$('#geoBtn').addEventListener('click', doGeocheck);
function updateGeoUI(){/* minimal */}
function updateGeoInline(){
  const wrap = $('#geoInline'); if(!wrap) return;
  if(state.mode!=='delivery'){ wrap.style.display='none'; wrap.innerHTML=''; return; }
  if(state.geo.status==='inside'){ wrap.style.display='none'; wrap.innerHTML=''; return; }
  let html='';
  if(state.geo.status==='unknown' || state.geo.status==='denied'){
    html = '<div class="geo-inline__box"><div>Для доставки нужно определить зону</div><button class="geo-inline__btn" id="geoInlineBtn">Проверить доставку</button></div>';
  } else if(state.geo.status==='outside'){
    const r = state.conf.delivery.radius_km||1.5;
    html = '<div class="geo-inline__box bad">Вне зоны доставки (радиус '+r+' км). Доступен самовывоз.</div>';
  }
  wrap.innerHTML = html; wrap.style.display='block';
  const b=$('#geoInlineBtn'); if(b) b.onclick=doGeocheck;
}
$('#modeSegment').addEventListener('click', (e)=>{
  const b=e.target.closest('button[data-mode]'); if(!b) return;
  $$('#modeSegment .seg').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  state.mode = b.dataset.mode;
  updateGeoInline();
});

// WhatsApp
$('#waBtn').addEventListener('click', ()=>{
  const phone = (state.conf.whatsapp_phone||'').replace(/\D/g,'');
  const lines=[];
  state.cart.forEach(c=>{
    const dPairs = Object.entries(c.dips||{}).filter(([k,v])=>v>0).map(([k,v])=>`${k}×${v}`);
    const drPairs = Object.entries(c.drinks||{}).filter(([k,v])=>v>0).map(([k,v])=>`${k}×${v}`);
    const extras=[
      c.flavors?.length?('вкус: '+c.flavors.join(', ')):null,
      c.dips_included?('дипы: '+(dPairs.join(', ')||`входит ${c.dips_included}`)):null,
      c.drinks_included?('напитки: '+(drPairs.join(', ')||`входит ${c.drinks_included}`)):null,
    ].filter(Boolean);
    lines.push(`• ${c.name} × ${c.qty} — ${money(c.base*c.qty)}${extras.length?`\n   (${extras.join('; ')})`:''}`);
  });
  const msg = encodeURIComponent(`Заказ:\n`+lines.join('\n')+`\nИтого: `+$('#totalText').textContent.replace('Итого: ','')+`\nКомментарий: `+($('#comment').value||'-'));
  const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
  window.open(url,'_blank');
});

// INIT
window.addEventListener('DOMContentLoaded', async ()=>{
  try{
    await loadAll();
    buildTabs();
    const first = $('#tabs .tab')?.textContent || (state.menu.items[0]?.category||'Меню');
    selectTab(first);
    updateCartBar();
  }catch(e){
    console.error(e);
  }
});
