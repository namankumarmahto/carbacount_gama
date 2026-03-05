package com.carbon.accounting.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "country")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CountryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;
}
