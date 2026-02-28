Excellent 🔥
Now you’re thinking like a real carbon accounting platform.

You want:

1. ✅ Industry selection (Steel, Cement, etc.)
2. ✅ Scope-wise emission category selection
3. ✅ Categories differ per industry
4. ✅ If category not available → manual entry allowed
5. ✅ Everything stored under that logged-in industry

I’ll write this in clear developer instruction format so you can directly tell him what to build.

---

# 🎯 FEATURE UPGRADE – INDUSTRY & SCOPE-BASED EMISSION CATEGORIES

---

# 🏗️ 1️⃣ DATABASE CHANGES (VERY IMPORTANT)

We need to normalize emission categories.

---

## ✅ A. industry_type Table

```text
industry_type
--------------
id (UUID, PK)
name (Steel, Cement, Power, etc.)
created_at
```

---

## ✅ B. emission_category Table

Each industry has its own categories per scope.

```text
emission_category
-------------------
id (UUID, PK)
industry_type_id (FK)
scope (SCOPE1 / SCOPE2 / SCOPE3)
category_name
is_custom (boolean)
created_at
```

Example Data:

Steel:

* Scope 1 → Blast Furnace
* Scope 1 → Coke Oven
* Scope 2 → Purchased Electricity
* Scope 3 → Transportation

Cement:

* Scope 1 → Clinker Production
* Scope 2 → Grid Electricity

---

## ✅ C. emission_record Update

Modify existing table:

```text
emission_record
-------------------
id (UUID)
industry_id (FK)
plant_id (FK)
scope (SCOPE1 / SCOPE2 / SCOPE3)
category_id (FK nullable)
custom_category_name (nullable)
emission_value
recorded_at
created_at
```

⚠ Important:

* If category exists → use category_id
* If user writes manually → store custom_category_name
* Set is_custom = true in category table if saved permanently

---

# 🏭 2️⃣ REGISTRATION UPDATE

During registration:

Add:

```text
industry_type_id
```

When user selects:

* Steel
* Cement
* Power
* etc.

Store in industry table.

---

# 🔁 3️⃣ API FLOW CHANGES

---

## ✅ API 1 – Get Industry Types

GET `/api/industry-types`

Returns:

```json
[
  { "id": "1", "name": "Steel" },
  { "id": "2", "name": "Cement" }
]
```

---

## ✅ API 2 – Get Scope Categories

When user selects:

Industry = Steel
Scope = Scope1

Frontend calls:

GET `/api/categories?industryTypeId=UUID&scope=SCOPE1`

Return:

```json
[
  { "id": "c1", "name": "Blast Furnace" },
  { "id": "c2", "name": "Coke Oven" }
]
```

---

# 🧠 4️⃣ FRONTEND LOGIC REQUIREMENT

Modify your form:

### Step 1:

Select Industry Type

### Step 2:

Select Scope

When scope clicked:
→ Fetch categories for that scope

### Step 3:

Select Category OR choose:
☑ "Other"

If Other:
→ Show text input
→ Save manual value

---

# 💾 5️⃣ STORE LOGIC (VERY IMPORTANT)

When saving emission:

Backend must:

1. Extract industry_id from JWT
2. Get industry_type_id from industry table
3. Validate category belongs to that industry type
4. If custom:

   * Store custom_category_name
   * Optionally save as permanent category

---

# 🔒 6️⃣ DATA ISOLATION RULE

All emission_record must store:

```text
industry_id
```

Every dashboard query must filter by:

```sql
WHERE industry_id = logged_in_user_industry_id
```

No exceptions.

---

# 📊 7️⃣ DASHBOARD CHANGE

Dashboard should now:

Aggregate by:

* Scope
* Category
* Time

Example Response:

```json
{
  "totalEmission": 4500,
  "scopeBreakdown": {
    "SCOPE1": 2000,
    "SCOPE2": 1500,
    "SCOPE3": 1000
  },
  "categoryBreakdown": [
    { "name": "Blast Furnace", "value": 1200 },
    { "name": "Coke Oven", "value": 800 }
  ]
}
```

---

# 🧱 8️⃣ FUTURE-READY DESIGN

This allows:

✔ Industry-specific emission logic
✔ Carbon factor mapping per category
✔ AI suggestions per industry
✔ Regulatory compliance rules per sector

---

# 🚀 FINAL TASK LIST FOR YOUR DEVELOPER

Tell him:

