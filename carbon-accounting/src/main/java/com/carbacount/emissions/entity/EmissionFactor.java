package com.carbacount.emissions.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "emission_factors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmissionFactor {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String country;

    private String state;

    @Column(name = "fuel_type")
    private String fuelType;

    @Column(name = "electricity_source")
    private String electricitySource;

    @Column(name = "scope_type")
    private String scopeType;

    @Column(name = "activity_type")
    private String activityType;

    @Column(name = "source_name")
    private String sourceName;

    @Column(nullable = false)
    private String unit;

    @Column(name = "factor_value", nullable = false)
    private BigDecimal factorValue;

    @Column(name = "factor_year")
    private Integer factorYear;

    @Column(name = "unit_of_factor")
    private String unitOfFactor;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
