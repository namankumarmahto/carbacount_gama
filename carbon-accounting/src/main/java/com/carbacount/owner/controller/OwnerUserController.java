package com.carbacount.owner.controller;

import com.carbacount.common.response.ApiResponse;
import com.carbacount.common.enums.UserRole;
import com.carbacount.common.enums.UserStatus;
import com.carbacount.owner.service.OwnerService;
import com.carbacount.user.dto.EditActiveUserRequest;
import com.carbacount.user.dto.EditPendingUserRequest;
import com.carbacount.user.dto.UserInviteRequest;
import com.carbacount.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/owner/users")
@PreAuthorize("hasRole('OWNER')")
public class OwnerUserController {

    @Autowired
    private OwnerService ownerService;

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<UserResponse>> inviteUser(@Valid @RequestBody UserInviteRequest request) {
        try {
            UserResponse userResponse = ownerService.inviteUser(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "User invited successfully", userResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<String>> updateUserRole(@PathVariable UUID id, @RequestParam UserRole role) {
        try {
            ownerService.updateUserRole(id, role);
            return ResponseEntity.ok(new ApiResponse<>(true, "User role updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateUserStatus(
            @PathVariable UUID id,
            @RequestParam UserStatus status) {
        try {
            ownerService.updateUserStatus(id, status);
            return ResponseEntity.ok(new ApiResponse<>(true, "User status updated to " + status, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deactivateUser(@PathVariable UUID id) {
        try {
            ownerService.softDeactivateUser(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "User deactivated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /** Hard-delete a PENDING user and all their DB records. */
    @DeleteMapping("/{id}/pending")
    public ResponseEntity<ApiResponse<String>> deletePendingUser(@PathVariable UUID id) {
        try {
            ownerService.deletePendingUser(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Pending user deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Hard-delete ANY non-OWNER user (ACTIVE, INACTIVE, or PENDING) from the DB.
     */
    @DeleteMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable UUID id) {
        try {
            ownerService.deleteUser(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /** Edit a PENDING user's name, email, role, and facilities. */
    @PutMapping("/{id}/pending")
    public ResponseEntity<ApiResponse<UserResponse>> updatePendingUser(
            @PathVariable UUID id,
            @Valid @RequestBody EditPendingUserRequest request) {
        try {
            UserResponse updated = ownerService.updatePendingUser(id, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Pending user updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Edit an ACTIVE/INACTIVE user's name, email, and facility assignments. Sends
     * notification email.
     */
    @PutMapping("/{id}/active")
    public ResponseEntity<ApiResponse<UserResponse>> updateActiveUser(
            @PathVariable UUID id,
            @Valid @RequestBody EditActiveUserRequest request) {
        try {
            UserResponse updated = ownerService.updateActiveUser(id, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "User updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        try {
            List<UserResponse> users = ownerService.getAllUsers();
            System.out.println("Fetched " + users.size() + " users for current organization.");
            return ResponseEntity.ok(new ApiResponse<>(true, "Users fetched successfully", users));
        } catch (Exception e) {
            System.err.println("getAllUsers error: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "Failed to fetch users: " + e.getMessage(), null));
        }
    }
}
