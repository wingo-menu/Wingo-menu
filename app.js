// ===================== WINGO MENU app.js =====================
// Финальная версия с исправлениями:
// - Баннер «как у Додо»: понятные формулировки "…и доставим за/бесплатно"
// - Фиксированный чекаут и лист товара: фон не ездит, локальный скролл, без горизонтальных «съездов»
// - Рабочие кнопки +/- в корзине (делегирование событий)
// - Только одна линия-разделитель в карточках (очистка и нормализация)
// - Без зависаний после алертов: безопасная проверка гео + сторож разблокировки
// - Логика доставки сохранена (от 5 000 ₸ — бесплатно)
// - FAB без «призрака» и правильные z-index
// - [FIX #1] FAB всегда открывает чекаут (pickup по умолчанию, если гео не ок)
// - [FIX #2] Нет «отката» со страницы еды при открытии корзины
// - [FIX #3] Нижний баннер переносит текст на 2+ строки
// ===============================================================

// ---------------- helpers ----------------
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const money = v => '₸' + Math.round(v || 0).toLocaleString('ru-RU');
// FAB amount format: "1 320 ₸"
const moneyFab = v => Math.round(v||0).toLocaleString('ru-RU') + ' ₸';

const BUILD_VERSION = (() => {
  try {
    const currentScript = document.currentScript || [...document.getElementsByTagName('script')].pop();
    const u = new URL(currentScript.src || window.location.href, window.location.href);
    return u.searchParams.get('v') || '21';
  } catch (e) {
    return '21';
  }
})();

const hav = (a, b) => {
  const R = 6371, toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lng - a.lng);
  const s = (Math.sin(dLat/2) ** 2) + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * (Math.sin(dLon/2) ** 2);
  return 2 * R * Math.asin(Math.sqrt(s));
};

// --- доставка: пороги и утилиты ---
// < 1800 → 1490; 1800–2500 → 990; 2500–5000 → 490; ≥ 5000 → 0
const DELIVERY_RULES = {
  LIMIT1: 1800,
  LIMIT2: 2500,
  LIMIT3: 5000,
  FEE1: 1490,
  FEE2: 990,
  FEE3: 490
};
function calcSubtotal(){ return state.cart.reduce((a,c)=>a + c.qty * c.basePrice, 0); }
function calcDeliveryFee(subtotal){
  if (subtotal <= 0) return 0;
  if (state.mode !== 'delivery') return 0;
  if (!state.geo || state.geo.status !== 'inside') return 0;
  if (subtotal < DELIVERY_RULES.LIMIT1) return DELIVERY_RULES.FEE1;
  if (subtotal < DELIVERY_RULES.LIMIT2) return DELIVERY_RULES.FEE2;
  if (subtotal < DELIVERY_RULES.LIMIT3) return DELIVERY_RULES.FEE3;
  return 0; // от 5 000 ₸ — бесплатно
}

// «как у Додо» (одна строка, ясно и по делу)
function buildDeliveryBannerTextCompact(subtotal){
  if (state.mode !== 'delivery' || !state.geo || state.geo.status !== 'inside' || subtotal <= 0) return '';
  const fmt = n => Math.ceil(n).toLocaleString('ru-RU');
  if (subtotal < DELIVERY_RULES.LIMIT1){
    const left = DELIVERY_RULES.LIMIT1 - subtotal;
    return `Доставка ${DELIVERY_RULES.FEE1.toLocaleString('ru-RU')} ₸. Ещё ${fmt(left)} ₸, и доставим за ${DELIVERY_RULES.FEE2.toLocaleString('ru-RU')} ₸`;
  }
  if (subtotal < DELIVERY_RULES.LIMIT2){
    const left = DELIVERY_RULES.LIMIT2 - subtotal;
    return `Доставка ${DELIVERY_RULES.FEE2.toLocaleString('ru-RU')} ₸. Ещё ${fmt(left)} ₸, и доставим за ${DELIVERY_RULES.FEE3.toLocaleString('ru-RU')} ₸`;
  }
  if (subtotal < DELIVERY_RULES.LIMIT3){
    const left = DELIVERY_RULES.LIMIT3 - subtotal;
    return `Доставка ${DELIVERY_RULES.FEE3.toLocaleString('ru-RU')} ₸. Ещё ${fmt(left)} ₸, и доставим бесплатно`;
  }
  return 'Доставим бесплатно';
}

// ---------------- состояние ----------------
const state = {
  items: [], categories: [], conf: null, activeCategory: null,
  cart: JSON.parse(localStorage.getItem('wingo.cart') || '[]'),
  geo: JSON.parse(localStorage.getItem('wingo.geo') || '{"status":"unknown","inside":false}'),
  mode: 'delivery', sheetItem: null, sheetQty: 1,
  select: { flavors: [], garnish: null, drink: null, drinkCounts: {}, dipCounts: {} },
  drinkOptions: [],
  geoWarnedOnce: false,
  _scrollY: 0,
  _lockCount: 0
};

// ---------------- элементы ----------------
const el = {
  tabs: $('#tabs'), grid: $('#grid'), sheet: $('#sheet'),
  sheetBackdrop: $('#sheetBackdrop'), sheetClose: $('#sheetClose'),
  sheetImg: $('#sheetImg'), sheetTitle: $('#sheetTitle'), sheetPrice: $('#sheetPrice'), sheetDesc: $('#sheetDesc'),
  flavorBlock: $('#flavorBlock'), flavorOptions: $('#flavorOptions'), flavorMax: $('#flavorMax'), flavorHint: $('#flavorHint'),
  garnishBlock: $('#garnishBlock'), garnishOptions: $('#garnishOptions'),
  dipsBlock: $('#dipsBlock'), dipsInfo: $('#dipsInfo'), dipsChoice: $('#dipsChoice'), dipsLeftHint: $('#dipsLeftHint'),
  qtyMinus: $('#qtyMinus'), qtyPlus: $('#qtyPlus'), qtyValue: $('#qtyValue'), addToCart: $('#addToCart'),
  cartBar: $('#cartBar'), cartOpenArea: $('#cartOpenArea'), cartCount: $('#cartCount'), cartTotal: $('#cartTotal'), openCheckout: $('#openCheckout'),
  checkout: $('#checkout'), coBackdrop: $('#coBackdrop'), coClose: $('#coClose'), coName: $('#coName'), coPhone: $('#coPhone'),
  addressGroup: $('#addressGroup'), coStreet: $('#coStreet'), coHouse: $('#coHouse'), coFloor: $('#coFloor'), coApt: $('#coApt'),
  coNote: $('#coNote'), coSummary: $('#coSummary'), coTotal: $('#coTotal'), coWhatsApp: $('#coWhatsApp'),
  hoursState: $('#hoursState'), geoBtn: $('#geoBtn'), geoBanner: $('#geoBanner'),
  deliveryMode: $('#deliveryMode'), modeSegment: $('#modeSegment')
};

