---
cursor:
  subagentId: "bc-f202edc1-2397-5178-b13c-169bb539cee4"
---

# Жизненный цикл заказа Fluvion

Сейчас заказ — строка `status` (`PENDING`, `VERIFIED`, `PAID`, `PROCESSED`, `RECEIVED`, `REFUSED`, `COMPLETED`). Оплата одна: bePaid после `VERIFIED`, сумма в юанях. Веса и второй оплаты нет. Ниже — целевая машина и что меняется.

## Машина состояний

```
CREATED
  ├─ approve (админ) → APPROVED
  │     └─ pay PURCHASE (клиент) → AWAITING_PURCHASE_PAYMENT
  │           └─ callback bePaid или confirm (админ) → PURCHASE_PAID
  │                 └─ arrived (админ) → AT_CHINA_WAREHOUSE
  │                       └─ weight (админ) → AWAITING_WEIGHT_PAYMENT
  │                             └─ pay WEIGHT → подтверждение → WEIGHT_PAID
  │                                   └─ transit (админ) → IN_TRANSIT_TO_MINSK
  │                                         └─ ready (админ) → READY_FOR_PICKUP
  │                                               └─ complete (админ) → COMPLETED
  └─ reject (админ) → REJECTED
CANCELLED — из CREATED, APPROVED, AWAITING_PURCHASE_PAYMENT (клиент или админ)
```

Нелегальный переход — HTTP 400 и русское сообщение. `REJECTED`, `COMPLETED`, `CANCELLED` конечные.

Семь шагов на экране клиента: заказ, решение админа, оплата выкупа, ожидание склада в Китае, оплата по весу, дорога в Минск, получение в Европочте.

## Кто двигает переход

| Переход | Кто |
| --- | --- |
| создание → `CREATED` | клиент, `POST /api/orders` |
| → `APPROVED` / `REJECTED` | админ |
| → `AWAITING_PURCHASE_PAYMENT` | клиент выбирает способ |
| → `PURCHASE_PAID` | вебхук bePaid или админ (ручной способ) |
| → `AT_CHINA_WAREHOUSE` | админ |
| → `AWAITING_WEIGHT_PAYMENT` | админ вводит вес, система считает сумму |
| → `WEIGHT_PAID` | вебхук bePaid или админ |
| → `IN_TRANSIT_TO_MINSK` → `READY_FOR_PICKUP` → `COMPLETED` | админ |
| → `CANCELLED` | клиент до оплаты выкупа, либо админ |

Каждый переход пишет `order_event` и уведомление `ORDER_UPDATE`, если у заказа есть пользователь.

## Две оплаты

Запись `order_payment`: заказ, `purpose` (`PURCHASE` | `WEIGHT`), `method` (`BEPAID` | `MANUAL`), сумма, валюта, статус (`PENDING` | `PAID` | `FAILED`).

- Выкуп: сумма = `totalClientPrice` заказа, валюта CNY. Считается при оформлении, как сейчас.
- Вес: только после склада в Китае. `вес_кг × тариф_USD_за_кг` (уже есть `ExchangeRateService`, запасное значение 6) `+ сбор_по_Минску_USD`. Сбор лежит в `app_setting.intra_minsk_fee_usd`, по умолчанию 3, админ меняет. На заказе фиксируются вес, тариф, сбор и итог.

`BEPAID` остаётся текущим `POST /api/payment/create` и вебхуком. `MANUAL` создаёт платёж `PENDING`; заказ не двигается, пока админ не подтвердит.

## API

Клиент:

- `POST /api/orders` — статус `CREATED` вместо `PENDING`.
- `GET /api/orders/{id}/timeline` — шаги, текущий, события, платежи, цитата веса.
- `POST /api/orders/{id}/pay` — тело `{ purpose, method }`.
- `POST /api/orders/{id}/cancel`.

Админ (`/api/admin/orders/{id}/…`):

- `approve`, `reject`, `arrived-china`, `weight`, `in-transit`, `ready`, `complete`, `cancel`.
- `POST …/payments/{paymentId}/confirm` — ручное подтверждение.
- `GET/PUT /api/admin/settings/intra-minsk-fee`.

bePaid: создавать платёж можно из `APPROVED` и обоих `AWAITING_*`. Успешный вебхук вызывает ту же службу, что и ручное подтверждение, и не откатывает заказ назад.

## Миграция

Колонка `legacy_status` хранит старое значение. При старте:

| Было | Стало |
| --- | --- |
| `PENDING`, пусто | `CREATED` |
| `VERIFIED` | `AWAITING_PURCHASE_PAYMENT` |
| `PAID` | `PURCHASE_PAID` |
| `PROCESSED` | `AT_CHINA_WAREHOUSE` (если вес уже есть — `AWAITING_WEIGHT_PAYMENT`) |
| `SHIPPED`, `IN_TRANSIT` | `IN_TRANSIT_TO_MINSK` |
| `RECEIVED` | `READY_FOR_PICKUP` |
| `COMPLETED`, `DELIVERED` | `COMPLETED` |
| `REFUSED` | `REJECTED` |
| `CANCELLED`, `REFUNDED` | `CANCELLED` |

SQLite по умолчанию и MySQL через `SPRING_DATASOURCE_*` не меняются. Новые таблицы создаёт `ddl-auto: update`.

## Экраны

- `/order-details/:orderId` — лента из семи шагов в стекле `cargo/`, текущий шаг выделен, выбор способа оплаты.
- Профиль, список отправлений — русская подпись этапа.
- `/admin/crm/orders` — доска с действиями перехода и подтверждением ручной оплаты.
- Уведомления — уже есть `NotificationService`, тексты по-русски.

## Перед релизом

- JUnit на каждый переход и обе оплаты, в том числе запрещённый переход.
- `mvn -B test`, `npm run lint`, `npm run build`.
- Секреты почты, JWT, bePaid, Европочты и пароли БД уходят из `application.yml` и `docker-compose*.yml` в переменные окружения. В репозитории только `.env.example` с именами.
- README: как поднять API и витрину.
- Сквозной прогон в браузере: заказ → одобрение → ручная оплата выкупа → вес → оплата веса → транзит → готов к выдаче → завершён. Снимки ленты и доски в `media/fluvion-order-flow/`.
