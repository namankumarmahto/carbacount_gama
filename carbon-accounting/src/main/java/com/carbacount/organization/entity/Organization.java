package com.carbacount.organization.entity;

import com.carbacount.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "industry_type", nullable = false)
    private String industryType;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "cin_number")
    private String cinNumber;

    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "registered_address")
    private String registeredAddress;

    @Column(nullable = false)
    private String country;

    private String state;
    private String city;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "net_zero_target_year")
    private Integer netZeroTargetYear;

    @Column(name = "reporting_standard")
    private String reportingStandard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