// ---------------- стили ----------------
function ensureUIStyles(){
  if (document.getElementById('wingo-ui-style')) return;
  const css = `
  /* базовая стабилизация жестов */
  html, body { overscroll-behavior: contain; }
  body { -webkit-tap-highlight-color: transparent; }

  /* Лок скролла для боди при открытых слоях */
  .body-lock { position: fixed; left: 0; right: 0; width: 100%; overflow: hidden !important; top: var(--scroll-lock-top, 0px); }

  .section { padding-top: 8px; }
  .section-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; line-height: 1.2; }
  .section-sep { height:1px; background:#2E7D32; opacity:.35; margin:12px 0; border:0; }
  .opt { display:inline-block; margin:4px 8px 8px 0; border-radius: 8px; border:1px solid rgba(0,0,0,0.12); padding:8px 10px; background:#fff; }
  .opt:hover { border-color: rgba(0,0,0,0.25); }
  .opt.active { border-color:#2E7D32; box-shadow: 0 0 0 2px rgba(46,125,50,0.12); }
  .opt.opt-drink { text-align:center; padding:10px 12px 8px 12px; }
  .opt.opt-drink .nm { display:block; font-size:14px; font-weight:500; }
  .opt.opt-drink .add { display:block; font-size:12px; color:#6b7280; opacity:.9; margin-top:6px; padding-top:5px; border-top:1px solid rgba(0,0,0,0.08); }
  .dip-row + .dip-row { border-top:1px dashed rgba(0,0,0,0.08); }
  .btn-green { background:#2E7D32 !important; color:#fff !important; border:1px solid #2E7D32 !important; }
  .btn-green:hover { filter:brightness(0.95); }
  .btn-round { border-radius:9999px !important; aspect-ratio:1 / 1; width:36px; min-width:36px; display:inline-flex; align-items:center; justify-content:center; padding:0; }

  /* FAB корзина — фиксированный, без белого ореола */
  #cartBar.fab-cart { position: fixed; right: 16px; bottom: calc(76px + env(safe-area-inset-bottom));
    z-index: 900; display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 16px; background:#2E7D32; color:#fff;
    border: none; border-radius: 9999px; background-clip: padding-box;
    box-shadow: 0 10px 24px rgba(0,0,0,0.28); cursor: pointer; user-select: none;
    will-change: transform; transform: translateZ(0); backface-visibility: hidden; contain: paint; }
  #cartBar.fab-cart.hidden { display: none !important; }
  #cartBar.fab-cart::before, #cartBar.fab-cart::after { content: none !important; display: none !important; }
  #cartBar.fab-cart .cart-ic { width:18px; height:18px; display:inline-block; }
  #cartBar.fab-cart .cart-ic svg { width:100%; height:100%; display:block; fill:#fff; }
  #cartBar.fab-cart #cartCount { display:none !important; }
  #cartBar.fab-cart .cart-fab-total { font-weight:700; font-size:15px; }

  /* Нижний компактный баннер условий доставки (тёмный как у Додо) */
  #shipInfoBar { position: fixed; left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom)); z-index: 800;
    display: none; align-items: center; gap:10px; padding: 10px 12px;
    background: #111827; color:#F9FAFB; border:1px solid rgba(255,255,255,.08);
    border-radius: 9999px; box-shadow: 0 6px 16px rgba(0,0,0,.25);
    will-change: transform; transform: translateZ(0); backface-visibility: hidden; contain: paint; }
  #shipInfoBar.show { display:flex; }
  #shipInfoBar .i-btn { width: 22px; height: 22px; border-radius: 9999px; border:1px solid rgba(255,255,255,0.25);
    display:inline-flex; align-items:center; justify-content:center; background:transparent; cursor:pointer; font-weight:700; color:#fff; }
  /* [FIX #3] — разрешаем перенос на 2+ строки */
  #shipInfoBar .txt { flex:1; font-size: 13.5px; white-space: normal; overflow: visible; text-overflow: clip; line-height: 1.25; }

  /* Нижний шит с условиями — поверх FAB. Свой скролл, фон статичен */
  #shipSheetBackdrop { position:fixed; inset:0; background:rgba(0,0,0,.35); opacity:0; pointer-events:none; transition:opacity .2s ease; z-index: 1100; touch-action:none; overscroll-behavior: contain; }
  #shipSheet { position:fixed; left:0; right:0; bottom:-420px; background:#fff; border-radius:16px 16px 0 0;
    box-shadow: 0 -12px 28px rgba(0,0,0,.2); padding:14px 16px 18px; z-index: 1110; transition: transform .25s ease, bottom .25s ease;
    max-height: min(75vh, 520px); overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
  #shipSheet .hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; position: sticky; top: 0; background:#fff;}
  #shipSheet .hd .ttl { font-weight:700; font-size:16px; }
  #shipSheet .hd .cls { border:none; background:#111827; color:#fff; width:28px; height:28px; border-radius:9999px; cursor:pointer; }
  #shipSheet .tbl { width:100%; border-collapse:collapse; font-size:14px; margin-top:4px; }
  #shipSheet .tbl td { padding:10px 6px; border-bottom:1px solid rgba(0,0,0,.06); }
  #shipSheet.show + #shipSheetBackdrop,
  #shipSheetBackdrop.show { opacity:1; pointer-events:auto; }
  .ship-open #shipSheet { bottom:0; }

  /* Карточка товара и чекаут: фиксированные слои с локальным скроллом */
  #sheet.show, #checkout.show {
    position: fixed;
    inset: 0;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    overscroll-behavior: none;
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* Кнопка закрытия в листе товара поверх контента */
  #sheetClose, #sheet #sheetClose, #sheet .sheet-close, #sheetClose.btn-green { position: absolute; top: 10px; right: 10px; z-index: 1200; }
  `;
  const st = document.createElement('style'); st.id = 'wingo-ui-style'; st.textContent = css; document.head.appendChild(st);
}

