# Свадебное приглашение + RSVP

Mobile-first сайт для сбора ответов гостей.

## 1. Локальный просмотр

Можно открыть `index.html` в браузере, но отправка ответов заработает после настройки Google Apps Script.

## 2. Google Sheets

Создайте Google Таблицу и скопируйте её ID из адреса:

`https://docs.google.com/spreadsheets/d/ЭТОТ_ID/edit`

В `google-apps-script.gs` замените:

`PASTE_SPREADSHEET_ID_HERE`

на ID таблицы.

В Apps Script:
- Deploy → New deployment
- Type: Web app
- Execute as: Me
- Who has access: Anyone
- Deploy

Скопируйте URL веб-приложения.

## 3. Подключение сайта

В `app.js` замените:

`PASTE_GOOGLE_APPS_SCRIPT_URL_HERE`

на URL Apps Script.

## 4. GitHub Pages

Загрузите `index.html`, `style.css`, `app.js` и папку `assets` в репозиторий GitHub.

Settings → Pages → Deploy from branch → main / root.

## 5. Персональные ссылки

Можно использовать:

`https://ваш-сайт/?guest=ivan`

Значение `guest` попадёт в колонку `Guest ID`.
