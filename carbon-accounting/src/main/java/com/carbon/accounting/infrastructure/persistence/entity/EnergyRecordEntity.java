package com.carbon.accounting.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "energy_record")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnergyRecordEntity {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plant_id", nullable = false)
    private PlantEntity plant;

    @Column(name = "electricity_kwh")
    private Double electricityKwh;

    @Column(name = "fuel_used")
    private Double fuelUsed;

    @Column(name = "fuel_type")
    private String fuelType;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
