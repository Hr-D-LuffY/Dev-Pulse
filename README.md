# Dev-Pulse

A RESTful issue tracking API for development teams. Contributors can report bugs and feature requests, while maintainers can manage the full issue lifecycle — built with Node.js, TypeScript, Express, and PostgreSQL.

**Live URL:**[https://dev-pulse-two-tau.vercel.app/](https://dev-pulse-two-tau.vercel.app/)
**Repository:** [https://github.com/Hr-D-LuffY/Dev-Pulse](https://github.com/Hr-D-LuffY/Dev-Pulse)

---

## Features

- **JWT Authentication** — Secure login with signed tokens; raw token passed via `Authorization` header
- **Role-based access control** — Two roles: `contributor` and `maintainer`, each with distinct permissions
- **Issue management** — Create, read, update, and delete bug reports and feature requests
- **Flexible filtering** — Filter issues by `type` and `status`; sort by newest or oldest
- **Partial updates** — PATCH endpoint updates only the fields provided, leaving others unchanged
- **Auto-initializing database** — Tables and enum types created on server start if they don't exist

---

## Tech Stack

| Technology     | Purpose                              |
| -------------- | ------------------------------------ |
| Node.js 24.x   | LTS runtime                          |
| TypeScript 6.x | Strictly typed codebase              |
| Express 5.x    | Modular router architecture          |
| PostgreSQL      | Relational database                  |
| `pg`           | Native PostgreSQL driver, raw SQL    |
| `bcrypt`       | Password hashing (salt rounds: 12)   |
| `jsonwebtoken` | JWT generation and verification      |
| `dotenv`       | Environment variable management      |
| `tsup`         | TypeScript bundler for production    |

---

## Project Structure

```
src/
├── config/           # Environment config
├── db/               # Database pool and schema initialization
├── middleware/        # Authentication and authorization middleware
├── modules/
│   ├── auth/         # Signup and login (controller, service, interface)
│   └── issues/       # Issue CRUD (controller, service, interface)
├── types/            # Shared TypeScript types and enums
├── utility/          # Reusable helpers (sendResponse, etc.)
└── server.ts         # App entry point
```

---

## Getting Started

### Prerequisites

- Node.js 24.x or higher
- PostgreSQL running locally or a connection string from a cloud provider (e.g. Neon, Supabase)

### 1. Clone the repository

```bash
git clone https://github.com/Hr-D-LuffY/Dev-Pulse.git
cd Dev-Pulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/devpulse
JWT_SECRET=your_super_secret_key
```

### 4. Run in development mode

```bash
npm run dev
```

The server starts on `http://localhost:5000`. The database tables and enum types are created automatically on first run.

### 5. Build for production

```bash
npm run build
npm start
```

---

## API Endpoints

Base URL: `http://localhost:5000/api`


### Authentication

| Method | Endpoint          | Access | Description                  |
| ------ | ----------------- | ------ | ---------------------------- |
| POST   | `/auth/signup`    | Public | Register a new user account  |
| POST   | `/auth/login`     | Public | Login and receive a JWT token |



---

### Issues

| Method | Endpoint        | Access                              | Description                         |
| ------ | --------------- | ----------------------------------- | ----------------------------------- |
| POST   | `/issues`       | Authenticated (contributor, maintainer) | Create a new issue              |
| GET    | `/issues`       | Public                              | Get all issues (with filters)       |
| GET    | `/issues/:id`   | Public                              | Get a single issue by ID            |
| PATCH  | `/issues/:id`   | Authenticated (contributor*, maintainer) | Update an issue                |
| DELETE | `/issues/:id`   | Maintainer only                     | Permanently delete an issue         |

*Contributors can only update their own issues while status is `open`.

#### GET `/issues` — Query Parameters

| Param    | Values                          | Default  |
| -------- | ------------------------------- | -------- |
| `sort`   | `newest`, `oldest`              | `newest` |
| `type`   | `bug`, `feature_request`        | none     |
| `status` | `open`, `in_progress`, `resolved` | none   |

Example: `GET /api/issues?sort=oldest&type=bug&status=open`


---

## Database Schema

### `users` table

| Column       | Type          | Constraints                              |
| ------------ | ------------- | ---------------------------------------- |
| `id`         | SERIAL        | PRIMARY KEY                              |
| `name`       | VARCHAR(50)   | NOT NULL                                 |
| `email`      | VARCHAR(150)  | UNIQUE, NOT NULL                         |
| `password`   | TEXT          | NOT NULL (bcrypt hashed, never returned) |
| `role`       | roles_type    | DEFAULT `contributor`                    |
| `created_at` | TIMESTAMP     | DEFAULT NOW()                            |
| `updated_at` | TIMESTAMP     | DEFAULT NOW()                            |

### `issues` table

| Column        | Type          | Constraints                           |
| ------------- | ------------- | ------------------------------------- |
| `id`          | SERIAL        | PRIMARY KEY                           |
| `title`       | VARCHAR(150)  | NOT NULL                              |
| `description` | TEXT          | NOT NULL, min length 20 (CHECK)       |
| `type`        | issue_type    | NOT NULL                              |
| `status`      | issue_status  | NOT NULL, DEFAULT `open`              |
| `reporter_id` | INTEGER       | NOT NULL (references users.id)        |
| `created_at`  | TIMESTAMP     | DEFAULT NOW()                         |
| `updated_at`  | TIMESTAMP     | DEFAULT NOW()                         |

### PostgreSQL Enum Types

```sql
roles_type   → 'contributor' | 'maintainer'
issue_type   → 'bug' | 'feature_request'
issue_status → 'open' | 'in_progress' | 'resolved'
```

---

## Role Permissions Summary

| Action                        | Contributor         | Maintainer |
| ----------------------------- | ------------------- | ---------- |
| Register / Login              | ✅                  | ✅         |
| Create issue                  | ✅                  | ✅         |
| View all issues               | ✅                  | ✅         |
| Update own issue (status: open) | ✅                | ✅         |
| Update any issue              | ❌                  | ✅         |
| Delete any issue              | ❌                  | ✅         |

---
