const MENU_EMBED = {"items": [{"id": "combo-wings-6", "category": "SOLO", "name": "Комбо крылышки (6)", "description": "6 крылышек с выбором 1 вкуса, картофель фри или овощные палочки, 1 дип-соус и напиток 0,5 л", "price": 3990, "flavors_max": 1, "garnish": {"options": ["Картофель фри", "Овощные палочки"]}, "dips_included": 1, "image": "images/1.webp", "drinks_included": 1}, {"id": "solo-mix-5-2", "category": "SOLO", "name": "Solo MIX (5 крыльев + 2 тендерса)", "description": "5 крылышек и 2 тендерса с выбором 1 вкуса, 1 дип-соус", "price": 2990, "flavors_max": 1, "garnish": {"options": ["Картофель фри", "Овощные палочки"]}, "dips_included": 1, "image": "images/2.webp"}, {"id": "wings-10", "category": "SOLO", "name": "Крылышки (10)", "description": "10 крылышек с выбором до 2 вкусов (Дип-соус не входит)", "price": 2790, "flavors_max": 1, "image": "images/3.webp"}, {"id": "combo-tenders-5", "category": "SOLO", "name": "Комбо тендерсы (5)", "description": "5 тендерса с выбором до 2 вкусов, стандартный картофель фри или овощные палочки, 1 дип-соус и 1 напиток 0,5 л", "price": 4390, "flavors_max": 1, "garnish": {"options": ["Картофель фри", "Овощные палочки"]}, "dips_included": 1, "image": "images/4.webp", "drinks_included": 1}, {"id": "tenders-4", "category": "SOLO", "name": "Тендерсы (4)", "description": "4 тендерса с выбором до 2 вкусов и 1 дип-соуса", "price": 2590, "flavors_max": 1, "dips_included": 1, "image": "images/5.webp"}, {"id": "duo-mix-12-4", "category": "DUO", "name": "Duo MIX (12 крыльев + 4 тендерса)", "description": "12 крылышек и 4 тендерса с выбором до 2 вкусов, 2 дип-соуса", "price": 6690, "flavors_max": 2, "garnish": {"options": ["Картофель фри", "Овощные палочки"]}, "dips_included": 2, "image": "images/6.webp"}, {"id": "duo-wings-15", "category": "DUO", "name": "Сет на двоих (15 крыльев)", "description": "15 крылышек с выбором до 2 вкусов, картофель фри или овощные палочки, 2 дип-соуса и 2 напитка 0,5 л", "price": 6890, "flavors_max": 2, "garnish": {"options": ["Картофель фри", "Овощные палочки"]}, "dips_included": 2, "image": "images/7.webp", "drinks_included": 2}, {"id": "friends-30", "category": "СЕТЫ НА КОМПАНИЮ", "name": "Friends 30", "description": "20 крылышек и 10 тендерсов с выбором до 3 вкусов, 6 дип-соусов", "price": 9590, "flavors_max": 3, "dips_included": 6, "image": "images/8.webp"}, {"id": "hangout-50", "category": "СЕТЫ НА КОМПАНИЮ", "name": "Hangout 50", "description": "34 крылышек и 16 тендерсов с выбором до 4 вкусов, 8 дип-соусов", "price": 14590, "flavors_max": 4, "dips_included": 8, "image": "images/9.webp"}, {"id": "fries", "category": "ГАРНИРЫ", "name": "Картофель фри", "description": "Наш картофель фри горячий и хрустящий, готовится по заказу и обсыпается фирменной приправой Wingo Seasoning", "price": 790, "image": "images/10.webp"}, {"id": "corn", "category": "ГАРНИРЫ", "name": "Жареная кукуруза", "description": "6 кусочков жареной кукурузы посыпанной фирменной приправой", "price": 1890, "image": "images/11.webp"}, {"id": "dip-ranch", "category": "СОУСЫ (ДИПЫ)", "name": "Ранч", "description": "Авторский Ранч — сливочный соус с нотками зелени. Любимец гостей и идеальная пара к любому вкусу", "price": 380, "image": "images/12.webp"}, {"id": "dip-cheese", "category": "СОУСЫ (ДИПЫ)", "name": "Сырный соус", "description": "Авторский сливочно-сырный соус с насыщенным вкусом и мягкой текстурой. Идеален с картофелем и курочкой", "price": 380, "image": "images/13.webp"}, {"id": "dip-sweetspicy", "category": "СОУСЫ (ДИПЫ)", "name": "Сладко-острый", "description": "Авторский соус с гармонией сладости и остринки. Идеально подчёркивает вкус хрустящей курочки", "price": 380, "image": "images/14.webp"}, {"id": "dip-bbq", "category": "СОУСЫ (ДИПЫ)", "name": "BBQ", "description": "Авторский BBQ соус с ароматом копчения, лёгкой сладостью и пряной глубиной. Классика с дымком", "price": 380, "image": "images/15.webp"}, {"id": "dip-honey-mustard", "category": "СОУСЫ (ДИПЫ)", "name": "Медово-горчичный", "description": "Авторский соус с насыщенным медовым вкусом и острой горчичной ноткой. Сладко, пикантно и ярко", "price": 380, "image": "images/16.webp"}, {"id": "coke-05", "category": "НАПИТКИ", "name": "Coca-Cola 0,5", "description": "Освежающий газированный напиток, идеально дополняющий курочку и хрустящую картошку", "price": 890, "image": "images/17.webp"}, {"id": "fuse-05", "category": "НАПИТКИ", "name": "Fuse Tea 0,5", "description": "Освежающий холодный чай", "price": 790, "image": "images/18.webp"}, {"id": "water-asu-05", "category": "НАПИТКИ", "name": "Вода Asu 0,5", "description": "Негазированная вода", "price": 690, "image": "images/19.webp"}]};
const CONFIG_EMBED = {"whatsapp_number": "77071052828", "utm": "?utm_source=qr&utm_medium=menu&utm_campaign=wingo", "business_hours": {"daily": {"open": "11:00", "close": "23:00"}}, "dip_unit_price": 380, "cooking_flavors": [{"name": "BBQ", "heat": 0, "color": "#6a3b14", "note": "неострое"}, {"name": "Медово-горчичный", "heat": 0, "color": "#f2b705", "note": "неострое"}, {"name": "Сладко-острый", "heat": 1, "color": "#e65a1e", "note": "средняя острота"}, {"name": "Wingo fire", "heat": 3, "color": "#d61c1c", "note": "острое"}], "pickup": {"address": "Балкантау 94"}, "delivery": {"center": {"lat": 51.13192937251173, "lng": 71.47830351934499}, "radius_km": 1.5}, "dip_flavors": ["Ранч", "Сырный", "Сладко-острый", "BBQ", "Медово-горчичный"], "drink_flavors": ["Coca-Cola 0,5", "Fuse Tea 0,5", "Вода Asu 0,5"]};
const OFFLINE_MODE=true;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], money=v=>'₸'+Math.round(v||0).toLocaleString('ru-RU');
const hav=(a,b)=>{const R=6371,toRad=x=>x*Math.PI/180;const dLat=toRad(b.lat-a.lat),dLon=toRad(b.lng-a.lng);const s=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(s));};

