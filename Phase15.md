Perfect 👌
Now we are upgrading your platform from a **basic emission logger** to a **real carbon accounting engine (MRV-ready system)**.

I will now tell you **exactly what to do, where to do, and how to do it**, so you can give clear instructions to your developer.

---

# 🚨 IMPORTANT DECISION

You are correct:

❌ Do NOT allow users to manually enter final tCO2e
✅ Allow users to enter Activity Data
✅ System calculates emissions automatically

This makes your platform:

* Audit-friendly
* ESG compliant
* ISO-ready
* Investor-ready

---

# 🎯 WHAT YOU WANT TO BUILD

Upgrade this form:

Currently:

* Plant
* Reporting Period
* Scope
* Category
* Emission Value ❌

Replace with:

* Plant
* Reporting Period
* Scope
* Category
* Activity Type
* Quantity
* Unit
* Emission Factor (auto)
* Calculated Emission (auto)

---

# ✅ STEP 1 — DATABASE CHANGES

---

## 📍 WHERE:

Migration file (Flyway)
Database schema

---

## 🔧 REMOVE FROM TABLE:

Remove:

```
emission_value
```

---

## 🔧 UPDATE emission_record TABLE:

Add these fields:

```sql
activity_type VARCHAR(100),
activity_quantity DOUBLE,
activity_unit VARCHAR(50),
emission_factor DOUBLE,
calculated_emission DOUBLE
```

Keep:

```
scope
category_id
custom_category_name
recorded_at
industry_id
plant_id
```

---

# ✅ STEP 2 — CREATE EMISSION FACTOR TABLE

This is VERY IMPORTANT.

---

## 📍 Create Table: emission_factor

```sql
id UUID PRIMARY KEY,
industry_type_id UUID,
scope VARCHAR(20),
activity_type VARCHAR(100),
unit VARCHAR(50),
factor_value DOUBLE,
factor_unit VARCHAR(50),
source VARCHAR(255),
year INT
```

---

## Example Data

Steel Industry:

| Scope | Activity       | Unit   | Factor |
| ----- | -------------- | ------ | ------ |
| S1    | Diesel         | Liter  | 2.68   |
| S2    | Electricity    | kWh    | 0.82   |
| S3    | Road Transport | ton-km | 0.12   |

---

# ✅ STEP 3 — BACKEND LOGIC (AUTO CALCULATION)

---

## 📍 WHERE:

EmissionService.java

---

## 🔧 WHAT TO DO:

When user submits:

1. Fetch emission factor from DB
2. Calculate emission
3. Save all data

---

## 🔧 HOW TO DO:

```java
double quantity = request.getQuantity();
double factor = emissionFactor.getFactorValue();

double emissionKg = quantity * factor;
double emissionTon = emissionKg / 1000;

record.setActivityQuantity(quantity);
record.setEmissionFactor(factor);
record.setCalculatedEmission(emissionTon);
```

Never accept emission value from frontend.

---

# ✅ STEP 4 — UPDATE API REQUEST STRUCTURE

---

## OLD Request:

```json
{
  "scope": "SCOPE1",
  "categoryId": "UUID",
  "emissionValue": 100
}
```

---

## NEW Request:

```json
{
  "scope": "SCOPE1",
  "categoryId": "UUID",
  "activityType": "Diesel",
  "quantity": 10000
}
```

Backend must:

* Fetch factor automatically
* Calculate emission
* Return calculated value

---

# ✅ STEP 5 — FRONTEND CHANGES

---

## 📍 WHERE:

Manual Data Ingestion Form

---

## 🔧 WHAT TO CHANGE:

Remove:

```
Emission Value input
```

Add:

1. Activity Type (Dropdown)
2. Quantity (Number Input)
3. Unit (Auto-display)
4. Emission Factor (Read-only)
5. Calculated Emission (Read-only)

---

## 🔧 FLOW:

When user selects:

Scope → Category → Activity Type

Frontend calls:

```
GET /api/emission-factor?activityType=Diesel&scope=SCOPE1
```

Backend returns:

```json
{
  "factor": 2.68,
  "unit": "Liter"
}
```

Frontend auto-fills:

