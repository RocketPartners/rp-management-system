# Fix User Management Issues & Create Missing Endpoints

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 backend bugs discovered during User Management testing and create the missing Position CRUD endpoint, plus wire up the frontend Position and Manager dropdowns.

**Architecture:** Spring Boot backend at `hr_management_backend/` with layered architecture (Controller -> Service -> Repository -> Entity). Frontend is a standalone React SPA at `rp-management-system/frontend/` using TanStack Query. All backend responses use `ApiResponse<T>` wrapper. MapStruct for DTO mapping. Keycloak for auth/password management.

**Tech Stack:** Java 21, Spring Boot, MapStruct, Keycloak, PostgreSQL, React 19, TypeScript, TanStack Query, react-hook-form, zod

---

## File Map

### New Files (Backend - 6)

| File | Purpose |
|------|---------|
| `hr_management_backend/src/main/java/org/rp/application/position/PositionService.java` | Service interface for Position CRUD |
| `hr_management_backend/src/main/java/org/rp/application/position/PositionServiceImpl.java` | Service implementation with caching, validation |
| `hr_management_backend/src/main/java/org/rp/application/dto/request/CreatePositionRequest.java` | Create DTO with validation annotations |
| `hr_management_backend/src/main/java/org/rp/application/dto/request/UpdatePositionRequest.java` | Update DTO with validation annotations |
| `hr_management_backend/src/main/java/org/rp/application/dto/response/PositionResponse.java` | Response DTO |
| `hr_management_backend/src/main/java/org/rp/application/mapper/PositionMapper.java` | MapStruct mapper |
| `hr_management_backend/src/main/java/org/rp/infrastructure/controller/PositionController.java` | REST controller with CRUD + `/active` + `/by-department/{departmentId}` |

### Modified Files (Backend - 2)

| File | Change |
|------|--------|
| `hr_management_backend/src/main/java/org/rp/application/user/UserService.java` | Fix `deleteUser()` (add self-deletion guard + set accountStatus), fix `activateUser()` (set accountStatus + re-enable Keycloak) |
| `hr_management_backend/src/main/java/org/rp/infrastructure/security/KeycloakClient.java` | Fix `changePassword()` to throw `BusinessValidationException` instead of `RuntimeException`, add `enableUser()` method |

### Modified Files (Frontend - 1)

| File | Change |
|------|--------|
| `rp-management-system/frontend/src/components/users/UserForm.tsx` | Re-enable Position dropdown from `/positions/active`, add Manager dropdown from `/users?size=1000` |

---

## Task 1: Create Position DTOs

**Files:**
- Create: `hr_management_backend/src/main/java/org/rp/application/dto/request/CreatePositionRequest.java`
- Create: `hr_management_backend/src/main/java/org/rp/application/dto/request/UpdatePositionRequest.java`
- Create: `hr_management_backend/src/main/java/org/rp/application/dto/response/PositionResponse.java`

- [ ] **Step 1: Create CreatePositionRequest**

```java
package org.rp.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePositionRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must be at most 100 characters")
    private String title;

    @NotBlank(message = "Code is required")
    @Size(max = 50, message = "Code must be at most 50 characters")
    private String code;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    private Long departmentId;

    private BigDecimal minSalary;

    private BigDecimal maxSalary;

    @Size(max = 50, message = "Level must be at most 50 characters")
    private String level;

    @Builder.Default
    private Boolean isActive = true;
}
```

- [ ] **Step 2: Create UpdatePositionRequest**

```java
package org.rp.application.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePositionRequest {

    @Size(max = 100, message = "Title must be at most 100 characters")
    private String title;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    private Long departmentId;

    private BigDecimal minSalary;

    private BigDecimal maxSalary;

    @Size(max = 50, message = "Level must be at most 50 characters")
    private String level;

    private Boolean isActive;
}
```

- [ ] **Step 3: Create PositionResponse**

```java
package org.rp.application.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PositionResponse {

    private Long id;
    private String title;
    private String code;
    private String description;
    private Long departmentId;
    private String departmentName;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String level;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Step 4: Compile check**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./mvnw compile -q 2>&1 | tail -5`
