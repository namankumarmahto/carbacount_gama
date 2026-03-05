package com.carbacount.emissions.entity;

import com.carbacount.facility.entity.Facility;
import com.carbacount.reporting.entity.ReportingYear;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "emission_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmissionResult {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_year_id", nullable = false)
    private ReportingYear reportingYear;

    @Column(nullable = false)
    private String scope; // SCOPE1, SCOPE2, SCOPE3

    @Column(name = "total_emission", nullable = false)
    private BigDecimal totalEmission;

    @CreationTimestamp
    @Column(name = "calculated_at", updatable = false)
    private LocalDateTime calculatedAt;
}
