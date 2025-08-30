// helpers
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const money = v => '₸' + Math.round(v || 0).toLocaleString('ru-RU');

// Версия берём из src текущего скрипта (?v=...), чтобы index.html не трогать
const BUILD_VERSION = (() => {
  try {
    const currentScript = document.currentScript || [...document.getElementsByTagName('script')].pop();
    const u = new URL(currentScript.src, location.href);
    return u.searchParams.get('v') || '21';
  } catch (e) {
    return '21';
  }
})();

// геодистанция
const hav = (a, b) => {
  const R = 6371, toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lng - a.lng);
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(Math.pow(dLon/2,2));
  return 2 * R * Math.asin(Math.sqrt(s));
};

const state = {
  items: [],
  categories: [],
  conf: null,
  activeCategory: null,
  cart: JSON.parse(localStorage.getItem('wingo.cart') || '[]'),
  geo: JSON.parse(localStorage.getItem('wingo.geo') || '{"status":"unknown","inside":false}'),
  mode: 'delivery',
  sheetItem: null,
  sheetQty: 1,
  // ТОЛЬКО входящие дипы (без доп. дипов) + напитки
  select: { flavors: [], garnish: null, drink: null, drinkCounts: {}, dipCounts: {} },
  drinkOptions: [] // формируем из раздела "НАПИТКИ" меню
};

const el = {
  tabs: $('#tabs'),
  grid: $('#grid'),
  sheet: $('#sheet'),
  sheetBackdrop: $('#sheetBackdrop'),
  sheetClose: $('#sheetClose'),
  sheetImg: $('#sheetImg'),
  sheetTitle: $('#sheetTitle'),
  sheetPrice: $('#sheetPrice'),
  sheetDesc: $('#sheetDesc'),

  flavorBlock: $('#flavorBlock'),
  flavorOptions: $('#flavorOptions'),
  flavorMax: $('#flavorMax'),
  flavorHint: $('#flavorHint'),

  garnishBlock: $('#garnishBlock'),
  garnishOptions: $('#garnishOptions'),

  dipsBlock: $('#dipsBlock'),
  dipsInfo: $('#dipsInfo'),
  dipsChoice: $('#dipsChoice'),
  dipsLeftHint: $('#dipsLeftHint'),

  qtyMinus: $('#qtyMinus'),
  qtyPlus: $('#qtyPlus'),
  qtyValue: $('#qtyValue'),
  addToCart: $('#addToCart'),

  cartBar: $('#cartBar'),
  cartOpenArea: $('#cartOpenArea'),
  cartCount: $('#cartCount'),
  cartTotal: $('#cartTotal'),
  openCheckout: $('#openCheckout'),

  checkout: $('#checkout'),
  coBackdrop: $('#coBackdrop'),
  coClose: $('#coClose'),
  coName: $('#coName'),
  coPhone: $('#coPhone'),
  addressGroup: $('#addressGroup'),
  coStreet: $('#coStreet'),
  coHouse: $('#coHouse'),
  coFloor: $('#coFloor'),
  coApt: $('#coApt'),
  coNote: $('#coNote'),
  coSummary: $('#coSummary'),
  coTotal: $('#coTotal'),
  coWhatsApp: $('#coWhatsApp'),

  hoursState: $('#hoursState'),
  geoBtn: $('#geoBtn'),
  geoBanner: $('#geoBanner'),
  deliveryMode: $('#deliveryMode'),
  modeSegment: $('#modeSegment')
};

