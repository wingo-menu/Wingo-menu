'use strict';

function sanitizeName(n){
  return (n||'').trim();
}
function imageCandidates(it){
  const base='images/';
  const names=[];
  if(it.image){ names.push(it.image); }
  if(it.id){ names.push(String(it.id)); }
  const nm=sanitizeName(it.name);
  if(nm){ names.push(nm, nm.replace(/[()]/g,''), nm.replace(/[()]/g,'').replace(/\s+/g,'_'), encodeURIComponent(nm)); }
  const exts=['.jpg','.jpeg','.png','.webp'];
  const urls=[];
  names.forEach(n=>{
    if(!n) return;
    if(n.match(/\.(jpg|jpeg|png|webp)$/i)){ urls.push(n.startsWith('images/')?n:base+n); }
    else exts.forEach(ext=>urls.push(base+n+ext));
  });
  return Array.from(new Set(urls));
}
function loadAutoImage(im, ph, it){
  const cands=imageCandidates(it);
  let i=0;
  const tryNext=()=>{
    if(i>=cands.length){ im.style.display='none'; return; }
    const u=cands[i++];
    const test=new Image();
    test.onload=()=>{ im.src=u; im.style.display='block'; if(ph) ph.remove(); };
    test.onerror=tryNext;
    test.src=u;
  };
  tryNext();
}

