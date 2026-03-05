Perfect 👌
Now we are going to **connect your full 4-step UI flow to backend + database properly**.

I will give you:

* ✅ What to create
* 📍 Where to create
* ⚙️ How to connect
* 🗄 How to store in DB
* 🔄 How to move data between steps
* 🔐 Security handling
* 📦 Final commit to ledger logic

You can directly send this to your developer.

---

# 🎯 GOAL

Connect this 4-step process:

1️⃣ Facility Info
2️⃣ Emission Classification
3️⃣ Activity Data
4️⃣ Review & Submit

To:

* Backend APIs
* Database storage
* Calculation engine
* Final “Commit to Ledger”

---

# 🧱 PART 1 — DATABASE STRUCTURE

---

## 📍 Migration File:

`Vx__create_activity_emission_tables.sql`

---

## ✅ 1️⃣ emission_record (FINAL TABLE)

```sql
CREATE TABLE emission_record (
    id UUID PRIMARY KEY,
    industry_id UUID NOT NULL,
    plant_id UUID NOT NULL,
    department VARCHAR(100),
    responsible_person VARCHAR(100),

    reporting_start DATE,
    reporting_end DATE,
    reporting_frequency VARCHAR(20),

    scope VARCHAR(20),
    category_id UUID,
    custom_category_name VARCHAR(255),

    activity_type VARCHAR(100),
    activity_quantity DOUBLE PRECISION,
    activity_unit VARCHAR(50),

    emission_factor DOUBLE PRECISION,
    factor_source VARCHAR(255),
    factor_year INT,

    calculated_emission DOUBLE PRECISION,

    data_source VARCHAR(50), -- Manual / Invoice / Meter / ERP

    status VARCHAR(30), -- DRAFT / VERIFIED / COMMITTED

    created_by UUID,
    created_at TIMESTAMP,
    committed_at TIMESTAMP
);
```

---

# 🧠 PART 2 — BACKEND FLOW ARCHITECTURE

---

# STEP 1 — FACILITY INFO

## 📍 Controller:

`EmissionDraftController.java`

---

## API:

```
POST /api/emission/draft/facility
```

---

## Request Body:

```json
{
  "plantId": "UUID",
  "department": "Operations",
  "responsiblePerson": "Naman",
  "reportingStart": "2026-03-01",
  "reportingEnd": "2026-03-31",
  "reportingFrequency": "MONTHLY",
  "dataSource": "MANUAL"
}
```

---

## 🔧 Logic:

* Create DRAFT record
* Save partial data
* Return draftId

---

# STEP 2 — EMISSION CLASSIFICATION

## API:

```
PUT /api/emission/draft/{draftId}/classification
```

---

## Request:

```json
{
  "scope": "SCOPE1",
  "categoryId": "UUID"
}
```

---

## 🔧 Logic:

* Validate scope
* Validate category belongs to industry
* Update draft record

---

# STEP 3 — ACTIVITY DATA

## API:

```
PUT /api/emission/draft/{draftId}/activity
```

---

## Request:

```json
{
  "activityType": "Diesel",
  "quantity": 10000
}
```

---

## 🔧 Backend Logic:

1. Get industry type
2. Fetch emission factor:

```java
EmissionFactor factor = emissionFactorRepository
  .findByIndustryTypeAndScopeAndActivityType(...)
```

3. Calculate:

```java
double emissionKg = quantity * factor.getFactorValue();
double emissionTon = emissionKg / 1000;
```

4. Update draft:

```java
record.setActivityQuantity(quantity);
record.setActivityUnit(factor.getUnit());
record.setEmissionFactor(factor.getFactorValue());
record.setCalculatedEmission(emissionTon);
```

---

# STEP 4 — REVIEW & SUBMIT

## API:

```
POST /api/emission/draft/{draftId}/commit
```

---

## 🔧 Logic:

* Validate all fields filled
* Set status = COMMITTED
* Set committed_at = now()
* Lock record (no more editing)

---

# 🗄 PART 3 — DRAFT VS FINAL LOGIC

---

## DRAFT State