// ---------------- body scroll lock helpers ----------------
function lockBodyScroll(){
  state._lockCount++;
  if (state._lockCount > 1) return; // уже залочено
  state._scrollY = window.scrollY || window.pageYOffset || 0;
  document.documentElement.dataset.sb = getComputedStyle(document.documentElement).scrollBehavior || '';
  document.documentElement.style.scrollBehavior = 'auto';
  document.body.style.setProperty('--scroll-lock-top', `-${state._scrollY}px`);
  document.body.classList.add('body-lock');
}
function unlockBodyScroll(){
  if (state._lockCount === 0) return;
  state._lockCount--;
  if (state._lockCount > 0) return;
  document.body.classList.remove('body-lock');
  const prev = state._scrollY || 0;
  window.scrollTo(0, prev);
  requestAnimationFrame(()=>{
    const prevBeh = document.documentElement.dataset.sb || '';
    if (prevBeh) document.documentElement.style.scrollBehavior = prevBeh;
    else document.documentElement.style.removeProperty('scroll-behavior');
  });
}
function ensureUnlockedIfNoLayers(){
  const sheetOpen = el.sheet && el.sheet.classList.contains('show');
  const checkoutOpen = el.checkout && el.checkout.classList.contains('show');
  const shipOpen = document.body.classList.contains('ship-open');
  if (!sheetOpen && !checkoutOpen && !shipOpen) {
    state._lockCount = 0;
    document.body.classList.remove('body-lock');
    const prev = state._scrollY || 0;
    window.scrollTo(0, prev);
    document.documentElement.style.removeProperty('scroll-behavior');
  }
}

// ---------------- geo check (safe) ----------------
function requireGeoChecked(){
  if (!state.geo || state.geo.status === 'unknown'){
    if (!state.geoWarnedOnce) {
      state.geoWarnedOnce = true;
      alert('Пожалуйста, проверьте доступность доставки — нажмите «Проверить доставку» вверху.');
    }
    return false;
  }
  return true;
}
function requireGeoCheckedSafe(){
  const ok = requireGeoChecked();
  if (!ok){ ensureUnlockedIfNoLayers(); }
  return ok;
}

// ---------------- помощники UI ----------------
function insertSeparatorBefore(elm){
  if (!elm || !elm.parentNode) return;
  if (elm.dataset && elm.dataset.sep === '1') return;
  const prev = elm.previousElementSibling;
  if (prev && prev.classList && prev.classList.contains('section-sep')) { elm.dataset.sep='1'; return; }
  const hr = document.createElement('hr'); hr.className = 'section-sep auto'; elm.parentNode.insertBefore(hr, elm);
  if (elm.dataset) elm.dataset.sep='1';
}
function clearAutoSeparators(){
  document.querySelectorAll('#sheet hr.section-sep.auto').forEach(n=>n.remove());
}
function dedupeSeparators(){
  const seps = Array.from(document.querySelectorAll('#sheet .section-sep')); let prev = null;
  seps.forEach(node => {
    if (prev && prev.nextElementSibling === node && prev.classList.contains('section-sep') && node.classList.contains('section-sep')) {
      if (node.classList.contains('auto')) node.remove(); else if (prev && prev.classList.contains('auto')) prev.remove();
    } else { prev = node; }
  });
}
function normalizeSeparators(){
  const root = document.getElementById('sheet');
  if (!root) return;
  const list = Array.from(root.querySelectorAll('hr.section-sep'));
  for (let i = list.length - 2; i >= 0; i--) {
    const cur = list[i], nxt = list[i+1];
    if (cur && nxt && cur.nextElementSibling === nxt) {
      if (nxt.classList.contains('auto')) nxt.remove();
      else if (cur.classList.contains('auto')) cur.remove();
    }
  }
  const first = root.querySelector('#sheet .section-sep');
  if (first && first === root.firstElementChild) first.remove();
  const last = root.querySelector('#sheet .section-sep:last-of-type');
  if (last && last === root.lastElementChild) last.remove();
}
function getHeaderOffsetPx() {
  const header = document.querySelector('.header, header'); if (!header) return 0;
  const cs = getComputedStyle(header); if (cs.position === 'fixed' || cs.position === 'sticky') { return header.offsetHeight || 0; }
  return 0;
}
function ensureNoticeVisible(elm) {
  if (!elm) return; elm.scrollIntoView({ block: 'start', behavior: 'smooth' });
  const ho = getHeaderOffsetPx(); if (ho) { setTimeout(() => { window.scrollBy({ top: -ho - 8, left: 0, behavior: 'instant' }); }, 250); }
}

// --- единая проверка гео (только один alert за сессию) ---
function requireGeoCheckedOnce(){
  if (!state.geo || state.geo.status === 'unknown'){
    if (!state.geoWarnedOnce) {
      state.geoWarnedOnce = true;
      alert('Пожалуйста, проверьте доступность доставки — нажмите «Проверить доставку» вверху.');
    }
    return false;
  }
  return true;
}

// ---------------- нижний баннер + нижний шит ----------------
function ensureShipInfoBar(){
  if (!document.getElementById('shipInfoBar')) {
    const bar = document.createElement('div'); bar.id = 'shipInfoBar';
    bar.innerHTML = `<button class="i-btn" aria-label="Условия" type="button">i</button><div class="txt"></div>`;
    document.body.appendChild(bar);
  }
  el.shipInfoBar = document.getElementById('shipInfoBar');
  el.shipInfoText = el.shipInfoBar.querySelector('.txt');
  el.shipInfoBtn = el.shipInfoBar.querySelector('.i-btn');

  if (!document.getElementById('shipSheet')) {
    const sheet = document.createElement('div'); sheet.id = 'shipSheet';
    sheet.innerHTML = `
      <div class="hd">
        <div class="ttl">Условия доставки</div>
        <button class="cls" type="button" aria-label="Закрыть">×</button>
      </div>
      <table class="tbl" aria-label="Тарифы доставки">
        <tbody>
          <tr><td>До 1 800 ₸</td><td style="text-align:right">1 490 ₸</td></tr>
          <tr><td>1 800–2 499 ₸</td><td style="text-align:right">990 ₸</td></tr>
          <tr><td>2 500–4 999 ₸</td><td style="text-align:right">490 ₸</td></tr>
          <tr><td>От 5 000 ₸</td><td style="text-align:right">0 ₸ (бесплатно)</td></tr>
        </tbody>
      </table>`;
    const backdrop = document.createElement('div'); backdrop.id = 'shipSheetBackdrop';
    document.body.appendChild(sheet); document.body.appendChild(backdrop);

    el.shipSheet = sheet; el.shipSheetBackdrop = backdrop;
    const close = () => { document.body.classList.remove('ship-open'); el.shipSheetBackdrop.classList.remove('show'); unlockBodyScroll(); ensureUnlockedIfNoLayers(); };
    sheet.querySelector('.cls').onclick = close;
    backdrop.onclick = close;
  } else {
    el.shipSheet = document.getElementById('shipSheet');
    el.shipSheetBackdrop = document.getElementById('shipSheetBackdrop');
  }

  el.shipInfoBtn.onclick = ()=>{ document.body.classList.add('ship-open'); el.shipSheetBackdrop.classList.add('show'); lockBodyScroll(); };
}
function updateShipInfoBar(){
  ensureShipInfoBar();
  ensureCartFAB();

  const sub = calcSubtotal();
  const sheetOpen = el.sheet && el.sheet.classList.contains('show');
  const checkoutOpen = el.checkout && el.checkout.classList.contains('show');

  const shouldShow = state.mode==='delivery'
    && state.geo && state.geo.status==='inside'
    && sub>0
    && !sheetOpen
    && !checkoutOpen;

  if (!shouldShow){
    el.shipInfoBar.classList.remove('show');
    el.shipInfoText.textContent='';
    return;
  }

  const txt = buildDeliveryBannerTextCompact(sub);
  if (!txt){ el.shipInfoBar.classList.remove('show'); return; }

  el.shipInfoText.textContent = txt;
  el.shipInfoBar.classList.add('show');
}