// ─── Единый аккуратный стиль разделов и кнопок (инжект CSS) ───────────────────
function ensureUIStyles(){
  if (document.getElementById('wingo-ui-style')) return;
  const css = `
  .section { padding-top: 8px; }
  .section-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; line-height: 1.2; }
  .section-sep { height:1px; background:#2E7D32; opacity:.35; margin:12px 0; border:0; }
  /* Базовый вид для всех опций (вкус/гарнир/напиток) */
  .opt { display:inline-block; margin:4px 8px 8px 0; border-radius: 8px; border:1px solid rgba(0,0,0,0.12); padding:8px 10px; line-height:1.1; background:#fff; }
  .opt:hover { border-color: rgba(0,0,0,0.25); }
  .opt.active { border-color:#2E7D32; box-shadow: 0 0 0 2px rgba(46,125,50,0.12); }
  /* Solo-напиток: нижняя серая подпись +0 ₸ */
  .opt.opt-drink { text-align:center; padding:10px 12px 8px 12px; }
  .opt.opt-drink .nm { display:block; font-size:14px; font-weight:500; }
  .opt.opt-drink .add { display:block; font-size:12px; color:#6b7280; opacity:.9; margin-top:6px; padding-top:5px; border-top:1px solid rgba(0,0,0,0.08); }
  /* Сетка для счётчиков дипов/напитков 2+ */
  .dip-row + .dip-row { border-top:1px dashed rgba(0,0,0,0.08); }
  /* Зелёная кнопка (для закрытия чекаута) */
  .btn-green { background:#2E7D32 !important; color:#fff !important; border:1px solid #2E7D32 !important; }
  .btn-green:hover { filter:brightness(0.95); }
  /* Круглая кнопка */
  .btn-round { border-radius:9999px !important; aspect-ratio:1 / 1; width:36px; min-width:36px; display:inline-flex; align-items:center; justify-content:center; padding:0; }
  `;
  const st = document.createElement('style');
  st.id = 'wingo-ui-style';
  st.textContent = css;
  document.head.appendChild(st);
}
function insertSeparatorBefore(elm){
  if (!elm || !elm.parentNode) return;
  const prev = elm.previousElementSibling;
  if (prev && prev.classList && prev.classList.contains('section-sep')) return;
  const hr = document.createElement('hr');
  hr.className = 'section-sep auto';
  elm.parentNode.insertBefore(hr, elm);
}
function dedupeSeparators(){
  // Удаляем подряд идущие повторные разделители
  const seps = Array.from(document.querySelectorAll('#sheet .section-sep'));
  let prev = null;
  seps.forEach(node => {
    if (prev && prev.nextElementSibling === node && prev.classList.contains('section-sep') && node.classList.contains('section-sep')) {
      if (node.classList.contains('auto')) node.remove();
      else if (prev.classList.contains('auto')) prev.remove();
    } else {
      prev = node;
    }
  });
}
// ───────────────────────────────────────────────────────────────────────────────

// ─── Аккуратная прокрутка к уведомлению ───────────────────────────────────────
function getHeaderOffsetPx() {
  const header = document.querySelector('.header, header');
  if (!header) return 0;
  const cs = getComputedStyle(header);
  if (cs.position === 'fixed' или cs.position === 'sticky') {
    return header.offsetHeight || 0;
  }
  return 0;
}
function ensureNoticeVisible(elm) {
  if (!elm) return;
  elm.scrollIntoView({ block: 'start', behavior: 'smooth' });
  const ho = getHeaderOffsetPx();
  if (ho) {
    setTimeout(() => {
      window.scrollBy({ top: -ho - 8, left: 0, behavior: 'instant' });
    }, 250);
  }
}
// ───────────────────────────────────────────────────────────────────────────────

// загрузка
async function loadAll() {
  try {
    const [m, c] = await Promise.all([
      fetch(`menu.json?v=${BUILD_VERSION}`),
      fetch(`config.json?v=${BUILD_VERSION}`)
    ]);
    const menu = await m.json();
    state.items = menu.items || [];
    state.conf = await c.json();
  } catch (e) {
    console.error('Не удалось загрузить конфиг/меню', e);
    alert('Ошибка загрузки конфигурации. Проверьте, что config.json и menu.json — валидный JSON (без комментариев).');
    return;
  }

  ensureUIStyles();
  // зелёная и круглая кнопка закрытия оформления
  if (el.coClose) el.coClose.classList.add('btn-green','btn-round');

  // сформируем варианты напитков из раздела меню "НАПИТКИ"
  try {
    state.drinkOptions = state.items
      .filter(i => (i.category || '').toLowerCase() === 'напитки')
      .map(i => i.name)
      .filter(Boolean);
  } catch(_) { state.drinkOptions = []; }

  setupHours();
  buildCategories();
  renderGrid();
  updateCartBar();
  updateGeoUI();
}

function setupHours(){
  const now = new Date();
  const [oh, om] = state.conf.business_hours.daily.open.split(':').map(Number);
  const [ch, cm] = state.conf.business_hours.daily.close.split(':').map(Number);
  const open = new Date(now); open.setHours(oh, om, 0, 0);
  const close = new Date(now); close.setHours(ch, cm, 0, 0);
  const isOpen = now >= open && now <= close;
  el.hoursState.textContent = (isOpen ? 'Открыто · ' : 'Закрыто · ') + state.conf.business_hours.daily.open + '–' + state.conf.business_hours.daily.close;
}

