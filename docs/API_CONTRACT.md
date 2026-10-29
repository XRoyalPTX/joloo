# 📋 Joloo API Contract & Frontend Architecture

Документ согласования контрактов между **Backend (Python / FastAPI)** и **Frontend (React / TypeScript)**.

---

## 🧭 Архитектура интерфейса (Сценарии и Страницы)

Вместо кучи разрозненных страниц по каждому эндпоинту, интерфейс сгруппирован по **пользовательским сценариям (User Journeys)**:

1. **Главная / Поиск поездок (`/`)**:
   - Фильтры: "Откуда" (выпадающий список / селект локаций) и "Куда".
   - Список карточек доступных поездок:
     - Маршрут: `from_location.name` → `to_location.name`
     - Дата и время отправления
     - Имя водителя (`driver.name` `driver.surname`)
     - Доступно мест (`seats`)
     - Стоимость (`price` ₽)
     - Кнопка **"Забронировать"** (создание `TripRequest`).
2. **Создать поездку (`/trips/new`)**:
   - Доступно только авторизованному пользователю (водителю).
   - Выбор локаций отправления и прибытия (из `/locations/`).
   - Дата/время, количество мест, цена за место, комментарий.
   - Отправка `POST /trips/`.
3. **Мои поездки и заявки (`/my-trips`)**:
   - Вкладка **"Я водитель"**: поездки текущего пользователя и заявки пассажиров к ним (с кнопками **Подтвердить** / **Отклонить** через `PATCH /trips/requests/{id}/status`).
   - Вкладка **"Я пассажир"**: мои заявки со статусами (`pending`, `accepted`, `rejected`, `cancelled`) и кнопкой **Отменить** (`PATCH /trips/requests/{id}/cancel`).
4. **Авторизация и Регистрация (`/auth`)**:
   - Вход по номеру телефона и паролю (`POST /users/login`).
   - Регистрация с проверками форматов (`POST /users/register`).
5. **Профиль (`/profile`)**:
   - Данные текущего пользователя (`GET /users/me`).
   - Кнопка выхода (Logout).
6. **Администрирование локаций (`/admin/locations`)**:
   - Просмотр списка локаций (`GET /locations/`).
   - Добавление новой точки (Бурятия: Улан-Удэ, Горячинск, Кяхта, Курумкан...) через `POST /locations/`.

---

## 🤝 Согласование эндпоинтов (API Contract)

### 1. Авторизация (`/users`)

#### `POST /users/login`
- **Фронт передает**: `application/x-www-form-urlencoded`
  - `username`: строка (номер телефона пользователя, например `79991234567`)
  - `password`: строка
- **Бэкенд возвращает** `200 OK`:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer"
  }
  ```
- **Ошибки**: `401 Unauthorized` `{ "detail": "Неверный логин или пароль" }`

#### `POST /users/register`
- **Фронт передает**: `application/json`
  ```json
  {
    "name": "Баир",
    "surname": "Доржиев",
    "patronymic": "Батоевич",
    "birth_date": "1995-06-15",
    "password": "Password123!",
    "email": "bair@example.com",
    "phone_number": "79991234567"
  }
  ```
- **Бэкенд возвращает** `200 OK` (`UserResponse`):
  ```json
  {
    "id": 1,
    "name": "Баир",
    "surname": "Доржиев",
    "patronymic": "Батоевич",
    "birth_date": "1995-06-15",
    "email": "bair@example.com",
    "phone_number": "79991234567",
    "is_active": false
  }
  ```

#### `GET /users/me`
- **Заголовок**: `Authorization: Bearer <access_token>`
- **Возвращает**: `200 OK` с объектом текущего пользователя (`UserResponse`).

---

### 2. Локации (`/locations`)

#### `GET /locations/`
- **Возвращает** `200 OK`:
  ```json
  [
    {
      "id": 1,
      "country": "Россия",
      "region": "Республика Бурятия",
      "district": "Прибайкальский район",
      "name": "Горячинск"
    },
    {
      "id": 2,
      "country": "Россия",
      "region": "Республика Бурятия",
      "district": "Городской округ",
      "name": "Улан-Удэ"
    }
  ]
  ```

#### `POST /locations/`
- **Заголовок**: `Authorization: Bearer <access_token>` (требуется `is_staff=True`)
- **Тело**:
  ```json
  {
    "country": "Россия",
    "region": "Республика Бурятия",
    "district": "Иволгинский район",
    "name": "Иволгинск"
  }
  ```

---

### 3. Поездки (`/trips`)

#### `GET /trips/`
- **Query параметры**:
  - `from_location_id` (необязательно): `int`
  - `to_location_id` (необязательно): `int`
- **Возвращает**: `200 OK` (`TripResponse[]`)
  ```json
  [
    {
      "id": 10,
      "driver_id": 2,
      "from_location_id": 2,
      "to_location_id": 1,
      "price": 600,
      "seats": 3,
      "departure_date": "2026-06-01T09:00:00Z",
      "arrival_date": "2026-06-01T12:00:00Z",
      "comment": "Выезжаю от ЖД вокзала, багажник свободный",
      "driver": {
        "id": 2,
        "name": "Алексей",
        "surname": "Цыденов"
      },
      "from_location": {
        "id": 2,
        "country": "Россия",
        "region": "Республика Бурятия",
        "district": null,
        "name": "Улан-Удэ"
      },
      "to_location": {
        "id": 1,
        "country": "Россия",
        "region": "Республика Бурятия",
        "district": null,
        "name": "Горячинск"
      }
    }
  ]
  ```

#### `POST /trips/`
- **Заголовок**: `Authorization: Bearer <access_token>`
- **Тело** (`TripCreate`):
  ```json
  {
    "from_location_id": 2,
    "to_location_id": 1,
    "price": 600,
    "seats": 3,
    "departure_date": "2026-06-01T09:00:00Z",
    "arrival_date": "2026-06-01T12:00:00Z",
    "comment": "Выезжаю от ЖД вокзала"
  }
  ```

---

### 4. Заявки на поездку (`/trips/requests`)

#### `POST /trips/requests`
- **Заголовок**: `Authorization: Bearer <access_token>`
- **Тело** (`TripRequestCreate`):
  ```json
  {
    "trip_id": 10,
    "seats_requested": 1
  }
  ```
- **Возвращает** `200 OK` со статусом `"pending"`.

#### `PATCH /trips/requests/{trip_request_id}/status?answer=true|false`
- Водитель подтверждает (`true`) или отклоняет (`false`).
- **Заголовок**: `Authorization: Bearer <access_token>`.

#### `PATCH /trips/requests/{trip_request_id}/cancel`
- Пассажир отменяет свою заявку.
- **Заголовок**: `Authorization: Bearer <access_token>`.

---

## 📌 Предложения фронтендера бэкендеру на будущее (Tech Debt / Improvements):
1. **Эндпоинт "Мои поездки и заявки"**:
   - Сейчас в API нет выделенных `GET /trips/my` и `GET /trips/requests/my`. Чтобы отобразить пользователю, куда он записался или какие заявки пришли к его поездкам, бэкенду будет очень полезно добавить эти два эндпоинта!
2. **CORS Middleware**:
   - На бэкенде в `app/main.py` потребуется включить `CORSMiddleware`, чтобы фронтенд-сервер на Vite (`http://localhost:5173`) мог без препятствий слать запросы на `http://localhost:8000`.