// ---------------- FAB корзины ----------------
function ensureCartFAB(){
  if (!el.cartBar || el.cartBar.dataset.fabInited === '1') return;
  el.cartBar.dataset.fabInited = '1';
  el.cartBar.classList.add('fab-cart');

  el.cartBar.innerHTML = `
    <span class="cart-ic" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14h9.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49a1 1 0 00-.88-1.48H6.21Л5.27 2H2v2h2l3.6 7.59-1.35 2.44C5.52 14.37 6.25 15 7.16 15z"/></svg>
    </span>
    <span id="cartFabTotal" class="cart-fab-total">0 ₸</span>
  `;
  el.cartFabTotal = document.getElementById('cartFabTotal');

  // [FIX #1] и [FIX #2]: всегда открываем чекаут; без блокирующего requireGeo
  el.cartBar.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // если открыт лист товара — закрываем его перед переходом к чекауту
    if (el.sheet && el.sheet.classList.contains('show')) { closeSheet(); }
    // режим под ситуацию: доставка внутри зоны → delivery, иначе pickup
    if (state.geo && state.geo.status === 'inside') {
      state.mode = 'delivery';
    } else {
      state.mode = 'pickup';
    }
    openCheckout();
  });

  if (el.cartOpenArea) el.cartOpenArea.style.display = 'none';
}

// ---------------- загрузка ----------------
async function loadAll() {
  try {
    const [m, c] = await Promise.all([ fetch(`menu.json?v=${BUILD_VERSION}`), fetch(`config.json?v=${BUILD_VERSION}`) ]);
    const menu = await m.json(); state.items = menu.items || []; state.conf = await c.json();
  } catch (e) {
    console.error('Не удалось загрузить конфиг/меню', e);
    alert('Ошибка загрузки конфигурации. Проверьте, что config.json и menu.json — валидный JSON (без комментариев).'); return;
  }
  ensureUIStyles();
  ensureCartFAB(); ensureShipInfoBar();
  if (el.coClose) el.coClose.classList.add('btn-green','btn-round');
  try {
    state.drinkOptions = state.items.filter(i => (i.category || '').toLowerCase() === 'напитки').map(i => i.name).filter(Boolean);
  } catch(_) { state.drinkOptions = []; }
  setupHours(); buildCategories(); renderGrid(); updateCartBar(); updateGeoUI();
}

// ---------------- расписание ----------------
function setupHours(){
  const now = new Date();
  const [oh, om] = state.conf.business_hours.daily.open.split(':').map(Number);
  const [ch, cm] = state.conf.business_hours.daily.close.split(':').map(Number);
  const open = new Date(now); open.setHours(oh, om, 0, 0); const close = new Date(now); close.setHours(ch, cm, 0, 0);
  const isOpen = now >= open && now <= close;
  el.hoursState.textContent = (isOpen ? 'Открыто · ' : 'Закрыто · ') + state.conf.business_hours.daily.open + '–' + state.conf.business_hours.daily.close;
}

// ---------------- категории/грид ----------------
function buildCategories(){
  const set = new Set(state.items.map(i => i.category)); state.categories = [...set]; el.tabs.innerHTML = '';
  state.categories.forEach((cat, i) => {
    const a = document.createElement('a'); a.href = '#'; a.textContent = cat;
    a.className = (state.activeCategory ? (state.activeCategory===cat) : i===0) ? 'active' : '';
    a.onclick = e => { e.preventDefault(); state.activeCategory = cat; renderGrid(); $$('#tabs a').forEach(n => n.classList.toggle('active', n.textContent === cat)); };
    el.tabs.appendChild(a);
  });
}
function renderGrid(){
  const list = state.activeCategory ? state.items.filter(i => i.category === state.activeCategory) : state.items;
  el.grid.innerHTML = ''; const frag = document.createDocumentFragment();
  list.forEach(item => {
    const card = document.createElement('div'); card.className = 'card';
    const img = document.createElement('img'); img.className='thumb'; img.src=item.image||'images/placeholder.png'; img.alt=item.name;
    const body = document.createElement('div'); body.className='card-body';
    const title = document.createElement('div'); title.className='title'; title.textContent=item.name;
    const actions = document.createElement('div'); actions.className='actions';
    const price = document.createElement('div'); price.className='price'; price.textContent=money(item.price);
    const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Выбрать';
    btn.onclick = () => openSheet(item); card.onclick = () => openSheet(item);
    actions.append(price, btn); body.append(title, actions); card.append(img, body); frag.append(card);
  });
  el.grid.append(frag);
}

