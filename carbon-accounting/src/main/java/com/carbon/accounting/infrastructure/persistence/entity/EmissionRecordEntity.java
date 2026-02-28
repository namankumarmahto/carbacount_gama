package com.carbon.accounting.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "emission_record")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionRecordEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plant_id", nullable = false)
    private PlantEntity plant;

    @Column(nullable = false)
    private String scope;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "custom_category_name")
    private String customCategoryName;

    @Column(name = "total_emission")
    private Double totalEmission;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
