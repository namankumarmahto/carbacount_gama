package com.carbon.accounting.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "activity_template")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityTemplateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_type_id", nullable = false)
    private IndustryTypeEntity industryType;

    @Column(nullable = false)
    private String scope;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private EmissionCategoryEntity category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fuel_type_id", nullable = false)
    private FuelTypeEntity fuelType;
}