// ---------------- напитки/дипы ----------------
function getIncludedDrinksCount(item){
  if ((item?.category || '').toLowerCase() === 'напитки') return 0;
  if (item?.id === 'combo-wings-6') return 1;
  if (item?.id === 'combo-tenders-5') return 1;
  if (item?.id === 'duo-wings-15') return 2;
  const t = (item.description || '').toLowerCase(); const m = t.match(/(\d+)\s*напит(?:ок|ка|ков)/i);
  if (m) { const n = parseInt(m[1], 10); if (Number.isFinite(n) && n > 0) return n; }
  if (t.includes('напиток')) return 1;
  return 0;
}
function removePrevDrinkBlock(){ const prev = document.getElementById('drinkBlock'); if (prev) prev.remove(); }
function buildDrinkUI(item){
  removePrevDrinkBlock();
  if ((item?.category || '').toLowerCase() === 'напитки') { state.select.drink = null; state.select.drinkCounts = {}; return; }
  const count = getIncludedDrinksCount(item); if (!count) { state.select.drink = null; state.select.drinkCounts = {}; return; }
  const options = state.drinkOptions || []; if (!options.length) return;

  const block = document.createElement('div'); block.id = 'drinkBlock'; block.className = 'section';
  const title = document.createElement('div'); title.className = 'section-title'; title.textContent = 'Напиток:'; block.appendChild(title);
  insertSeparatorBefore(block);

  if (count === 1) {
    const wrap = document.createElement('div'); wrap.id = 'drinkOptions'; block.appendChild(wrap);
    options.forEach((name, idx) => {
      const btn = document.createElement('button'); btn.className = 'opt opt-drink' + (idx===0 ? ' active' : '');
      btn.innerHTML = `<span class="nm">${name}</span><span class="add">+0 ₸</span>`;
      if (idx===0) state.select.drink = name;
      btn.onclick = () => { state.select.drink = name; [...wrap.children].forEach(n => n.classList.toggle('active', n===btn)); };
      wrap.appendChild(btn);
    });
  } else {
    const hint = document.createElement('div'); hint.className = 'hint'; block.appendChild(hint);
    const list = document.createElement('div'); list.id = 'drinkChoice'; block.appendChild(list);
    state.select.drink = null; state.select.drinkCounts = {};
    const sumAssigned = () => Object.values(state.select.drinkCounts).reduce((a,b)=>a+(b||0),0);
    const setHint = () => { const left = count - sumAssigned(); hint.textContent = left > 0 ? `Осталось выбрать: ${left}` : 'Готово'; };
    options.forEach(name => {
      state.select.drinkCounts[name] = 0;
      const row = document.createElement('div'); row.className = 'dip-row';
      row.innerHTML = `
        <div class="dip-name">${name}</div>
        <div class="dip-ctr">
          <button class="dip-btn minus" type="button" aria-label="Уменьшить">−</button>
          <span class="dip-count">0</span>
          <button class="dip-btn plus" type="button" aria-label="Увеличить">+</button>
        </div>`;
      const minus = row.querySelector('.minus'); const plus = row.querySelector('.plus'); const cEl = row.querySelector('.dip-count');
      const refresh = () => { const v = state.select.drinkCounts[name] || 0; cEl.textContent = v; row.classList.toggle('active', v>0); setHint(); };
      minus.onclick = () => { const cur = state.select.drinkCounts[name] || 0; if (cur > 0) state.select.drinkCounts[name] = cur - 1; refresh(); };
      plus.onclick = () => { if (sumAssigned() >= count) return; state.select.drinkCounts[name] = (state.select.drinkCounts[name] || 0) + 1; refresh(); };
      refresh(); list.appendChild(row);
    });
    setHint();
  }

  if (el.dipsBlock && el.dipsBlock.parentNode) { el.dipsBlock.parentNode.insertBefore(block, el.dipsBlock); }
  else { el.sheet.appendChild(block); }
}

// ---------------- карточка товара ----------------
function openSheet(item){
  clearAutoSeparators();

  state.sheetItem = item; state.sheetQty = 1;
  state.select = { flavors: [], garnish: null, drink: null, drinkCounts: {}, dipCounts: {} };
  el.sheetImg.src = item.image || 'images/placeholder.png';
  el.sheetTitle.textContent = item.name; el.sheetPrice.textContent = money(item.price);
  el.sheetDesc.textContent = item.description || ''; el.qtyValue.textContent = state.sheetQty;

  const isDrinkCard = ((item.category || '').toLowerCase() === 'напитки');

  if(!isDrinkCard && item.flavors_max){
    el.flavorBlock.style.display = ''; el.flavorMax.textContent = item.flavors_max; el.flavorOptions.innerHTML = '';
    (state.conf.cooking_flavors || []).forEach(fl => {
      const o = document.createElement('button'); o.className = 'opt flavor'; o.setAttribute('aria-pressed','false');
      const name = typeof fl === 'string' ? fl : (fl.name || ''); const heat = typeof fl === 'object' && typeof fl.heat === 'number' ? fl.heat : 0;
      const color = typeof fl === 'object' && fl.color ? fl.color : ''; const peppers = '🌶'.repeat(Math.max(0, Math.min(3, heat)));
      o.innerHTML = `<span class="dot" style="${color?`background:${color}`:''}"></span><span class="nm">${name}</span><span class="heat">${peppers}</span>`;
      o.onclick = () => { const i = state.select.flavors.indexOf(name);
        if(i > -1){ state.select.flavors.splice(i,1); o.classList.remove('active'); o.setAttribute('aria-pressed','false'); }
        else if(state.select.flavors.length < item.flavors_max){ state.select.flavors.push(name); o.classList.add('active'); o.setAttribute('aria-pressed','true'); }
        updateFlavorHint(item);
      };
      el.flavorOptions.appendChild(o);
    });
    updateFlavorHint(item); insertSeparatorBefore(el.flavorBlock);
  } else { el.flavorBlock.style.display = 'none'; }

  if(!isDrinkCard && item.garnish && item.garnish.options && item.garnish.options.length){
    el.garnishBlock.style.display=''; el.garnishOptions.innerHTML='';
    item.garnish.options.forEach((g, idx) => {
      const o = document.createElement('button'); o.className = 'opt' + (idx===0 ? ' active' : ''); o.textContent = g;
      if(idx===0) state.select.garnish = g;
      o.onclick = () => { state.select.garnish = g; [...el.garnishOptions.children].forEach(n => n.classList.toggle('active', n===o)); };
      el.garnishOptions.appendChild(o);
    });
    insertSeparatorBefore(el.garnishBlock);
  } else { el.garnishBlock.style.display='none'; }

  if (!isDrinkCard) buildDrinkUI(item);

  if(!isDrinkCard && typeof item.dips_included === 'number'){
    el.dipsBlock.style.display=''; el.dipsInfo.textContent = `Входит: ${item.dips_included} дип` + (item.dips_included===1?'':'ов');
    buildIncludedDipsUI(item); insertSeparatorBefore(el.dipsBlock);
  } else { el.dipsBlock.style.display='none'; el.dipsChoice.innerHTML=''; el.dipsLeftHint.textContent=''; }

  dedupeSeparators(); normalizeSeparators();

  if (el.shipInfoBar) el.shipInfoBar.classList.remove('show');
  lockBodyScroll();

  el.sheet.classList.add('show'); el.sheet.setAttribute('aria-hidden','false');

  updateShipInfoBar();
}
function updateFlavorHint(item){ const max = item.flavors_max || 1; const n = state.select.flavors.length; el.flavorHint.textContent = `${n}/${max} выбрано`; }