const EMBED_MENU = {"items": [{"id": "combo-wings-6", "category": "SOLO", "name": "Комбо крылышки (6)", "description": "6 крыльев, гарнир на выбор, 1 дип, напиток 0.5 л", "price": 3990, "flavors_max": 1, "garnish": {"options": ["Картофель фри", "Овощные палочки"]}, "dips_included": 1, "image": "images/1.webp"}, {"id": "solo-mix-5-2", "category": "SOLO", "name": "Solo MIX (5 крыльев + 2 тендерса)", "description": "1 дип-соус включён", "price": 2990, "flavors_max": 1, "garnish": {"options": ["Картофель фри", "Овощные палочки"]}, "dips_included": 1, "image": "images/2.webp"}, {"id": "wings-10", "category": "SOLO", "name": "Крылышки (10)", "description": "Дип не входит", "price": 2790, "flavors_max": 1, "image": "images/3.webp"}, {"id": "combo-tenders-5", "category": "SOLO", "name": "Комбо тендерсы (5)", "description": "Гарнир на выбор, 1 дип, напиток 0.5 л", "price": 4390, "flavors_max": 1, "garnish": {"options": ["Картофель фри", "Овощные палочки"]}, "dips_included": 1, "image": "images/4.webp"}, {"id": "tenders-4", "category": "SOLO", "name": "Тендерсы (4)", "description": "1 дип включён", "price": 2590, "flavors_max": 1, "dips_included": 1, "image": "images/5.webp"}, {"id": "duo-mix-12-4", "category": "DUO", "name": "Duo MIX (12 крыльев + 4 тендерса)", "description": "2 дипа включено", "price": 6690, "flavors_max": 2, "garnish": {"options": ["Картофель фри", "Овощные палочки"]}, "dips_included": 2, "image": "images/6.webp"}, {"id": "duo-wings-15", "category": "DUO", "name": "Сет на двоих (15 крыльев)", "description": "Гарнир на выбор, 2 дипа, 2 напитка 0.5 л", "price": 6890, "flavors_max": 2, "garnish": {"options": ["Картофель фри", "Овощные палочки"]}, "dips_included": 2, "image": "images/7.webp"}, {"id": "friends-30", "category": "СЕТЫ НА КОМПАНИЮ", "name": "Friends 30", "description": "20 крыльев + 10 тендерсов, 6 дипов", "price": 9590, "flavors_max": 3, "dips_included": 6, "image": "images/8.webp"}, {"id": "hangout-50", "category": "СЕТЫ НА КОМПАНИЮ", "name": "Hangout 50", "description": "34 крыльев + 16 тендерсов, 8 дипов", "price": 14590, "flavors_max": 4, "dips_included": 8, "image": "images/9.webp"}, {"id": "fries", "category": "ГАРНИРЫ", "name": "Картофель фри", "description": "Горячий и хрустящий. Wingo Seasoning.", "price": 790, "image": "images/10.webp"}, {"id": "corn", "category": "ГАРНИРЫ", "name": "Жареная кукуруза", "description": "6 кусочков с фирменной приправой.", "price": 1890, "image": "images/11.webp"}, {"id": "dip-ranch", "category": "СОУСЫ (ДИПЫ)", "name": "Ранч", "description": "Сливочный, с зеленью.", "price": 380, "image": "images/12.webp"}, {"id": "dip-cheese", "category": "СОУСЫ (ДИПЫ)", "name": "Сырный соус", "description": "Сливочно-сырный.", "price": 380, "image": "images/13.webp"}, {"id": "dip-sweetspicy", "category": "СОУСЫ (ДИПЫ)", "name": "Сладко-острый", "description": "Сладость + остринка.", "price": 380, "image": "images/14.webp"}, {"id": "dip-bbq", "category": "СОУСЫ (ДИПЫ)", "name": "BBQ", "description": "Классика с дымком.", "price": 380, "image": "images/15.webp"}, {"id": "dip-honey-mustard", "category": "СОУСЫ (ДИПЫ)", "name": "Медово-горчичный", "description": "Сладко и пикантно.", "price": 380, "image": "images/16.webp"}, {"id": "coke-05", "category": "НАПИТКИ", "name": "Coca-Cola 0,5", "description": "Освежает.", "price": 890, "image": "images/17.webp"}, {"id": "fuse-05", "category": "НАПИТКИ", "name": "Fuse Tea 0,5", "description": "Холодный чай.", "price": 790, "image": "images/18.webp"}, {"id": "water-asu-05", "category": "НАПИТКИ", "name": "Вода Asu 0,5", "description": "Негазированная.", "price": 690, "image": "images/19.webp"}]};
const EMBED_CONF  = {"whatsapp_number": "77071052828", "utm": "?utm_source=qr&utm_medium=menu&utm_campaign=wingo", "business_hours": {"daily": {"open": "11:00", "close": "23:00"}}, "dip_unit_price": 380, "cooking_flavors": ["BBQ", "Медово-горчичный", "Wingo fire", "Сладко-острый"], "pickup": {"address": "Балкантау 94"}, "delivery": {"center": {"lat": 51.13192937251173, "lng": 71.47830351934499}, "radius_km": 1.5}, "dip_flavors": ["Ранч", "Сырный", "Сладко-острый", "BBQ", "Медово-горчичный"], "drink_flavors": ["Coca-Cola 0,5", "Fuse Tea 0,5", "Вода Asu 0,5"], "brand": {"name": "WINGO CHICKEN", "green": "#2E7D32"}, "whatsapp_phone": ""};

const state = {
  menu: EMBED_MENU,
  conf: EMBED_CONF,
  cart: [],
  sheetItem: null,
  sheetQty: 1,
  select: {flavors:[], dipCounts: {}, drinkCounts: {}},
};

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const money = v => '₸' + (v||0).toLocaleString('ru-RU');
function on(el, ev, fn){ el && el.addEventListener(ev, fn); }

function uniq(arr){ return [...new Set(arr)]; }
function buildTabs(){
  const cats = uniq(state.menu.items.map(i=>i.category||'Прочее'));
  const tabs = $('#tabs'); tabs.innerHTML='';
  cats.forEach((c,idx)=>{
    const b=document.createElement('button');
    b.className='tab'+(idx===0?' active':'');
    b.textContent=c;
    b.onclick=()=>{ selectTab(c); };
    tabs.appendChild(b);
  });
}

function selectTab(cat){
  $$('#tabs .tab').forEach(t=>t.classList.toggle('active', t.textContent===cat));
  const items = state.menu.items.filter(i=>(i.category||'Прочее')===cat);
  renderGrid(items);
}

