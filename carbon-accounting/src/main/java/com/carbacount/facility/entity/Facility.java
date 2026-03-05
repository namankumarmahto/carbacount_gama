package com.carbacount.facility.entity;

import com.carbacount.common.enums.FacilityStatus;
import com.carbacount.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "facilities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Facility {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false)
    private String name;

    private String country;
    private String state;
    private String city;

    @Column(name = "production_capacity")
    private BigDecimal productionCapacity;

    @Column(name = "product_type")
    private String productType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FacilityStatus status = FacilityStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
