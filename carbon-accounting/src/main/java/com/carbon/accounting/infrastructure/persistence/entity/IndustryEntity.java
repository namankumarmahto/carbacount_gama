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
@Table(name = "industry")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IndustryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String sector;

    private String location;

    @Column(name = "industry_type_id")
    private UUID industryTypeId;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
