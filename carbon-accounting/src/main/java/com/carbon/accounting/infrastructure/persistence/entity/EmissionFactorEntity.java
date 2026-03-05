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
@Table(name = "emission_factor")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionFactorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "industry_type_id")
    private UUID industryTypeId;

    @Column(nullable = false)
    private String scope;

    @Column(name = "fuel_type_id")
    private UUID fuelTypeId;

    @Column(name = "country_id")
    private UUID countryId;

    @Column(name = "state_id")
    private UUID stateId;

    @Column(name = "factor_value", nullable = false)
    private Double factorValue;

    @Column(name = "factor_unit", nullable = false)
    private String factorUnit;

    private String source;

    private Integer year;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
