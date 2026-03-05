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

    @Column(name = "activity_type")
    private String activityType;

    @Column(name = "activity_quantity")
    private Double activityQuantity;

    @Column(name = "activity_unit")
    private String activityUnit;

    @Column(name = "emission_factor")
    private Double emissionFactor;

    @Column(name = "factor_source")
    private String factorSource;

    @Column(name = "factor_year")
    private Integer factorYear;

    @Column(name = "calculated_emission")
    private Double calculatedEmission;

    @Column(name = "department")
    private String department;

    @Column(name = "reporting_frequency")
    private String reportingFrequency;

    @Column(name = "data_source")
    private String dataSource;

    @Column(name = "evidence_url")
    private String evidenceUrl;

    @Column(name = "status")
    private String status;

    @Column(name = "responsible_person")
    private String responsiblePerson;

    @Column(name = "reporting_period_start")
    private Instant reportingPeriodStart;

    @Column(name = "reporting_period_end")
    private Instant reportingPeriodEnd;

    @Column(name = "fuel_type")
    private String fuelType;

    @Column(name = "calorific_value")
    private Double calorificValue;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "industry_id")
    private UUID industryId;

    @Column(name = "committed_at")
    private Instant committedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

}
