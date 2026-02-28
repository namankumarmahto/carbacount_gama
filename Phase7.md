Perfect 👍
Now we focus only on **PHASE 7 — Frontend Integration (Professional Level)**.

You want clear instructions so you can tell your developer exactly:

* What to build
* Where to build
* How to connect
* What APIs to use
* What standards to follow

This will be written like a task document you can directly share.

---

# 🚀 PHASE 7 — FRONTEND INTEGRATION (Developer Task Guide)

## 🎯 Objective

Build a separate frontend application that connects to the Carbon Accounting backend and:

* Authenticates users
* Allows emission data entry
* Displays dashboard analytics
* Maintains clean separation from backend

Frontend must be independent repository.

---

# 📁 1️⃣ Create Separate Frontend Project

## Tech Stack (Recommended)

* React (Vite)
* TypeScript
* Axios
* React Router
* Recharts (for graphs)
* Context API or Redux
* Tailwind CSS or Material UI

---

## Command to Start

```bash
npm create vite@latest carbon-frontend
cd carbon-frontend
npm install
npm install axios react-router-dom recharts
```

---

# 📂 2️⃣ Folder Structure (Professional)

```id="2lyzfx"
src/
│
├── api/                # API service layer
│   ├── axiosInstance.ts
│   ├── authApi.ts
│   ├── emissionApi.ts
│   └── dashboardApi.ts
│
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── AddEmissionPage.tsx
│   └── IndustryManagement.tsx
│
├── components/
│   ├── charts/
│   ├── forms/
│   ├── layout/
│   └── common/
│
├── context/
│   └── AuthContext.tsx
│
├── routes/
│   └── AppRoutes.tsx
│
└── types/
```

---

# 🔐 3️⃣ Authentication Integration

## Task 1: Create Login Page

Call backend:

```
POST /api/auth/login
```

Save JWT token in:

* localStorage
* OR secure httpOnly cookie (preferred later)

---

## Task 2: Create Axios Interceptor

In `axiosInstance.ts`:

* Automatically attach JWT token
* Handle 401 errors
* Redirect to login if expired

---

# 📊 4️⃣ Dashboard Integration

## Task 3: Connect Dashboard Page

Call:

```
GET /api/dashboard/{industryId}
```

Display:

* Total Emission
* Scope 1 / 2 / 3
* Monthly Trend Chart
* Carbon Intensity

Use Recharts:

* LineChart (trend)
* PieChart (scope breakdown)

---

# 🏭 5️⃣ Add Emission Page

## Task 4: Create Form

Call:

```
POST /api/emissions
```

Fields:

* Plant ID
* Scope 1
* Scope 2
* Scope 3
* Reporting Timestamp

On success:

* Show notification
* Refresh dashboard

---

# 🧠 6️⃣ Role-Based UI Handling

If role = ADMIN:

* Show industry management page

If role = INDUSTRY:

* Show only their dashboard

If role = AUDITOR:

* Disable editing

---

# 🔄 7️⃣ State Management

Use:

* Context API for Auth
* Local state for forms
* Optional: Redux if scaling

---

# 🧱 8️⃣ Environment Configuration

Create `.env` file:

```id="tdr0s8"
VITE_API_BASE_URL=http://localhost:8080
```

Use in axios baseURL.

This allows changing backend URL later without code change.

---

# 🧪 9️⃣ Testing Requirements

Developer must verify:

✔ Login works
✔ Token persists after refresh
✔ Dashboard loads correctly
✔ Add emission updates DB
✔ Proper error handling
✔ Unauthorized access blocked

---

# 🛡️ 10️⃣ Professional Standards

Developer must:

* Never hardcode URLs
* Never hardcode industryId
* Use types/interfaces
* Use loading states
* Use error boundaries
* Follow component reusability
* Keep API logic separated from UI

---

# 📦 11️⃣ Deployment Preparation

Frontend must be:

* Standalone build
* Configurable API URL
* Docker-ready

Command:

```bash
npm run build
```

---

# 🔥 Final Deliverables from Developer

He should deliver:

1. Working login flow
2. Dashboard with charts
3. Add emission form
4. Role-based UI
5. Clean folder structure
6. Environment config support
7. Production build

---

# 🎯 After Phase 7 Complete

You will have:

Backend → Running locally
Frontend → Running locally
Full system → Working end-to-end

Ready for:

* Real-time upgrade
* SaaS upgrade
* Production deployment

---
