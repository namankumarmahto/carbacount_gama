package com.carbacount.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrgEnterResponse {
    private String orgScopedToken;
    private String organizationId;
    private String organizationName;
}
