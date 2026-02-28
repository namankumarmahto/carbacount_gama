Perfect ✅
Now I’ll give you **PHASE 6 – API Layer Implementation** in a **clear task format** so you can directly assign this to your developer.

This assumes:

* Clean Architecture already created
* Use cases already implemented
* Repositories implemented
* Security configured (JWT basic ready)

We are only building the **API (Interface Layer)**.

---

# 🚀 PHASE 6 – API LAYER IMPLEMENTATION

## 🎯 Objective

Expose backend functionality through REST APIs
WITHOUT putting business logic in controllers.

---

# 📁 Where To Work

All work in:

```
src/main/java/com/carbon/accounting/interfaces/rest/
```

And:

```
src/main/java/com/carbon/accounting/application/dto/
```

---

# ✅ TASK 1 — Create API Response Wrapper (Professional Standard)

📍 Location:

```
common/response/
```

Create:

```java
ApiResponse.java
```

Structure:

```java
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

}
```

✔ Used for all API responses
✔ Ensures consistency

---

# ✅ TASK 2 — Create DTOs (Input & Output)

📍 Location:

```
application/dto/
```

### Create:

1. AddEmissionRequestDTO
2. EmissionResponseDTO
3. DashboardResponseDTO
4. LoginRequestDTO
5. LoginResponseDTO

⚠ IMPORTANT:

* No JPA annotations here
* Only validation annotations (@NotNull, @NotBlank)

Example:

```java
public class AddEmissionRequestDTO {

    @NotNull
    private UUID plantId;

    @NotNull
    private Double scope1;

    @NotNull
    private Double scope2;

    @NotNull
    private Double scope3;

    @NotNull
    private LocalDateTime recordedAt;
}
```

---

# ✅ TASK 3 — Create Controllers

📍 Location:

```
interfaces/rest/
```

Create:

1. EmissionController
2. DashboardController
3. IndustryController
4. AuthController

---

# ✅ TASK 4 — EmissionController

📍 File:

```
interfaces/rest/EmissionController.java
```

Responsibilities:

* Accept AddEmissionRequestDTO
* Call AddEmissionUseCase
* Return ApiResponse

Example structure:

```java
@RestController
@RequestMapping("/api/emissions")
@RequiredArgsConstructor
public class EmissionController {

    private final AddEmissionUseCase addEmissionUseCase;

    @PostMapping
    public ResponseEntity<ApiResponse<EmissionResponseDTO>> addEmission(
            @Valid @RequestBody AddEmissionRequestDTO request) {

        EmissionResponseDTO response = addEmissionUseCase.execute(request);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Emission added successfully", response)
        );
    }
}
```

❌ No repository calls
❌ No business logic

---

# ✅ TASK 5 — DashboardController

📍 File:

```
interfaces/rest/DashboardController.java
```

Responsibilities:

* Call GetDashboardUseCase
* Return dashboard summary

Endpoint:

```
GET /api/dashboard/{industryId}
```

Structure:

```java
@GetMapping("/{industryId}")
public ResponseEntity<ApiResponse<DashboardResponseDTO>> getDashboard(
        @PathVariable UUID industryId) {

    DashboardResponseDTO response = getDashboardUseCase.execute(industryId);

    return ResponseEntity.ok(
        new ApiResponse<>(true, "Dashboard data fetched", response)
    );
}
```

---

# ✅ TASK 6 — AuthController

📍 File:

```
interfaces/rest/AuthController.java
```

Endpoints:

```
POST /api/auth/login
POST /api/auth/register
```

Responsibilities:

* Call AuthUseCase
* Generate JWT
* Return token in LoginResponseDTO

---

# ✅ TASK 7 — Global Exception Handling

📍 Location:

```
common/exception/
```

Create:

```
GlobalExceptionHandler.java
```

Use:

```java
@RestControllerAdvice
```

Handle:

* MethodArgumentNotValidException
* EntityNotFoundException
* AccessDeniedException
* Generic Exception

Return standardized ApiResponse.

---

# ✅ TASK 8 — Enable Validation

In main class:

```java
@Validated
```

Ensure:

* @Valid works
* Proper error responses

---

# ✅ TASK 9 — Swagger Configuration

Add dependency:

```
springdoc-openapi
```

Access:

```
http://localhost:8080/swagger-ui.html
```

Purpose:

* Test all APIs
* Share API documentation with frontend team

---

# ✅ TASK 10 — Security Integration

Add:

```
@PreAuthorize("hasRole('INDUSTRY')")
```

On:

* Add Emission API
* Dashboard API

Ensure:

* Only logged-in user can access

---

# 📦 FINAL API STRUCTURE EXPECTED

```
POST   /api/auth/login
POST   /api/auth/register

POST   /api/emissions
GET    /api/dashboard/{industryId}
POST   /api/industries
GET    /api/industries/{id}
```

---

# 🧪 TESTING REQUIREMENTS

Developer must:

✔ Test all endpoints in Postman
✔ Verify DB inserts
✔ Verify JWT authentication
✔ Validate error handling
✔ Check Swagger documentation

---

# 🎯 PHASE 6 COMPLETION CRITERIA

Phase 6 is complete when:

* All APIs work
* No business logic in controller
* All responses use ApiResponse
* Proper validation errors
* JWT protected endpoints
* Swagger documentation working

---

# 🔥 What You Can Tell Your Developer

Say this:

> Implement REST API layer inside interfaces/rest
> Use DTOs from application layer
> Do not write business logic in controllers
> Return standardized ApiResponse
> Integrate JWT security
> Add Swagger documentation
> Ensure all endpoints tested locally

---