1. Create industry_type table
2. Create emission_category table
3. Modify emission_record table
4. Seed default industry types
5. Seed default categories per industry
6. Update registration flow to select industry type
7. Create API to fetch categories by industry + scope
8. Modify emission input API to accept category
9. Allow manual category entry
10. Update dashboard aggregation logic

---

# 🔥 After This Upgrade

Your system becomes:

✔ Industry-aware
✔ Scope-aware
✔ Sector-specific
✔ Customizable
✔ Professional carbon accounting platform



Perfect 👍
I will now write this in **clear, simple, direct instruction format** so you can send it to your developer without confusion.

You can copy-paste this.

---

# 📌 Feature Update – Industry-Based Scope & Category System

## 🎯 Objective

Modify the current system so that:

1. User selects **Industry Type** (Steel, Cement, Power, etc.)
2. Each **Scope (1, 2, 3)** shows industry-specific emission categories
3. If category not available → user can manually add it
4. All data must be stored under that logged-in user’s industry
5. Dashboard must reflect scope-wise and category-wise data

---

# ✅ TASK 1 — Database Changes

## 1️⃣ Create `industry_type` Table

Fields:

* id (UUID, Primary Key)
* name (Steel, Cement, Power, etc.)
* created_at

Seed default values:

* Steel
* Cement
* Power
* Chemical
* Mining

---

## 2️⃣ Update `industry` Table

Add:

* industry_type_id (Foreign Key → industry_type.id)

---

## 3️⃣ Create `emission_category` Table

Fields:

* id (UUID, Primary Key)
* industry_type_id (FK)
* scope (SCOPE1 / SCOPE2 / SCOPE3)
* category_name
* is_custom (boolean)
* created_at

Important:
Each industry type must have its own predefined categories.

Example:

Steel:

* Scope1 → Blast Furnace
* Scope1 → Coke Oven
* Scope2 → Purchased Electricity

Cement:

* Scope1 → Clinker Production
* Scope2 → Grid Electricity

---

## 4️⃣ Modify `emission_record` Table

Replace old structure with:

* id (UUID)
* industry_id (FK)
* plant_id (FK)
* scope
* category_id (nullable FK)
* custom_category_name (nullable)
* emission_value
* recorded_at
* created_at

Rules:

* If predefined category selected → use category_id
* If manual entry → store in custom_category_name

---

# ✅ TASK 2 — Registration Flow Update

Modify registration API:

POST `/api/auth/register`

Add field:

* industryTypeId

When user registers:

* Store industry_type_id in industry table

---

# ✅ TASK 3 — Create New APIs

## API 1 — Get Industry Types

GET `/api/industry-types`

Returns list of available industries.

---

## API 2 — Get Categories by Industry & Scope

GET `/api/categories?industryTypeId=UUID&scope=SCOPE1`

Returns only relevant categories.

---

# ✅ TASK 4 — Update Emission Input API

POST `/api/emissions`

Changes required:

* Do NOT accept industry_id from request
* Extract industry_id from JWT
* Validate category belongs to that industry type
* Save record properly

---

# ✅ TASK 5 — Manual Category Handling

If user selects “Other”:

* Accept custom category name
* Store it in `custom_category_name`
* Optional: save as permanent category for that industry with is_custom=true

---

# ✅ TASK 6 — Dashboard Update

Update dashboard aggregation:

GET `/api/dashboard`

Now dashboard must:

* Aggregate by scope
* Aggregate by category
* Show monthly trend
* Filter strictly by industry_id from JWT

No cross-industry data allowed.

---

# ✅ TASK 7 — Security Rules

Developer must ensure:

* Every query filters by industry_id
* No user can access another industry's data
* Category validation must check industry_type_id

---

# ✅ TASK 8 — Indexing

Add database indexes on:

* industry_id
* recorded_at
* industry_type_id
* scope

For performance.

---

# ✅ TASK 9 — Seed Default Data

Insert:

* Default industry types
* Default categories per industry
* Default scopes

Use Flyway migration for this.

---

# ✅ TASK 10 — Testing Requirements

Developer must test:

1. Create Steel industry account
2. Create Cement industry account
3. Ensure each sees only its own categories
4. Add emission records
5. Confirm dashboard shows correct aggregation
6. Confirm no cross-data access

---

# 🎯 Expected Final Result

After implementation:

✔ User selects industry type
✔ Scope shows relevant emission categories
✔ Manual category option available
✔ All data stored under that industry
✔ Dashboard shows scope + category breakdown
✔ System remains SaaS-ready

---