function buildCategories(){
  const set = new Set(state.items.map(i => i.category));
  state.categories = [...set];
  el.tabs.innerHTML = '';
  state.categories.forEach((cat, i) => {
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = cat;
    a.className = (state.activeCategory ? (state.activeCategory===cat) : i===0) ? 'active' : '';
    a.onclick = e => {
      e.preventDefault();
      state.activeCategory = cat;
      renderGrid();
      $$('#tabs a').forEach(n => n.classList.toggle('active', n.textContent === cat));
    };
    el.tabs.appendChild(a);
  });
}

function renderGrid(){
  const list = state.activeCategory ? state.items.filter(i => i.category === state.activeCategory) : state.items;
  el.grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  list.forEach(item => {
    const card = document.createElement('div'); card.className = 'card';
    const img = document.createElement('img'); img.className='thumb'; img.src=item.image||'images/placeholder.png'; img.alt=item.name;
    const body = document.createElement('div'); body.className='card-body';
    const title = document.createElement('div'); title.className='title'; title.textContent=item.name;
    const actions = document.createElement('div'); actions.className='actions';
    const price = document.createElement('div'); price.className='price'; price.textContent=money(item.price);
    const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Выбрать';
    btn.onclick = () => openSheet(item);
    card.onclick = () => openSheet(item);
    actions.append(price, btn);
    body.append(title, actions);
    card.append(img, body);
    frag.append(card);
  });
  el.grid.append(frag);
}

