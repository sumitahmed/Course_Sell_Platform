# Backend Work Summary

This document tracks what was implemented and verified in the backend project.

## Project
- Folder: backendOFCourseSellingAPp
- API base path: /api/v1

## What Was Checked First
- Verified existing user/admin/course routes by running end-to-end API smoke tests.
- Found that some protected routes were throwing 500 on missing token.
- Found README tasks that were still pending:
  - cookie-based auth
  - rate limiting middleware
  - admin delete course route
  - admin add course content route

## Changes Implemented

### 1) Auth Middleware Stability Fix
- Updated both user/admin middleware to safely handle:
  - missing token
  - invalid/expired token
- Behavior now returns `403` with a proper JSON message instead of crashing with `500`.

Files updated:
- middleware/user.js
- middleware/admin.js

### 2) Cookie-Based Auth Added
- On signin, token is now also set in HttpOnly cookies:
  - `userToken` for user signin
  - `adminToken` for admin signin
- Middleware now accepts token from:
  - cookie (preferred)
  - Authorization Bearer header
  - `token` header (kept for backward compatibility)

Files updated:
- routes/user.js
- routes/admin.js
- middleware/user.js
- middleware/admin.js

### 3) Rate Limiter Middleware Added
- Added a minimal in-memory per-IP limiter:
  - window: 60 seconds
  - max requests: 120 per IP per window
- Returns `429` when limit exceeds.

File updated:
- index.js

### 4) Missing Admin Routes Implemented
- Added delete course route:
  - `DELETE /api/v1/admin/course/:courseId`
- Added add-content route:
  - `POST /api/v1/admin/course/:courseId/content`
  - Body example: `{ "content": "Module 1 notes" }`

File updated:
- routes/admin.js

### 5) Course Schema Updated for Content
- Added `content` array to course schema to support add-content route.

File updated:
- db.js

### 6) Mongo Index Compatibility Fix
- Existing database had unique index on `userId` in user/admin collections.
- Signup was failing with duplicate key errors when `userId` was missing.
- Added `userId` in schema and set `userId = email` during signup.

Files updated:
- db.js
- routes/user.js
- routes/admin.js

## Route Verification Results
The following were tested successfully after fixes:

- `GET /api/v1/user/purchases` without token -> `403` (expected)
- `POST /api/v1/user/signup` -> `200`
- `POST /api/v1/user/signin` -> `200` + `Set-Cookie: userToken`
- `POST /api/v1/admin/signup` -> `200`
- `POST /api/v1/admin/signin` -> `200` + `Set-Cookie: adminToken`
- `POST /api/v1/admin/course` -> `200`
- `POST /api/v1/admin/course/:courseId/content` -> `200`
- `GET /api/v1/course/preview` -> `200`
- `POST /api/v1/course/purchase` -> `200`
- `GET /api/v1/user/purchases` with token -> `200`
- `DELETE /api/v1/admin/course/:courseId` -> `200`

## Notes
- Frontend was not touched (as requested).
- Changes were kept minimal and aligned with beginner-friendly code style.
- Existing behavior for token header auth was preserved so older clients do not break.