* Unit
* Factor

When user types quantity:

Auto-calculate:

```
quantity × factor ÷ 1000
```

Display calculated emission live.

---

# ✅ STEP 6 — STORE COMPLETE AUDIT DATA

Each emission record must store:

* Quantity
* Unit
* Emission Factor
* Source
* Year
* Calculated emission
* Timestamp
* User ID

This allows:

✔ Recalculation
✔ Audit trail
✔ Regulatory verification

---

# ✅ STEP 7 — DASHBOARD CHANGES

Dashboard aggregation must now use:

```
SUM(calculated_emission)
```

Instead of manual emission_value.

---

# ✅ STEP 8 — PDF REPORT UPDATE

PDF must now show:

| Activity | Quantity | Unit | Factor | Emission |
| -------- | -------- | ---- | ------ | -------- |

This improves transparency.

---

# 🔒 IMPORTANT SECURITY RULE

Backend must:

* Validate activity type exists
* Validate factor exists
* Reject manual emission override
* Log calculation version

---

# 🎯 FINAL RESULT

After this upgrade:

✔ No manual tCO2e entry
✔ Activity-based calculation
✔ Transparent emission factor
✔ Industry-specific factors
✔ Audit-ready
✔ Compliance-ready
✔ Investor-grade

---

# 🚀 STRATEGIC NEXT STEP

After this, you can:

* Add versioned emission factors
* Add government factor import
* Add real-time IoT fuel meter integration
* Add carbon credit estimation
* Add compliance mapping (GHG Protocol)

Perfect.
Now I will give you a **very detailed execution document** that you can directly send to your developer.

This will clearly explain:

* ✅ What to do
* 📍 Where to do it
* ⚙️ How to implement it
* 🗄 Database structure
* 🧠 Backend logic
* 🖥 Frontend changes
* 🔒 Security rules

---

# 🎯 PROJECT UPGRADE: ACTIVITY-BASED CARBON CALCULATION SYSTEM

## 🚨 Goal

Replace manual emission entry with:

> Activity Data → Emission Factor → Automatic Calculation → Stored with full audit trail.

System must be:

* GHG Protocol aligned
* Audit-friendly
* Industry-specific
* Scalable
* Secure

---

# 🧱 PART 1 — DATABASE CHANGES

---

## 📍 WHERE:

Flyway migration file
`Vx__update_emission_structure.sql`

---

## ✅ 1️⃣ Update `emission_record` Table

### Remove:

```sql
emission_value
```

---

### Add:

```sql
activity_type VARCHAR(100),
activity_quantity DOUBLE PRECISION,
activity_unit VARCHAR(50),
emission_factor DOUBLE PRECISION,
factor_source VARCHAR(255),
factor_year INT,
calculated_emission DOUBLE PRECISION
```

Keep existing:

```sql
scope
category_id
custom_category_name
industry_id
plant_id
recorded_at
created_at
```

---

## ✅ 2️⃣ Create `emission_factor` Table

📍 New migration file
`Vx__create_emission_factor.sql`

```sql
CREATE TABLE emission_factor (
    id UUID PRIMARY KEY,
    industry_type_id UUID,
    scope VARCHAR(20),
    activity_type VARCHAR(100),
    unit VARCHAR(50),
    factor_value DOUBLE PRECISION,
    factor_unit VARCHAR(50),
    source VARCHAR(255),
    year INT,
    created_at TIMESTAMP
);
```

---

## Example Data

Insert seed values:

Steel Industry:

| Scope  | Activity       | Unit   | Factor |
| ------ | -------------- | ------ | ------ |
| SCOPE1 | Diesel         | Liter  | 2.68   |
| SCOPE2 | Electricity    | kWh    | 0.82   |
| SCOPE3 | Road Transport | ton-km | 0.12   |

---

# 🧠 PART 2 — BACKEND IMPLEMENTATION

---

## 📍 WHERE:

`EmissionController.java`
`EmissionService.java`
`EmissionFactorRepository.java`

---

# ✅ STEP 1 — Create EmissionFactorRepository

Create:

```java
Optional<EmissionFactor> findByIndustryTypeAndScopeAndActivityType(...)
```