const state={items:[],categories:[],cart:JSON.parse(localStorage.getItem('wingo.cart')||'[]'),activeCategory:null,sheetItem:null,sheetQty:1,select:{flavors:[],garnish:null,dipQty:0},conf:null,geo:{status:'unknown',distanceKm:null,inside:false},mode:'delivery'};

const el={tabs:$('#tabs'),grid:$('#grid'),
sheet:$('#sheet'),sheetBackdrop:$('#sheetBackdrop'),sheetClose:$('#sheetClose'),sheetImg:$('#sheetImg'),sheetTitle:$('#sheetTitle'),sheetPrice:$('#sheetPrice'),sheetDesc:$('#sheetDesc'),
flavorBlock:$('#flavorBlock'),flavorOptions:$('#flavorOptions'),flavorMax:$('#flavorMax'),flavorHint:$('#flavorHint'),
garnishBlock:$('#garnishBlock'),garnishOptions:$('#garnishOptions'),
dipsBlock:$('#dipsBlock'),dipsInfo:$('#dipsInfo'),dipMinus:$('#dipMinus'),dipPlus:$('#dipPlus'),dipQty:$('#dipQty'),dipPriceView:$('#dipPriceView'),drinksBlock:$('#drinksBlock'),drinksInfo:$('#drinksInfo'),drinksChoice:$('#drinksChoice'),drinksLeftHint:$('#drinksLeftHint'),
qtyMinus:$('#qtyMinus'),qtyPlus:$('#qtyPlus'),qtyValue:$('#qtyValue'),addToCart:$('#addToCart'),
cartBar:$('#cartBar'),cartOpenArea:$('#cartOpenArea'),cartCount:$('#cartCount'),cartTotal:$('#cartTotal'),openCheckout:$('#openCheckout'),
checkout:$('#checkout'),coBackdrop:$('#coBackdrop'),coClose:$('#coClose'),
coName:$('#coName'),coPhone:$('#coPhone'),
addressGroup:$('#addressGroup'),coStreet:$('#coStreet'),coHouse:$('#coHouse'),coFloor:$('#coFloor'),coApt:$('#coApt'),coNote:$('#coNote'),
coSummary:$('#coSummary'),coTotal:$('#coTotal'),coWhatsApp:$('#coWhatsApp'),
hoursState:$('#hoursState'),geoBtn:$('#geoBtn'),geoBanner:$('#geoBanner'),deliveryMode:$('#deliveryMode'),modeSegment:$('#modeSegment')};