function buildIncludedDipsUI(item){
  const dips = state.conf.dip_flavors || []; el.dipsChoice.innerHTML = ''; el.dipsChoice.classList.remove('dips-grid'); state.select.dipCounts = {};
  const getAssigned = () => Object.values(state.select.dipCounts).reduce((a,b)=>a+(b||0),0); const max = item.dips_included || 0;
  dips.forEach(name => {
    state.select.dipCounts[name] = 0;
    const row = document.createElement('div'); row.className = 'dip-row';
    row.innerHTML = `
      <div class="dip-name">${name}</div>
      <div class="dip-ctr">
        <button class="dip-btn minus" type="button" aria-label="Уменьшить">−</button>
        <span class="dip-count">0</span>
        <button class="dip-btn plus" type="button" aria-label="Увеличить">+</button>
      </div>`;
    const minus = row.querySelector('.minus'); const plus = row.querySelector('.plus'); const cEl = row.querySelector('.dip-count');
    const updateActive = ()=>{ const val = state.select.dipCounts[name] || 0; cEl.textContent = val; row.classList.toggle('active', val>0); };
    const inc = ()=>{ const assigned = getAssigned(); if(assigned >= max) return; state.select.dipCounts[name] = (state.select.dipCounts[name]||0) + 1; updateActive();
      const left = max - getAssigned(); el.dipsLeftHint.textContent = left>0 ? `Осталось распределить: ${left}` : 'Распределено'; };
    const dec = ()=>{ const cur = state.select.dipCounts[name] || 0; if(cur>0){ state.select.dipCounts[name] = cur - 1; } updateActive();
      const left = max - getAssigned(); el.dipsLeftHint.textContent = left>0 ? `Осталось распределить: ${left}` : 'Распределено'; };
    minus.addEventListener('click', dec); plus.addEventListener('click', inc); el.dipsChoice.appendChild(row);
  });
  el.dipsLeftHint.textContent = max>0 ? `Осталось распределить: ${max}` : 'Распределено';
}

el.sheetClose && (el.sheetClose.onclick = () => closeSheet());
el.sheetBackdrop && (el.sheetBackdrop.onclick = () => closeSheet());
function closeSheet(){
  el.sheet.classList.remove('show'); el.sheet.setAttribute('aria-hidden','true');
  unlockBodyScroll();
  updateShipInfoBar();
}

el.qtyMinus && (el.qtyMinus.onclick = () => { if(state.sheetQty>1){ state.sheetQty--; el.qtyValue.textContent = state.sheetQty; } });
el.qtyPlus && (el.qtyPlus.onclick = () => { state.sheetQty++; el.qtyValue.textContent = state.sheetQty; });

el.addToCart && (el.addToCart.onclick = () => {
  const it = state.sheetItem; if(!it) return;
  if(it.flavors_max && state.select.flavors.length===0){ alert('Выберите хотя бы 1 вкус'); return; }
  const drinkKeyPart = (() => { if (state.select.drink) return state.select.drink;
    const list = Object.entries(state.select.drinkCounts || {}).filter(([_,v])=>v>0).map(([k,v])=>`${k}×${v}`).join(','); return list || ''; })();
  const key = [ it.id||it.name, (state.select.flavors||[]).join('+'), state.select.garnish||'', drinkKeyPart ].join('|');
  const ex = state.cart.find(c => c.key === key);
  const drinks_included = getIncludedDrinksCount(it);
  const itemPayload = { key, id: it.id || it.name, name: it.name, basePrice: it.price, qty: state.sheetQty,
    flavors: [...(state.select.flavors||[])], garnish: state.select.garnish || null,
    drinks_included, drink: state.select.drink || null, drinks_breakdown: state.select.drinkCounts || null,
    dips_included: it.dips_included || 0, dips_breakdown: state.select.dipCounts };
  if(ex){ ex.qty += state.sheetQty; } else { state.cart.push(itemPayload); }
  localStorage.setItem('wingo.cart', JSON.stringify(state.cart)); updateCartBar(); closeSheet();
});

// ---------------- корзина / чекаут ----------------
function updateCartBar(){
  const count = state.cart.reduce((a,c)=>a+c.qty,0);
  const subtotal = calcSubtotal();

  if (el.cartFabTotal) el.cartFabTotal.textContent = moneyFab(subtotal);

  const checkoutOpen = el.checkout && el.checkout.classList.contains('show');

  if (count > 0 && !checkoutOpen) {
    el.cartBar.classList.remove('hidden'); el.cartBar.style.display='';
  } else {
    el.cartBar.classList.add('hidden'); el.cartBar.style.display='none';
  }

  updateShipInfoBar();
  ensureUnlockedIfNoLayers();
}
el.openCheckout && (el.openCheckout.onclick = () => { if (!requireGeoCheckedSafe()) return; openCheckout(); });
el.cartOpenArea && (el.cartOpenArea.onclick = () => { if (!requireGeoCheckedSafe()) return; openCheckout(); });

function setNoteLabel(text){
  const labelCandidates = [ document.querySelector('label[for="coNote"]'), el.coNote && el.coNote.closest('.field') ? el.coNote.closest('.field').querySelector('label') : null,
    ...Array.from(document.querySelectorAll('#checkout label')).filter(l => /Комментарий/i.test(l.textContent || '')) ].filter(Boolean);
  labelCandidates.forEach(l => { l.textContent = text; });
}