// ─── Напитки: разбор и UI ─────────────────────────────────────────────────────
function getIncludedDrinksCount(item){
  // Если это отдельная карточка из категории «Напитки», никакие «входящие напитки» не рисуем
  if ((item?.category || '').toLowerCase() === 'напитки') return 0;

  // Жёсткие правила на конкретные позиции (единообразие)
  if (item?.id === 'combo-wings-6') return 1;
  if (item?.id === 'combo-tenders-5') return 1;
  if (item?.id === 'duo-wings-15') return 2;

  // Универсальная логика по описанию
  const t = (item.description || '').toLowerCase();
  const m = t.match(/(\d+)\s*напит(?:ок|ка|ков)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  if (t.includes('напиток')) return 1;
  return 0;
}

function removePrevDrinkBlock(){
  const prev = document.getElementById('drinkBlock');
  if (prev) prev.remove();
}

function buildDrinkUI(item){
  removePrevDrinkBlock();

  // Если это карточка из категории «Напитки» — ничего не вставляем
  if ((item?.category || '').toLowerCase() === 'напитки') {
    state.select.drink = null; state.select.drinkCounts = {};
    return;
  }

  const count = getIncludedDrinksCount(item);
  if (!count) { state.select.drink = null; state.select.drinkCounts = {}; return; }

  const options = state.drinkOptions || [];
  if (!options.length) return;

  const block = document.createElement('div');
  block.id = 'drinkBlock';
  block.className = 'section';

  const title = document.createElement('div');
  title.className = 'section-title';
  title.textContent = 'Напиток:';
  block.appendChild(title);

  insertSeparatorBefore(block);

  if (count === 1) {
    const wrap = document.createElement('div');
    wrap.id = 'drinkOptions';
    block.appendChild(wrap);

    options.forEach((name, idx) => {
      const btn = document.createElement('button');
      btn.className = 'opt opt-drink' + (idx===0 ? ' active' : '');
      btn.innerHTML = `<span class="nm">${name}</span><span class="add">+0 ₸</span>`;
      if (idx===0) state.select.drink = name;
      btn.onclick = () => {
        state.select.drink = name;
        [...wrap.children].forEach(n => n.classList.toggle('active', n===btn));
      };
      wrap.appendChild(btn);
    });
  } else {
    const hint = document.createElement('div');
    hint.className = 'hint';
    block.appendChild(hint);

    const list = document.createElement('div');
    list.id = 'drinkChoice';
    block.appendChild(list);

    state.select.drink = null;
    state.select.drinkCounts = {};
    const sumAssigned = () => Object.values(state.select.drinkCounts).reduce((a,b)=>a+(b||0),0);
    const setHint = () => {
      const left = count - sumAssigned();
      hint.textContent = left > 0 ? `Осталось выбрать: ${left}` : 'Готово';
    };

    options.forEach(name => {
      state.select.drinkCounts[name] = 0;
      const row = document.createElement('div');
      row.className = 'dip-row';
      row.innerHTML = `
        <div class="dip-name">${name}</div>
        <div class="dip-ctr">
          <button class="dip-btn minus" type="button" aria-label="Уменьшить">−</button>
          <span class="dip-count">0</span>
          <button class="dip-btn plus" type="button" aria-label="Увеличить">+</button>
        </div>`;
      const minus = row.querySelector('.minus');
      const plus = row.querySelector('.plus');
      const cEl = row.querySelector('.dip-count');

      const refresh = () => {
        const v = state.select.drinkCounts[name] || 0;
        cEl.textContent = v;
        row.classList.toggle('active', v>0);
        setHint();
      };
      minus.onclick = () => {
        const cur = state.select.drinkCounts[name] || 0;
        if (cur > 0) state.select.drinkCounts[name] = cur - 1;
        refresh();
      };
      plus.onclick = () => {
        if (sumAssigned() >= count) return;
        state.select.drinkCounts[name] = (state.select.drinkCounts[name] || 0) + 1;
        refresh();
      };
      refresh();
      list.appendChild(row);
    });
    setHint();
  }

  if (el.dipsBlock && el.dipsBlock.parentNode) {
    el.dipsBlock.parentNode.insertBefore(block, el.dipsBlock);
  } else {
    el.sheet.appendChild(block);
  }
}
// ───────────────────────────────────────────────────────────────────────────────

// карточка
function openSheet(item){
  state.sheetItem = item;
  state.sheetQty = 1;
  state.select = { flavors: [], garnish: null, drink: null, drinkCounts: {}, dipCounts: {} };

  el.sheetImg.src = item.image || 'images/placeholder.png';
  el.sheetTitle.textContent = item.name;
  el.sheetPrice.textContent = money(item.price);
  el.sheetDesc.textContent = item.description || '';
  el.qtyValue.textContent = state.sheetQty;

  const isDrinkCard = ((item.category || '').toLowerCase() === 'напитки');

  // вкусы
  if(!isDrinkCard && item.flavors_max){
    el.flavorBlock.style.display = '';
    el.flavorMax.textContent = item.flavors_max;
    el.flavorOptions.innerHTML = '';
    (state.conf.cooking_flavors || []).forEach(fl => {
      const o = document.createElement('button');
      o.className = 'opt flavor';
      o.setAttribute('aria-pressed','false');
      const name = typeof fl === 'string' ? fl : (fl.name || '');
      const heat = typeof fl === 'object' && typeof fl.heat === 'number' ? fl.heat : 0;
      const color = typeof fl === 'object' && fl.color ? fl.color : '';
      const peppers = '🌶'.repeat(Math.max(0, Math.min(3, heat)));
      o.innerHTML = `<span class="dot" style="${color?`background:${color}`:''}"></span><span class="nm">${name}</span><span class="heat">${peppers}</span>`;
      o.onclick = () => {
        const i = state.select.flavors.indexOf(name);
        if(i > -1){
          state.select.flavors.splice(i,1);
          o.classList.remove('active');
          o.setAttribute('aria-pressed','false');
        } else if(state.select.flavors.length < item.flavors_max){
          state.select.flavors.push(name);
          o.classList.add('active');
          o.setAttribute('aria-pressed','true');
        }
        updateFlavorHint(item);
      };
      el.flavorOptions.appendChild(o);
    });
    updateFlavorHint(item);
    insertSeparatorBefore(el.flavorBlock);
  } else {
    el.flavorBlock.style.display = 'none';
  }

  // гарнир
  if(!isDrinkCard && item.garnish && item.garnish.options && item.garnish.options.length){
    el.garnishBlock.style.display='';
    el.garnishOptions.innerHTML='';
    item.garnish.options.forEach((g, idx) => {
      const o = document.createElement('button');
      o.className = 'opt' + (idx===0 ? ' active' : '');
      o.textContent = g; // без "+0"
      if(idx===0) state.select.garnish = g;
      o.onclick = () => {
        state.select.garnish = g;
        [...el.garnishOptions.children].forEach(n => n.classList.toggle('active', n===o));
      };
      el.garnishOptions.appendChild(o);
    });
    insertSeparatorBefore(el.garnishBlock);
  } else {
    el.garnishBlock.style.display='none';
  }

  // НАПИТКИ (если включены в это блюдо и это не карточка напитка)
  if (!isDrinkCard) buildDrinkUI(item);

  // ВХОДЯЩИЕ дипы (распределение по счётчикам)
  if(!isDrinkCard && typeof item.dips_included === 'number'){
    el.dipsBlock.style.display='';
    el.dipsInfo.textContent = `Входит: ${item.dips_included} дип` + (item.dips_included===1?'':'ов');
    buildIncludedDipsUI(item);
    insertSeparatorBefore(el.dipsBlock);
  } else {
    el.dipsBlock.style.display='none';
    el.dipsChoice.innerHTML='';
    el.dipsLeftHint.textContent='';
  }

  // Схлопываем лишние разделители (между разделами оставить по одной линии)
  dedupeSeparators();

  el.cartBar.classList.add('hidden');
  el.sheet.classList.add('show'); el.sheet.setAttribute('aria-hidden','false');
}
function updateFlavorHint(item){
  const max = item.flavors_max || 1;
  const n = state.select.flavors.length;
  el.flavorHint.textContent = `${n}/${max} выбрано`;
}

// Нейтральный UI для ВХОДЯЩИХ дипов (никаких «доп. дипов»!)
function buildIncludedDipsUI(item){
  const dips = state.conf.dip_flavors || [];
  el.dipsChoice.innerHTML = '';
  el.dipsChoice.classList.remove('dips-grid'); // на всякий
  state.select.dipCounts = {};

  const getAssigned = () => Object.values(state.select.dipCounts).reduce((a,b)=>a+(b||0),0);
  const max = item.dips_included || 0;

  dips.forEach(name => {
    state.select.dipCounts[name] = 0;

    const row = document.createElement('div');
    row.className = 'dip-row';
    row.innerHTML = `
      <div class="dip-name">${name}</div>
      <div class="dip-ctr">
        <button class="dip-btn minus" type="button" aria-label="Уменьшить">−</button>
        <span class="dip-count">0</span>
        <button class="dip-btn plus" type="button" aria-label="Увеличить">+</button>
      </div>`;

    const minus = row.querySelector('.minus');
    const plus = row.querySelector('.plus');
    const cEl = row.querySelector('.dip-count');

    const updateActive = ()=>{
      const val = state.select.dipCounts[name] || 0;
      cEl.textContent = val;
      row.classList.toggle('active', val>0);
    };

    const inc = ()=>{
      const assigned = getAssigned();
      if(assigned >= max) return;
      state.select.dipCounts[name] = (state.select.dipCounts[name]||0) + 1;
      updateActive();
      const left = max - getAssigned();
      el.dipsLeftHint.textContent = left>0 ? `Осталось распределить: ${left}` : 'Распределено';
    };
    const dec = ()=>{
      const cur = state.select.dipCounts[name] || 0;
      if(cur>0){ state.select.dipCounts[name] = cur - 1; }
      updateActive();
      const left = max - getAssigned();
      el.dipsLeftHint.textContent = left>0 ? `Осталось распределить: ${left}` : 'Распределено';
    };

    minus.addEventListener('click', dec);
    plus.addEventListener('click', inc);

    el.dipsChoice.appendChild(row);
  });

  el.dipsLeftHint.textContent = max>0 ? `Осталось распределить: ${max}` : 'Распределено';
}

// закрытие шита
el.sheetClose.onclick = () => closeSheet();
el.sheetBackdrop.onclick = () => closeSheet();
function closeSheet(){
  el.sheet.classList.remove('show');
  el.sheet.setAttribute('aria-hidden','true');
  el.cartBar.classList.remove('hidden');
}

// qty
el.qtyMinus.onclick = () => { if(state.sheetQty>1){ state.sheetQty--; el.qtyValue.textContent = state.sheetQty; } };
el.qtyPlus.onclick = () => { state.sheetQty++; el.qtyValue.textContent = state.sheetQty; };

// add to cart
el.addToCart.onclick = () => {
  const it = state.sheetItem; if(!it) return;
  if(it.flavors_max && state.select.flavors.length===0){ alert('Выберите хотя бы 1 вкус'); return; }

  // ключ учитывает напитки (строка для 1шт или расклад для 2+)
  const drinkKeyPart = (() => {
    if (state.select.drink) return state.select.drink;
    const list = Object.entries(state.select.drinkCounts || {}).filter(([_,v])=>v>0).map(([k,v])=>`${k}×${v}`).join(',');
    return list || '';
  })();

  const key = [
    it.id||it.name,
    (state.select.flavors||[]).join('+'),
    state.select.garnish||'',
    drinkKeyPart
  ].join('|');

  const ex = state.cart.find(c => c.key === key);

  const drinks_included = getIncludedDrinksCount(it);
  const itemPayload = {
    key,
    id: it.id || it.name,
    name: it.name,
    basePrice: it.price,
    qty: state.sheetQty,
    flavors: [...(state.select.flavors||[])],
    garnish: state.select.garnish || null,
    // напитки
    drinks_included,
    drink: state.select.drink || null, // для 1шт
    drinks_breakdown: state.select.drinkCounts || null, // для 2+
    // только ВХОДЯЩИЕ дипы
    dips_included: it.dips_included || 0,
    dips_breakdown: state.select.dipCounts
  };

  if(ex){ ex.qty += state.sheetQty; }
  else { state.cart.push(itemPayload); }

  localStorage.setItem('wingo.cart', JSON.stringify(state.cart));
  updateCartBar(); closeSheet();
};

// cart bar
function updateCartBar(){
  const count = state.cart.reduce((a,c)=>a+c.qty,0);
  const total = state.cart.reduce((a,c)=>a + c.qty * c.basePrice, 0);
  el.cartCount.textContent = count + ' поз.';
  el.cartTotal.textContent = money(total);
}
el.openCheckout.onclick = () => openCheckout();
el.cartOpenArea.onclick = () => openCheckout();

// Надёжная смена заголовка/плейсхолдера комментария по режиму
function setNoteLabel(text){
  // пробуем разные варианты расположения ярлыка
  const labelCandidates = [
    document.querySelector('label[for="coNote"]'),
    el.coNote?.closest('.field')?.querySelector('label'),
    ...Array.from(document.querySelectorAll('#checkout label')).filter(l => /Комментарий/i.test(l.textContent || ''))
  ].filter(Boolean);
  labelCandidates.forEach(l => l.textContent = text);
}
function ensureNoteFieldVisible(){
  const field = el.coNote ? el.coNote.closest('.field') : null;
  if (field) field.style.display = '';
}
function updateNoteUIByMode(){
  if (state.mode === 'delivery') {
    setNoteLabel('Комментарий курьеру');
    if (el.coNote) el.coNote.placeholder = 'Комментарий курьеру (как пройти, код домофона...)';
  } else {
    setNoteLabel('Комментарий ресторану');
    if (el.coNote) el.coNote.placeholder = 'Комментарий ресторану (пожелания, уточнения...)';
  }
  ensureNoteFieldVisible();
}

function openCheckout(){
  // требуем геопроверку перед оформлением
  if (state.geo && state.geo.status === 'unknown') {
    alert('Пожалуйста, проверьте доступность доставки — нажмите «Проверить доставку» вверху.');
    return;
  }
  // режим по гео
  state.mode = state.geo.inside ? 'delivery' : 'pickup';
  updateModeUI();
  if(!el.coPhone.value){ el.coPhone.value = '+7'; }
  el.checkout.classList.add('show'); el.checkout.setAttribute('aria-hidden','false');
  updateNoteUIByMode();
  renderCoSummary();
}
el.coClose.onclick = () => { el.checkout.classList.remove('show'); el.checkout.setAttribute('aria-hidden','true'); };
el.coBackdrop.onclick = () => { el.checkout.classList.remove('show'); el.checkout.setAttribute('aria-hidden','true'); };

el.modeSegment.addEventListener('click', e=>{
  const btn = e.target.closest('.seg'); if(!btn) return;
  const mode = btn.getAttribute('data-mode');
  if(mode==='delivery' && state.geo && state.geo.status==='unknown'){ alert('Сначала проверьте доступность доставки — кнопка «Проверить доставку».'); return; }
  if(mode==='delivery' && state.geo.status==='outside'){ alert('Вы вне зоны доставки. Доступен самовывоз.'); return; }
  state.mode = mode; updateModeUI();
});
function updateModeUI(){
  if(state.mode==='delivery'){
    el.deliveryMode.textContent = 'Режим: Доставка';
    el.addressGroup.style.display='';
  } else {
    el.deliveryMode.textContent = 'Режим: Самовывоз — ' + (state.conf.pickup?.address || '');
    el.addressGroup.style.display='none';
  }
  $$('#modeSegment .seg').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode')===state.mode));
  updateNoteUIByMode();
}

function renderCoSummary(){
  if(state.cart.length===0){ el.coSummary.innerHTML='<em>Корзина пуста</em>'; el.coTotal.textContent=money(0); return; }
  const lines = state.cart.map(c=>{
    const extras=[];
    if(c.flavors?.length) extras.push('вкус: '+c.flavors.join(' + '));
    if(c.garnish) extras.push('гарнир: '+c.garnish);

    // напитки
    if (c.drinks_included > 1) {
      const pairs = Object.entries(c.drinks_breakdown||{}).filter(([_,v])=>v>0).map(([k,v])=>`${k}×${v}`);
      if (pairs.length) extras.push('напитки: '+pairs.join(', '));
      else extras.push('напитки: выбрать при звонке');
    } else if (c.drinks_included === 1 && c.drink) {
      extras.push('напиток: '+c.drink);
    }

    if(c.dips_included){
      extras.push('входит дипов: '+c.dips_included);
      const pairs = Object.entries(c.dips_breakdown||{}).filter(([_,v])=>v>0).map(([k,v])=>`${k}×${v}`);
      if(pairs.length) extras.push('дипы: '+pairs.join(', '));
    }
    const sum = c.qty * c.basePrice;
    return `<div class="co-item" data-key="${c.key}">
      <div class="co-title">${c.name}${extras.length?' ('+extras.join(', ')+')':''}</div>
      <div class="co-controls">
        <button class="qtybtn minus" data-k="${c.key}">−</button>
        <span class="q">${c.qty}</span>
        <button class="qtybtn plus" data-k="${c.key}">+</button>
        <span class="s">${money(sum)}</span>
      </div>
    </div>`;
  }).join('');
  const total = state.cart.reduce((a,c)=>a + c.qty * c.basePrice, 0);
  el.coSummary.innerHTML = lines;
  el.coTotal.textContent = money(total);

  el.coSummary.querySelectorAll('.qtybtn.minus').forEach(b=>b.onclick=()=>{
    const k=b.getAttribute('data-k');
    const i=state.cart.findIndex(c=>c.key===k);
    if(i>-1){
      if(state.cart[i].qty>1) state.cart[i].qty--; else state.cart.splice(i,1);
      localStorage.setItem('wingo.cart', JSON.stringify(state.cart));
      renderCoSummary(); updateCartBar();
    }
  });
  el.coSummary.querySelectorAll('.qtybtn.plus').forEach(b=>b.onclick=()=>{
    const k=b.getAttribute('data-k');
    const i=state.cart.findIndex(c=>c.key===k);
    if(i>-1){
      state.cart[i].qty++;
      localStorage.setItem('wingo.cart', JSON.stringify(state.cart));
      renderCoSummary(); updateCartBar();
    }
  });
}

// ─── Формат текста в баннере гео (с расстоянием, адресом и самовывозом) ──────
function updateGeoUI(){
  const b = el.geoBanner, g = state.geo;
  const d = (typeof g.distanceKm === 'number' && isFinite(g.distanceKm)) ? g.distanceKm : null;
  const dStr = d !== null ? ` — расстояние: ${d.toFixed(1)} км` : '';

  if(g.status==='inside'){
    b.className='geo-banner ok';
    b.textContent=`Доступна доставка с улицы Балкантау 94${dStr}.`;
  }
  else if(g.status==='outside'){
    b.className='geo-banner bad';
    const pickupAddr = state.conf.pickup?.address || '';
    b.textContent=`Доставка недоступна${dStr} (за пределами зоны), но доступен самовывоз${pickupAddr ? ' — ' + pickupAddr : ''}.`;
  }
  else if(g.status==='denied'){
    b.className='geo-banner bad';
    b.textContent='Доступ к геолокации запрещён — доставка недоступна.';
  }
  else {
    b.className='geo-banner';
    b.textContent='';
  }
}
// ───────────────────────────────────────────────────────────────────────────────

el.geoBtn && (el.geoBtn.onclick = () => {
  if(!navigator.geolocation){ alert('Геолокация не поддерживается'); return; }
  el.geoBtn.disabled = true; el.geoBtn.textContent='Проверяем...';
  navigator.geolocation.getCurrentPosition(pos=>{
    const pt = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    const base = state.conf.delivery.center;
    const radius = state.conf.delivery.radius_km || 1.5;
    const d = hav(base, pt);
    state.geo.distanceKm = d;
    state.geo.inside = d <= radius;
    state.geo.status = state.geo.inside ? 'inside' : 'outside';
    localStorage.setItem('wingo.geo', JSON.stringify(state.geo));
    updateGeoUI();
    ensureNoticeVisible(el.geoBanner);
    el.geoBtn.disabled=false; el.geoBtn.textContent='Проверить доставку';
  }, err=>{
    state.geo.status='denied'; state.geo.inside=false; updateGeoUI();
    ensureNoticeVisible(el.geoBanner);
    el.geoBtn.disabled=false; el.geoBtn.textContent='Проверить доставку';
  }, {enableHighAccuracy:true, timeout:7000, maximumAge:30000});
});

// WhatsApp
function makeWAOrderLink(){
  const phone = state.conf.whatsapp_number;
  const lines = state.cart.map(c=>{
    const extras=[];
    if(c.flavors?.length) extras.push('вкус: '+c.flavors.join(' + '));
    if(c.garnish) extras.push('гарнир: '+c.garnish);

    if (c.drinks_included > 1) {
      const pairs = Object.entries(c.drinks_breakdown||{}).filter(([_,v])=>v>0).map(([k,v])=>`${k}×${v}`);
      if (pairs.length) extras.push('напитки: '+pairs.join(', '));
      else extras.push('напитки: выбрать при звонке');
    } else if (c.drinks_included === 1 && c.drink) {
      extras.push('напиток: '+c.drink);
    }

    if(c.dips_included){
      extras.push('входит дипов: '+c.dips_included);
      const pairs = Object.entries(c.dips_breakdown||{}).filter(([_,v])=>v>0).map(([k,v])=>`${k}×${v}`);
      if(pairs.length) extras.push('дипы: '+pairs.join(', '));
    }
    const sum = Math.round(c.qty * c.basePrice);
    return `- ${c.name}${extras.length?' ('+extras.join(' + ')+')':''} × ${c.qty} = ${sum} ₸`;
  }).join('%0A');
  const total = Math.round(state.cart.reduce((a,c)=>a + c.qty * c.basePrice, 0));

  let addr = '';
  if(state.mode==='delivery'){
    const street=(el.coStreet.value||'').trim();
    const house=(el.coHouse.value||'').trim();
    const floor=(el.coFloor.value||'').trim();
    const apt=(el.coApt.value||'').trim();
    if(!street||!house){ alert('Пожалуйста, укажите улицу и дом.'); throw new Error('address missing'); }
    addr = `ул. ${street}, д. ${house}${floor?`, эт. ${floor}`:''}${apt?`, кв. ${apt}`:''}`;
  }

  const name = encodeURIComponent((el.coName.value||'').trim());
  const phoneText = encodeURIComponent((el.coPhone.value||'').trim());
  const mode = state.mode==='delivery' ? 'Доставка' : ('Самовывоз — ' + (state.conf.pickup?.address||'')); 
  const addrEnc = encodeURIComponent(addr);
  const note = encodeURIComponent((el.coNote.value||'').trim());
  const text = `Заказ WINGO:%0A${lines}%0AИтого: ${total} ₸%0AРежим: ${mode}%0AИмя: ${name}%0AТел: ${phoneText}%0AАдрес: ${addrEnc}%0AКомментарий: ${note}`;
  return `https://wa.me/${phone}?text=${text}${state.conf.utm}`;
}
el.coWhatsApp.onclick = () => {
  if(state.cart.length===0){ alert('Сначала добавьте позиции в корзину'); return; }
  if (state.geo && state.geo.status === 'unknown') { alert('Пожалуйста, проверьте доступность доставки — кнопка «Проверить доставку».'); return; }
  try{ window.open(makeWAOrderLink(), '_blank', 'noopener'); }catch(e){}
};

// init
loadAll();
