// bump-version.mjs — обновляет app.js?v=<build> и VERSION.txt
import fs from 'fs';

const FILE = 'index.html';
if (!fs.existsSync(FILE)) {
  console.error('index.html not found at project root');
  process.exit(1);
}

const html = fs.readFileSync(FILE, 'utf8');
const ts = Date.now().toString().slice(0,10);

let changed = html;

// app.js?v=<old> -> app.js?v=<ts>; если ?v= нет — добавить
changed = changed.replace(/app\.js\?v=\d+/g, 'app.js?v=' + ts);
if (!/app\.js\?v=\d+/.test(changed)) {
  changed = changed.replace(/app\.js\b(?!\?)/, 'app.js?v=' + ts);
}

// Также обновим menu.json и config.json вызовы вида fetch(`file.json?v=${BUILD_VERSION}`)
// если у вас есть шаблон BUILD_VERSION — будет ок. Если нет — можно игнорировать.
changed = changed.replace(/(menu\.json\?v=)\d+/g, '$1' + ts);
changed = changed.replace(/(config\.json\?v=)\d+/g, '$1' + ts);

fs.writeFileSync(FILE, changed, 'utf8');
fs.writeFileSync('VERSION.txt', `BUILD_VERSION=${ts}\n`, 'utf8');
console.log('Stamped build v=' + ts);
