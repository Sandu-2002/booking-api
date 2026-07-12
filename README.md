# Booking Platform REST API

A NestJS + TypeScript backend for the EN2H "Software Engineer Intern (NestJS)" technical
assignment. Lets authenticated staff manage **services**, and lets customers create
**bookings** for those services without needing an account.

## Project Overview

- **Framework:** NestJS 10 + TypeScript
- **Database:** PostgreSQL (preferred) or SQLite — switchable via `.env`
- **ORM:** TypeORM with versioned migrations (no `synchronize: true` in any environment)
- **Auth:** JWT (register/login, bcrypt password hashing)
- **Docs:** Swagger UI + Postman collection
- **Extras:** global exception filter, DTO validation, pagination/search/filter on
  bookings, duplicate-booking prevention, Docker support, unit tests

### Modules

\`\`\`
src/
  auth/        Register, Login, JWT strategy & guard
  services/    Service CRUD (protected)
  bookings/    Booking CRUD + status lifecycle (public create)
  common/      Global exception filter
  config/      TypeORM data source (used by CLI + app)
  migrations/  Versioned SQL schema migrations
\`\`\`

### Business Rules Implemented

- A booking must reference an existing service (404 if not found).
- \`bookingDate\` cannot be in the past (custom \`class-validator\` rule).
- A \`CANCELLED\` booking cannot be transitioned to \`COMPLETED\`.
- Only authenticated users (valid JWT) can create/update/delete services.
- Anyone can create a booking — no auth required.
- Duplicate bookings for the same \`serviceId\` + \`bookingDate\` + \`bookingTime\` are
  rejected with \`409 Conflict\` (bonus), unless the existing one was cancelled.

---

## 1. Installation Steps

**Prerequisites:** Node.js ≥ 18, npm, and either PostgreSQL or nothing (SQLite needs no
server).

\`\`\`bash
git clone <your-repo-url>
cd booking-platform
npm install
cp .env.example .env
\`\`\`

## 2. Environment Variables

Edit \`.env\` (see \`.env.example\` for the full list):

| Variable | Description | Default |
|---|---|---|
| \`PORT\` | HTTP port | \`3000\` |
| \`DB_TYPE\` | \`postgres\` or \`sqlite\` | \`postgres\` |
| \`DB_HOST\` / \`DB_PORT\` / \`DB_USERNAME\` / \`DB_PASSWORD\` / \`DB_DATABASE\` | Postgres connection | — |
| \`DB_SQLITE_PATH\` | SQLite file path (if \`DB_TYPE=sqlite\`) | \`db/booking-platform.sqlite\` |
| \`JWT_SECRET\` | Secret used to sign JWTs | — (set a long random value) |
| \`JWT_EXPIRES_IN\` | Token lifetime | \`1d\` |

## 3. Database Setup

### Option A — PostgreSQL (preferred)

\`\`\`bash
createdb booking_platform
\`\`\`

Or use Docker for just the database:

\`\`\`bash
docker run --name booking-postgres -e POSTGRES_PASSWORD=postgres \\
  -e POSTGRES_DB=booking_platform -p 5432:5432 -d postgres:16-alpine
\`\`\`

### Option B — SQLite (zero setup)

Set \`DB_TYPE=sqlite\` in \`.env\`. Make sure the \`db/\` folder exists: \`mkdir -p db\`.

## 4. Running Migrations

\`\`\`bash
npm run migration:run
\`\`\`

To roll back the last migration:

\`\`\`bash
npm run migration:revert
\`\`\`

## 5. Running the Application

\`\`\`bash
npm run start:dev
npm run build && npm run start:prod
\`\`\`

The API is served under the \`/api\` prefix: \`http://localhost:3000/api\`

## 6. API Documentation

- **Swagger UI:** \`http://localhost:3000/api/docs\`
- **Postman:** import \`postman_collection.json\` from the project root.

### Endpoint Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | \`/api/auth/register\` | — | Register a new user |
| POST | \`/api/auth/login\` | — | Login, returns JWT |
| POST | \`/api/services\` | Required | Create service |
| GET | \`/api/services\` | — | List all services |
| GET | \`/api/services/:id\` | — | Get one service |
| PATCH | \`/api/services/:id\` | Required | Update service |
| DELETE | \`/api/services/:id\` | Required | Delete service |
| POST | \`/api/bookings\` | — (public) | Create booking |
| GET | \`/api/bookings\` | — | List bookings (\`?status=&search=&page=&limit=\`) |
| GET | \`/api/bookings/:id\` | — | Get one booking |
| PATCH | \`/api/bookings/:id/status\` | — | Update booking status |
| PATCH | \`/api/bookings/:id/cancel\` | — | Cancel booking |

## 7. Docker

\`\`\`bash
docker compose up --build
\`\`\`

## 8. Testing

\`\`\`bash
npm run test
npm run test:cov
\`\`\`

---

## Assumptions Made

- "Update Booking Status" and "Cancel Booking" are exposed as two distinct endpoints
  since the assignment lists them separately, even though cancel is really a status
  transition.
- Added a \`COMPLETED\` status alongside the three specified (\`PENDING\`, \`CONFIRMED\`,
  \`CANCELLED\`) so the "cancelled bookings cannot be marked as completed" business rule
  is actually testable/enforceable.
- Booking read endpoints are left public, since the spec only explicitly restricts
  *service management* to authenticated users.
- Both PostgreSQL and SQLite are supported behind the same TypeORM config.

## Future Improvements

- Refresh token rotation and logout/blacklisting.
- Role-based access control.
- Rate limiting on the public booking-creation endpoint.
- Soft deletes for services with existing bookings.
- E2E tests with a dedicated test database/container.