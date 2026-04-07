<p align="center">
  <h1 align="center">📚 Course Sell Platform</h1>
  <p align="center">
    A full-stack course marketplace where <strong>admins</strong> create &amp; manage courses and <strong>users</strong> browse, purchase &amp; track them.
  </p>
</p>

---
![alt text](<Screenshot 2026-04-07 202701.png>)
## 🗂️ Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Authentication Flow](#-authentication-flow)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Frontend Pages](#-frontend-pages)
- [Known Limitations & Roadmap](#-known-limitations--roadmap)

---

## 🔭 Overview

Course Sell Platform is a monorepo-style project with a **Node.js / Express** REST API backend and a **React (Vite + TypeScript)** single-page application frontend. The backend persists data in **MongoDB** via Mongoose and uses **JWT + HttpOnly cookies** for stateless authentication across two separate auth domains — **User** and **Admin**.

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express v5** | Web framework & routing |
| **MongoDB + Mongoose** | Database & ODM |
| **JSON Web Tokens** | Stateless authentication |
| **dotenv** | Environment variable management |
| **Zod** | Input validation (installed, integration in progress) |
| **CORS** | Cross-origin resource sharing |
| **Nodemon** | Dev server with hot-reload |

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Bundler & dev server |
| **React Router v7** | Client-side routing |
| **@react-oauth/google** | Optional Google OAuth integration |
| **Vanilla CSS** | Custom styling (no CSS framework) |

---

## ✨ Features

### User-Facing
- 🔐 **User Sign-up / Sign-in** — JWT-based auth with HttpOnly cookie support
- 🛒 **Browse Courses** — Public course catalog with preview (no auth required)
- 💳 **Purchase Courses** — Buy courses with duplicate-purchase prevention
- 📋 **Purchase History** — View all purchased courses with full course data

### Admin-Facing
- 🔐 **Admin Sign-up / Sign-in** — Separate auth domain with its own JWT secret
- ➕ **Create Courses** — Add new courses with title, description, price & image
- ✏️ **Update Courses** — Edit existing course details (ownership verified)
- 🗑️ **Delete Courses** — Remove courses (ownership verified)
- 📄 **Add Course Content** — Push content items to a course's content array
- 📦 **Bulk Fetch** — Retrieve all courses created by the signed-in admin

### Platform
- 🚦 **Rate Limiting** — In-memory per-IP rate limiter (120 req/min)
- 🌐 **CORS** — Configurable origin whitelist
- 🍪 **Cookie + Bearer Auth** — Middleware accepts tokens from cookies, `Authorization` header, or legacy `token` header
- 🛡️ **Global Error Handler** — Centralized Express error-handling middleware

---

## 📁 Project Structure

```
courseSellApp/
├── index.js                  # App entry — middleware setup, DB connection, route mounting
├── db.js                     # Mongoose schemas & models (User, Admin, Course, Purchase)
├── config.js                 # Reads JWT secrets from environment variables
├── auth.js                   # Standalone JWT auth helper (legacy/utility)
├── .env                      # Local secrets (git-ignored)
├── .env.example              # Template for required env vars
├── package.json              # Backend dependencies & npm scripts
│
├── middleware/
│   ├── admin.js              # Admin JWT verification middleware (cookie + header)
│   └── user.js               # User JWT verification middleware (cookie + header)
│
├── routes/
│   ├── admin.js              # Admin auth + full course CRUD routes
│   ├── user.js               # User auth + purchase history route
│   └── course.js             # Public course preview + user purchase route
│
└── frontend/                 # React SPA (Vite + TypeScript)
    ├── index.html            # HTML shell
    ├── vite.config.ts        # Vite configuration
    ├── package.json          # Frontend dependencies
    ├── tsconfig.json         # TypeScript configuration
    │
    └── src/
        ├── main.tsx          # React root — providers (Router, Auth, optional Google OAuth)
        ├── App.tsx           # Route definitions
        ├── index.css         # Global styles
        ├── types.ts          # Shared TypeScript interfaces
        │
        ├── api/
        │   ├── client.ts     # Base HTTP client (fetch wrapper)
        │   ├── adminApi.ts   # Admin API calls
        │   ├── userApi.ts    # User API calls
        │   └── courseApi.ts  # Course API calls
        │
        ├── components/
        │   ├── AppLayout.tsx       # Shared layout with navigation
        │   ├── CourseCard.tsx       # Reusable course display card
        │   └── MessageBanner.tsx   # Feedback / notification banner
        │
        ├── context/
        │   └── AuthContext.tsx      # Global auth state (role, token, login/logout)
        │
        └── pages/
            ├── HomePage.tsx             # Landing page
            ├── AuthChoicePage.tsx        # Choose User vs Admin auth
            ├── UserAuthPage.tsx          # User sign-up / sign-in forms
            ├── AdminAuthPage.tsx         # Admin sign-up / sign-in forms
            ├── CourseCatalogPage.tsx     # Public course browsing
            ├── PurchasesPage.tsx         # User's purchased courses
            ├── AdminDashboardPage.tsx    # Admin course management dashboard
            └── NotFoundPage.tsx         # 404 fallback
```

---

## 🗄️ Database Schema

Four Mongoose models defined in `db.js`:

### User
| Field | Type | Constraints |
|---|---|---|
| `userId` | String | Unique |
| `email` | String | Unique |
| `password` | String | — |
| `firstName` | String | — |
| `lastName` | String | — |

### Admin
| Field | Type | Constraints |
|---|---|---|
| `userId` | String | Unique |
| `email` | String | Unique |
| `password` | String | — |
| `firstName` | String | — |
| `lastName` | String | — |

### Course
| Field | Type | Notes |
|---|---|---|
| `title` | String | — |
| `description` | String | — |
| `content` | [String] | Array of content items |
| `price` | Number | — |
| `imageUrl` | String | — |
| `creatorId` | ObjectId | Refers to admin `_id` |

### Purchase
| Field | Type | Notes |
|---|---|---|
| `purchaseId` | String | Auto-generated unique ID |
| `userId` | ObjectId | Refers to user `_id` |
| `courseId` | ObjectId | Refers to course `_id` |

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api/v1`.

### User Routes — `/api/v1/user`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | ❌ Public | Register a new user |
| `POST` | `/signin` | ❌ Public | Login and receive JWT (also set as cookie) |
| `GET` | `/purchases` | ✅ User | Get all purchased courses with full course data |

### Admin Routes — `/api/v1/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | ❌ Public | Register a new admin |
| `POST` | `/signin` | ❌ Public | Login and receive JWT (also set as cookie) |
| `POST` | `/course` | ✅ Admin | Create a new course |
| `PUT` | `/course` | ✅ Admin | Update an existing course (ownership verified) |
| `GET` | `/course/bulk` | ✅ Admin | Fetch all courses created by the admin |
| `DELETE` | `/course/:courseId` | ✅ Admin | Delete a course (ownership verified) |
| `POST` | `/course/:courseId/content` | ✅ Admin | Append a content item to a course |

### Course Routes — `/api/v1/course`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/preview` | ❌ Public | Fetch all courses (public catalog) |
| `POST` | `/purchase` | ✅ User | Purchase a course (duplicate check enforced) |

### Common Response Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad request / missing fields |
| `403` | Unauthorized / invalid token |
| `404` | Resource not found |
| `409` | Conflict (duplicate user, already purchased) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## 🔐 Authentication Flow

```
┌──────────┐       POST /signup or /signin        ┌───────────┐
│  Client  │ ──────────────────────────────────▶   │  Express  │
│ (React)  │                                       │  Server   │
│          │ ◀──── JWT token (JSON + HttpOnly ──── │           │
│          │       cookie "userToken" or            │           │
└──────────┘       "adminToken")                   └───────────┘
      │                                                  │
      │  Subsequent requests include token via:          │
      │   1. Cookie (automatic in browser)               │
      │   2. Authorization: Bearer <token>               │
      │   3. token header (legacy)                       │
      ▼                                                  ▼
  Middleware verifies JWT with the                  Rejects with
  correct secret (User vs Admin)                    403 if invalid
```

- **User tokens** are signed with `JWT_USER_PASSWORD` and verified by `middleware/user.js`.
- **Admin tokens** are signed with `JWT_ADMIN_PASSWORD` and verified by `middleware/admin.js`.
- Separate secrets ensure a user token **cannot** access admin routes and vice versa.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local instance or Atlas cloud URI)
- **npm**

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd courseSellApp
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the project root (use `.env.example` as a template):