function injectNoteAfterLabel(){
  const checkout = el.checkout || document.getElementById('checkout');
  if (!checkout) return;
  const labels = Array.from(checkout.querySelectorAll('label'));
  const label = labels.find(l => /Комментарий/i.test((l.textContent||'').trim()));
  if (!label) { ensureNoteField(); return; }
  const next = label.nextElementSibling;
  if (next && next.tagName === 'TEXTAREA' && next.id === 'coNote') return;
  let ta = checkout.querySelector('#coNote');
  if (!ta) { ta = document.createElement('textarea'); ta.id = 'coNote'; }
  ta.setAttribute('rows','3');
  ta.placeholder = (state.mode === 'delivery')
    ? 'Комментарий курьеру (как пройти, код домофона...)'
    : 'Комментарий ресторану (пожелания, уточнения...)';
  ta.style.width = '100%';
  ta.style.boxSizing = 'border-box';
  ta.style.border = '1px solid rgba(0,0,0,.15)';
  ta.style.borderRadius = '12px';
  ta.style.padding = '12px 14px';
  ta.style.margin = '6px 0 12px 0';
  ta.style.fontSize = '16px';
  ta.style.minHeight = '60px';
  label.parentNode.insertBefore(ta, label.nextSibling);
  el.coNote = ta;
}
function ensureNoteField(){
  if (el.coNote && el.coNote.tagName) return;
  const checkout = el.checkout || document.getElementById('checkout');
  if (!checkout) return;
  let label = checkout.querySelector('label[for="coNote"]') || Array.from(checkout.querySelectorAll('label')).find(l => /Комментарий/i.test(l.textContent||''));
  let container = (label && label.closest && label.closest('.field')) ? label.closest('.field') : null;
  if (!container) {
    container = document.createElement('div');
    container.className = 'field';
    if (label && label.parentNode) {
      label.parentNode.insertBefore(container, label.nextSibling);
      container.appendChild(label);
    } else {
      checkout.appendChild(container);
    }
  }
  const ta = document.createElement('textarea');
  ta.id = 'coNote';
  ta.className = 'input';
  ta.rows = 3;
  ta.placeholder = state.mode === 'delivery' 
    ? 'Комментарий курьеру (как пройти, код домофона...)' 
    : 'Комментарий ресторану (пожелания, уточнения...)';
  container.appendChild(ta);
  el.coNote = ta;
}
function forceShowNoteField(){ ensureNoteField();
  if (!el.coNote) return;
  el.coNote.removeAttribute('hidden'); el.coNote.style.display = ''; el.coNote.style.visibility = 'visible';
  const field = el.coNote.closest('.field') || el.coNote.parentElement;
  if (field) { field.removeAttribute('hidden'); field.classList.remove('hidden'); field.style.display = ''; field.style.visibility = 'visible'; }
  let p = el.coNote.parentElement;
  while (p && p !== el.checkout) {
    if (p && p.style && (p.style.display === 'none' || p.style.visibility === 'hidden')) { p.style.display = ''; p.style.visibility = 'visible'; }
    if (p && p.classList && p.classList.contains('hidden')) p.classList.remove('hidden'); // [FIX typo: п -> p]
    p = p.parentElement;
  }
}
function updateNoteUIByMode(){ ensureNoteField();
  if (state.mode === 'delivery') { setNoteLabel('Комментарий курьеру'); if (el.coNote) el.coNote.placeholder = 'Комментарий курьеру (как пройти, код домофона...)'; }
  else { setNoteLabel('Комментарий ресторану'); if (el.coNote) el.coNote.placeholder = 'Комментарий ресторану (пожелания, уточнения...)'; }
  forceShowNoteField();
}

function openCheckout(){
  injectNoteAfterLabel();

  // [FIX #1] уважаем заранее выбранный режим (из FAB), но валидируем
  const defaultMode = (state.geo && state.geo.status === 'inside') ? 'delivery' : 'pickup';
  if (state.mode === 'delivery' && (!state.geo || state.geo.status !== 'inside')) {
    state.mode = 'pickup';
  }
  if (state.mode !== 'delivery' && state.mode !== 'pickup') {
    state.mode = defaultMode;
  }

  if(el.coPhone && !el.coPhone.value){ el.coPhone.value = '+7'; }
  el.checkout.classList.add('show'); el.checkout.setAttribute('aria-hidden','false');
  ensureNoteField(); updateModeUIByModeSafe(); renderCoSummary();
  lockBodyScroll();
  updateCartBar();
  updateShipInfoBar();
}
function updateModeUIByModeSafe(){
  // Обёртка, чтобы не дергать сегмент, если его нет
  updateModeUI();
}
el.coClose && (el.coClose.onclick = () => { 
  el.checkout.classList.remove('show'); el.checkout.setAttribute('aria-hidden','true'); 
  unlockBodyScroll();
  updateCartBar();
  updateShipInfoBar();
});
el.coBackdrop && (el.coBackdrop.onclick = () => { 
  el.checkout.classList.remove('show'); el.checkout.setAttribute('aria-hidden','true'); 
  unlockBodyScroll();
  updateCartBar();
  updateShipInfoBar();
});

el.modeSegment && el.modeSegment.addEventListener('click', e=>{
  const btn = e.target.closest('.seg'); if(!btn) return;
  const mode = btn.getAttribute('data-mode');
  if(mode==='delivery' && !requireGeoCheckedSafe()) return;
  if(mode==='delivery' && state.geo.status==='outside'){ alert('Вы вне зоны доставки. Доступен самовывоз.'); return; }
  state.mode = mode; updateModeUI();
});
function updateModeUI(){
  injectNoteAfterLabel();
  if(state.mode==='delivery'){ el.deliveryMode.textContent = 'Режим: Доставка'; el.addressGroup.style.display=''; }
  else { el.deliveryMode.textContent = 'Режим: Самовывоз — ' + (state.conf.pickup && state.conf.pickup.address ? state.conf.pickup.address : ''); el.addressGroup.style.display='none'; }
  $$('#modeSegment .seg').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode')===state.mode));
  updateNoteUIByMode();
  updateShipInfoBar();
  renderCoSummary();
}

function renderCoSummary(){
  if(state.cart.length===0){ el.coSummary.innerHTML='<em>Корзина пуста</em>'; el.coTotal.textContent=money(0); return; }

  const lines = state.cart.map(c=>{
    const extras=[];
    if(c.flavors?.length) extras.push('вкус: '+c.flavors.join(' + '));
    if(c.garnish) extras.push('гарнир: '+c.garnish);
    if (c.drinks_included > 1) {
      const pairs = Object.entries(c.drinks_breakdown||{}).filter(([_,v])=>v>0).map(([k,v])=>`${k}×${v}`);
      if (pairs.length) extras.push('напитки: '+pairs.join(', ')); else extras.push('напитки: выбрать при звонке');
    } else if (c.drinks_included === 1 && c.drink) { extras.push('напиток: '+c.drink); }
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

  const subtotal = calcSubtotal();
  const delivery = calcDeliveryFee(subtotal);
  const total = subtotal + delivery;

  const deliveryLine = (state.mode==='delivery' && (state.geo && state.geo.status==='inside'))
    ? `<div class="co-item delivery">
        <div class="co-title">Доставка</div>
        <div class="co-controls"><span class="s">${money(delivery)}</span></div>
      </div>`
    : '';

  el.coSummary.innerHTML = lines + deliveryLine;
  el.coTotal.textContent = money(total);

  if (!el._summaryBound) {
    el._summaryBound = true;
    el.coSummary.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button');
      if (!btn) return;
      const k = btn.getAttribute('data-k');
      if (!k) return;
      const isMinus = btn.classList.contains('minus');
      const isPlus = btn.classList.contains('plus');
      const idx = state.cart.findIndex(c=>c.key===k);
      if (idx === -1) return;
      if (isMinus) {
        if (state.cart[idx].qty > 1) state.cart[idx].qty--; else state.cart.splice(idx,1);
      } else if (isPlus) {
        state.cart[idx].qty++;
      } else {
        return;
      }
      localStorage.setItem('wingo.cart', JSON.stringify(state.cart));
      renderCoSummary();
      updateCartBar();
    });
  }
}

