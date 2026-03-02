# 📚 LMS Server — Learning Management System API

> **Author**: Tran Xuan Nghia — Hoc Vien Ky Thuat Mat Ma (Academy of Cryptography Techniques)

A comprehensive Learning Management System backend built with **Node.js + TypeScript + Express + Sequelize + MySQL**.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database](#-database)
- [API Endpoints](#-api-endpoints)
- [Authentication & Authorization](#-authentication--authorization)
- [File Uploads](#-file-uploads)
- [Real-time Features](#-real-time-features)
- [AI Chatbot](#-ai-chatbot)
- [Docker](#-docker)
- [Scripts](#-scripts)

---

## ✨ Features

### 👤 User Management

- Registration & login with JWT (Access + Refresh Token)
- 3 roles: **User**, **Instructor**, **Admin**
- Avatar upload with automatic WebP compression
- Instructor profiles (bio, specialization, experience)
- Email verification via Nodemailer + EJS templates

### 📚 Courses

- Full CRUD for courses (title, description, thumbnail, demo video)
- Category-based classification (hierarchical parent/child categories)
- **Benefits** & **Prerequisites** per course
- Flexible **Price Tiers** system
- Thumbnail auto-resize to 800×450 WebP
- Status workflow: `draft` → `active` → `archived`

### 📖 Lessons

- CRUD lessons per course with video upload
- Drag & drop reorder support
- Bulk create multiple lessons
- **Materials**: attachments (PDF, DOC, PPT, ZIP)
- **Notes**: personal notes per lesson per user

### 💬 Lesson Discussions

- **Threaded comment system** (nested/tree structure)
- Only enrolled users & instructors can participate
- Unlimited nesting depth for replies
- Cascade delete for comment threads

### 📝 Quizzes

- 2 question types: **text** & **text_image** (text + image)
- 4 answer options per question (A, B, C, D)
- Instructor creates quizzes per lesson
- Bulk question creation with batch image upload
- **Auto-grading** on submission
- Attempt history with answer review
- Unlimited retakes

### ⭐ Reviews & Ratings

- **Course Reviews**: rate courses (must be enrolled)
- **Instructor Reviews**: rate instructors
- **Review Replies**: instructor responds (1 reply per review)
- Polymorphic reply system (works for both course & instructor reviews)
- Automatic average rating calculation

### 🛒 Cart & Orders

- Add/remove courses from cart
- Create orders with coupon codes
- Order flow: `pending` → `completed` → `refunded`
- Coupon validation: date range, usage limits, discount type (% or fixed)
- Refund handling with coupon usage restoration

### 💰 Coupons & Promotions

- **Coupons**: discount codes for specific courses
- **Promotions**: site-wide or category-based campaigns
- Scope options: `all`, `specific_tiers`, `specific_categories`
- Date range & usage limit validation

### ❤️ Wishlists

- Bookmark courses & lessons (polymorphic)
- Batch check API for list views

### 🔔 Notifications

- Role-based notification system:
  - **Admin**: receives all (orders, reviews, new users)
  - **Instructor**: course orders, new reviews, new questions
  - **User**: order status, review replies, discussion answers
- Pagination, mark as read, bulk delete

### 💬 Real-time Chat

- 1-on-1 messaging between students and instructors
- Image messages with WebP optimization
- Real-time delivery via Socket.IO
- Typing indicators & online status

### 🤖 AI Chatbot

- Powered by **Groq (Llama 3.3 70B)**
- Vietnamese-language AI learning assistant
- Context-aware conversations (remembers last 10 messages)
- Helps with course content, study tips, and platform usage

### 🎓 Certificates & Progress

- Lesson progress tracking (completed/total)
- Certificate generation upon course completion
- PDF certificate generation with Puppeteer

---

## 🛠 Tech Stack

| Component       | Technology                                   |
| --------------- | -------------------------------------------- |
| Runtime         | Node.js 20+                                  |
| Language        | TypeScript 5.4                               |
| Framework       | Express.js 4                                 |
| ORM             | Sequelize v6                                 |
| Database        | MySQL 8.0                                    |
| Auth            | JWT (Access + Refresh Token)                 |
| File Upload     | Multer + Sharp (WebP conversion)             |
| Real-time       | Socket.IO 4                                  |
| AI              | Groq SDK (Llama 3.3)                         |
| API Docs        | Swagger (swagger-jsdoc + swagger-ui-express) |
| Security        | Helmet, CORS, Rate Limiting                  |
| Logging         | Morgan + Winston                             |
| Email           | Nodemailer + EJS templates                   |
| Process Manager | PM2 (cluster mode)                           |
| PDF Generation  | Puppeteer                                    |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **MySQL** >= 8.0
- **npm** >= 9

### Step 1: Clone & Install

```bash
git clone <repo-url>
cd LMS-sv
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings (see below)
```

### Step 3: Create Database

```sql
CREATE DATABASE lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 4: Run Migrations

```bash
npm run db:migrate
```

### Step 5: Start Server

```bash
# Development (hot reload)
npm run dev

# Production
npm run build && npm start

# PM2 (cluster mode)
npm run pm2:start
```

The server runs at `http://localhost:3000` by default.

---

## 🔐 Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lms_db
DB_USER=root
DB_PASSWORD=your_password
DB_POOL_MAX=30
DB_POOL_MIN=2

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_REFRESH_EXPIRES_IN=30d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# AI Chatbot
GROQ_API_KEY=your_groq_api_key
```

---

## 🗄 Database

### Entity Relationship (30 tables)

```
users
├── instructors (1:1)
│   └── instructor_reviews (1:N)
│       └── review_replies (1:1, polymorphic)
├── orders (1:N)
├── cart_items (1:N)
├── wishlists (1:N, polymorphic)
├── notifications (1:N)
├── conversations (1:N)
│   └── messages (1:N)
├── chatbot_messages (1:N)
├── lesson_notes (1:N)
├── lesson_progress (1:N)
├── lesson_discussions (1:N, self-referencing tree)
├── quiz_attempts (1:N)
│   └── quiz_attempt_answers (1:N)
├── certificates (1:N)
└── course_reviews (1:N)
    └── review_replies (1:1, polymorphic)

courses
├── lessons (1:N)
│   ├── lesson_materials (1:N)
│   ├── lesson_discussions (1:N)
│   └── quiz_questions (1:N)
│       └── quiz_answers (1:N)
├── course_benefits (1:N)
├── course_prerequisites (1:N)
├── course_reviews (1:N)
├── coupons (1:N)
├── faqs (1:N)
└── course_categories (N:M) → categories

price_tiers (lookup table)
promotions (scoped: all / specific_tiers / specific_categories)
```

### Migration Commands

```bash
npm run db:migrate           # Run all pending migrations
npm run db:migrate:undo      # Undo last migration
npm run db:migrate:undo:all  # Undo all migrations
npm run db:seed              # Run seeders
```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000/api/v1`

### 🔐 Auth

| Method | Endpoint              | Auth | Description        |
| ------ | --------------------- | ---- | ------------------ |
| POST   | `/auth/register`      | ❌   | Register new user  |
| POST   | `/auth/login`         | ❌   | Login (get tokens) |
| POST   | `/auth/refresh-token` | ❌   | Refresh JWT tokens |
| POST   | `/auth/logout`        | ✅   | Logout             |
| GET    | `/auth/me`            | ✅   | Get current user   |

### 👤 Users

| Method | Endpoint         | Auth | Description      |
| ------ | ---------------- | ---- | ---------------- |
| GET    | `/users/profile` | ✅   | Get user profile |
| PUT    | `/users/profile` | ✅   | Update profile   |
| PUT    | `/users/avatar`  | ✅   | Upload avatar    |
| DELETE | `/users/avatar`  | ✅   | Remove avatar    |

### 🎓 Instructors

| Method | Endpoint                   | Auth     | Description               |
| ------ | -------------------------- | -------- | ------------------------- |
| GET    | `/instructors`             | ❌       | List all (public)         |
| GET    | `/instructors/:id`         | ❌       | Get details (public)      |
| GET    | `/instructors/me`          | ✅       | Get my instructor profile |
| GET    | `/instructors/me/students` | ✅       | Get my enrolled students  |
| POST   | `/instructors/register`    | ✅       | Register as instructor    |
| PUT    | `/instructors/me`          | ✅       | Update my profile         |
| GET    | `/instructors/admin/all`   | ✅ Admin | List all (admin view)     |
| PATCH  | `/instructors/:id/approve` | ✅ Admin | Approve instructor        |
| DELETE | `/instructors/:id`         | ✅ Admin | Remove instructor         |

### 📚 Courses

| Method | Endpoint               | Auth          | Description                          |
| ------ | ---------------------- | ------------- | ------------------------------------ |
| GET    | `/courses`             | ❌            | List (pagination, filter, search)    |
| GET    | `/courses/:id`         | ❌            | Get course details                   |
| GET    | `/courses/my`          | ✅ Instructor | Get my created courses               |
| GET    | `/courses/purchased`   | ✅            | Get user's purchased courses         |
| GET    | `/courses/admin`       | ✅ Admin      | List all (admin view)                |
| POST   | `/courses`             | ✅ Instructor | Create (multipart: thumbnail + demo) |
| PUT    | `/courses/:id`         | ✅ Instructor | Update course                        |
| PATCH  | `/courses/:id/submit`  | ✅ Instructor | Submit for review                    |
| PATCH  | `/courses/:id/approve` | ✅ Admin      | Approve course                       |
| PATCH  | `/courses/:id/reject`  | ✅ Admin      | Reject course                        |
| DELETE | `/courses/:id`         | ✅ Instructor | Delete course                        |

### 📂 Categories

| Method | Endpoint           | Auth     | Description                      |
| ------ | ------------------ | -------- | -------------------------------- |
| GET    | `/categories`      | ❌       | List all categories              |
| GET    | `/categories/tree` | ❌       | Get category tree (parent/child) |
| GET    | `/categories/:id`  | ❌       | Get category by ID               |
| POST   | `/categories`      | ✅ Admin | Create (optional icon upload)    |
| PUT    | `/categories/:id`  | ✅ Admin | Update (optional icon upload)    |
| DELETE | `/categories/:id`  | ✅ Admin | Delete category                  |

### 📖 Lessons

| Method | Endpoint                            | Auth          | Description        |
| ------ | ----------------------------------- | ------------- | ------------------ |
| GET    | `/lessons/course/:courseId`         | ❌            | List by course     |
| GET    | `/lessons/:id`                      | ❌            | Get lesson details |
| POST   | `/lessons/course/:courseId`         | ✅ Instructor | Create with video  |
| POST   | `/lessons/course/:courseId/bulk`    | ✅ Instructor | Bulk create        |
| PATCH  | `/lessons/course/:courseId/reorder` | ✅ Instructor | Reorder lessons    |
| PUT    | `/lessons/:id`                      | ✅ Instructor | Update lesson      |
| DELETE | `/lessons/:id`                      | ✅ Instructor | Delete lesson      |

### 📝 Quizzes

| Method | Endpoint                                 | Auth          | Description                  |
| ------ | ---------------------------------------- | ------------- | ---------------------------- |
| GET    | `/lessons/:lessonId/quiz`                | ✅ Enrolled   | Get quiz (hide answers)      |
| POST   | `/lessons/:lessonId/quiz/submit`         | ✅ Enrolled   | Submit attempt               |
| GET    | `/lessons/:lessonId/quiz/attempts`       | ✅ User       | Attempt history              |
| GET    | `/quiz/attempts/:attemptId`              | ✅ User       | Attempt details              |
| GET    | `/lessons/:lessonId/quiz/questions`      | ✅ Instructor | Get questions (with answers) |
| POST   | `/lessons/:lessonId/quiz/questions`      | ✅ Instructor | Create question              |
| POST   | `/lessons/:lessonId/quiz/questions/bulk` | ✅ Instructor | Bulk create + images         |
| PUT    | `/quiz/questions/:id`                    | ✅ Instructor | Update question              |
| DELETE | `/quiz/questions/:id`                    | ✅ Instructor | Delete question              |

### 💬 Chat

| Method | Endpoint                           | Auth | Description         |
| ------ | ---------------------------------- | ---- | ------------------- |
| POST   | `/chat/conversations`              | ✅   | Create conversation |
| GET    | `/chat/conversations`              | ✅   | List conversations  |
| GET    | `/chat/conversations/:id/messages` | ✅   | Get messages        |
| POST   | `/chat/conversations/:id/messages` | ✅   | Send text message   |
| POST   | `/chat/conversations/:id/images`   | ✅   | Send image message  |

### 🤖 Chatbot (AI)

| Method | Endpoint           | Auth | Description   |
| ------ | ------------------ | ---- | ------------- |
| POST   | `/chatbot/message` | ✅   | Send to AI    |
| GET    | `/chatbot/history` | ✅   | Chat history  |
| DELETE | `/chatbot/history` | ✅   | Clear history |

### 🛒 Cart

| Method | Endpoint    | Auth | Description        |
| ------ | ----------- | ---- | ------------------ |
| GET    | `/cart`     | ✅   | Get cart items     |
| POST   | `/cart`     | ✅   | Add course to cart |
| DELETE | `/cart/:id` | ✅   | Remove from cart   |

### 📦 Orders

| Method | Endpoint               | Auth     | Description    |
| ------ | ---------------------- | -------- | -------------- |
| GET    | `/orders`              | ✅       | List orders    |
| POST   | `/orders`              | ✅       | Create order   |
| PATCH  | `/orders/:id/complete` | ✅       | Complete order |
| PATCH  | `/orders/:id/cancel`   | ✅       | Cancel order   |
| PATCH  | `/orders/:id/refund`   | ✅ Admin | Refund order   |

### ❤️ Wishlists

| Method | Endpoint                 | Auth | Description             |
| ------ | ------------------------ | ---- | ----------------------- |
| POST   | `/wishlists/toggle`      | ✅   | Toggle bookmark         |
| GET    | `/wishlists/check`       | ✅   | Check single item       |
| GET    | `/wishlists/my-courses`  | ✅   | List bookmarked courses |
| GET    | `/wishlists/my-lessons`  | ✅   | List bookmarked lessons |
| POST   | `/wishlists/batch-check` | ✅   | Batch check items       |

### 🔔 Notifications

| Method | Endpoint                      | Auth | Description      |
| ------ | ----------------------------- | ---- | ---------------- |
| GET    | `/notifications`              | ✅   | List (paginated) |
| GET    | `/notifications/unread-count` | ✅   | Unread count     |
| PATCH  | `/notifications/:id/read`     | ✅   | Mark as read     |
| PATCH  | `/notifications/read-all`     | ✅   | Mark all as read |
| DELETE | `/notifications/:id`          | ✅   | Delete one       |
| DELETE | `/notifications/clear`        | ✅   | Clear all read   |

### ⭐ Course Reviews

| Method | Endpoint                           | Auth           | Description       |
| ------ | ---------------------------------- | -------------- | ----------------- |
| GET    | `/course-reviews/course/:courseId` | ❌             | List with replies |
| POST   | `/course-reviews/course/:courseId` | ✅ Enrolled    | Create review     |
| PUT    | `/course-reviews/:id`              | ✅ Owner       | Update review     |
| DELETE | `/course-reviews/:id`              | ✅ Owner/Admin | Delete review     |
| POST   | `/course-reviews/:reviewId/reply`  | ✅ Instructor  | Reply to review   |

### ⭐ Instructor Reviews

| Method | Endpoint                                             | Auth           | Description     |
| ------ | ---------------------------------------------------- | -------------- | --------------- |
| GET    | `/instructors/:instructorId/reviews`                 | ❌             | List reviews    |
| POST   | `/instructors/:instructorId/reviews`                 | ✅             | Create review   |
| PUT    | `/instructors/:instructorId/reviews/:reviewId`       | ✅ Owner       | Update review   |
| DELETE | `/instructors/:instructorId/reviews/:reviewId`       | ✅ Owner/Admin | Delete review   |
| POST   | `/instructors/:instructorId/reviews/:reviewId/reply` | ✅ Instructor  | Reply to review |

### ✏️ Review Replies

| Method | Endpoint              | Auth          | Description  |
| ------ | --------------------- | ------------- | ------------ |
| PUT    | `/review-replies/:id` | ✅ Instructor | Update reply |
| DELETE | `/review-replies/:id` | ✅ Instructor | Delete reply |

### 💬 Discussions

| Method | Endpoint                               | Auth                      | Description      |
| ------ | -------------------------------------- | ------------------------- | ---------------- |
| GET    | `/lessons/:lessonId/discussions`       | ❌                        | List (tree view) |
| GET    | `/lessons/:lessonId/discussions/count` | ❌                        | Count            |
| POST   | `/lessons/:lessonId/discussions`       | ✅ Enrolled               | Create/Reply     |
| PUT    | `/lessons/:lessonId/discussions/:id`   | ✅ Owner                  | Update           |
| DELETE | `/lessons/:lessonId/discussions/:id`   | ✅ Owner/Instructor/Admin | Delete           |

### 💰 Price Tiers

| Method | Endpoint           | Auth     | Description    |
| ------ | ------------------ | -------- | -------------- |
| GET    | `/price-tiers`     | ❌       | List all tiers |
| POST   | `/price-tiers`     | ✅ Admin | Create tier    |
| PUT    | `/price-tiers/:id` | ✅ Admin | Update tier    |
| DELETE | `/price-tiers/:id` | ✅ Admin | Delete tier    |

### 🎟️ Coupons

| Method | Endpoint                    | Auth          | Description          |
| ------ | --------------------------- | ------------- | -------------------- |
| POST   | `/coupons/validate`         | ❌            | Validate coupon code |
| GET    | `/coupons/all`              | ✅ Admin      | List all coupons     |
| POST   | `/coupons`                  | ✅ Instructor | Create coupon        |
| GET    | `/coupons/my`               | ✅ Instructor | List my coupons      |
| GET    | `/coupons/course/:courseId` | ✅ Instructor | List by course       |
| DELETE | `/coupons/:id`              | ✅ Instructor | Deactivate coupon    |

### 📣 Promotions

| Method | Endpoint                             | Auth     | Description                  |
| ------ | ------------------------------------ | -------- | ---------------------------- |
| GET    | `/promotions/course/:courseId/price` | ❌       | Get course price after promo |
| GET    | `/promotions/active`                 | ❌       | List active promotions       |
| GET    | `/promotions`                        | ✅ Admin | List all promotions          |
| POST   | `/promotions`                        | ✅ Admin | Create promotion             |
| PUT    | `/promotions/:id`                    | ✅ Admin | Update promotion             |
| DELETE | `/promotions/:id`                    | ✅ Admin | Delete promotion             |

### ❓ FAQs

| Method | Endpoint           | Auth     | Description         |
| ------ | ------------------ | -------- | ------------------- |
| GET    | `/faqs`            | ❌       | List FAQs           |
| GET    | `/faqs/categories` | ❌       | List FAQ categories |
| POST   | `/faqs`            | ✅ Admin | Create FAQ          |
| PUT    | `/faqs/:id`        | ✅ Admin | Update FAQ          |
| DELETE | `/faqs/:id`        | ✅ Admin | Delete FAQ          |

### 📎 Lesson Materials

| Method | Endpoint                      | Auth          | Description     |
| ------ | ----------------------------- | ------------- | --------------- |
| GET    | `/materials/lesson/:lessonId` | ❌            | List by lesson  |
| POST   | `/materials/lesson/:lessonId` | ✅ Instructor | Upload material |
| DELETE | `/materials/:id`              | ✅ Instructor | Delete material |

### 📝 Lesson Notes

| Method | Endpoint                  | Auth | Description |
| ------ | ------------------------- | ---- | ----------- |
| GET    | `/notes/lesson/:lessonId` | ✅   | Get notes   |
| POST   | `/notes/lesson/:lessonId` | ✅   | Create note |
| PUT    | `/notes/:id`              | ✅   | Update note |
| DELETE | `/notes/:id`              | ✅   | Delete note |

### 📈 Lesson Progress

| Method | Endpoint                       | Auth | Description             |
| ------ | ------------------------------ | ---- | ----------------------- |
| GET    | `/progress`                    | ✅   | Get all progress        |
| GET    | `/progress/course/:courseId`   | ✅   | Get course progress     |
| POST   | `/progress/:lessonId/complete` | ✅   | Mark lesson completed   |
| DELETE | `/progress/:lessonId/complete` | ✅   | Unmark lesson completed |

### 🎓 Certificates

| Method | Endpoint                         | Auth | Description          |
| ------ | -------------------------------- | ---- | -------------------- |
| GET    | `/certificates/verify/:code`     | ❌   | Verify certificate   |
| GET    | `/certificates/my`               | ✅   | List my certificates |
| GET    | `/certificates/course/:courseId` | ✅   | Get by course        |
| POST   | `/certificates/course/:courseId` | ✅   | Issue certificate    |

### 📊 Statistics

| Method | Endpoint                             | Auth          | Description              |
| ------ | ------------------------------------ | ------------- | ------------------------ |
| GET    | `/stats/admin/overview`              | ✅ Admin      | Admin overview stats     |
| GET    | `/stats/admin/revenue-by-month`      | ✅ Admin      | Monthly revenue chart    |
| GET    | `/stats/admin/top-courses`           | ✅ Admin      | Top performing courses   |
| GET    | `/stats/admin/recent-orders`         | ✅ Admin      | Recent orders            |
| GET    | `/stats/admin/new-users-daily`       | ✅ Admin      | Daily new user signups   |
| GET    | `/stats/instructor/overview`         | ✅ Instructor | Instructor overview      |
| GET    | `/stats/instructor/revenue-by-month` | ✅ Instructor | Instructor monthly rev   |
| GET    | `/stats/instructor/top-courses`      | ✅ Instructor | Instructor top courses   |
| GET    | `/stats/instructor/recent-orders`    | ✅ Instructor | Instructor recent orders |
| GET    | `/stats/instructor/course/:courseId` | ✅ Instructor | Single course stats      |

### 🏥 Health Check

| Method | Endpoint  | Auth | Description          |
| ------ | --------- | ---- | -------------------- |
| GET    | `/health` | ❌   | Server health status |

---

## 🔒 Authentication & Authorization

### JWT Token Flow

```
POST /auth/login → { accessToken, refreshToken }
Authorization: Bearer <accessToken>
POST /auth/refresh → { accessToken } (when expired)
```

### Roles & Permissions

| Role           | Permissions                                                              |
| -------------- | ------------------------------------------------------------------------ |
| **User**       | Browse courses, purchase, review, discuss, take quizzes, chat, wishlist  |
| **Instructor** | All User permissions + CRUD courses/lessons/quizzes, reply reviews, chat |
| **Admin**      | All permissions + manage users, categories, pricing, coupons, promotions |

---

## 📤 File Uploads

| Type             | Endpoint                  | Format             | Max Size |
| ---------------- | ------------------------- | ------------------ | -------- |
| Avatar           | PUT `/users/me`           | WebP (auto)        | 5MB      |
| Category Icon    | POST `/categories`        | WebP 128×128       | 2MB      |
| Course Thumbnail | POST/PUT `/courses`       | WebP 800×450       | 200MB\*  |
| Course Demo      | POST/PUT `/courses`       | Original format    | 200MB    |
| Lesson Video     | POST/PUT `/lessons`       | Original format    | 500MB    |
| Materials        | POST `/materials`         | PDF, DOC, PPT, ZIP | 50MB     |
| Quiz Images      | POST `.../questions/bulk` | WebP 800px         | 5MB/img  |
| Chat Images      | POST `.../images`         | WebP 800px         | 5MB      |

All images are automatically converted to **WebP** and resized using **Sharp**.

---

## � Real-time Features

Socket.IO is used for:

- **Chat**: real-time message delivery between users and instructors
- **Typing indicators**: shows when the other person is typing
- **Notifications**: new message alerts

Socket events:

```
join_conversation  → join a chat room
leave_conversation → leave a chat room
send_message       → send a text message
typing             → typing indicator
new_message        → receive new message (server → client)
```

---

## 🐳 Docker

```bash
# Start all services
docker compose up -d

# Start specific services
docker compose up -d backend admin

# Rebuild after code changes
docker compose up -d --build

# View logs
docker compose logs -f backend

# Stop all
docker compose down
```

| Service      | Port | Description          |
| ------------ | ---- | -------------------- |
| mysql        | 3306 | MySQL 8.0            |
| backend      | 3000 | Node.js API server   |
| admin        | 5173 | Admin dashboard      |
| instructor   | 5174 | Instructor dashboard |
| mobile (web) | 5175 | Mobile web version   |

---

## 📜 Scripts

```bash
# Development
npm run dev              # Start dev server (hot reload)
npm run build            # Compile TypeScript
npm start                # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix lint errors

# Database
npm run db:migrate           # Run pending migrations
npm run db:migrate:undo      # Undo last migration
npm run db:migrate:undo:all  # Undo all migrations
npm run db:seed              # Run seeders
npm run db:seed:undo         # Undo seeders

# PM2 (Production)
npm run pm2:start        # Start in cluster mode
npm run pm2:dev          # Start single instance
npm run pm2:stop         # Stop
npm run pm2:restart      # Restart
npm run pm2:logs         # View logs
npm run pm2:status       # Check status
```

---

## 📊 Swagger API Documentation

After starting the server, visit:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **JSON Spec**: `http://localhost:3000/api-docs.json`

---

## 📝 License

MIT
#
