# Облако ![](public/favicon.ico)
![](public/screen2.gif)

Файлы хранятся на сервере БЕЗ ШИФРОВАНИЯ
(это нужно для своих целей)

У каждого пользователя свое хранилище.
Доступ по токену, без токена сервер не знает полный путь

Можно создавать папки, скачивать папки целиком архивом

Можно создавать открытые папки или давать сторонний доступ к отдельным файлам по уникальным ссылкам

Мультизагрузка, загрузка перетаскиванием, загрузка копированием/вставкой, загрузка скриншотов
загрузка на сервер по ссылке

рекурсивный поиск по вложенным файлам и папкам

Развернуто на next.ts, данные о пользователях и ключи в монге

для загрузки используется Axios так как поддерживает отслеживание процесса загрузки (% выполнения)
Дизайн - mui
БД - mongo, redis (для ускорения проверки токена)

https://cloud.spamigor.ru

## документация по API (swagger)

https://cloud.spamigor.ru/swagger

## lines
https://cloud.spamigor.ru/lines

Простенькая анимация на canvas. Главная особенность - синхронизация 2 вкладок через localStorage
шарик вылетает из основной вкладки, влетает во вторую вкладку. При изменении позиции вкладки, направление динамически меняется

## three
https://cloud.spamigor.ru/three

# 3d модельки
[первая](https://cloud.spamigor.ru/demo4)
[вторая](https://cloud.spamigor.ru/demo5)

# авторешалка судоку
https://cloud.spamigor.ru/demo6
![](public/sudocu.gif)

Точки в 3D на three.js

## Есть Android-приложение облака, написанно на React-Native, собрано в android studio
Git: https://github.com/pyshnenko/cloud_react_native
билд: [Актуальная версия](https://github.com/pyshnenko/cloud_react_native/raw/refs/heads/main/files/cloud_app.apk)