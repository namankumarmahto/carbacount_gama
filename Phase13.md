Perfect ✅
Now we are defining **interactive dashboard behavior**.

You want:

> When user clicks Scope 1 / Scope 2 / Scope 3
> → It should open detailed view
> → Show all emission records under that scope
> → Only for logged-in industry

I will write this in **clear developer instruction format**.

---

# 📌 Feature: Clickable Scope Sections in Environmental Dashboard

## 🎯 Objective

In Dashboard:

* Scope 1 card → Click → Show all Scope 1 records
* Scope 2 card → Click → Show all Scope 2 records
* Scope 3 card → Click → Show all Scope 3 records

Data must:

* Be filtered by logged-in industry
* Be filterable by date range
* Show category breakdown

---

# ✅ TASK 1 — Backend API Required

Create new API:

```
GET /api/dashboard/scope/{scope}
```

Where:

* scope = SCOPE1 / SCOPE2 / SCOPE3

---

## Backend Logic Requirements

1. Extract industry_id from JWT
2. Validate scope value
3. Query emission_record table:

   * WHERE industry_id = logged_in_industry
   * AND scope = requested_scope
4. Order by recorded_at DESC
5. Return structured response

---

# ✅ TASK 2 — Response Format

Return structured data like:

```json
{
  "scope": "SCOPE1",
  "totalEmission": 2100,
  "records": [
    {
      "category": "Blast Furnace",
      "value": 500,
      "recordedAt": "2026-02-28T10:30:00"
    },
    {
      "category": "Coke Oven",
      "value": 300,
      "recordedAt": "2026-02-27T09:15:00"
    }
  ]
}
```

If category_id is null:
Return custom_category_name.

---

# ✅ TASK 3 — Add Date Filter (Recommended)

Enhance API:

```
GET /api/dashboard/scope/{scope}?startDate=2026-01-01&endDate=2026-02-28
```

If not provided:

* Default to current month.

---

# ✅ TASK 4 — Aggregation Required

Besides raw records, also return:

* Total for that scope
* Category-wise total
* Monthly trend for that scope

Example:

```json
{
  "scope": "SCOPE1",
  "totalEmission": 2100,
  "categoryBreakdown": [
    { "name": "Blast Furnace", "total": 1200 },
    { "name": "Coke Oven", "total": 900 }
  ],
  "records": [...]
}
```

---

# ✅ TASK 5 — Database Query Optimization

Developer must:

Add indexes on:

* industry_id
* scope
* recorded_at

To ensure fast filtering.

---

# ✅ TASK 6 — Frontend Behavior (What Developer Must Do)

In Dashboard:

1. Make Scope cards clickable
2. On click:

   * Call `/api/dashboard/scope/SCOPE1`
3. Show:

   * Detailed list table
   * Category breakdown
   * Total emission

Can show:

* Modal popup
  OR
* Separate detail page

---

# ✅ TASK 7 — Security Rule

Must ensure:

* No industry_id taken from frontend
* Always extract from JWT
* Validate scope enum strictly

---

# ✅ TASK 8 — Optional Advanced Feature

Add:

```
GET /api/dashboard/scope/{scope}/export
```

To download CSV or PDF report.

---

# 🎯 Final Expected Result

When user clicks:

Scope 1 →
✔ Detailed list appears
✔ Category breakdown appears
✔ Monthly trend appears
✔ Only that industry's data visible

Same for Scope 2 & Scope 3.

---

# 🚀 After This

Your dashboard becomes:

✔ Interactive
✔ Drill-down capable
✔ Audit-ready
✔ Compliance-ready
✔ Professional SaaS level

Perfect 👍
I’ll write this in **simple, direct task format** so you can send it to your developer exactly as it is.

---

# 📌 New Requirement – Clickable Scope Sections in Environmental Dashboard

## 🎯 Objective

In the Environmental Dashboard:

* When user clicks **Scope 1**
  → Show all Scope 1 emission records for that industry

* When user clicks **Scope 2**
  → Show all Scope 2 emission records

* When user clicks **Scope 3**
  → Show all Scope 3 emission records

Data must:

* Belong only to logged-in industry
* Be filterable by date
* Show category-wise breakdown
* Show total emission

---

# ✅ TASK 1 — Create Backend API

### Create this endpoint:

GET `/api/dashboard/scope/{scope}`

Where:

* scope = SCOPE1 / SCOPE2 / SCOPE3

---

## 🔹 Backend Logic

Developer must:

1. Extract industry_id from JWT

2. Validate scope enum (only SCOPE1, SCOPE2, SCOPE3 allowed)

3. Query emission_record table:

   WHERE:

   * industry_id = logged-in user industry
   * scope = requested scope

4. Order results by recorded_at DESC

5. Return structured response

---

# ✅ TASK 2 — Response Structure

API should return:

```json
{
  "scope": "SCOPE1",
  "totalEmission": 2100,
  "categoryBreakdown": [
    { "name": "Blast Furnace", "total": 1200 },
    { "name": "Coke Oven", "total": 900 }
  ],
  "records": [
    {
      "category": "Blast Furnace",
      "value": 500,
      "recordedAt": "2026-02-28T10:30:00"
    }
  ]
}
```

Rules:

* If category_id exists → return category_name
* If custom category → return custom_category_name

---

# ✅ TASK 3 — Add Date Filter

Enhance endpoint:

GET `/api/dashboard/scope/{scope}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

If dates not provided:

* Default to current month

Backend must filter using recorded_at.

---

# ✅ TASK 4 — Add Proper Indexes

Developer must ensure database has indexes on:

* industry_id
* scope
* recorded_at

This is required for performance.

---

# ✅ TASK 5 — Update Dashboard UI Behavior

Frontend developer must:

1. Make Scope 1 / 2 / 3 cards clickable
2. On click:

   * Call `/api/dashboard/scope/SCOPE1`
3. Display:

   * Total emission
   * Category breakdown
   * List of records

This can open:

* A modal popup
  OR
* A new detail page

---

# ✅ TASK 6 — Security Rules (Very Important)

Developer must ensure:

* No industry_id taken from frontend
* Always extract industry_id from JWT
* No cross-industry access
* Strict enum validation for scope

---

# ✅ TASK 7 — Testing Requirements

Developer must test:

1. Create Industry A
2. Create Industry B
3. Add emission records to both
4. Login as Industry A
5. Click Scope 1
6. Confirm only Industry A data appears
7. Repeat for Scope 2 & 3

---

# 🎯 Expected Final Result

When user clicks:

Scope 1 →
✔ Shows detailed Scope 1 data
✔ Shows total
✔ Shows category breakdown
✔ Shows record list
✔ Only that industry’s data

Same behavior for Scope 2 and Scope 3.

