# 📚 BookFlow API

BookFlow is a **resource booking and scheduling REST API** built for managing bookable resources such as meeting rooms, desks, and equipment.

The project focuses on **relational database design, resource availability, booking management, role-based access control, transactional booking, and concurrency-safe double-booking prevention**.

### 🌐 Live API

`https://book-flow-reyh6l9vi-abuhasanxts-projects.vercel.app`

---

## ✨ Features

- 🔐 JWT-based authentication
- 🔄 Access & refresh token support
- 👤 User profile management
- 🛡️ Role-based access control (USER / ADMIN)
- 🏪 Amenity management
- 📂 Resource management
- 🔗 Resource–Amenity many-to-many relationship
- 🕐 Resource weekly open-hours management
- 🔎 Resource filtering and sorting
- 📄 Pagination
- 📅 Resource availability checking
- 📦 Booking management
- ❌ Booking cancellation
- 🔄 Booking rescheduling
- 🚫 Double-booking prevention
- 💳 Booking price calculation using `priceCentsPerHour`
- 🔒 Transaction-safe booking operations
- 🗄️ PostgreSQL relational database with Prisma ORM

---

# 🔐 Authentication

Protected endpoints require authentication using an access token.

### Authorization Header

```http
Authorization: Bearer <access_token>
```

### Roles

| Role    | Description                                         |
| ------- | --------------------------------------------------- |
| `USER`  | Can browse resources and manage own bookings        |
| `ADMIN` | Can manage resources, amenities, and resource hours |

---

# 📡 API Endpoints

## 🔐 Authentication

| Feature        |  Method  | Endpoint             | Access |
| -------------- | :------: | -------------------- | ------ |
| Register       |  `POST`  | `/auth/register`     | Public |
| Login          |  `POST`  | `/auth/login`        | Public |
| Get Me         |  `GET`   | `/auth/me`           | Auth   |
| Email Verify   |  `POST`  | `/auth/email-verify` | Auth   |
| Refresh Token  |  `POST`  | `/auth/refresh`      | Auth   |
| Logout         |  `POST`  | `/auth/logout`       | Auth   |
| Update Me      | `PATCH`  | `/auth/me`           | Auth   |
| Delete Account | `DELETE` | `/auth/me`           | Auth   |

---

## 🏪 Amenities

Amenities represent features available for resources, such as `projector`, `whiteboard`, or `wifi`.

Resources and amenities have a **many-to-many relationship**.

| Feature           |  Method  | Endpoint         | Access |
| ----------------- | :------: | ---------------- | ------ |
| Create Amenity    |  `POST`  | `/amenities`     | Admin  |
| Get All Amenities |  `GET`   | `/amenities`     | Public |
| Update Amenity    | `PATCH`  | `/amenities/:id` | Admin  |
| Delete Amenity    | `DELETE` | `/amenities/:id` | Admin  |

---

## 📂 Resources

Resources are bookable items such as meeting rooms, desks, or equipment.

| Feature          |  Method  | Endpoint                              | Access |
| ---------------- | :------: | ------------------------------------- | ------ |
| Create Resource  |  `POST` |`/resources`                          | Admin  |
| Get All Resources | `GET`   | `/resources`                          | Public |
| Get Resource by ID|  `GET`   | `/resources/:id`                      | Public |
| Get Availability  |  `GET`   | `/resources/:resourceId/availability` | Public |
| Update Resource   | `PATCH`  | `/resources/:id`                      | Admin  |
| Update Resource Hours |  `PUT`   | `/resources/:resourceId/hours`        | Admin  |
| Delete Resource       | `DELETE` | `/resources/:id`                      | Admin  |

### Create Resource

```http
POST /resources
```

Example request body:

```json
{
  "name": "Meeting Room A",
  "type": "ROOM",
  "description": "Large meeting room",
  "capacity": 10,
  "priceCentsPerHour": 1500,
  "amenityIds": ["amenity-id-1", "amenity-id-2"]
}
```

### Resource Types

```text
ROOM
DESK
EQUIPMENT
```

### Resource Listing

The resource listing endpoint supports:

- Filter by `type`
- Filter by `minCapacity`
- Filter by `amenity`
- Availability filtering using `availableFrom` and `availableTo`
- Sort by `priceCentsPerHour`
- Sort by `capacity`
- Pagination using `page` and `limit`

