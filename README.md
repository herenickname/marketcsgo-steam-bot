# marketcsgo-steam-bot

Бот написан на коленке за 2 часа, но работает :)

Алгоритм бота:
1. Получаем по ссылке `https://market.csgo.com/api/v2/prices/RUB.json` список текущих маркет-цен на CSGO-вещи
2. Просим `market.csgo.com` подгрузить весь Stean-инвентарь нашего бота
3. Выставляем на `market.csgo.com` все вещи из инвентаря Steam по ценам, полученным из пункта 1
4. Авторизовываемся в Steam
5. Переодически получаем у `market.csgo.com` данные для создания трейдов по проданным предметам
6. Отправляем проданные вещи через трейды в Steam
7. Подтверждаем трейды через мобильный аутентификатор Steam
8. Оповещаем market.csgo.com что мы живы (метод /ping)

Запускать через `export $(cat .env) && ts-node src/index`

Также доступен ввод параметров для авторизации прямо в боте

В планах сделать docker-образ

# .env

```
MARKET_API_KEY=ваш_api_ключ_от_market.csgo.com
STEAM_LOGIN=логин_в_стиме
STEAM_PASSWORD=пароль_в_стиме
STEAM_SHAREDSECRET=много_букв
STEAM_IDENTITYSECRET=много_букв
```

# example

```
# ts-node src/index
   ┌───────────────────────────────┐
   │                               │
   │   SteamBot by @herenickname   │
   │                               │
   └───────────────────────────────┘


Введите данные бота ниже (esc - выход)...

✔ Логин в Steam … 11231
✔ Пароль от аккаунта … ******
✔ Shared Secret из 2FA … 1231231231123123123123123123
✔ Identity Secret из 2FA … 1231231231231231231231212333
✔ CSGO.TM API Key … 123123123123123123123123123123123

Запросили обновление Steam-инвентаря на маркете
Five-SeveN | Violent Daimyo (Minimal Wear) теперь продается за 10.08 RUB
UMP-45 | Moonrise (Field-Tested) теперь продается за 14.96 RUB
P250 | Ripple (Field-Tested) теперь продается за 5.97 RUB
Запросили обновление Steam-инвентаря на маркете

(дальше идут JSON-логи из бота, главный скрипт подписан на уведомления класса)
```
