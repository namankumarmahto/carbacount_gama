Perfect 👍
I will now write this in **clear instruction format** so you can directly send it to your developer.

You can copy-paste this.

---

# 📌 Project Requirement – Carbon Accounting Platform

## 🎯 Objective

Build a backend system where:

1. Industry can create an account
2. User can login
3. User can enter emission data
4. That data automatically appears in their dashboard
5. Each industry sees only its own data

System must be scalable and SaaS-ready.

---

# 🏗️ 1️⃣ Architecture Requirements

Follow:

* Clean Architecture
* Modular Monolith
* Backend separate from UI
* PostgreSQL database
* JWT Authentication
* UUID as primary keys
* Timestamp-based data storage

---

# 🗄️ 2️⃣ Database Structure

Create these tables:

### industry

* id (UUID, PK)
* name
* created_at

---

### user

* id (UUID, PK)
* industry_id (FK)
* name
* email (unique)
* password (BCrypt encrypted)
* role (INDUSTRY_ADMIN / INDUSTRY_USER)
* created_at

---

### plant

* id (UUID, PK)
* industry_id (FK)
* name
* location

---

### emission_record

* id (UUID, PK)
* plant_id (FK)
* industry_id (FK)
* scope1
* scope2
* scope3
* total_emission
* recorded_at (TIMESTAMP)
* created_at

Important:

* Add index on industry_id
* Add index on recorded_at

---

# 🔐 3️⃣ Authentication System

## Registration API

POST `/api/auth/register`

When user registers:

* Create Industry
* Create User
* Encrypt password
* Assign INDUSTRY_ADMIN role

---

## Login API

POST `/api/auth/login`

Return:

* JWT token

All other APIs must require:

Authorization: Bearer TOKEN

---

# 🏭 4️⃣ Data Input API

POST `/api/emissions`

Requirements:

* Extract industry_id from JWT
* Validate plant belongs to that industry
* Calculate total_emission = scope1 + scope2 + scope3
* Save record with timestamp

No industry_id should be taken from request body.

Always derive from logged-in user.

---

# 📊 5️⃣ Dashboard API

GET `/api/dashboard`

Requirements:

* Extract industry_id from JWT
* Aggregate:

  * Total emission
  * Scope-wise breakdown
  * Monthly trend
* Return JSON response

Dashboard must show only that industry’s data.

---

# 🔒 6️⃣ Security Rules

* No cross-industry access
* Every DB query must filter by industry_id
* No hardcoded credentials
* Use production profile configuration
* Do not expose DB publicly

---

# ⚙️ 7️⃣ Technical Requirements

* Use Flyway for DB migration
* Use Docker for local setup
* Create application-dev.yml
* Create application-prod.yml
* Add Spring Actuator
* Proper logging configuration

---

# 🧠 8️⃣ Future-Ready Design

Structure code into:

* core (business logic)
* application (use cases)
* infrastructure (database, security)
* interfaces (controllers)

Do not mix:

* Controller logic in service
* Business logic in entity
* DB logic in controller

---

# 🧪 9️⃣ Testing Requirement

Test with:

* Two different industries
* Two different users
* Ensure data isolation works
* Verify dashboard updates after input

---

# 🚀 10️⃣ Final Outcome Expected

After completion:

✔ Industry can register
✔ Industry can login
✔ Industry can add emission data
✔ Dashboard shows aggregated results
✔ System is multi-industry ready
✔ Real-time upgrade possible in future


