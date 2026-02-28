package com.carbon.accounting.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "industry_type")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IndustryTypeEntity {
    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