```env
MONGODB_URI=mongodb://localhost:27017/courseSellApp
JWT_USER_PASSWORD=your_user_jwt_secret
JWT_ADMIN_PASSWORD=your_admin_jwt_secret
```

### 4. Start the Backend

```bash
# Development (hot-reload)
npm run dev

# Production
npm start
```

The API server starts on **http://localhost:3000**.

### 5. Install & Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173**.

---

## 🔑 Environment Variables

### Backend (`.env` in project root)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_USER_PASSWORD` | ✅ | Secret used to sign/verify user JWTs |
| `JWT_ADMIN_PASSWORD` | ✅ | Secret used to sign/verify admin JWTs |

### Frontend (`.env` in `/frontend`)

| Variable | Required | Description |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | ❌ Optional | Google OAuth client ID (enables Google sign-in) |

---

## 🖥️ Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/` | HomePage | Landing page with app introduction |
| `/courses` | CourseCatalogPage | Browse all available courses (public) |
| `/auth` | AuthChoicePage | Choose between User and Admin login |
| `/user/auth` | UserAuthPage | User sign-up / sign-in forms |
| `/admin/auth` | AdminAuthPage | Admin sign-up / sign-in forms |
| `/purchases` | PurchasesPage | View user's purchased courses |
| `/admin/dashboard` | AdminDashboardPage | Admin course management (CRUD) |
| `*` | NotFoundPage | 404 catch-all |

---

## ⚠️ Known Limitations & Roadmap

| Area | Current State | Improvement |
|---|---|---|
| **Password Storage** | Stored as plaintext | Hash with **bcrypt** before saving |
| **Input Validation** | Manual checks | Integrate **Zod** schemas (already installed) |
| **Rate Limiter** | In-memory (resets on restart) | Use **Redis** or a DB-backed store |
| **Payment Integration** | Purchase is free / simulated | Integrate **Stripe** or **Razorpay** |
| **Error Handling** | Basic try/catch | Add structured error classes |
| **Testing** | None | Add unit & integration tests (Jest / Vitest) |
| **Deployment** | Local only | Containerize with Docker, deploy to cloud |

---

## 📄 License

ISC

---

<p align="center">
  Built with ❤️ using Express, MongoDB, React & TypeScript
</p>
