# GitHub Pages: всегда свежая версия без чистки кэша

## Идея
- **app.js, menu.json, config.json** открываем с `?v=<build>` (уникальный номер билда).
- На каждом деплое CI проставляет новый `<build>`, создаёт `VERSION.txt`.
- На стороне клиента крошечный `version-probe.js` сравнивает текущий `<build>` со свежим из `VERSION.txt` (берёт с `?ts=Date.now()` → кеш не влияет). Если есть более свежая версия — делает «жёсткий» рефреш страницы.

## Шаги
1. **Добавьте `version-probe.js` в `<head>`** до подключения `app.js`:
   ```html
   <script src="version-probe.js" defer></script>
   <script src="app.js?v=BUILD"></script>
   ```
   (Скрипт сам вытащит `BUILD` из `app.js?v=...`.)

2. **Положите в корень проекта** файлы:
   - `bump-version.mjs`
   - `version-probe.js`
   - `VERSION.txt` (появится автоматически после первого запуска скрипта)
   - `.github/workflows/pages-cache.yml`

3. **Включите GitHub Actions** в репозитории (если выключен).

4. **Правки под ваши ветки/папки** в `.github/workflows/pages-cache.yml`:
   - `on.push.branches: ["main"]` — на какую ветку вы пушите код.
   - `PUBLISH_DIR: "."` — если сайт в корне; или `docs` если публикуете из `docs/`.
   - `COMMIT_BRANCH: "main"` — в какую ветку коммитить изменённый `index.html`/`VERSION.txt`.
     > Если Pages у вас собирается из ветки `gh-pages` — укажите её.

5. Коммит/пуш → Action проставит новую версию и закоммитит обратно. После публикации при первом заходе старый `index.html` увидит новый `VERSION.txt` и **автоматически обновится**.

Готово — пользователи всегда получают свежую версию, без «почистите кэш».
