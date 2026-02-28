package com.carbon.accounting.infrastructure.persistence.entity;

import com.carbon.accounting.core.domain.model.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "industry_id")
    private UUID industryId;

    @Column(name = "industry_type_id")
    private UUID industryTypeId;

    @Column(name = "tenant_id")
    private UUID tenantId;
}
