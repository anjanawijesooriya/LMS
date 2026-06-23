# LMS Project — Security & Bug Fixes

## Phase 1 — Critical

### 1. Authentication Middleware
**File:** `BACKEND/middleware/auth.js` *(new file)*

Created JWT verification middleware with two functions:
- `protect` — verifies the Bearer token from the `Authorization` header, attaches `req.user`
- `authorize(...roles)` — restricts access to specific roles (admin, teacher, student)

---

### 2. Protected Routes
**Files:** `BACKEND/routes/auth.js`, `classes.js`, `payments.js`, `courses.js`, `upload.js`

All routes were previously open to anyone without a token. Applied the following tiers:

| Route | Protection |
|-------|-----------|
| `POST /api/auth/register` | Public |
| `POST /api/auth/login` | Public |
| `POST /api/auth/forgotpassword` | Public |
| `PUT /api/auth/passwordreset/:token` | Public |
| `GET /api/auth/get` | Admin only |
| `POST /api/auth/registerStaff` | Admin only |
| `DELETE /api/auth/delete/:id` | Admin only |
| `PUT /api/auth/toggleApproval/:id` | Admin only |
| `GET /api/auth/getProfile/:id` | Authenticated |
| `PUT /api/auth/update/:id` | Authenticated |
| `GET /classes/` | Authenticated |
| `GET /classes/getClass/:id` | Authenticated |
| `POST /classes/add` | Admin / Teacher |
| `PUT /classes/update/:id` | Admin / Teacher |
| `PUT /classes/cancel/:id` | Admin / Teacher |
| `DELETE /classes/delete/:id` | Admin / Teacher |
| `GET /payments/` | Authenticated |
| `GET /payments/:id` | Authenticated |
| `POST /payments/add` | Authenticated |
| `PUT /payments/approve/:id` | Admin only |
| `PUT /payments/reject/:id` | Admin only |
| `DELETE /payments/delete/:id` | Admin only |
| `GET /courses/` | Public |
| `GET /courses/:id` | Public |
| `POST /courses/add` | Admin only |
| `PUT /courses/edit/:id` | Admin only |
| `DELETE /courses/delete/:id` | Admin only |
| `POST /upload/` | Authenticated |

---

### 3. Axios Interceptor — Auth Token Forwarding
**File:** `frontend/src/utils/axiosInstance.js` *(new file)*

Previously, the JWT token was stored in Redux but never sent to the backend. Created an axios instance with a request interceptor that reads the token from the Redux store and attaches it as `Authorization: Bearer <token>` on every request.

Replaced `import axios from "axios"` with `axiosInstance` in all affected files:
- `redux/features/auth/authActions.js`
- `redux/features/payments/paymentActions.js`
- `redux/features/classes/classActions.js`
- `redux/features/featuredCourses/courseActions.js`
- `components/Login Register/ResetPassword.js`
- `components/Login Register/PasswordResetRequest.js`
- `components/User/Profile.js`
- `components/User/Enroll.js`
- `components/Admin/Dashboard.js`
- `components/Admin/Users/Users.js`
- `components/Admin/Payments/Payments.js`
- `components/Admin/Online-Classes/Classes.js`

---

### 4. Admin Role Guard on Frontend
**Files:** `frontend/src/components/routes/PrivateRoute.js`, `frontend/src/App.js`

`PrivateRoute` previously only checked if a token existed — any logged-in student could navigate to `/admin-dashboard/:username` directly.

- Added a `roles` prop to `PrivateRoute`
- Added role check: if `roles` is provided and `user.role` is not in the list, redirect to `/login`
- Applied `roles={["admin"]}` to the admin dashboard route in `App.js`

---

### 5. `sendEmail` — Fixed Fire-and-Forget
**File:** `BACKEND/utils/sendEmail.js`

`sendEmail()` was using a callback-based `transporter.sendMail()` without returning a Promise. All callers used `await sendEmail()` but it resolved immediately regardless of success or failure, silently swallowing email errors.

**Fix:** Wrapped `sendMail` in a `Promise` — rejects on error, resolves on success. Callers can now properly catch email failures.

---

### 6. Password Validation on Reset Endpoint
**File:** `BACKEND/controllers/auth.js`