Expected: BUILD SUCCESS (DTOs are standalone Lombok classes, no dependencies to resolve)

- [ ] **Step 5: Commit**

```bash
cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend
git add src/main/java/org/rp/application/dto/request/CreatePositionRequest.java \
        src/main/java/org/rp/application/dto/request/UpdatePositionRequest.java \
        src/main/java/org/rp/application/dto/response/PositionResponse.java
git commit -m "feat: add Position DTOs (CreatePositionRequest, UpdatePositionRequest, PositionResponse)"
```

---

## Task 2: Create PositionMapper

**Files:**
- Create: `hr_management_backend/src/main/java/org/rp/application/mapper/PositionMapper.java`

- [ ] **Step 1: Create PositionMapper**

Follow the exact DepartmentMapper pattern. The Position entity has a `department` relationship (ManyToOne) that needs special mapping.

```java
package org.rp.application.mapper;

import org.mapstruct.*;
import org.rp.application.dto.request.CreatePositionRequest;
import org.rp.application.dto.request.UpdatePositionRequest;
import org.rp.application.dto.response.PositionResponse;
import org.rp.infrastructure.database.entity.Position;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PositionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "department", ignore = true)
    Position toEntity(CreatePositionRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "department", ignore = true)
    void updateEntity(@MappingTarget Position position, UpdatePositionRequest request);

    @Mapping(target = "departmentId", source = "department.id")
    @Mapping(target = "departmentName", source = "department.name")
    PositionResponse toResponse(Position position);
}
```

- [ ] **Step 2: Compile check**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./mvnw compile -q 2>&1 | tail -5`
Expected: BUILD SUCCESS (MapStruct generates implementation at compile time)

- [ ] **Step 3: Commit**

```bash
cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend
git add src/main/java/org/rp/application/mapper/PositionMapper.java
git commit -m "feat: add PositionMapper (MapStruct)"
```

---

## Task 3: Create PositionService Interface and Implementation

**Files:**
- Create: `hr_management_backend/src/main/java/org/rp/application/position/PositionService.java`
- Create: `hr_management_backend/src/main/java/org/rp/application/position/PositionServiceImpl.java`

- [ ] **Step 1: Create PositionService interface**

```java
package org.rp.application.position;