function renderGrid(items){
  const g = $('#grid'); g.innerHTML='';
  items.forEach(it=>{
    const card=document.createElement('article'); card.className='card';
    const imgBox=document.createElement('div'); imgBox.className='img';
    const ph=document.createElement('div'); ph.className='ph'; ph.textContent='Фото скоро';
    imgBox.appendChild(ph);
    const im=new Image(); im.style.display='none'; imgBox.appendChild(im);
    loadAutoImage(im, ph, it);; }
    const text=document.createElement('div'); text.className='text';
    const name=document.createElement('h3'); name.className='name'; name.textContent=it.name;
    const price=document.createElement('div'); price.className='price'; price.textContent=money(it.price);
    text.appendChild(name); text.appendChild(price);
    card.appendChild(imgBox); card.appendChild(text);
    card.onclick=()=>openSheet(it);
    g.appendChild(card);
  });
}

function openSheet(it){
  state.sheetItem=it; state.sheetQty=1; state.select={flavors:[],dipCounts:{},drinkCounts:{}};
  $('#sheetTitle').textContent=it.name;
  $('#sheetDesc').textContent=it.description||'';
  $('#qtyValue').textContent='1';
  $('#sheetImg').style.display='none'; $('#sheetPh').style.display='block';
  { const im=$('#sheetImg'); im.onload=()=>{ im.style.display='block'; $('#sheetPh').style.display='none'; }; loadAutoImage(im, $('#sheetPh'), it); }

  const fo=$('#flavorOptions'); fo.innerHTML='';
  const flavors = state.conf.cooking_flavors || [];
  flavors.forEach(fl=>{
    const name = typeof fl==='string'?fl:(fl.name||'');
    const heat = typeof fl==='object'? (fl.heat||0):0;
    const color = typeof fl==='object'? (fl.color||''):'';
    const b=document.createElement('button'); b.className='btn flavor';
    const peppers = '🌶'.repeat(Math.min(3,Math.max(0,heat)));
    b.innerHTML = `<span style="display:flex;align-items:center;"><span class="dot" style="background:${color}"></span><span>${name}</span></span><span>${peppers}</span>`;
    b.onclick=()=>{ toggleFlavor(name, it.flavors_max||1); };
    fo.appendChild(b);
  });
  updateFlavorHint(it);
  fillChoiceList('#dipsChoice', state.conf.dip_flavors||[], 'dipCounts', it.dips_included||0, '#dipsLeftHint', '#dipsInfo', 'дип');
  fillChoiceList('#drinksChoice', state.conf.drink_flavors||[], 'drinkCounts', it.drinks_included||0, '#drinksLeftHint', '#drinksInfo', 'напиток');
  $('#sheet').showModal();
}

function toggleFlavor(name, max){
  const arr = state.select.flavors;
  const idx = arr.indexOf(name);
  if(idx>=0) arr.splice(idx,1); else if(arr.length<max) arr.push(name);
  $$('#flavorOptions .btn').forEach(b=>{
    const nm=b.querySelector('span span:last-child')?.textContent||b.textContent;
    b.classList.toggle('selected', arr.indexOf(nm)>=0);
  });
  updateFlavorHint(state.sheetItem);
}

function updateFlavorHint(it){
  const cnt=state.select.flavors.length;
  $('#flavorHint').innerHTML = `Выбрано ${cnt} из ${it.flavors_max||1}. <span class="muted">🌶 0 — неострое · 1 — средняя · 3 — острое</span>`;
}

