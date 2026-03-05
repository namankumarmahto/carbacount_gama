package com.carbon.accounting.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "state")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private CountryEntity country;

    @Column(nullable = false)
    private String name;
}
