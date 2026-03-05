package com.carbacount.user.dto;

import com.carbacount.common.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String fullName;
    private String email;
    private UserStatus status;
    private List<String> roles;
    private UUID organizationId;
    private String facility;
}
