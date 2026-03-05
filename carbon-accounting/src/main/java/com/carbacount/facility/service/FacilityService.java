package com.carbacount.facility.service;

import com.carbacount.facility.entity.Facility;
import com.carbacount.facility.repository.FacilityRepository;
import com.carbacount.facility.repository.FacilityUserMappingRepository;
import com.carbacount.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private FacilityUserMappingRepository facilityUserMappingRepository;

    public List<Facility> getAccessibleFacilities(UUID organizationId) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean isOwnerOrAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OWNER") || a.getAuthority().equals("ROLE_ADMIN"));

        if (isOwnerOrAdmin) {
            return facilityRepository.findByOrganizationId(organizationId);
        }

        // For DATA_ENTRY, we filter by facility_user_mapping
        List<UUID> assignedFacilityIds = facilityUserMappingRepository.findByUserId(principal.getId()).stream()
                .map(m -> m.getFacility().getId())
                .collect(Collectors.toList());

        return facilityRepository.findAllById(assignedFacilityIds);
    }

    public boolean canAccessFacility(UUID facilityId) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean isOwnerOrAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OWNER") || a.getAuthority().equals("ROLE_ADMIN"));

        if (isOwnerOrAdmin) {
            Facility facility = facilityRepository.findById(facilityId).orElse(null);
            return facility != null; // Ideally check if it belongs to their organization
        }

        return facilityUserMappingRepository.existsByFacilityIdAndUserId(facilityId, principal.getId());
    }
}