async function loadAll(){
  state.menu = MENU_EMBED;
  state.conf = CONFIG_EMBED;
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
  state.sheetItem=item; state.sheetQty=1; state.select={flavors:[],garnish:null,dipCounts:{},drinkCounts:{}};
  el.sheetImg.src=item.image||'images/placeholder.png'; el.sheetTitle.textContent=item.name; el.sheetPrice.textContent=money(item.price); el.sheetDesc.textContent=item.description||''; 
  // Drinks included handling
  if(typeof item.drinks_included==='number' && item.drinks_included>0){
    if(el.drinksBlock){ el.drinksBlock.style.display=''; }
    if(el.drinksInfo){ el.drinksInfo.textContent = `Входит: ${item.drinks_included} напиток` + (item.drinks_included===1?'':'а'); }
    if(el.drinksChoice){ el.drinksChoice.innerHTML=''; }
    state.select.drinkCounts = {};
    const drinks = (state.conf.drink_flavors||[]);
    drinks.forEach(dn=>{
      state.select.drinkCounts[dn]=0;
      const row=document.createElement('div'); row.className='opt drink';
      row.innerHTML = `<span class="nm">${dn}</span><div class="ctr"><button class="mini">−</button><span class="v">0</span><button class="mini">+</button></div>`;
      const btns=row.querySelectorAll('button.mini'); const lbl=row.querySelector('.v');
      const update=()=>{ lbl.textContent=state.select.drinkCounts[dn]; const left=item.drinks_included-Object.values(state.select.drinkCounts).reduce((a,b)=>a+b,0); if(el.drinksLeftHint){ el.drinksLeftHint.textContent = left>0?`Осталось распределить: ${left}`:`Распределено полностью`; } };
      btns[0].addEventListener('click',()=>{ if(state.select.drinkCounts[dn]>0){ state.select.drinkCounts[dn]--; update(); }});
      btns[1].addEventListener('click',()=>{ const sum=Object.values(state.select.drinkCounts).reduce((a,b)=>a+b,0); if(sum<item.drinks_included){ state.select.drinkCounts[dn]++; update(); }});
      if(el.drinksChoice){ el.drinksChoice.appendChild(row); }
      update();
    });
  } else { if(el.drinksBlock){ el.drinksBlock.style.display='none'; } }
el.qtyValue.textContent=state.sheetQty;

  if(item.flavors_max){
    el.flavorBlock.style.display=''; el.flavorMax.textContent=item.flavors_max; el.flavorOptions.innerHTML='';
    
(state.conf.cooking_flavors||[]).forEach(fl=>{
  const o=document.createElement('button');
  o.className='opt flavor';
  const name = (typeof fl==='string') ? fl : (fl.name||'');
  const heat = (typeof fl==='object' && typeof fl.heat==='number') ? fl.heat : 0;
  const color = (typeof fl==='object' && fl.color) ? fl.color : '';
  const peppers = '🌶'.repeat(Math.max(0, Math.min(3, heat)));
  o.innerHTML = `<span class="dot" style="${color?`background:${color}`:''}"></span><span class="nm">${name}</span><span class="heat">${peppers}</span>`;
o.onclick=()=>{const i=state.select.flavors.indexOf(name); if(i>=0){state.select.flavors.splice(i,1); o.classList.remove('active');}
        else if(state.select.flavors.length<item.flavors_max){state.select.flavors.push(name); o.classList.add('active');} updateFlavorHint(item); };
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
    state.select.dipQty=0; // el.dipQty.textContent='0'; // el.dipPriceView.textContent=state.conf.dip_unit_price?`+ ${money(state.conf.dip_unit_price)} за шт.`:'';
  } else { el.dipsBlock.style.display='none'; }

  
  // Included dip choice UI
  if(typeof item.dips_included==='number' && el.dipsChoice){
    const dips = state.conf.dip_flavors || [];
    el.dipsChoice.innerHTML='';
    state.select.dipCounts = {};
    dips.forEach(dn=>{
      state.select.dipCounts[dn]=0;
      const row = document.createElement('div'); row.className='opt dip';
      row.innerHTML = `<span class="nm">${dn}</span>
        <span class="ctr">
          <button class="mini minus" type="button">−</button>
          <span class="c">0</span>
          <button class="mini plus" type="button">+</button>
        </span>`;
      const minus = row.querySelector('.minus');
      const plus = row.querySelector('.plus');
      const cEl = row.querySelector('.c');
      const getAssigned = ()=>Object.values(state.select.dipCounts).reduce((a,b)=>a+(b||0),0);
      minus.onclick = ()=>{
        const cur = state.select.dipCounts[dn]||0;
        if(cur>0){ state.select.dipCounts[dn]=cur-1; cEl.textContent = state.select.dipCounts[dn]; }
        const left=(item.dips_included||0)-getAssigned();
        if(el.dipsLeftHint) el.dipsLeftHint.textContent = left>0?`Осталось распределить: ${left}`:'Распределено';
      };
      plus.onclick = ()=>{
        const assigned = getAssigned();
        if(assigned >= (item.dips_included||0)) return;
        const cur = state.select.dipCounts[dn]||0;
        state.select.dipCounts[dn]=cur+1; cEl.textContent = state.select.dipCounts[dn];
        const left=(item.dips_included||0)-getAssigned();
        if(el.dipsLeftHint) el.dipsLeftHint.textContent = left>0?`Осталось распределить: ${left}`:'Распределено';
      };
      el.dipsChoice.appendChild(row);
    });
    const assigned = Object.values(state.select.dipCounts).reduce((a,b)=>a+(b||0),0);
    const left=(item.dips_included||0)-assigned;
    if(el.dipsLeftHint) el.dipsLeftHint.textContent = left>0?`Осталось распределить: ${left}`:'Распределено';
  }

  el.cartBar.classList.add('hidden');
  el.sheet.classList.add('show'); el.sheet.setAttribute('aria-hidden','false');
}
function updateFlavorHint(item){ const max=item.flavors_max||1, cnt=state.select.flavors.length; el.flavorHint.innerHTML = `Выбрано ${cnt} из ${max}. <span class="muted">🌶 шкала: 0 — неострое, 1 — средняя, 3 — острое.</span>`;
if(item.dips_included>0){
  const note = document.createElement('div');
  note.className='muted';
  note.textContent='Белый на фото — дип (например, Ранч). Его выбирают отдельно ниже.';
  el.flavorHint.appendChild(note);
} }
function closeSheet(){ el.sheet.classList.remove('show'); el.sheet.setAttribute('aria-hidden','true'); el.cartBar.classList.remove('hidden'); }
el.sheetBackdrop.onclick=closeSheet;
el.sheetClose.onclick=closeSheet;

el.qtyMinus.onclick=()=>{ if(state.sheetQty>1){ state.sheetQty--; el.qtyValue.textContent=state.sheetQty; } };
el.qtyPlus.onclick=()=>{ state.sheetQty++; el.qtyValue.textContent=state.sheetQty; };
el.dipMinus.onclick=()=>{ if(state.select.dipQty>0){ state.select.dipQty--; // el.dipQty.textContent=state.select.dipQty; } };
el.dipPlus.onclick=()=>{ state.select.dipQty++; // el.dipQty.textContent=state.select.dipQty; };

function addToCart(){
  const it=state.sheetItem; if(!it) return;
  if(it.flavors_max && state.select.flavors.length===0){ alert('Выберите хотя бы 1 вкус'); return; }
  const key=[it.id||it.name,(state.select.flavors||[]).join('+'),state.select.garnish||''].join('|');
  const ex=state.cart.find(c=>c.key===key);
  if(ex){ ex.qty+=state.sheetQty; ex.extraDipQty=(ex.extraDipQty||0)+state.select.dipQty; }
  else { state.cart.push({key,id:it.id||it.name,name:it.name,basePrice:it.price,qty:state.sheetQty,flavors:[...state.select.flavors],garnish:state.select.garnish,dips_included:it.dips_included||0,includedDipBreakdown:state.select.dipCounts,extraDipQty:state.select.dipQty}); }
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
    if(c.dips_included){ extras.push('входит дипов: '+c.dips_included); const br=c.includedDipBreakdown||{}; const pairs=Object.keys(br).filter(k=>br[k]>0).map(k=>`${k}×${br[k]}`); if(pairs.length) extras.push('дипы: '+pairs.join(', ')); } if(c.drinks_included){ extras.push('входит напитков: '+c.drinks_included); const brd=c.includedDrinkBreakdown||{}; const pairsd=Object.keys(brd).filter(k=>brd[k]>0).map(k=>`${k}×${brd[k]}`); if(pairsd.length) extras.push('напитки: '+pairsd.join(', ')); }
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
    if(c.dips_included){ extras.push('входит дипов: '+c.dips_included); const br=c.includedDipBreakdown||{}; const pairs=Object.keys(br).filter(k=>br[k]>0).map(k=>`${k}×${br[k]}`); if(pairs.length) extras.push('дипы: '+pairs.join(', ')); } if(c.drinks_included){ extras.push('входит напитков: '+c.drinks_included); const brd=c.includedDrinkBreakdown||{}; const pairsd=Object.keys(brd).filter(k=>brd[k]>0).map(k=>`${k}×${brd[k]}`); if(pairsd.length) extras.push('напитки: '+pairsd.join(', ')); }
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
