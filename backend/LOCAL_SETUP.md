# Local + Railway MySQL Setup

This backend now uses MySQL (local or Railway).

## Prerequisites
- Node.js installed
- MySQL database (local MySQL or Railway MySQL service)

## 1) Install backend dependencies
From the backend folder:

npm install

## 2) Configure environment
Create a `.env` file in `backend/` using `.env.example`.

Required:
- `JWT_SECRET`
- `MYSQL_URL` (recommended for Railway)

If you do not use `MYSQL_URL`, set:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## 3) Start backend API
npm run dev

On first successful DB connection, backend auto-creates tables and seed users from:

`src/config/schema.mysql.sql`

## 4) Start frontend
From the frontend folder:

npm run dev

## 5) Open app
http://127.0.0.1:5173/index.html

## Seed users
- Admin
  - Email: admin@local.test
  - Password: admin123
- Newcomer
  - Email: user@local.test
  - Password: user123

## Railway notes
- Add a MySQL service in Railway.
- Copy Railway `MYSQL_URL` into backend environment variables.
- Deploy backend service; schema is initialized automatically on first start.
