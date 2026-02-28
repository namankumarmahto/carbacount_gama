package com.carbon.accounting.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "emission_category")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionCategoryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "industry_type_id", nullable = false)
    private UUID industryTypeId;

    @Column(nullable = false)
    private String scope;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(name = "is_custom")
    private boolean isCustom;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
