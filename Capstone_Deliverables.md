# Digital Life Organizer

## Project Information
- Team Members: Avinash Suhagiya, Vraj Patel, Aum Patel, Rishikesh Patel
- Team Number: Group 2
- Course Code: PROG2480
- Mentor Name: Davnnet Chavala
- Client Name: N/A
- Due Date: April 14, 2026

---

## Contents
1. User Test Plans and Results
2. Deployment Guide
3. User Technical Manual
4. Working Code Demonstration

---

## User Test Plans and Results

### Test Plan Overview
Testing was completed at two levels:
- Automated smoke and route validation tests (Jest)
- Manual end-user flow verification (UI and API behavior checks)

### Test Environment
- Frontend: Static HTML/CSS/JavaScript, served from port 5173
- Backend: Node.js + Express API, served from port 5000
- Database: MySQL
- Test framework: Jest (backend and frontend)
- Browser: Chrome / Edge

### Automated Test Execution Summary
- Backend command: npm test -- --runInBand
- Frontend command: npm test -- --runInBand

### Automated Test Results
- Test Suites: 3 passed, 3 total
- Tests: 10 passed, 10 total
- Failed: 0
- Blocked: 0

### User Acceptance Test Cases and Outcomes

| Test ID | Feature | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| UAT-01 | User Registration | Submit valid form in Register page | Account is created | Account created successfully | Passed |
| UAT-02 | User Login | Login with valid credentials | User redirected by role | Login and redirect worked | Passed |
| UAT-03 | Dashboard Access | Open user dashboard after login | Dashboard data loads | Dashboard loaded successfully | Passed |
| UAT-04 | Task Create/Edit | Create task, then edit task | Data saved and displayed | Task saved and edited successfully | Passed |
| UAT-05 | Task Authorization | Access tasks without token | Request is denied | API returned 401 as expected | Passed |
| UAT-06 | Deadline Validation | Submit deadline missing due_date | Request is rejected | API returned 400 as expected | Passed |
| UAT-07 | Announcement Authorization | Newcomer attempts create announcement | Access denied | API returned 403 as expected | Passed |
| UAT-08 | Admin Announcement Create | Admin creates announcement | Announcement created | API returned 201 created | Passed |
| UAT-09 | Frontend File Integrity | Verify required pages/scripts exist | Files are present | All required files found | Passed |
| UAT-10 | API Health | Check root and db-test routes | API and DB respond correctly | API root/db-test reachable | Passed |

### Screenshot Evidence Checklist
Insert screenshots with these captions in your report:

- Figure 1: Backend Jest results (2 suites passed, 8 tests passed)
- Figure 2: Frontend Jest results (1 suite passed, 2 tests passed)
- Figure 3: Login page (before authentication)
- Figure 4: Newcomer dashboard (after login)
- Figure 5: Tasks page showing created task
- Figure 6: Deadlines page with at least one entry
- Figure 7: Announcements page list view
- Figure 8: Admin page (admin user logged in)
- Figure 9: API health route response (/)
- Figure 10: Database test route response (/db-test)

### Evidence File Naming Recommendation
- screenshot-01-backend-tests.png
- screenshot-02-frontend-tests.png
- screenshot-03-login-page.png
- screenshot-04-dashboard.png
- screenshot-05-tasks.png
- screenshot-06-deadlines.png
- screenshot-07-announcements.png
- screenshot-08-admin.png
- screenshot-09-api-root.png
- screenshot-10-db-test.png

---

## Deployment Guide

### About Digital Life Organizer
Digital Life Organizer is a student productivity platform that combines tasks, deadlines, schedules, announcements, and role-based features in a single web application. It is designed to help users organize day-to-day priorities quickly and track progress with minimal friction.

### Quick Start
1. Install Node.js (LTS) and MySQL.
2. Open two terminals.
3. In backend folder:
   - npm install
   - configure .env values (JWT_SECRET and MySQL settings)
   - npm run dev
4. In frontend folder:
   - npm install
   - npm run dev
5. Open: http://127.0.0.1:5173/index.html

### Deployment Instructions

#### How to Create the Database
1. Create a MySQL database (example: digital_life_organizer).
2. Create a DB user with required access.
3. Set backend environment variables:
   - MYSQL_URL
   - or DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
4. Start backend once to initialize schema from backend/src/config/schema.mysql.sql.
5. Verify via /db-test.

#### How to Install and Configure the Application

##### Backend Deployment
1. Copy backend folder to server.
2. Run npm install --omit=dev.
3. Configure PORT, JWT_SECRET, DB values, FRONTEND_URL.
4. Start API: npm start.

##### IIS Frontend Deployment
1. Copy frontend files to IIS site folder.
2. Create/configure IIS website and bindings.
3. Ensure static content is enabled.
4. Set frontend API URL and backend CORS origin as needed.

#### How to Access the Application
- Frontend: http://<server-or-domain>/index.html
- API root: http://<api-host>:<port>/
- DB test: http://<api-host>:<port>/db-test

### Mentor Waiver
The undersigned permit Conestoga College Information Technology faculty to use the finished application and other deliverables for classroom demonstrations and the marketing of Conestoga College Information Technology programs. Conestoga College Information Technology faculty agree to use the source code only for marking purposes, and not to disclose or distribute the source code to any third party.

Signature: _______________________________
Date: _______________________________

---

## User Technical Manual

### 1. System Requirements
- Modern web browser
- Access to deployed frontend and backend
- Valid credentials

### 2. Accessing the Application
1. Navigate to the app URL.
2. Register new account or login with existing account.
3. Use role-based dashboard after authentication.

### 3. Core Features
- Authentication (register/login/logout)
- Task management
- Deadline management
- Announcements
- Study/work schedule pages
- Profile updates
- Admin controls

### 4. Troubleshooting
- Login issue: verify credentials and API availability.
- Missing data: check API base URL and backend logs.
- Authorization errors: verify token exists and is valid.
- Deployment issue: verify IIS static files and CORS settings.

### 5. Security Practices
- Keep JWT secret private.
- Use HTTPS in production.
- Use least-privilege DB credentials.

---

## Working Code Demonstration
- Video Link: TBA

Suggested video flow:
1. Start backend and frontend
2. Show login and role redirect
3. Show task/deadline operations
4. Show announcements and admin flow
5. Show test execution outputs
