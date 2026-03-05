package com.carbon.accounting.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "fuel_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelTypeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "default_unit", nullable = false)
    private String defaultUnit;
}
