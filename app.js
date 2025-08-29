// helpers
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const money = v => '₸' + Math.round(v || 0).toLocaleString('ru-RU');

// геодистанция
const hav = (a, b) => {
  const R = 6371, toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lng - a.lng);
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon/2)**2;
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

// ─── Единый аккуратный стиль разделов и кнопок напитков (инжект CSS) ─────────
function ensureUIStyles(){
  if (document.getElementById('wingo-ui-style')) return;
  const css = `
  .section { padding-top: 8px; }
  .section-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; line-height: 1.2; }
  .section-sep { height:1px; background:#2E7D32; opacity:.35; margin:12px 0; border:0; }
  /* кнопки одиночного напитка */
  .opt.opt-drink { display:inline-block; margin:4px 8px 8px 0; border-radius: 8px !important; border:1px solid rgba(0,0,0,0.12); padding:8px 10px 4px 10px; line-height: 1.1; text-align:center; }
  .opt.opt-drink .nm { display:block; font-size:14px; font-weight:500; }
  .opt.opt-drink .add { display:block; font-size:12px; opacity:.7; color:#555; margin-top:3px; }
  .opt.opt-drink.active { border-color:#2E7D32; box-shadow: 0 0 0 2px rgba(46,125,50,0.12); }
  .opt.opt-drink:not(.active):hover { border-color: rgba(0,0,0,0.25); }
  /* для рядов счётчиков (напитки 2шт и дипы) — лёгкая сетка */
  .dip-row + .dip-row { border-top:1px dashed rgba(0,0,0,0.08); }
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
  hr.className = 'section-sep';
  elm.parentNode.insertBefore(hr, elm);
}
// ───────────────────────────────────────────────────────────────────────────────

// ─── Аккуратная прокрутка к уведомлению ───────────────────────────────────────
function getHeaderOffsetPx() {
  const header = document.querySelector('.header, header');
  if (!header) return 0;
  const cs = getComputedStyle(header);
  if (cs.position === 'fixed' || cs.position === 'sticky') {
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
      // instant, чтобы не было двойной анимации
      window.scrollBy({ top: -ho - 8, left: 0, behavior: 'instant' });
    }, 250);
  }
}
// ───────────────────────────────────────────────────────────────────────────────

// загрузка
async function loadAll() {
  try {
    const [m, c] = await Promise.all([
      fetch('menu.json?v=21'),
      fetch('config.json?v=21')
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

// остальной код без изменений (как в предыдущей версии)...
