# Course Selling Frontend

Unified React frontend for the Course Selling App backend.

## Prerequisites

- Node.js 18+
- Backend running at http://localhost:3000

## Setup

1. Install dependencies

npm install

2. Create env file

Copy .env.example to .env and set:

VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id (optional, enables Google auth buttons)

3. Run dev server

npm run dev

4. Build for production

npm run build

## Screen to API Mapping

| Screen | API Calls |
|---|---|
| Course Catalog | GET /course/preview, POST /course/purchase |
| User Auth | POST /user/signup, POST /user/signin |
| My Purchases | GET /user/purchases |
| Admin Auth | POST /admin/signup, POST /admin/signin |
| Admin Dashboard | GET /admin/course/bulk, POST /admin/course, PUT /admin/course, DELETE /admin/course/:courseId, POST /admin/course/:courseId/content |

## Auth Notes

- Requests use credentials: include, so HttpOnly cookies are sent automatically.
- The token header fallback is also sent when local storage token exists.
- Local storage tokens are only used as fallback.

## Quick Test Checklist

- User signup and signin work.
- Admin signup and signin work.
- Public course listing loads real courses.
- User can purchase a course.
- User purchases page lists purchased courses.
- Admin can create, update, delete a course.
- Admin can add content to a course.
- 403 errors show clear messages.
- 429 errors show clear retry guidance.
