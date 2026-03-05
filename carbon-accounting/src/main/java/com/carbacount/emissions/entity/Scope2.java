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
@Table(name = "scope2")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scope2 {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_year_id", nullable = false)
    private ReportingYear reportingYear;

    @Column(name = "electricity_source", nullable = false)
    private String electricitySource;

    @Column(nullable = false)
    @Builder.Default
    private String unit = "kWh";

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(nullable = false)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT | SUBMITTED | VERIFIED | REJECTED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", nullable = false)
    private User updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