Example:

```http
GET /resources?type=ROOM&minCapacity=5&page=1&limit=10
```

---

## 🕐 Resource Hours

Resource hours define when a resource is available for booking.

```text
0 → Sunday
1 → Monday
2 → Tuesday
3 → Wednesday
4 → Thursday
5 → Friday
6 → Saturday
```

### Update Resource Hours

```http
PUT /resources/:resourceId/hours
```

Example:

```json
{
  "hours": [
    {
      "dayOfWeek": 1,
      "openTime": "09:00",
      "closeTime": "18:00"
    },
    {
      "dayOfWeek": 2,
      "openTime": "09:00",
      "closeTime": "18:00"
    }
  ]
}
```

---

# 📦 Bookings

Bookings allow authenticated users to reserve available resources.

| Feature           |  Method  | Endpoint                      | Access       |
| ----------------- | :------: | ----------------------------- | ------------ |
| Create Booking    |  `POST`  | `/bookings`                   | User         |
| Get Bookings      |  `GET`   | `/bookings`                   | User / Admin |
| Get Booking by ID |  `GET`   | `/bookings/:bookingId`        | User / Admin |
| Cancel Booking    |  `POST`  | `/bookings/:bookingId/cancel` | User / Admin |
| Update Booking    | `PATCH`  | `/bookings/:bookingId`        | User / Admin |
| Delete Booking    | `DELETE` | `/bookings/:bookingId`        | User / Admin |

### Get All Bookings

Regular authenticated users can retrieve their own bookings:

```http
GET /bookings
```

Admins can retrieve all bookings:

```http
GET /bookings?all=true
```

### Create Booking

```http
POST /bookings
```

Example:

```json
{
  "resourceId": "resource-id",
  "startTime": "2026-09-20T10:00:00.000Z",
  "endTime": "2026-09-20T12:00:00.000Z"
}
```

The booking flow validates resource availability and open hours before creating the booking.

---

# 🚫 Double-Booking Prevention

BookFlow is designed to prevent two users from booking the same resource for overlapping time periods.

The booking flow performs overlap validation inside a transaction so that concurrent booking attempts are handled safely.

For the same resource and time slot:

```text
Request A ────────┐
                  ├── Concurrent booking
Request B ────────┘

        ↓

Request A → 201 Created
Request B → 409 Conflict
```

This ensures that the same confirmed time slot cannot be successfully booked twice.

---

# 🗄️ Database

BookFlow uses:

- **PostgreSQL** — Relational database
- **Prisma ORM** — Database access and migrations

### Main Models

```text
User
Resource
Amenity
ResourceHours
Booking
```

### Relationships

```text
User
 │
 └──< Booking >── Resource
                    │
                    ├──< ResourceHours
                    │
                    └──< Amenity
```

Resource ↔ Amenity uses a **many-to-many relationship**.

---

# 🛡️ Authorization

Admin-only endpoints return `403 Forbidden` when accessed by a regular user.

Examples:

```text
POST   /amenities
PATCH  /amenities/:id
DELETE /amenities/:id

POST   /resources
PATCH  /resources/:id
DELETE /resources/:id

PUT    /resources/:resourceId/hours
```

Regular users can browse resources and manage their own bookings according to the booking rules.

---

# 🧪 Testing

The project includes testing for important booking and database scenarios, including:

- Authentication
- Authorization
- Resource validation
- Booking validation
- Out-of-hours booking
- Invalid time ranges
- Overlapping bookings
- Concurrent booking attempts
- Transaction rollback
- Migration and seed behavior

---

## 🚀 Tech Stack

| Technology | Purpose                  |
| ---------- | ------------------------ |
| Node.js    | Runtime                  |
| Express.js | REST API                 |
| TypeScript | Type safety              |
| PostgreSQL | Relational database      |
| Prisma     | ORM & migrations         |
| Zod        | Validation               |
| JWT        | Authentication           |
| Jest       | Testing                  |
| Supertest  | API testing              |
| Docker     | Database/container setup |

---

## 📌 Project Status

**BookFlow API — Phase 4**

The core authentication, authorization, resource management, availability, booking, cancellation, rescheduling, and concurrency handling features are implemented.
