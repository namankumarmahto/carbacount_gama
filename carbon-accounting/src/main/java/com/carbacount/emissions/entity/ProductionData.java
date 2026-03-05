package com.carbacount.emissions.entity;

import com.carbacount.facility.entity.Facility;
import com.carbacount.reporting.entity.ReportingYear;
import com.carbacount.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "production_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionData {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_year_id", nullable = false)
    private ReportingYear reportingYear;

    @Column(name = "total_production", nullable = false)
    private BigDecimal totalProduction;

    @Column(nullable = false)
    @Builder.Default
    private String unit = "ton";

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING | APPROVED | REJECTED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