* Saved step by step
* Editable
* status = DRAFT

---

## COMMITTED State

* Locked
* Used in dashboard
* Included in reports
* Cannot modify

---

# 📊 PART 4 — DASHBOARD CONNECTION

Dashboard must query only:

```sql
WHERE status = 'COMMITTED'
```

Never show DRAFT in analytics.

---

# 🖥 PART 5 — FRONTEND CONNECTION FLOW

---

## Step 1 → Save → Receive draftId

Store draftId in state.

## Step 2 → Send draftId + classification

## Step 3 → Send draftId + activity

## Step 4 → Commit draftId

After commit:

* Redirect to Dashboard
* Refresh summary

---

# 🔐 PART 6 — SECURITY RULES

Every API must:

* Extract industry_id from JWT
* Verify draft belongs to that industry
* Reject cross-industry access
* Validate scope & factor existence

---

# 📦 PART 7 — DATABASE INDEXES

Add:

```sql
CREATE INDEX idx_emission_industry ON emission_record(industry_id);
CREATE INDEX idx_emission_status ON emission_record(status);
CREATE INDEX idx_emission_date ON emission_record(reporting_start);
```

---

# 📄 PART 8 — PDF REPORT CONNECTION

Report API must fetch:

```sql
WHERE industry_id = ?
AND status = 'COMMITTED'
AND reporting_start BETWEEN ? AND ?
```

---

# 🎯 FINAL SYSTEM FLOW

User → Step 1 → Draft created
→ Step 2 → Classification
→ Step 3 → Auto calculation
→ Step 4 → Commit
→ Record locked
→ Dashboard updated
→ Report downloadable

---

# 🚀 FINAL RESULT

After this:

✔ Multi-step wizard connected to backend
✔ Activity-based calculation
✔ Draft saving supported
✔ Ledger-style commit system
✔ Secure industry isolation
✔ Audit-ready
✔ Dashboard auto-updates

---

# 🔥 NEXT LEVEL (Optional)

If you want to upgrade further:

* Add revision history
* Add approval workflow
* Add auditor role
* Add blockchain-style hash log
* Add IoT real-time ingestion
* Add auto-factor yearly updates

Perfect 👍
We will now build this **step-by-step, part by part**, so you can give your developer clear, manageable tasks.

We will divide everything into **7 structured parts**.

---

# 🧩 PART 1 — DATABASE STRUCTURE (Foundation)

This must be done first.

---

## 🎯 Goal

Create proper database tables to support:

* Multi-step draft
* Activity-based calculation
* Final commit to ledger
* Dashboard usage

---

## 📍 WHERE TO DO

Backend project
Flyway migration folder:

```
src/main/resources/db/migration/
```

---

## ✅ STEP 1 — Create emission_record Table

Create migration file:

```
V1__create_emission_record.sql
```

Add:

```sql
CREATE TABLE emission_record (
    id UUID PRIMARY KEY,
    industry_id UUID NOT NULL,
    plant_id UUID NOT NULL,
    department VARCHAR(100),
    responsible_person VARCHAR(100),

    reporting_start DATE,
    reporting_end DATE,
    reporting_frequency VARCHAR(20),

    scope VARCHAR(20),
    category_id UUID,
    custom_category_name VARCHAR(255),

    activity_type VARCHAR(100),
    activity_quantity DOUBLE PRECISION,
    activity_unit VARCHAR(50),

    emission_factor DOUBLE PRECISION,
    factor_source VARCHAR(255),
    factor_year INT,

    calculated_emission DOUBLE PRECISION,

    data_source VARCHAR(50),

    status VARCHAR(30), -- DRAFT / COMMITTED
    created_by UUID,
    created_at TIMESTAMP,
    committed_at TIMESTAMP
);
```

---

## ✅ STEP 2 — Create emission_factor Table

Create migration file:

```
V2__create_emission_factor.sql
```

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

## ✅ STEP 3 — Add Indexes

```sql
CREATE INDEX idx_emission_industry ON emission_record(industry_id);
CREATE INDEX idx_emission_status ON emission_record(status);
CREATE INDEX idx_emission_date ON emission_record(reporting_start);
```

