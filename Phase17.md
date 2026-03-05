Excellent 🔥
Now I will **modify everything according to your actual CarbaCount GAMA website structure** (based on your 4-step wizard UI).

We will align this to:

1️⃣ Signup (Organization setup)
2️⃣ Data Ingestion (4-step wizard)
3️⃣ Scope-based logic
4️⃣ Industry-driven activity logic
5️⃣ Emission factor auto-fetch
6️⃣ Clean SaaS backend architecture

No generic SaaS theory — only what fits your system.

---

# 🧩 PART 1 — SIGNUP PAGE (CarbaCount Version)

Your system is B2B SaaS for industries.
So signup = Organization Creation.

---

## ✅ Signup Fields (Modified for Your Platform)

### 1️⃣ Organization Info

* Organization Name
* Industry Type (Dropdown)
* Country (Dropdown)
* State / Region (Conditional)
* Primary Contact Name
* Official Email
* Password

---

## 🔹 Industry Type (CarbaCount Optimized)

Store inside: `industry_type` table

Keep:

* Steel
* Cement
* Power
* Oil & Gas
* Chemicals
* Mining
* Textile
* IT / Services
* Construction
* Food Processing
* Others

This will control:

* Activity templates
* Emission factor mapping
* Scope visibility

---

## 🔹 Country → State Logic (For Your System)

If Country = India
Show state dropdown.

Because:

Grid emission factor depends on state.

So your backend must store:

```
organization:
   industry_type_id
   country_id
   state_id
```

This will later help in Scope 2 electricity factor selection.

---

# 🧩 PART 2 — DATA INGESTION WIZARD (Your 4-Step UI)

You already have:

1. Facility Info
2. Emission Classification
3. Activity Data
4. Review & Submit

Now we refine logic for each step.

---

# 🧩 STEP 1 — Facility Info (Your UI Screenshot 1)

## Keep:

* Plant / Facility
* Department
* Responsible Person
* Reporting Period
* Frequency (Monthly / Quarterly / Yearly)
* Data Source (Manual / Invoice / Meter / ERP)

---

## 🔥 Add Smart Logic:

If Frequency = Monthly
Then auto-set reporting period to:

Start: 1st of month
End: Last day of month

Prevent random date mismatch.

---

# 🧩 STEP 2 — Emission Classification (Your Scope Cards)

You have:

* Scope 1
* Scope 2
* Scope 3

Now we make it dynamic.

---

## 🔹 If Industry = Steel

Scope 1 Categories:

* Stationary Combustion
* Process Emissions
* Mobile Combustion

Scope 2:

* Purchased Electricity

Scope 3:

* Raw Material Transport
* Product Distribution
* Business Travel

---

## 🔹 If Industry = IT / Services

Hide:

* Process emissions

Show:

Scope 1:

* Diesel Generator

Scope 2:

* Electricity

Scope 3:

* Business Travel
* Employee Commuting

---

### Backend Logic

When Step 2 loads:

```
GET /api/classification?industryId=123
```

Return only valid scopes + categories.

No hardcoding in frontend.

---

# 🧩 STEP 3 — Activity Data (Your Screenshot 3)

This is the most important part.

---

## 🔹 Activity Type Dropdown (Dynamic)

Based on:

Industry + Scope + Category

Example:

Steel + Scope1 + Stationary Combustion

Return:

* Coal
* Coke
* Diesel
* Furnace Oil
* Natural Gas

---

## 🔥 Fuel → Unit Auto Logic (Your System Version)

Instead of hardcoding in frontend, do this:

Create table:

```
fuel_type:
   id
   name
   default_unit
```

When user selects Diesel:

Frontend calls:

```
GET /api/fuel/123
```

Backend returns:

```
{
   "name": "Diesel",
   "unit": "Liter"
}
```

Unit field becomes auto-filled + disabled.

---

# 🧩 Electricity Logic (Scope 2)

If Scope 2 selected:

Activity Type:

* Grid Electricity
* Solar PPA
* Wind PPA
* Captive Power
* DG Set

Now emission factor logic:

Factor depends on:

Country + State + Year

So backend must:

```
SELECT factor
FROM emission_factor
WHERE country = 'India'
AND state = 'Odisha'
AND year = 2026
AND scope = 'SCOPE2'
```

User never sees this logic.

---

# 🧩 STEP 4 — Review & Submit

In your screenshot:

You show:

* Facility
* Reporting Period
* Classification
* Calculated Footprint
* Audit Ready badge

Now improve:

Show:

Activity Summary Table:

| Activity | Quantity | Unit | Factor | Emission |

Then:

Button → Commit to Ledger

When clicked:

* status = COMMITTED
* Lock record
* Show success message

---

# 🧩 PART 3 — DATABASE MASTER TABLE STRUCTURE (Modified for You)

Create these tables:

---

## industries

* id
* name

---

## countries

* id
* name

---

## states

* id
* country_id
* name

---

## fuel_types

* id
* name
* default_unit

---

## activity_templates

* id
* industry_id
* scope
* category
* fuel_type_id

---

## emission_factor

* id
* industry_id
* scope
* fuel_type_id
* country_id
* state_id
* factor_value
* year

---

Now everything becomes dynamic.

---

# 🔥 FINAL CARBACOUNT LOGIC FLOW

Signup →
Store industry + country + state

↓

Data Ingestion Step 2 →
Load industry-specific classification

↓

Step 3 →
Load activity template

↓

Fuel selected →
Auto unit from DB

↓

Quantity entered →
Backend fetches correct factor

↓

Emission calculated →
Saved with factor version

↓

Commit →
Record locked

↓

Dashboard →
Shows only committed data

---

# 🚀 ENTERPRISE RULES FOR YOUR PLATFORM

✔ Never allow manual unit change
✔ Never allow manual emission override
✔ Always store factor year
✔ Always store factor source
✔ Always isolate industry data
✔ Dashboard must ignore DRAFT

---

# 🎯 Now You Decide

