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
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "full_name", nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.OWNER;

    @Column(name = "industry_id")
    private UUID industryId;

    @Column(name = "industry_type_id")
    private UUID industryTypeId;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "country_id")
    private UUID countryId;

    @Column(name = "state_id")
    private UUID stateId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private com.carbacount.common.enums.UserStatus status = com.carbacount.common.enums.UserStatus.ACTIVE;
}