// ---------------- гео UI ----------------
function updateGeoUI(){
  const b = el.geoBanner, g = state.geo;
  const d = (typeof g.distanceKm === 'number' && isFinite(g.distanceKm)) ? g.distanceKm : null;
  const dStr = d !== null ? ` — расстояние: ${d.toFixed(1)} км` : '';
  if(g.status==='inside'){ b.className='geo-banner ok'; b.textContent=`Доступна доставка с улицы Балкантау 94${dStr}.`; }
  else if(g.status==='outside'){
    b.className='geo-banner bad'; const pickupAddr = state.conf.pickup && state.conf.pickup.address ? state.conf.pickup.address : '';
    b.textContent=`Доставка недоступна${dStr} (за пределами зоны), но доступен самовывоз${pickupAddr ? ' — ' + pickupAddr : ''}.`;
  }
  else if(g.status==='denied'){ b.className='geo-banner bad'; b.textContent='Доступ к геолокации запрещён — доставка недоступна.'; }
  else { b.className='geo-banner'; b.textContent=''; }
  updateShipInfoBar();
}

el.geoBtn && (el.geoBtn.onclick = () => {
  if(!navigator.geolocation){ alert('Геолокация не поддерживается'); return; }
  el.geoBtn.disabled = true; el.geoBtn.textContent='Проверяем...';
  navigator.geolocation.getCurrentPosition(pos=>{
    const pt = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    const base = state.conf.delivery.center;
    const TEST_RADIUS_KM = 10;
    const radius = TEST_RADIUS_KM;
    const d = hav(base, pt); state.geo.distanceKm = d; state.geo.inside = d <= radius; state.geo.status = state.geo.inside ? 'inside' : 'outside';
    localStorage.setItem('wingo.geo', JSON.stringify(state.geo)); updateGeoUI(); ensureNoticeVisible(el.geoBanner);
    el.geoBtn.disabled=false; el.geoBtn.textContent='Проверить доставку';
  }, err=>{
    state.geo.status='denied'; state.geo.inside=false; updateGeoUI(); ensureNoticeVisible(el.geoBanner);
    el.geoBtn.disabled=false; el.geoBtn.textContent='Проверить доставку';
  }, {enableHighAccuracy:true, timeout:7000, maximumAge:30000});
});

// ---------------- WhatsApp ----------------
function makeWAOrderLink(){
  const phone = state.conf.whatsapp_number;
  const lines = state.cart.map(c=>{
    const extras=[];
    if(c.flavors?.length) extras.push('вкус: '+c.flavors.join(' + '));
    if(c.garnish) extras.push('гарнир: '+c.garnish);
    if (c.drinks_included > 1) {
      const pairs = Object.entries(c.drinks_breakdown||{}).filter(([_,v])=>v>0).map(([k,v])=>`${k}×${v}`);
      if (pairs.length) extras.push('напитки: '+pairs.join(', ')); else extras.push('напитки: выбрать при звонке');
    } else if (c.drinks_included === 1 && c.drink) { extras.push('напиток: '+c.drink); }
    if(c.dips_included){
      extras.push('входит дипов: '+c.dips_included);
      const pairs = Object.entries(c.dips_breakdown||{}).filter(([_,v])=>v>0).map(([k,v])=>`${k}×${v}`);
      if(pairs.length) extras.push('дипы: '+pairs.join(', '));
    }
    const sum = Math.round(c.qty * c.basePrice);
    return `- ${c.name}${extras.length?' ('+extras.join(' + ')+')':''} × ${c.qty} = ${sum} ₸`;
  }).join('%0A');

  const subtotal = Math.round(calcSubtotal());
  const delivery = Math.round(calcDeliveryFee(subtotal));
  const total = subtotal + delivery;

  let addr = '';
  if(state.mode==='delivery'){
    const street=(el.coStreet?.value||'').trim();
    const house=(el.coHouse?.value||'').trim();
    const floor=(el.coFloor?.value||'').trim();
    const apt=(el.coApt?.value||'').trim();
    if(!street||!house){ alert('Пожалуйста, укажите улицу и дом.'); throw new Error('address missing'); }
    addr = `ул. ${street}, д. ${house}${floor?`, эт. ${floor}`:''}${apt?`, кв. ${apt}`:''}`;
  }

  const name = encodeURIComponent((el.coName?.value||'').trim());
  const phoneText = encodeURIComponent((el.coPhone?.value||'').trim());
  const mode = state.mode==='delivery' ? 'Доставка' : ('Самовывоз — ' + (state.conf.pickup && state.conf.pickup.address ? state.conf.pickup.address : '')); 
  const addrEnc = encodeURIComponent(addr);
  const note = encodeURIComponent((el.coNote?.value||'').trim());
  const deliveryLine = (state.mode==='delivery' && state.geo && state.geo.status==='inside') ? `%0AДоставка: ${delivery} ₸` : '';

  const text = `Заказ WINGO:%0A${lines}%0AИтого: ${total} ₸${deliveryLine}%0AРежим: ${mode}%0AИмя: ${name}%0AТел: ${phoneText}%0AАдрес: ${addrEnc}%0AКомментарий: ${note}`;
  return `https://wa.me/${phone}?text=${text}${state.conf.utm}`;
}
el.coWhatsApp && (el.coWhatsApp.onclick = () => {
  if(state.cart.length===0){ alert('Сначала добавьте позиции в корзину'); return; }
  if (!requireGeoCheckedSafe()) return;
  try{ window.open(makeWAOrderLink(), '_blank', 'noopener'); }catch(e){}
});

// ---------------- запуск ----------------
loadAll();