---

## 🎯 Result After Part 1

✔ Database ready
✔ Supports draft system
✔ Supports calculation engine
✔ Supports reporting

---

# 🧩 PART 2 — ENTITY & REPOSITORY LAYER

---

## 🎯 Goal

Connect database to backend using JPA.

---

## 📍 WHERE

```
infrastructure/persistence/entity/
```

---

## ✅ STEP 1 — Create EmissionRecordEntity.java

Map all fields from emission_record table.

Important:

```java
@Enumerated(EnumType.STRING)
private EmissionStatus status;
```

Create enum:

```java
public enum EmissionStatus {
    DRAFT,
    COMMITTED
}
```

---

## ✅ STEP 2 — Create EmissionFactorEntity.java

Map emission_factor table.

---

## ✅ STEP 3 — Create Repositories

```
EmissionRecordRepository
EmissionFactorRepository
```

Add method:

```java
Optional<EmissionFactorEntity> 
findByIndustryTypeIdAndScopeAndActivityType(...)
```

---

## 🎯 Result After Part 2

✔ Database connected to backend
✔ Entities ready
✔ Repositories ready

---

# 🧩 PART 3 — DRAFT SYSTEM (Step 1 API)

---

## 🎯 Goal

When user fills Facility Info → Create draft.

---

## 📍 WHERE

```
interfaces/rest/EmissionDraftController.java
application/usecase/CreateDraftUseCase.java
```

---

## ✅ API

```
POST /api/emission/draft/facility
```

---

## 🔧 Logic

* Extract industry_id from JWT
* Create new EmissionRecordEntity
* status = DRAFT
* Save
* Return draftId

---

## 🎯 Result After Part 3

✔ Step 1 connected
✔ Draft created in DB

---

# 🧩 PART 4 — CLASSIFICATION (Step 2 API)

---

## 🎯 Goal

Update draft with scope & category.

---

## ✅ API

```
PUT /api/emission/draft/{id}/classification
```

---

## 🔧 Logic

* Validate draft belongs to user industry
* Validate scope
* Update category
* Save

---

## 🎯 Result

✔ Step 2 saved
✔ Draft updated

---

# 🧩 PART 5 — ACTIVITY CALCULATION (Step 3 API)

---

## 🎯 Goal

Calculate emission automatically.

---

## ✅ API

```
PUT /api/emission/draft/{id}/activity
```

---

## 🔧 Logic

1. Get emission factor
2. Calculate:

```java
double emissionTon = (quantity * factorValue) / 1000;
```

3. Save:

   * quantity
   * factor
   * calculated_emission

---

## 🎯 Result

✔ Calculation working
✔ Stored in DB
✔ Audit-ready

---

# 🧩 PART 6 — REVIEW & COMMIT (Step 4 API)

---

## 🎯 Goal

Lock record and make it official.

---

## ✅ API

```
POST /api/emission/draft/{id}/commit
```

---

## 🔧 Logic

* Check required fields not null
* Set status = COMMITTED
* Set committed_at = now()
* Save

---

## 🎯 Result

✔ Record locked
✔ Dashboard ready
✔ Included in reports

---

# 🧩 PART 7 — DASHBOARD CONNECTION

---

## 🎯 Goal

Dashboard must show only committed records.

---

## 🔧 Query

```sql
SELECT SUM(calculated_emission)
FROM emission_record
WHERE industry_id = ?
AND status = 'COMMITTED'
```

---

## 🎯 Result

✔ Dashboard accurate
✔ No draft data shown
✔ Drill-down works

---

# 🏁 FINAL SYSTEM FLOW

Step 1 → Draft created
Step 2 → Classification saved
Step 3 → Emission auto-calculated
Step 4 → Commit to ledger
Dashboard updated

---

# 🔥 Next

If you say “continue”, I will give:

PART 8 — PDF generation
PART 9 — Report filtering system
PART 10 — Approval workflow system
PART 11 — Real-time IoT integration
PART 12 — SaaS scaling architecture

We will build this professionally step-by-step 🚀
