Perfect 🔥
Now your platform is moving toward **professional SaaS level reporting**.

I will write this clearly so you can directly tell your developer what to implement.

---

# 📌 UPDATE REQUIREMENTS – DASHBOARD IMPROVEMENT + PDF REPORT

---

# ✅ 1️⃣ SHOW CATEGORY NAME INSTEAD OF ID

## 🎯 Problem:

Dashboard is showing:

```
4d5d756e-ecbb-40e4-b51c-bd49ad51f28
```

Instead of:

```
Blast Furnace
Coke Oven
Purchased Electricity
```

---

## 🔧 What Developer Must Do

### Backend Fix:

In Scope API response:

Currently:

* Returning category_id

Change to:

* Join emission_record with emission_category
* Return category_name

If custom category:

* Return custom_category_name

---

### Query Logic Example (Concept)

When fetching records:

* LEFT JOIN emission_category ON category_id
* If category_id exists → use category_name
* Else → use custom_category_name

---

### Final API Response Must Be:

```json
{
  "category": "Blast Furnace",
  "value": 500,
  "recordedAt": "2026-02-28"
}
```

NO UUIDs in UI.

---

# ✅ 2️⃣ TOTAL EMISSION CLICKABLE

## 🎯 Requirement:

When user clicks:

"Total Emission"

It should:

* Show ALL emissions
* Across Scope 1, 2, 3
* Filterable by date
* With category names
* With scope column

---

## 🔧 Developer Task

Create new API:

```
GET /api/dashboard/all-emissions
```

Filters:

* startDate
* endDate

Return:

```json
{
  "totalEmission": 1404,
  "records": [
    {
      "scope": "SCOPE1",
      "category": "Blast Furnace",
      "value": 500,
      "date": "2026-02-28"
    }
  ]
}
```

Frontend:

* Make total emission card clickable
* Open detailed modal or page

---

# ✅ 3️⃣ PDF REPORT DOWNLOAD SYSTEM

Now this is very important.

---

# 🎯 REPORT REQUIREMENT

User can download report:

Options:

* Monthly
* Quarterly
* 6 Months
* Yearly
* Custom date range

Report must include:

* Industry name
* Reporting period
* Total emission
* Scope breakdown
* Category breakdown
* Detailed records table
* Date-wise summary

---

# 🔧 DEVELOPER TASK – BACKEND

## Step 1: Create API

```
GET /api/report/download
```

Parameters:

```
?startDate=YYYY-MM-DD
&endDate=YYYY-MM-DD
```

---

## Step 2: Generate PDF

Use:

* iText
  OR
* OpenPDF
  OR
* Apache PDFBox

---

## Step 3: PDF Structure

PDF must contain:

### Header

* Company Name
* Industry Type
* Report Period
* Generated Date

---

### Section 1: Summary

* Total Emission
* Scope 1 Total
* Scope 2 Total
* Scope 3 Total

---

### Section 2: Category Breakdown

Table:

| Scope | Category | Total Emission |

---

### Section 3: Detailed Records

Table:

| Date | Scope | Category | Emission |

---

### Footer

* System generated report
* Carbon Accounting Platform name

---

## Step 4: Return as Download

Response:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Emission_Report.pdf"
```

---

# ✅ 4️⃣ FRONTEND TASK

Add:

"Download Report" button

On click:

Show options:

* Monthly
* Quarterly
* 6 Months
* 1 Year
* Custom Range

Call:

```
/api/report/download?startDate=...&endDate=...
```

Trigger browser download.

---

# ✅ 5️⃣ SECURITY RULE

PDF generation must:

* Extract industry_id from JWT
* Filter data by industry_id
* No cross-industry data

---

# ✅ 6️⃣ PERFORMANCE REQUIREMENT

For large data:

* Use pagination for UI
* But PDF should include full range
* Add DB indexes on:

  * industry_id
  * recorded_at
  * scope

---

# 🎯 FINAL EXPECTED RESULT

After implementation:

✔ Category names shown (no UUIDs)
✔ Total emission clickable
✔ Scope drill-down working
✔ Professional PDF download
✔ Custom date range reports
✔ Monthly / Quarterly selection
✔ Secure industry-level isolation

---

# 🚀 After This

Your platform becomes:

* Audit-ready
* Investor-ready
* ESG-ready
* Compliance-ready
* Enterprise-grade

Perfect 👍
Now I will give you a **very detailed technical execution plan**.

You can copy-paste this and send it directly to your developer.
It includes:

* WHAT to do
* WHERE to do
* HOW to do
* Database changes
* Backend logic
* API structure
* PDF generation
* Frontend behavior

---

# 🚀 FEATURE 1 — SHOW CATEGORY NAME INSTEAD OF UUID

---

## 🎯 OBJECTIVE

Replace category UUID in UI with actual category name.

---

## ✅ STEP 1 — Backend Change

### 📍 WHERE:

`EmissionRepository`
`DashboardService`
`ScopeDetailUseCase`

---

### 🔧 WHAT TO DO:

When fetching emission records:

* Join `emission_record`
* With `emission_category`

---

### 🔧 HOW TO DO:

Modify query:

```sql
SELECT 
  er.scope,
  COALESCE(ec.category_name, er.custom_category_name) AS category_name,
  er.emission_value,
  er.recorded_at
