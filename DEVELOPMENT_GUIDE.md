# LMS Platform — Development Guide

A full-stack Learning Management System built with React, Node.js/Express, and MongoDB. This guide covers everything you need to understand, run, and extend the codebase.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Environment Setup](#environment-setup)
4. [Running the App](#running-the-app)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Database Models](#database-models)
8. [API Reference](#api-reference)
9. [Authentication & Authorization](#authentication--authorization)
10. [File Uploads & Cloudinary](#file-uploads--cloudinary)
11. [Email System](#email-system)
12. [Background Jobs (Cron)](#background-jobs-cron)
13. [Backup System](#backup-system)
14. [Security](#security)
15. [State Management (Redux)](#state-management-redux)
16. [Common Development Tasks](#common-development-tasks)
17. [Deployment Notes](#deployment-notes)

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 19.0.0 |
| UI Library | Ant Design | 5.23.4 |
| Styling | Tailwind CSS + SCSS | 3.4.17 |
| Animations | Framer Motion | 12.4.2 |
| State | Redux Toolkit + Redux Persist | 2.6.1 |
| HTTP Client | Axios | 1.7.9 |
| Calendar | React Big Calendar | 1.20.0 |
| Backend | Node.js + Express | 4.21.2 |
| Database | MongoDB + Mongoose | 8.10.0 |
| Auth | JWT (jsonwebtoken) | 9.0.2 |
| Passwords | bcrypt | 5.1.1 |
| Email | Nodemailer | 6.10.0 |
| Images | Cloudinary | 2.5.1 |
| Uploads | Multer | 2.1.1 |
| Cron Jobs | node-cron | 3.0.3 |
| Backups | Google Drive API | 173.0.0 |
| Security | Helmet + express-rate-limit | 8.2.0 |

---

## Project Structure

```
LMS/
├── server.js                   # Express entry point (port 8071)
├── package.json                # Backend dependencies & scripts
├── .env                        # Secrets — never commit this
├── .gitignore
├── DEVELOPMENT_GUIDE.md        # This file
├── BACKUP_SETUP.md             # Google Drive backup setup guide
├── FIXES.md                    # Security and bug fix history
│
├── BACKEND/
│   ├── controllers/
│   │   ├── auth.js             # Register, login, password reset, profile
│   │   ├── courses.js          # Featured course CRUD
│   │   ├── classes.js          # Online class CRUD + cancellation
│   │   └── payments.js         # Payment submission, approval, rejection
│   │
│   ├── models/
│   │   ├── auth.js             # User schema (students, admins, teachers)
│   │   ├── courses.js          # Featured course schema
│   │   ├── classes.js          # Online class session schema
│   │   ├── payments.js         # Payment record schema
│   │   └── counter.js          # Atomic sequential ID counter
│   │
│   ├── routes/
│   │   ├── auth.js             # /api/auth/*
│   │   ├── courses.js          # /courses/*
│   │   ├── classes.js          # /classes/*
│   │   ├── payments.js         # /payments/*
│   │   └── upload.js           # /upload
│   │
│   ├── middleware/
│   │   └── auth.js             # JWT protect + role authorize
│   │
│   ├── utils/
│   │   ├── sendEmail.js        # Nodemailer wrapper
│   │   ├── cloudinary.js       # Cloudinary SDK config
│   │   ├── cronJobs.js         # Membership expiry checker (daily)
│   │   ├── paymentReminderJob.js # Payment reminder emails
│   │   ├── backupJob.js        # DB backup to Google Drive
│   │   ├── envBackup.js        # Encrypted .env backup on startup
│   │   ├── googleDrive.js      # Google Drive API client
│   │   └── emailTemplates/
│   │       └── resetPasswordTemplate.js
│   │
│   └── scripts/
│       └── getDriveToken.js    # One-time OAuth2 setup for Drive backups
│
└── frontend/
    ├── package.json            # Frontend dependencies (proxy → :8071)
    └── src/
        ├── index.js            # App entry, Redux Provider + PersistGate
        ├── App.js              # Router config, all page routes
        ├── App.css
        ├── index.css
        │
        ├── store/
        │   ├── store.js        # Redux store + redux-persist setup
        │   └── rootReducer.js  # Combined reducers with persist config
        │
        ├── features/
        │   ├── auth/           # authSlice, authActions, authSelectors
        │   ├── user/           # userSlice, userActions, userSelectors
        │   ├── classes/        # classSlice, classActions, classSelectors
        │   ├── payments/       # paymentSlice, paymentActions, paymentSelectors
        │   └── featuredCourses/# courseSlice, courseActions, courseSelectors
        │
        ├── middlewares/
        │   └── loggerMiddleware.js
        │
        ├── utils/
        │   └── axiosInstance.js  # Axios with auto Bearer token injection
        │
        └── components/
            ├── common/
            │   ├── home.js               # Landing / user home
            │   └── FeaturedCourseDetails.js
            ├── Login Register/
            │   ├── Login.js
            │   ├── Register.js
            │   ├── PasswordResetRequest.js
            │   └── ResetPassword.js
            ├── User/
            │   ├── userHome.js
            │   ├── Classes.js
            │   ├── ClassMonth.js         # Calendar view
            │   ├── ClassDetails.js
            │   ├── Enroll.js
            │   ├── Payments.js
            │   └── Profile.js
            ├── Admin/
            │   ├── Dashboard.js
            │   ├── Modal.js
            │   ├── ClassCalendar.js
            │   ├── Online-Classes/Classes.js
            │   ├── Payments/Payments.js
            │   └── Users/Users.js
            └── routes/
                ├── PrivateRoute.js       # Auth + role guard
                └── Pagenotfound.js
```

---

## Environment Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (free tier is enough)
- Gmail account with App Password enabled (for email)

### Install Dependencies

```bash
# Install backend dependencies (from project root)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Configure `.env`

Create a `.env` file at the project root. All required variables:

```env
# MongoDB
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>

# JWT
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRE=24h

# Frontend URL (for CORS and email links)
CLIENT_URL=http://localhost:3000

# Email (Gmail with App Password)
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_APIKEY=your_api_key
CLOUDINARY_APISECRET=your_api_secret

# Rate Limiting
AUTH_RATE_LIMIT=20       # requests per 15 minutes on /api/auth
API_RATE_LIMIT=200       # requests per 15 minutes on general routes

# Admin alerts
ADMIN_EMAIL=admin@example.com

# Google Drive Backups (optional — see BACKUP_SETUP.md)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_DRIVE_FOLDER_ID=
BACKUP_ENCRYPTION_KEY=
```

**Gmail App Password setup:** Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail".

---

## Running the App

```bash
# Run both backend and frontend together
npm run dev

# Run backend only (nodemon, auto-restarts on change)
npm run server

# Run frontend only (React dev server on :3000)
npm run client
```

- Backend: `http://localhost:8071`
- Frontend: `http://localhost:3000`

The frontend `package.json` has `"proxy": "http://localhost:8071"`, so all `/api/*` and route calls from React are automatically forwarded to the backend in development.

---

## Backend Architecture

### `server.js` — Entry Point

```
Express App
  ↓ Security Middleware (Helmet, CORS, rate limiter, mongo-sanitize)
  ↓ Body Parsers (JSON, URL-encoded)
  ↓ Route Mounting
  ↓ Global Error Handler
  ↓ MongoDB Connect → Start Server + Cron Jobs
```

**Route mounting:**

| Prefix | Router file |
|---|---|
| `/api/auth` | `BACKEND/routes/auth.js` |
| `/courses` | `BACKEND/routes/courses.js` |
| `/classes` | `BACKEND/routes/classes.js` |
| `/payments` | `BACKEND/routes/payments.js` |
| `/upload` | `BACKEND/routes/upload.js` |

### Controller Pattern

All business logic lives in controllers. Routes are thin — they call `protect`, `authorize`, then a controller function.

```js
// Typical route pattern
router.put('/approve/:id', protect, authorize('admin'), approvePayment);
```

### Error Handling

Controllers use `try/catch` and pass errors to Express with `next(err)`. The global handler in `server.js` formats the response, adds request context, and logs errors.

---

## Frontend Architecture

### Routing (`App.js`)

All routes are defined in `App.js`. Protected routes use `PrivateRoute`:

```jsx
<Route path="/dashboard" element={
  <PrivateRoute roles={['admin']}>
    <Dashboard />
  </PrivateRoute>
} />
```

`PrivateRoute` reads from the Redux `auth` slice. If no token or wrong role, it redirects to `/login`.

### Axios Instance (`utils/axiosInstance.js`)

All API calls should use this instance, not plain `axios`. It automatically attaches the JWT token from Redux store as a `Bearer` header on every request.

```js
import axiosInstance from '../utils/axiosInstance';
const res = await axiosInstance.get('/classes');
```

### Redux Feature Slices

Each domain (auth, classes, payments, courses, user) has three files:

| File | Purpose |
|---|---|
| `*Slice.js` | State shape, reducers, action creators |
| `*Actions.js` | Async thunks (API calls) |
| `*Selectors.js` | Memoized selectors for reading state |

State is persisted to `localStorage` via `redux-persist`. On page reload, the store is rehydrated automatically.

---

## Database Models

### User (`BACKEND/models/auth.js`)

| Field | Type | Notes |
|---|---|---|
| `studentId` | String | Auto-generated: STD0001, STD0002… |
| `firstName` | String | Required |
| `lastName` | String | Required |
| `email` | String | Unique, validated format |
| `telephoneNumber` | String | 10–15 digits |
| `password` | String | bcrypt hashed, `select: false` |
| `grade` | String | Required |
| `role` | String | `student` / `admin` / `teacher` |
| `isApproved` | Boolean | Default: true |
| `profilePhoto` | String | Cloudinary URL |
| `membership.status` | String | `active` / `expired` / `pending` |
| `membership.expiryDate` | Date | Set on payment approval |
| `membership.paidMonths` | Array | `[{ month: "January" }]` |
| `resetPasswordToken` | String | Hashed token for reset flow |
| `resetPasswordExpire` | Date | 10-minute window |

**Instance methods:**
- `matchPasswords(plainText)` — compares against stored hash
- `getSignedToken()` — returns signed JWT
- `getResetPasswordToken()` — generates and stores reset token, returns raw token for email

### Payment (`BACKEND/models/payments.js`)

| Field | Type | Notes |
|---|---|---|
| `studentId` | String | Indexed, links to User |
| `firstName` / `lastName` | String | Copied from user at submission |
| `month` | String | Enum: all 12 months |
| `year` | Number | Default: current year |
| `amount` | Number | Validated 0 < amount ≤ 100,000 |
| `slipImage` | String | Cloudinary URL |
| `status` | String | `pending` / `approved` / `rejected` |
| `approvalDate` | Date | Set when admin approves |
| `rejectionReason` | String | Set when admin rejects |

### Class (`BACKEND/models/classes.js`)

| Field | Type | Notes |
|---|---|---|
| `className` | String | Unique |
| `classLink` | String | Unique, validated URL (http/https) |
| `classDate` | Date | Required |
| `classTime` | String | Required |
| `classGrade` | String | Required |
| `description` | String | Required |
| `notes` | String | Optional |
| `isCancelled` | Boolean | Default: false |
| `cancellationReason` | String | Required when cancelling |

### Course (`BACKEND/models/courses.js`)

| Field | Type | Notes |
|---|---|---|
| `courseName` | String | Unique |
| `description` | String | Required |
| `instructor` | String | Required |
| `courseImage` | String | Cloudinary URL |

---

## API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Create student account |
| `POST` | `/login` | Public (rate limited) | Returns JWT + user object |
| `POST` | `/forgotpassword` | Public | Sends password reset email |
| `PUT` | `/passwordreset/:token` | Public | Validates token, sets new password |
| `GET` | `/get` | Admin | Paginated list of all users |
| `POST` | `/registerStaff` | Admin | Create admin or teacher account |
| `DELETE` | `/delete/:id` | Admin | Remove user |
| `PUT` | `/toggleApproval/:id` | Admin | Toggle `isApproved` flag |
| `GET` | `/getProfile/:id` | Authenticated | Get user profile |
| `PUT` | `/update/:id` | Authenticated | Update profile fields |

### Courses — `/courses`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | List all courses |
| `GET` | `/:id` | Public | Get course by ID |
| `POST` | `/add` | Admin | Create course |
| `PUT` | `/edit/:id` | Admin | Update course |
| `DELETE` | `/delete/:id` | Admin | Delete course |

### Classes — `/classes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Authenticated | Paginated list, sorted by date |
| `GET` | `/getClass/:id` | Authenticated | Single class details |
| `POST` | `/add` | Admin / Teacher | Create class session |
| `PUT` | `/update/:id` | Admin / Teacher | Update class details |
| `PUT` | `/cancel/:id` | Admin / Teacher | Cancel with reason |
| `DELETE` | `/delete/:id` | Admin / Teacher | Delete class |

### Payments — `/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Authenticated | Paginated payment list |
| `GET` | `/:id` | Authenticated | Single payment details |
| `POST` | `/add` | Authenticated | Submit payment with slip image |
| `PUT` | `/approve/:id` | Admin | Approve → activates membership |
| `PUT` | `/reject/:id` | Admin | Reject with reason |
| `DELETE` | `/delete/:id` | Admin | Delete payment record |

### Upload — `/upload`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | Authenticated | Upload image → returns Cloudinary URL |

**Upload constraints:** JPEG, PNG, WebP, GIF only. Max 5MB. Response: `{ success, url, publicId }`.

---

## Authentication & Authorization

### Flow

```
1. POST /api/auth/login
   → validate credentials
   → bcrypt.compare(password, hash)
   → user.getSignedToken() → JWT signed with JWT_SECRET, expires in JWT_EXPIRE
   → return { token, user }

2. Frontend stores token in Redux (persisted to localStorage)

3. axiosInstance attaches header: Authorization: Bearer <token>

4. protect middleware (BACKEND/middleware/auth.js)
   → decode JWT → find user in DB
   → attach req.user

5. authorize('admin', 'teacher') middleware
   → check req.user.role against allowed roles
```

### `protect` Middleware

```js
// Extracts and verifies JWT, attaches req.user
router.get('/admin-only', protect, authorize('admin'), handler);
```

### Password Reset Flow

```
POST /forgotpassword
  → generate crypto token
  → hash it → store in user.resetPasswordToken + 10min expiry
  → email raw token as link to user

PUT /passwordreset/:token
  → hash incoming token → find user where token matches & not expired
  → set new password → clear token fields
```

---

## File Uploads & Cloudinary

All images (profile photos, payment slips, course images) are stored on Cloudinary.

### Upload Process

```
1. Frontend: FormData with image file → POST /upload
2. Multer (memoryStorage) → holds file in buffer
3. MIME type validation (whitelist: jpeg, png, webp, gif)
4. cloudinary.uploader.upload_stream → streams buffer to Cloudinary
5. Returns { url: secure_url, publicId }
6. Frontend stores URL, sends it in the next API call as a string field
```

### Cloudinary Config (`BACKEND/utils/cloudinary.js`)

Reads `CLOUDINARY_NAME`, `CLOUDINARY_APIKEY`, `CLOUDINARY_APISECRET` from `.env`.

---

## Email System

Uses Nodemailer with Gmail as the transport.

**Triggers:**
- User registration → welcome email
- Forgot password → password reset link
- Payment approved → confirmation to student
- Payment rejected → notification with reason
- Membership expiry → reminder email (via cron job)
- Cron job failures → alert to `ADMIN_EMAIL`

**Template:** `BACKEND/utils/emailTemplates/resetPasswordTemplate.js` contains the HTML for the password reset email.

**Sending:**
```js
await sendEmail({
  email: user.email,
  subject: 'Subject here',
  html: '<p>Body</p>'
});
```

---

## Background Jobs (Cron)

Jobs start automatically when the server starts. Defined in `BACKEND/utils/`.

### Membership Expiry Checker (`cronJobs.js`)

- **Schedule:** Daily at midnight (`0 0 * * *`)
- **Logic:** Finds all users where `membership.status === 'active'` and `membership.expiryDate < now`
- **Action:** Sets status to `'pending'`, sends expiry email if not already notified

### Payment Reminder (`paymentReminderJob.js`)

- Sends reminder emails to students who have not paid for the current month

### Database Backup (`backupJob.js`)

- Daily and weekly backups of MongoDB data exported to Google Drive
- See [Backup System](#backup-system) for full details

---

## Backup System

See `BACKUP_SETUP.md` for the full step-by-step Google Drive OAuth2 setup.

**What gets backed up:**
- Full MongoDB database export (daily + weekly)
- Encrypted `.env` file (AES-256-GCM, on every server start)

**One-time setup:**
```bash
node BACKEND/scripts/getDriveToken.js
```
Follow the OAuth2 consent flow, paste the code, and the refresh token is saved to `.env`.

**Backup folder structure on Google Drive:**
```
<GOOGLE_DRIVE_FOLDER_ID>/
├── daily/
└── weekly/
```

---

## Security

| Measure | Implementation |
|---|---|
| Security headers | `helmet()` middleware |
| CORS | Restricted to `CLIENT_URL` |
| Rate limiting | 20 req/15min on auth, 200 on API |
| NoSQL injection | `express-mongo-sanitize` |
| Password hashing | bcrypt, salt rounds default |
| JWT expiry | 24 hours (`JWT_EXPIRE=24h`) |
| Password reset tokens | Crypto-generated, hashed in DB, 10-min expiry |
| File upload validation | MIME whitelist + 5MB limit |
| Encrypted backups | AES-256-GCM for `.env` backup |
| Role guards | `authorize('admin', 'teacher')` on sensitive routes |
| Password field protection | `select: false` on password field — explicit `.select('+password')` required |

---

## State Management (Redux)

### Store Shape

```
{
  auth: {
    isAuthenticated: boolean,
    user: { _id, studentId, firstName, lastName, email, role, membership, ... },
    token: string,
    loading: boolean,
    error: string | null
  },
  user: { ... },
  classes: { list: [], total, page, loading, error },
  payments: { list: [], total, page, loading, error },
  featuredCourses: { list: [], loading, error }
}
```

### Persistence

`redux-persist` saves the store to `localStorage`. On refresh, the state is rehydrated. The `PersistGate` in `index.js` delays rendering until rehydration is complete.

### Adding a New Feature Slice

1. Create `frontend/src/features/<name>/<name>Slice.js` — define initial state + reducers
2. Create `<name>Actions.js` — async thunks using `axiosInstance`
3. Create `<name>Selectors.js` — selectors with `createSelector`
4. Add the reducer to `store/rootReducer.js`

---

## Common Development Tasks

### Add a New API Endpoint

1. Add the controller function in `BACKEND/controllers/<domain>.js`
2. Add the route in `BACKEND/routes/<domain>.js` with appropriate middleware
3. Test with a tool like Postman or the React UI

### Add a New Page (React)

1. Create the component in `frontend/src/components/<section>/`
2. Add the route in `App.js`
3. If protected, wrap with `<PrivateRoute roles={[...]}>`
4. Add a Redux action in the relevant `*Actions.js` file if needed

### Add a New Database Model

1. Create `BACKEND/models/<name>.js` with a Mongoose schema
2. Import and use it in the relevant controller
3. No migration needed — Mongoose creates collections on first insert

### Create the First Admin User

There is no admin registration UI. To seed an admin:

```js
// Option 1: Use the registerStaff endpoint after manually creating first admin in DB
// Option 2: Use a one-time script or MongoDB Atlas UI to set role: "admin" on a registered user
```

Or use MongoDB Atlas → Collections → `users` → Edit a document → set `"role": "admin"`.

### Check Payment Approval Effect on Membership

When `PUT /payments/approve/:id` is called:
1. Payment `status` → `"approved"`, `approvalDate` set
2. `user.membership.status` → `"active"`
3. `user.membership.expiryDate` → 1st day of the month following the paid month
4. The paid month is added to `user.membership.paidMonths`

---

## Deployment Notes

- Set `NODE_ENV=production` in your hosting environment
- Set `CLIENT_URL` to your actual frontend domain (for CORS)
- The frontend needs to be built (`npm run build` in `frontend/`) and served statically, or deployed separately
- MongoDB Atlas: whitelist your server IP in Network Access
- Cloudinary: keep API keys in environment, never commit them
- Google Drive backup: ensure the refresh token is valid and the service account has Drive access

---

*Last updated: 2026-06-23*