The reset password endpoint accepted any value including blank strings. Added validation to reject passwords shorter than 6 characters before saving.

---

## Phase 2 — High

### 7. Payment Amount Validation
**File:** `BACKEND/controllers/payments.js`

The `addPayment` endpoint accepted any value for `amount` including zero, negative numbers, and strings. Added validation:
- Must be a valid number
- Must be greater than 0
- Must not exceed 100,000

---

### 8. Membership Expiry Edge Case
**File:** `BACKEND/controllers/payments.js`

When approving a payment for a past month (e.g. approving January in March), the calculated expiry date (February 1) would be in the past. The cron job would then immediately expire the membership on its next run.

**Fix:** Added a minimum expiry floor — the effective expiry is always at least the 1st of the next calendar month from today, regardless of which month the payment is for.

---

### 9. Pagination on List Endpoints
**Files:** `BACKEND/controllers/auth.js`, `classes.js`, `payments.js`

All three `GET` list endpoints used `find()` with no limit, returning every record in the database. This causes memory issues and slow responses at scale.

**Fix:** Added `?page` and `?limit` query parameter support (default: page 1, limit 20, max 100). All three now return:
```json
{
  "success": true,
  "data": [...],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

Frontend components updated to extract `response.data.data` from the new shape:
- `redux/features/classes/classActions.js`
- `redux/features/payments/paymentActions.js`
- `components/Admin/Dashboard.js`
- `components/Admin/Users/Users.js`
- `components/Admin/Payments/Payments.js`
- `components/Admin/Online-Classes/Classes.js`

---

### 10. Image Upload MIME Type Whitelist
**File:** `BACKEND/routes/upload.js`

The upload route used `file.mimetype.startsWith("image/")` which allows SVG files (which can contain embedded JavaScript) and other non-photo formats.

**Fix:** Replaced with an explicit whitelist: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.

---

## Phase 3 — Medium / Low

### 11. Timestamps on Class Model
**File:** `BACKEND/models/classes.js`

The `Class` schema had no `createdAt` / `updatedAt` fields, making audit trails impossible.

**Fix:** Added `{ timestamps: true }` to the schema options.

---

### 12. Global Error Handler — Request Context
**File:** `server.js`

The global error handler only logged the stack trace, making it impossible to know which request caused the error.

**Fix:** Now logs `[METHOD] /path | user: <id>` alongside the stack trace on every unhandled error.

---

### 13. Rate Limits Moved to Environment Variables
**File:** `server.js`, `.env`

Auth and API rate limit values were hardcoded and required a code change to adjust.

**Fix:** Moved to `AUTH_RATE_LIMIT` and `API_RATE_LIMIT` environment variables with the same defaults (20 and 200).

---

### 14. Cron Job Failure Alerting
**Files:** `BACKEND/utils/cronJobs.js`, `BACKEND/utils/paymentReminderJob.js`

Cron job failures were only `console.error`'d. If either job silently died, no one would know until students complained.

**Fix:**
- Added an `alertAdmin()` helper that emails `ADMIN_EMAIL` when a cron job throws
- Individual email send failures inside the loop are now caught separately so one bad email doesn't abort the entire job

---

### 15. Consistent Response Format
**File:** `BACKEND/controllers/payments.js`

Several payment controller responses used `{ message }` only while the rest of the codebase used `{ success, message }`.

**Fix:** Standardized all payment controller responses to `{ success: boolean, message: string, data?: object }`.

---

### 16. Import Order Fix
**Files:** `components/Admin/Dashboard.js`, `components/Admin/Online-Classes/Classes.js`

`import` statements appeared after `const` declarations, which is invalid ES module syntax (even if transpilers tolerate it).

**Fix:** Moved all `import` statements to the top of each file.

---

## New Environment Variables Added

Add these to your `.env` file:

```env
# Rate limits (requests per 15-minute window)
AUTH_RATE_LIMIT=20
API_RATE_LIMIT=200

# Admin email for cron failure alerts
ADMIN_EMAIL=your-admin@email.com

# JWT expiry (recommended: 24h instead of the previous 7d default)
JWT_EXPIRE=24h
```
