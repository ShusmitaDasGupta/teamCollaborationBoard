# 🚀 Team Collaboration Board

A full-stack Kanban-style team collaboration application built with **React.js**, **Node.js/Express**, and **MongoDB**. Supports real-time task management, role-based access control, and a complete admin panel.

![CI/CD](https://github.com/ShusmitaDasGupta/teamCollaborationBoard/actions/workflows/ci-cd.yml/badge.svg)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Authentication & Authorisation](#authentication--authorisation)
- [CRUD Operations](#crud-operations)
- [GitHub Branching Strategy](#github-branching-strategy)
- [CI/CD Pipeline](#cicd-pipeline)

---

## ✨ Features

### User Panel
- 🔐 Register / Login with JWT authentication
- 📋 Create, view, update, and delete **Boards**
- ✅ Create, view, update, and delete **Tasks** within boards
- 🗂️ Kanban view with drag-and-drop between columns (To Do → In Progress → Review → Done)
- 🎨 Colour-coded boards and priority labels
- 📅 Due dates, tags, and assignee support
- 👤 Profile management

### Admin Panel
- 👥 View, promote/demote, activate/deactivate, and delete **Users**
- 📋 View and delete all **Boards** across the platform
- ✅ View and delete all **Tasks** across the platform
- 📊 Dashboard stats: user count, board count, task counts by status

---

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router v6, Axios  |
| Backend    | Node.js, Express 4                |
| Database   | MongoDB, Mongoose 7               |
| Auth       | JWT (jsonwebtoken), bcryptjs      |
| Validation | express-validator                 |
| Testing    | Jest, Supertest (backend); React Testing Library (frontend) |
| CI/CD      | GitHub Actions                    |

---

## 📁 Project Structure

```
teamCollaborationBoard/
├── .github/
│   └── workflows/
│       ├── ci-cd.yml          # Main CI/CD pipeline
│       └── pr-checks.yml      # Pull request validation
│
├── backend/
│   ├── __tests__/             # Jest test files
│   ├── controllers/           # Route handler logic
│   │   ├── authController.js
│   │   ├── boardController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js            # JWT protect + adminOnly middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Board.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── boards.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── .env.example
│   ├── jest.config.json
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── boards/        # BoardModal
│   │   │   ├── layout/        # Sidebar + Topbar Layout
│   │   │   └── tasks/         # TaskCard, TaskModal
│   │   ├── context/
│   │   │   └── AuthContext.js # Global auth state
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── BoardPage.js   # Kanban view
│   │   │   ├── AdminPage.js
│   │   │   └── ProfilePage.js
│   │   ├── utils/
│   │   │   └── api.js         # Axios instance with interceptors
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── .gitignore
├── package.json               # Root workspace scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))
- npm v9+

### 1. Clone the repository

```bash
git clone https://github.com/ShusmitaDasGupta/teamCollaborationBoard.git
cd teamCollaborationBoard
```

### 2. Install all dependencies

```bash
npm run install:all
```

Or install individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your values (see [Environment Variables](#environment-variables)).

### 4. Run the development servers

**Run both together (from root):**
```bash
npm run dev
```

**Or run separately:**
```bash
# Terminal 1 – Backend
cd backend && npm run dev

# Terminal 2 – Frontend
cd frontend && npm start
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 5. Create the first admin account

Register the **first** user via the app — it is automatically assigned the `admin` role. All subsequent registrations default to `user`.

---

## 🔧 Environment Variables

Create a `backend/.env` file using `backend/.env.example` as a template:

| Variable       | Description                              | Example                                         |
|----------------|------------------------------------------|-------------------------------------------------|
| `PORT`         | Express server port                      | `5000`                                          |
| `MONGODB_URI`  | MongoDB connection string                | `mongodb://localhost:27017/teamCollaborationBoard` |
| `JWT_SECRET`   | Secret key for signing JWTs             | `change_this_to_a_long_random_string`           |
| `JWT_EXPIRE`   | JWT expiry duration                      | `7d`                                            |
| `FRONTEND_URL` | Allowed CORS origin                      | `http://localhost:3000`                         |
| `NODE_ENV`     | Runtime environment                      | `development` / `production`                    |

---

## 📡 API Documentation

### Auth Routes — `/api/auth`

| Method | Endpoint     | Auth | Description              |
|--------|--------------|------|--------------------------|
| POST   | `/register`  | ❌   | Register a new user      |
| POST   | `/login`     | ❌   | Login and receive a token |
| GET    | `/me`        | ✅   | Get current user profile |
| PUT    | `/me`        | ✅   | Update own profile       |

### Board Routes — `/api/boards`

| Method | Endpoint               | Auth  | Description                   |
|--------|------------------------|-------|-------------------------------|
| GET    | `/`                    | ✅    | Get own/member boards         |
| GET    | `/all`                 | Admin | Get all boards (admin)        |
| GET    | `/:id`                 | ✅    | Get single board              |
| POST   | `/`                    | ✅    | Create a board                |
| PUT    | `/:id`                 | ✅    | Update board (owner/admin)    |
| DELETE | `/:id`                 | ✅    | Delete board + tasks          |
| POST   | `/:id/members`         | ✅    | Add member to board           |
| DELETE | `/:id/members/:userId` | ✅    | Remove member from board      |

### Task Routes — `/api/tasks`

| Method | Endpoint            | Auth  | Description                  |
|--------|---------------------|-------|------------------------------|
| GET    | `/board/:boardId`   | ✅    | Get tasks for a board        |
| GET    | `/`                 | Admin | Get all tasks (admin)        |
| GET    | `/:id`              | ✅    | Get single task              |
| POST   | `/`                 | ✅    | Create a task                |
| PUT    | `/:id`              | ✅    | Update a task                |
| DELETE | `/:id`             | ✅    | Delete a task                |
| PATCH  | `/:id/status`       | ✅    | Quick status update (kanban) |

### User Routes — `/api/users` *(Admin only)*

| Method | Endpoint   | Description                   |
|--------|------------|-------------------------------|
| GET    | `/`        | List all users                |
| GET    | `/stats`   | Dashboard stats               |
| GET    | `/:id`     | Get user by ID                |
| PUT    | `/:id`     | Update user (role, active)    |
| DELETE | `/:id`     | Delete user                   |

---

## 🔐 Authentication & Authorisation

### Authentication Flow

1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Server validates credentials, hashes passwords with **bcryptjs** (12 salt rounds)
3. A signed **JWT** is returned to the client
4. The frontend stores the token in `localStorage` and attaches it to every request via an Axios interceptor as `Authorization: Bearer <token>`
5. The `protect` middleware on the backend verifies the token on every protected route

### Authorisation Levels

| Role    | Permissions                                                      |
|---------|------------------------------------------------------------------|
| `user`  | Own boards (full CRUD), tasks on accessible boards (full CRUD), own profile |
| `admin` | All of the above + all users, all boards, all tasks, admin panel |

- **First registered user** is automatically promoted to `admin`
- Admins can toggle other users' roles and active status
- Board owners can add/remove members; only owners or admins can delete boards

---

## ✅ CRUD Operations

This project implements **two primary CRUD resources**:

### 1. Boards
| Operation | Frontend Action          | API Call               |
|-----------|--------------------------|------------------------|
| Create    | "+ New Board" button     | `POST /api/boards`     |
| Read      | Dashboard grid / board page | `GET /api/boards` / `GET /api/boards/:id` |
| Update    | ✏️ Edit board modal      | `PUT /api/boards/:id`  |
| Delete    | 🗑️ Delete board          | `DELETE /api/boards/:id` |

### 2. Tasks
| Operation | Frontend Action               | API Call                          |
|-----------|-------------------------------|-----------------------------------|
| Create    | "+ Add Task" / column "+" btn | `POST /api/tasks`                 |
| Read      | Kanban columns on board page  | `GET /api/tasks/board/:boardId`   |
| Update    | Click task → edit modal       | `PUT /api/tasks/:id`              |
| Delete    | × button on task card         | `DELETE /api/tasks/:id`           |
| Status    | Drag-and-drop between columns | `PATCH /api/tasks/:id/status`     |

---

## 🌿 GitHub Branching Strategy

This project follows a **Git Flow**-inspired branching model:

```
main          ← Production-ready code only. Protected branch.
  └── develop ← Integration branch. All features merge here first.
        ├── feature/user-auth
        ├── feature/kanban-board
        ├── fix/task-drag-drop
        └── chore/update-readme
```

### Branch Naming Convention

| Type      | Pattern                        | Example                          |
|-----------|--------------------------------|----------------------------------|
| Feature   | `feature/<short-description>`  | `feature/board-members`          |
| Bug fix   | `fix/<short-description>`      | `fix/jwt-expiry-handling`        |
| Hotfix    | `hotfix/<short-description>`   | `hotfix/login-crash`             |
| Release   | `release/<version>`            | `release/1.2.0`                  |
| Chore     | `chore/<short-description>`    | `chore/upgrade-dependencies`     |
| Docs      | `docs/<short-description>`     | `docs/api-reference`             |

### Commit Message Convention (Conventional Commits)

```
type(scope): short description

feat(auth):    add JWT refresh token support
fix(tasks):    resolve drag-drop on mobile Safari
docs(readme):  update environment variables section
chore(deps):   upgrade mongoose to v7.3
test(boards):  add unit tests for board controller
refactor(api): extract error handling middleware
```

### Pull Request Rules

- All PRs must target `develop` (never directly to `main`)
- PRs to `main` only from `develop` or `hotfix/` branches
- PR title must follow Conventional Commits format (enforced by CI)
- At least 1 approving review required before merge
- CI checks (tests + build) must pass before merge

---

## ⚙️ CI/CD Pipeline

The pipeline is defined in `.github/workflows/ci-cd.yml` and runs on every push and PR.

### Pipeline Stages

```
Push / PR
    │
    ├── backend-test    → Install deps → Run Jest tests (with MongoDB service)
    ├── frontend-test   → Install deps → Run React tests → npm build
    └── lint            → npm audit (security check)
          │
          ├── [develop branch] → deploy-staging
          └── [main branch]    → deploy-production
```

### Workflow Jobs

| Job                | Trigger              | Steps                                              |
|--------------------|----------------------|----------------------------------------------------|
| `backend-test`     | Push / PR            | Spins up MongoDB service, runs Jest                |
| `frontend-test`    | Push / PR            | Runs React tests, builds production bundle          |
| `lint`             | Push / PR            | `npm audit` on both backend and frontend           |
| `deploy-staging`   | Push to `develop`    | Deploys to staging environment                     |
| `deploy-production`| Push to `main`       | Deploys to production (after all checks pass)      |

### Setting Up Deployment

To activate the deploy jobs, add your secrets to **GitHub → Settings → Secrets**:

| Secret Name                     | Used for                      |
|---------------------------------|-------------------------------|
| `RENDER_DEPLOY_HOOK_STAGING`    | Render staging webhook URL    |
| `RENDER_DEPLOY_HOOK_PRODUCTION` | Render production webhook URL |
| `RAILWAY_TOKEN`                 | Railway CLI deploy token      |
| `VERCEL_TOKEN`                  | Vercel CLI deploy token       |
| `MONGODB_URI`                   | Production MongoDB Atlas URI  |
| `JWT_SECRET`                    | Production JWT secret         |

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm test

# Backend tests with coverage
npm test -- --coverage

# Frontend tests
cd frontend
npm test -- --watchAll=false
```

---

## 📸 Application Screenshots

| View           | Description                            |
|----------------|----------------------------------------|
| Login / Register | Clean auth forms with validation     |
| Dashboard      | Board grid with colour-coded cards    |
| Board (Kanban) | 4-column drag-and-drop kanban board   |
| Admin Panel    | Stats overview + user/board/task tables |
| Profile        | Edit name and avatar                  |

---

## 👩‍💻 Author

**Shusmita Das Gupta**  
Assessment 1.2 — IFQ636 Full-Stack CRUD Application Development with DevOps Practices
