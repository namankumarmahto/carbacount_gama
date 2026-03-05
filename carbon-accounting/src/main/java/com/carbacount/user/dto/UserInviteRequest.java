package com.carbacount.user.dto;

import com.carbacount.common.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class UserInviteRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Role is required")
    private UserRole role; // OWNER, ADMIN, DATA_ENTRY, VIEWER

    private List<UUID> facilityIds; // Required only for DATA_ENTRY role
}