import org.rp.application.dto.request.CreatePositionRequest;
import org.rp.application.dto.request.UpdatePositionRequest;
import org.rp.application.dto.response.PositionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PositionService {

    PositionResponse createPosition(CreatePositionRequest request);

    PositionResponse getPositionById(Long id);

    Page<PositionResponse> getAllPositions(Pageable pageable);

    List<PositionResponse> getAllActivePositions();

    List<PositionResponse> getPositionsByDepartment(Long departmentId);

    PositionResponse updatePosition(Long id, UpdatePositionRequest request);

    void deletePosition(Long id);
}
```

- [ ] **Step 2: Create PositionServiceImpl**

Follow the DepartmentServiceImpl pattern exactly: `@Slf4j`, `@Service`, `@RequiredArgsConstructor`, `@Transactional`, `@Cacheable`/`@CacheEvict`, duplicate code check, relationship resolution.

```java
package org.rp.application.position;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.rp.application.dto.request.CreatePositionRequest;
import org.rp.application.dto.request.UpdatePositionRequest;
import org.rp.application.dto.response.PositionResponse;
import org.rp.application.mapper.PositionMapper;
import org.rp.infrastructure.database.entity.Department;
import org.rp.infrastructure.database.entity.Position;
import org.rp.infrastructure.database.repository.DepartmentRepository;
import org.rp.infrastructure.database.repository.PositionRepository;
import org.rp.infrastructure.exception.DuplicateResourceException;
import org.rp.infrastructure.exception.ResourceNotFoundException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PositionServiceImpl implements PositionService {

    private final PositionRepository positionRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionMapper positionMapper;

    @Override
    @Transactional
    public PositionResponse createPosition(CreatePositionRequest request) {
        log.info("Creating position with code: {}", request.getCode());

        if (positionRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Position", "code", request.getCode());
        }

        Position position = positionMapper.toEntity(request);

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
            position.setDepartment(department);
        }

        Position savedPosition = positionRepository.save(position);
        log.info("Position created successfully with id: {}", savedPosition.getId());

        return positionMapper.toResponse(savedPosition);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "positions", key = "#id")
    public PositionResponse getPositionById(Long id) {
        log.debug("Fetching position with id: {}", id);

        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position", "id", id));

        return positionMapper.toResponse(position);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PositionResponse> getAllPositions(Pageable pageable) {
        log.debug("Fetching all positions with pagination");

        Page<Position> positions = positionRepository.findAll(pageable);
        return positions.map(positionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PositionResponse> getAllActivePositions() {
        log.debug("Fetching all active positions");

        List<Position> positions = positionRepository.findByIsActiveTrue();
        return positions.stream()
                .map(positionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PositionResponse> getPositionsByDepartment(Long departmentId) {
        log.debug("Fetching positions for department id: {}", departmentId);

        List<Position> positions = positionRepository.findByDepartmentId(departmentId);
        return positions.stream()
                .map(positionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "positions", key = "#id")
    public PositionResponse updatePosition(Long id, UpdatePositionRequest request) {
        log.info("Updating position with id: {}", id);

        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position", "id", id));

        positionMapper.updateEntity(position, request);

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
            position.setDepartment(department);
        }

        Position updatedPosition = positionRepository.save(position);
        log.info("Position updated successfully with id: {}", updatedPosition.getId());

        return positionMapper.toResponse(updatedPosition);
    }

    @Override
    @Transactional
    @CacheEvict(value = "positions", key = "#id")
    public void deletePosition(Long id) {
        log.info("Deleting position with id: {}", id);

        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position", "id", id));

        positionRepository.delete(position);
        log.info("Position deleted successfully with id: {}", id);
    }
}
```

- [ ] **Step 3: Compile check**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./mvnw compile -q 2>&1 | tail -5`
Expected: BUILD SUCCESS

- [ ] **Step 4: Commit**

```bash
cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend
git add src/main/java/org/rp/application/position/PositionService.java \
        src/main/java/org/rp/application/position/PositionServiceImpl.java
git commit -m "feat: add PositionService with CRUD, caching, and validation"
```

---

## Task 4: Create PositionController

**Files:**
- Create: `hr_management_backend/src/main/java/org/rp/infrastructure/controller/PositionController.java`

- [ ] **Step 1: Create PositionController**

Follow the DepartmentController pattern exactly. Permission prefix: `POSITION_`.

```java
package org.rp.infrastructure.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.rp.application.dto.request.CreatePositionRequest;
import org.rp.application.dto.request.UpdatePositionRequest;
import org.rp.application.dto.response.PositionResponse;
import org.rp.application.position.PositionService;
import org.rp.infrastructure.web.response.ApiResponse;
import org.rp.infrastructure.web.response.PagedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/positions")
@RequiredArgsConstructor
@Tag(name = "Positions", description = "Position management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class PositionController {

    private final PositionService positionService;

    @PostMapping
    @PreAuthorize("hasAuthority('POSITION_CREATE')")
    @Operation(summary = "Create Position", description = "Create a new position")
    public ResponseEntity<ApiResponse<PositionResponse>> createPosition(@Valid @RequestBody CreatePositionRequest request) {
        log.info("Creating position: title={}", request.getTitle());
        PositionResponse response = positionService.createPosition(request);
        log.info("Position created: id={}, title={}", response.getId(), response.getTitle());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Position created successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('POSITION_READ')")
    @Operation(summary = "Get Position", description = "Get position by ID")
    public ResponseEntity<ApiResponse<PositionResponse>> getPosition(@PathVariable Long id) {
        PositionResponse response = positionService.getPositionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('POSITION_READ')")
    @Operation(summary = "Get All Positions", description = "Get all positions with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<PositionResponse>>> getAllPositions(Pageable pageable) {
        Page<PositionResponse> page = positionService.getAllPositions(pageable);
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(page)));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('POSITION_READ')")
    @Operation(summary = "Get Active Positions", description = "Get all active positions")
    public ResponseEntity<ApiResponse<List<PositionResponse>>> getActivePositions() {
        List<PositionResponse> response = positionService.getAllActivePositions();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/by-department/{departmentId}")
    @PreAuthorize("hasAuthority('POSITION_READ')")
    @Operation(summary = "Get Positions by Department", description = "Get all positions in a department")
    public ResponseEntity<ApiResponse<List<PositionResponse>>> getPositionsByDepartment(@PathVariable Long departmentId) {
        List<PositionResponse> response = positionService.getPositionsByDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('POSITION_UPDATE')")
    @Operation(summary = "Update Position", description = "Update position by ID")
    public ResponseEntity<ApiResponse<PositionResponse>> updatePosition(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePositionRequest request) {
        PositionResponse response = positionService.updatePosition(id, request);
        return ResponseEntity.ok(ApiResponse.success("Position updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('POSITION_DELETE')")
    @Operation(summary = "Delete Position", description = "Delete position by ID")
    public ResponseEntity<ApiResponse<Void>> deletePosition(@PathVariable Long id) {
        log.info("Deleting position: id={}", id);
        positionService.deletePosition(id);
        log.info("Position deleted: id={}", id);
        return ResponseEntity.ok(ApiResponse.success("Position deleted successfully"));
    }
}
```

- [ ] **Step 2: Compile check**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./mvnw compile -q 2>&1 | tail -5`
Expected: BUILD SUCCESS

- [ ] **Step 3: Smoke test — start the app and curl the endpoint**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./mvnw spring-boot:run &`

Wait for startup, then:

```bash
# Login to get a token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@rocketpartners.com","password":"admin123"}' | jq -r '.data.accessToken')

# Test /positions/active
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/positions/active | jq .

# Test /positions (paginated)
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/positions | jq .
```

Expected: Both return 200 with `{ status: "success", data: [...] }`

- [ ] **Step 4: Commit**

```bash
cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend
git add src/main/java/org/rp/infrastructure/controller/PositionController.java
git commit -m "feat: add PositionController with CRUD, /active, and /by-department endpoints"
```

---

## Task 5: Fix UserService.deleteUser() — Self-Deletion Guard + AccountStatus

**Files:**
- Modify: `hr_management_backend/src/main/java/org/rp/application/user/UserService.java` (lines 147-172)

**Bug:** `deleteUser()` does not prevent an admin from deleting themselves. Also, it sets `status = INACTIVE` but never sets `accountStatus`, leaving the account in an inconsistent state.

- [ ] **Step 1: Add self-deletion protection and fix accountStatus**

The `deleteUser()` method at line 149 needs two changes:
1. Accept the authenticated user's ID and reject if `id.equals(authenticatedUserId)`
2. Set `accountStatus = SUSPENDED` alongside `status = INACTIVE`

Replace lines 147-172 in `UserService.java`:

```java
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(Long id, Long authenticatedUserId) {
        log.info("Soft deleting user with id: {}", id);

        if (id.equals(authenticatedUserId)) {
            throw new BusinessValidationException("You cannot delete your own account");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setIsDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        user.setStatus(User.UserStatus.INACTIVE);
        user.setAccountStatus(User.AccountStatus.SUSPENDED);

        userRepository.save(user);

        // Disable user in Keycloak
        try {
            String keycloakUserId = keycloakClient.findUserIdByEmail(user.getEmail());
            if (keycloakUserId != null) {
                keycloakClient.disableUser(keycloakUserId);
            }
        } catch (Exception e) {
            log.warn("Failed to disable user in Keycloak: {}", e.getMessage());
        }

        log.info("User soft deleted successfully with id: {}", id);
    }
```

- [ ] **Step 2: Update UserController.deleteUser() to pass authenticated user ID**

In `UserController.java` (line 86-94), update the method to extract the authenticated user's ID:

Replace:
```java
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    @Operation(summary = "Delete User", description = "Soft delete user by ID")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        log.info("Deleting user: id={}", id);
        userService.deleteUser(id);
        log.info("User deleted: id={}", id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }
```

With:
```java
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    @Operation(summary = "Delete User", description = "Soft delete user by ID")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        Long authenticatedUserId = getUserIdFromJwt(jwt);
        log.info("Deleting user: id={}, requestedBy={}", id, authenticatedUserId);
        userService.deleteUser(id, authenticatedUserId);
        log.info("User deleted: id={}", id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }
```

- [ ] **Step 3: Compile check**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./mvnw compile -q 2>&1 | tail -5`
Expected: BUILD SUCCESS

- [ ] **Step 4: Smoke test**

```bash
# Try to delete admin (id=1) as admin — should get 400
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/users/1 | jq .
# Expected: { status: 400, message: "You cannot delete your own account" }
```

- [ ] **Step 5: Commit**

```bash
cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend
git add src/main/java/org/rp/application/user/UserService.java \
        src/main/java/org/rp/infrastructure/controller/UserController.java
git commit -m "fix: prevent self-deletion and set accountStatus on user delete"
```

---

## Task 6: Fix UserService.activateUser() — Set AccountStatus + Re-enable Keycloak

**Files:**
- Modify: `hr_management_backend/src/main/java/org/rp/infrastructure/security/KeycloakClient.java` (add `enableUser()`)
- Modify: `hr_management_backend/src/main/java/org/rp/application/user/UserService.java` (lines 174-187)

**Bug:** `activateUser()` only sets `status = ACTIVE` but doesn't change `accountStatus` or re-enable the Keycloak user. A suspended user who is "activated" remains unable to log in because Keycloak still has them disabled and `accountStatus` is still `SUSPENDED`.

- [ ] **Step 1: Add enableUser() to KeycloakClient**

Add this method right after `disableUser()` (after line 235) in `KeycloakClient.java`. It mirrors `disableUser()` but sets `enabled: true`:

```java
    /**
     * Re-enable a user in Keycloak
     */
    public void enableUser(String keycloakUserId) {
        log.info("Enabling user {} in Keycloak", keycloakUserId);

        String adminToken = getAdminToken();

        Map<String, Object> userRepresentation = new HashMap<>();
        userRepresentation.put("enabled", true);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(userRepresentation, headers);

        try {
            restTemplate.put(keycloakConfig.getUsersUrl() + "/" + keycloakUserId, entity);
            log.info("User {} enabled in Keycloak", keycloakUserId);
        } catch (HttpClientErrorException e) {
            log.error("Failed to enable user in Keycloak: {}", e.getMessage());
        }
    }
```

- [ ] **Step 2: Fix activateUser() in UserService.java**

Replace lines 174-187:

```java
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public UserResponse activateUser(Long id) {
        log.info("Activating user with id: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setStatus(User.UserStatus.ACTIVE);
        user.setAccountStatus(User.AccountStatus.ACTIVE);
        user.setIsDeleted(false);
        user.setDeletedAt(null);

        User activatedUser = userRepository.save(user);

        // Re-enable user in Keycloak
        try {
            String keycloakUserId = keycloakClient.findUserIdByEmail(user.getEmail());
            if (keycloakUserId != null) {
                keycloakClient.enableUser(keycloakUserId);
            }
        } catch (Exception e) {
            log.warn("Failed to enable user in Keycloak: {}", e.getMessage());
        }

        log.info("User activated successfully with id: {}", id);
        return userMapper.toResponse(activatedUser);
    }
```

- [ ] **Step 3: Compile check**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./mvnw compile -q 2>&1 | tail -5`
Expected: BUILD SUCCESS

- [ ] **Step 4: Commit**

```bash
cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend
git add src/main/java/org/rp/infrastructure/security/KeycloakClient.java \
        src/main/java/org/rp/application/user/UserService.java
git commit -m "fix: activateUser now sets accountStatus=ACTIVE, clears deletion flags, and re-enables Keycloak user"
```

---

## Task 7: Fix KeycloakClient.changePassword() — Throw BusinessValidationException

**Files:**
- Modify: `hr_management_backend/src/main/java/org/rp/infrastructure/security/KeycloakClient.java` (lines 240-275)

**Bug:** `changePassword()` throws `RuntimeException` on wrong password (line 245) and on Keycloak failures (line 273). The `GlobalExceptionHandler` catches `RuntimeException` via the generic `Exception.class` handler and returns 500. It should throw `BusinessValidationException` so the handler returns 400.

- [ ] **Step 1: Add import and fix the method**

Add to imports at the top of `KeycloakClient.java`:
```java
import org.rp.infrastructure.exception.BusinessValidationException;
import org.rp.infrastructure.exception.ResourceNotFoundException;
```

Replace lines 240-275 with:

```java
    public void changePassword(String email, String currentPassword, String newPassword) {
        // Verify current password by attempting a login
        try {
            login(email, currentPassword);
        } catch (Exception e) {
            throw new BusinessValidationException("Current password is incorrect");
        }

        // Find the user in Keycloak
        String userId = findUserIdByEmail(email);
        if (userId == null) {
            throw new ResourceNotFoundException("User", "email", email);
        }

        // Reset password using admin API
        String adminToken = getAdminToken();

        Map<String, Object> credentials = new HashMap<>();
        credentials.put("type", "password");
        credentials.put("value", newPassword);
        credentials.put("temporary", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(credentials, headers);

        try {
            restTemplate.put(keycloakConfig.getUsersUrl() + "/" + userId + "/reset-password", entity);
            log.info("Password changed for user {}", email);
        } catch (HttpClientErrorException e) {
            log.error("Failed to change password in Keycloak: {}", e.getMessage());
            throw new BusinessValidationException("Failed to change password");
        }
    }
```

- [ ] **Step 2: Compile check**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./mvnw compile -q 2>&1 | tail -5`
Expected: BUILD SUCCESS

- [ ] **Step 3: Smoke test**

```bash
# Wrong current password — should return 400, not 500
curl -s -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  http://localhost:8080/api/v1/users/me/password \
  -d '{"currentPassword":"wrongpassword","newPassword":"newpass123","confirmPassword":"newpass123"}' | jq .
# Expected: { status: 400, message: "Current password is incorrect" }
```

- [ ] **Step 4: Commit**

```bash
cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend
git add src/main/java/org/rp/infrastructure/security/KeycloakClient.java
git commit -m "fix: changePassword throws BusinessValidationException (400) instead of RuntimeException (500)"
```

---

## Task 8: Frontend — Wire Up Position Dropdown and Manager Dropdown

**Files:**
- Modify: `rp-management-system/frontend/src/components/users/UserForm.tsx` (lines 174-175, 531-552)

- [ ] **Step 1: Re-enable Position dropdown**

In `UserForm.tsx`, replace lines 174-175:

```typescript
    // Note: /positions endpoint does not exist in the backend yet — disabled to avoid 500s
    const positions: PositionOption[] = [];
```

With:

```typescript
    const { data: positions = [] } = useQuery({
        queryKey: ['positions', 'active'],
        queryFn: () => apiGet<PositionOption[]>('/positions/active'),
    });
```

- [ ] **Step 2: Add Manager dropdown data**

After the positions query (around line 177), add a query for users to populate the Manager dropdown. Import `UserResponse` from types if not already imported:

At the top of the file, update the import from `@/types`:

```typescript
import type { DepartmentOption, PositionOption, RoleOption, UserResponse } from '@/types';
```

Add after the positions query:

```typescript
    const { data: managers = [] } = useQuery({
        queryKey: ['users', 'all-for-manager'],
        queryFn: async () => {
            const res = await apiGet<{ content: UserResponse[] }>('/users?size=1000');
            return res.content;
        },
    });
```

- [ ] **Step 3: Populate the Manager dropdown SelectContent**

Replace lines 550-552 (the empty Manager SelectContent):

```typescript
                                <SelectContent>
                                    {/* Manager list fetched via users search */}
                                </SelectContent>
```

With:

```typescript
                                <SelectContent>
                                    {managers.map((m) => (
                                        <SelectItem
                                            key={m.id}
                                            value={String(m.id)}
                                        >
                                            {m.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
```

- [ ] **Step 4: Verify frontend compiles**

Run: `cd /Users/seanreptimiguell.ticzon/Herd/rp-management-system/frontend && npx tsc --noEmit 2>&1 | tail -10`
Expected: No errors (or only pre-existing ones unrelated to this file)

- [ ] **Step 5: Commit**

```bash
cd /Users/seanreptimiguell.ticzon/Herd/rp-management-system/frontend
git add src/components/users/UserForm.tsx
git commit -m "feat: wire up Position dropdown from /positions/active and Manager dropdown from /users"
```

---

## Task 9: End-to-End Verification

- [ ] **Step 1: Start backend (if not running)**

```bash
cd /Users/seanreptimiguell.ticzon/Herd/hr_management_backend && ./mvnw spring-boot:run &
```

- [ ] **Step 2: Verify Position endpoints**

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@rocketpartners.com","password":"admin123"}' | jq -r '.data.accessToken')

# GET /positions/active — should return 200 with array
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/positions/active | jq .status

# POST /positions — create a test position
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  http://localhost:8080/api/v1/positions \
  -d '{"title":"Junior Developer","code":"JR-DEV","level":"Junior"}' | jq .status

# GET /positions — should return paginated list with the new position
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/positions | jq '.data.content | length'
```

Expected: `"success"`, `"success"`, `1` (or more if positions existed)

- [ ] **Step 3: Verify self-deletion protection**

```bash
# Try to delete admin user as admin
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/users/1 | jq .
# Expected: 400 "You cannot delete your own account"
```

- [ ] **Step 4: Verify wrong password returns 400**

```bash
curl -s -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  http://localhost:8080/api/v1/users/me/password \
  -d '{"currentPassword":"wrong","newPassword":"newpass123","confirmPassword":"newpass123"}' | jq .status
# Expected: 400 (not 500)
```

- [ ] **Step 5: Start frontend and verify dropdowns**

```bash
cd /Users/seanreptimiguell.ticzon/Herd/rp-management-system/frontend && npm run dev &
```

Open browser:
1. Navigate to Users > Create User
2. Verify the Position dropdown is populated (shows "Junior Developer" if test position was created)
3. Verify the Manager dropdown is populated (shows list of users)
4. Navigate to Users > Edit (any user) — verify same dropdowns work

- [ ] **Step 6: Verify activate unsuspends properly**

```bash
# Create a test user first
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  http://localhost:8080/api/v1/users \
  -d '{"email":"test.activate@test.com","password":"password123","firstName":"Test","lastName":"Activate"}' | jq '.data.id'

# Suspend the test user (replace ID)
curl -s -X POST -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/users/{TEST_USER_ID}/suspend | jq .

# Activate — should set both status=ACTIVE and accountStatus=ACTIVE
curl -s -X POST -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/users/{TEST_USER_ID}/activate | jq '.data | {status, accountStatus}'
# Expected: { "status": "ACTIVE", "accountStatus": "ACTIVE" }
```

---

## Summary of All Changes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `/positions` returns 500 | No PositionController exists | Created full CRUD: PositionController, PositionService, DTOs, Mapper (Tasks 1-4) |
| Admin can delete themselves | No self-deletion guard in `deleteUser()` | Added `authenticatedUserId` parameter + validation check (Task 5) |
| Delete doesn't set accountStatus | `deleteUser()` only sets `status=INACTIVE` | Added `accountStatus=SUSPENDED` (Task 5) |
| Activate doesn't unsuspend | `activateUser()` only sets `status=ACTIVE` | Added `accountStatus=ACTIVE`, clear deletion flags, re-enable Keycloak user (Task 6) |
| No `enableUser()` in Keycloak | Missing method | Added `enableUser()` mirroring `disableUser()` but with `enabled: true` (Task 6) |
| Wrong password returns 500 | `changePassword()` throws `RuntimeException` | Changed to `BusinessValidationException` (400) (Task 7) |
| Position dropdown empty | Hardcoded `[]` as placeholder | Connected to `/positions/active` endpoint (Task 8) |
| Manager dropdown empty | No data source | Connected to `/users?size=1000` endpoint (Task 8) |

**XSS note:** The existing GlobalExceptionHandler + Spring Boot's default Jackson serialization already HTML-escapes output. The frontend uses React which auto-escapes JSX expressions. The backend validation annotations (`@Size`, `@NotBlank`) constrain input. No additional XSS sanitization is needed — the framework already handles this correctly.