function fillChoiceList(rootSel, names, key, included, hintSel, infoSel, noun){
  const root=$(rootSel); const hint=$(hintSel); const info=$(infoSel);
  if(!included){ root.parentElement.style.display='none'; return; }
  root.parentElement.style.display='';
  info.textContent = `Входит: ${included} ${noun}` + (included===1?'':'ов');
  root.innerHTML='';
  state.select[key] = {};
  names.forEach(n=>{ state.select[key][n]=0; });
  const update=()=>{
    const used = Object.values(state.select[key]).reduce((a,b)=>a+b,0);
    hint.textContent = used<included ? `Осталось распределить: ${included-used}` : 'Распределено полностью';
    root.querySelectorAll('.btn .qty').forEach(span=>{
      const nm = span.dataset.name; span.textContent = state.select[key][nm];
    });
  };
  names.forEach(n=>{
    const row=document.createElement('button'); row.className='btn';
    row.innerHTML = `<span class="nm">${n}</span><span class="qty" data-name="${n}">0</span>`;
    row.onclick=(e)=>{ e.preventDefault(); const used = Object.values(state.select[key]).reduce((a,b)=>a+b,0); if(used<included){ state.select[key][n]++; } else if(state.select[key][n]>0){ state.select[key][n]--; } update(); };
    root.appendChild(row);
  });
  update();
}

on($('#qtyMinus'),'click',()=>{ if(state.sheetQty>1){ state.sheetQty--; $('#qtyValue').textContent=state.sheetQty; } });
on($('#qtyPlus'),'click',()=>{ state.sheetQty++; $('#qtyValue').textContent=state.sheetQty; });
on($('#addBtn'),'click',()=>{
  const it = state.sheetItem; if(!it) return;
  const entry = {
    id: it.id || it.name, name: it.name, base: it.price||0, qty: state.sheetQty,
    flavors: [...state.select.flavors],
    dips_included: it.dips_included||0,
    dips: {...state.select.dipCounts},
    drinks_included: it.drinks_included||0,
    drinks: {...state.select.drinkCounts},
  };
  state.cart.push(entry);
  $('#sheet').close();
  updateCartBar();
});
on($('#sheetClose'),'click',()=>$('#sheet').close());

function updateCartBar(){
  const total = state.cart.reduce((s,c)=>s + (c.base*c.qty), 0);
  const count = state.cart.reduce((s,c)=>s + c.qty, 0);
  $('#cartText').textContent = `Корзина · ${count} поз. · ` + money(total);
}
on($('#checkoutBtn'),'click',openCheckout);
on($('#checkoutClose'),'click',()=>$('#checkout').close());
function openCheckout(){
  const list=$('#cartList'); list.innerHTML='';
  state.cart.forEach((c,i)=>{
    const row=document.createElement('div'); row.className='cartrow';
    const extras=[];
    if(c.flavors?.length) extras.push('вкус: '+c.flavors.join(', '));
    const dPairs = Object.entries(c.dips||{}).filter(([k,v])=>v>0).map(([k,v])=>`${k}×${v}`);
    if(c.dips_included) extras.push('дипы: '+(dPairs.join(', ')||`входит ${c.dips_included}`));
    const drPairs = Object.entries(c.drinks||{}).filter(([k,v])=>v>0).map(([k,v])=>`${k}×${v}`);
    if(c.drinks_included) extras.push('напитки: '+(drPairs.join(', ')||`входит ${c.drinks_included}`));
    row.innerHTML = `<div><div class="rowtitle">${c.name} × ${c.qty}</div><div class="muted">${extras.join('; ')}</div></div><div class="rowprice">${money(c.base*c.qty)}</div>`;
    list.appendChild(row);
  });
  $('#totalText').textContent = 'Итого: ' + money(state.cart.reduce((s,c)=>s+c.base*c.qty,0));
  $('#checkout').showModal();
}
on($('#waBtn'),'click',()=>{
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
  const msg = encodeURIComponent(`Заказ:\n`+lines.join('\n')+`\nИтого: `+$('#totalText').textContent.replace('Итого: ', '')+`\nКомментарий: `+($('#comment').value||'-'));
  const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
  window.open(url,'_blank');
});

window.addEventListener('DOMContentLoaded',()=>{
  buildTabs();
  const firstTab = $('#tabs .tab')?.textContent || (state.menu.items[0]?.category||'Прочее');
  selectTab(firstTab);
  updateCartBar();
});