FROM emission_record er
LEFT JOIN emission_category ec ON er.category_id = ec.id
WHERE er.industry_id = :industryId
AND er.scope = :scope
ORDER BY er.recorded_at DESC;
```

---

### API Response Must Return:

```json
{
  "category": "Blast Furnace",
  "value": 500,
  "recordedAt": "2026-02-28"
}
```

No UUID anywhere in UI response.

---

# 🚀 FEATURE 2 — TOTAL EMISSION CLICKABLE

---

## 🎯 OBJECTIVE

When clicking “Total Emission”:

* Show all emission records
* Across Scope 1, 2, 3
* With scope column
* With category names
* Filterable by date

---

## ✅ STEP 1 — Create New API

### 📍 WHERE:

`DashboardController`

Create:

```java
@GetMapping("/dashboard/all-emissions")
```

---

## ✅ STEP 2 — Service Layer

### 📍 WHERE:

`DashboardService`

Create method:

```java
getAllEmissions(industryId, startDate, endDate)
```

---

## 🔧 HOW TO DO:

Query:

```sql
SELECT 
  er.scope,
  COALESCE(ec.category_name, er.custom_category_name) AS category_name,
  er.emission_value,
  er.recorded_at
FROM emission_record er
LEFT JOIN emission_category ec ON er.category_id = ec.id
WHERE er.industry_id = :industryId
AND er.recorded_at BETWEEN :startDate AND :endDate
ORDER BY er.recorded_at DESC;
```

---

## ✅ Response Format:

```json
{
  "totalEmission": 1404,
  "records": [
    {
      "scope": "SCOPE1",
      "category": "Blast Furnace",
      "value": 500,
      "date": "2026-02-28"
    }
  ]
}
```

---

# 🚀 FEATURE 3 — PDF REPORT DOWNLOAD SYSTEM

This is major feature.

---

# 🎯 OBJECTIVE

User selects:

* Monthly
* Quarterly
* 6 Months
* Yearly
* Custom Range

Then download professional PDF.

---

# ✅ STEP 1 — Add Dependency

### 📍 WHERE:

`pom.xml`

Add:

```xml
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
</dependency>
```

---

# ✅ STEP 2 — Create Report Service

### 📍 WHERE:

`infrastructure/report/ReportService.java`

---

## 🔧 WHAT TO DO:

Create method:

```java
public byte[] generateEmissionReport(UUID industryId, LocalDate startDate, LocalDate endDate)
```

---

## 🔧 HOW TO DO:

Inside method:

1. Fetch:

   * Industry details
   * Total emission
   * Scope totals
   * Category breakdown
   * Detailed records

2. Create PDF using iText

---

# ✅ STEP 3 — PDF STRUCTURE

---

## Header Section

* Industry Name
* Industry Type
* Report Period
* Generated Date

---

## Section 1 — Summary

* Total Emission
* Scope 1 Total
* Scope 2 Total
* Scope 3 Total

---

## Section 2 — Category Breakdown Table

| Scope | Category | Total |

---

## Section 3 — Detailed Records Table

| Date | Scope | Category | Emission |

---

## Footer

* Generated by Carbon Accounting System
* Page Number

---

# ✅ STEP 4 — Controller Endpoint

### 📍 WHERE:

`ReportController.java`

Create:

```java
@GetMapping("/report/download")
public ResponseEntity<byte[]> downloadReport(
        @RequestParam LocalDate startDate,
        @RequestParam LocalDate endDate) {

    UUID industryId = getIndustryFromJWT();
    byte[] pdf = reportService.generateEmissionReport(industryId, startDate, endDate);

    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Emission_Report.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
}
```

---

# 🚀 FEATURE 4 — FRONTEND WORK

---

## 1️⃣ Total Emission Click

* On click → Call:

```
/api/dashboard/all-emissions
```

* Show modal with full data.

---

## 2️⃣ Scope Click

Already implemented → Just ensure it uses updated API.

---

## 3️⃣ Download Button

Add button:

"Download Report"

On click:

* Show options:

  * Monthly
  * Quarterly
  * 6 Months
  * Yearly
  * Custom Range

Frontend calculates dates and calls:

```
/api/report/download?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

---

# 🚀 FEATURE 5 — DATABASE INDEXING

Developer must ensure:

```sql
CREATE INDEX idx_industry ON emission_record(industry_id);
CREATE INDEX idx_scope ON emission_record(scope);
CREATE INDEX idx_recorded_at ON emission_record(recorded_at);
```

---

# 🚀 FEATURE 6 — SECURITY RULES

Must ensure:

* Extract industry_id from JWT
* Never accept industry_id from request
* Validate scope enum
* Prevent SQL injection
* Limit date range max 5 years per request

---

# 🎯 FINAL EXPECTED OUTPUT

After implementation:

✔ Category names visible
✔ Total emission clickable
✔ Scope drill-down working
✔ Monthly/Quarterly/Yearly report
✔ Custom date range PDF
✔ Secure multi-industry data
✔ Professional report layout

---

# 🚀 OPTIONAL ADVANCED (Future)

* Add charts inside PDF
* Add company logo
* Auto monthly report email
* Export Excel
* Add digital signature