Query must filter by:

* industry_type_id
* scope
* activity_type

---

# ✅ STEP 2 — Modify Emission Request DTO

Old DTO:

```java
Double emissionValue;
```

Remove it.

---

New DTO:

```java
String scope;
UUID categoryId;
String activityType;
Double quantity;
```

Do NOT accept emission value from frontend.

---

# ✅ STEP 3 — Calculation Logic

📍 In `EmissionService.java`

```java
EmissionFactor factor = emissionFactorRepository
    .findByIndustryTypeAndScopeAndActivityType(industryTypeId, scope, activityType)
    .orElseThrow(() -> new RuntimeException("Emission factor not found"));

double emissionKg = request.getQuantity() * factor.getFactorValue();
double emissionTon = emissionKg / 1000;
```

Then:

```java
record.setActivityQuantity(request.getQuantity());
record.setActivityUnit(factor.getUnit());
record.setEmissionFactor(factor.getFactorValue());
record.setFactorSource(factor.getSource());
record.setFactorYear(factor.getYear());
record.setCalculatedEmission(emissionTon);
```

Save record.

---

# 🔒 IMPORTANT

Never calculate on frontend as final truth.
Frontend can preview — but backend must recalculate before saving.

---

# 🖥 PART 3 — FRONTEND CHANGES

---

## 📍 WHERE:

Manual Data Ingestion Form

---

# ❌ Remove Field

Remove:

"Emission Value (tCO2e)"

---

# ✅ Add New Section

Under "Emission Classification", add:

### 1️⃣ Activity Type (Dropdown)

Loaded from:

```
GET /api/activity-types?scope=SCOPE1
```

---

### 2️⃣ Quantity (Number Input)

User enters number.

---

### 3️⃣ Unit (Read-only)

Auto-filled based on emission factor.

---

### 4️⃣ Emission Factor (Read-only)

Auto-filled.

---

### 5️⃣ Calculated Emission (Auto)

Live calculation:

```
quantity × factor ÷ 1000
```

Display but not editable.

---

# 🔄 Flow

1. User selects Scope
2. User selects Category
3. User selects Activity Type
4. Frontend calls:

```
GET /api/emission-factor?scope=SCOPE1&activityType=Diesel
```

5. Backend returns:

```json
{
  "factor": 2.68,
  "unit": "Liter",
  "source": "IPCC 2023",
  "year": 2023
}
```

6. User enters quantity
7. Emission auto-calculated

---

# 📊 PART 4 — DASHBOARD UPDATE

---

## 📍 WHERE:

`DashboardService.java`

---

Replace:

```sql
SUM(emission_value)
```

With:

```sql
SUM(calculated_emission)
```

Everything in dashboard must now use calculated_emission.

---

# 📄 PART 5 — PDF REPORT UPDATE

---

In report table include:

| Scope | Activity | Quantity | Unit | Factor | Emission |

Example row:

| SCOPE1 | Diesel | 10000 | Liter | 2.68 | 26.8 tCO2e |

This makes report:

✔ Transparent
✔ Verifiable
✔ Professional

---

# 🧪 PART 6 — VALIDATION RULES

Developer must enforce:

* Quantity > 0
* Emission factor must exist
* Scope must match activity
* Industry type must match factor
* No manual emission override

---

# 🔍 PART 7 — TESTING REQUIREMENTS

Developer must test:

1. Create Steel Industry
2. Add Diesel activity
3. Check calculation matches formula
4. Verify record saved correctly
5. Verify dashboard shows correct aggregation
6. Verify PDF contains activity breakdown
7. Try invalid activity → must reject

---

# 🚀 FINAL EXPECTED RESULT

After implementation:

✔ Users enter activity data only
✔ System calculates emissions
✔ Emission factors stored and versioned
✔ Dashboard uses calculated values
✔ PDF shows detailed breakdown
✔ Full audit trail available
✔ System ready for ESG reporting

---

# 📈 STRATEGIC ADVANTAGE

After this upgrade your system becomes:

* MRV-ready
* GHG Protocol aligned
* ISO 14064 compatible
* Enterprise-grade
* Ready for carbon credit calculation

