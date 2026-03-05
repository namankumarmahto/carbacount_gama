package com.carbacount.facility.controller;

import com.carbacount.common.exception.FacilityAccessDeniedException;
import com.carbacount.common.response.ApiResponse;
import com.carbacount.facility.dto.FacilityDTO;
import com.carbacount.facility.entity.Facility;
import com.carbacount.facility.service.FacilityService;
import com.carbacount.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/data-entry")
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DATA_ENTRY')")
public class DataEntryController {

    @Autowired
    private FacilityService facilityService;

    /**
     * Returns the facilities accessible to the currently logged-in user.
     * <ul>
     * <li>DATA_ENTRY → only facilities mapped in facility_user_mapping for this
     * user.</li>
     * <li>OWNER / ADMIN → all facilities for their organization.</li>
     * </ul>
     * The organizationId is always derived server-side from the user's record; the
     * client
     * cannot override it.
     */
    @GetMapping("/facilities")
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> getMyFacilities() {
        try {
            UserPrincipal principal = (UserPrincipal) SecurityContextHolder
                    .getContext().getAuthentication().getPrincipal();

            // Always resolve org from the server side – never trust a client-supplied
            // param.
            UUID organizationId = facilityService.resolveOrganizationIdForUser(principal.getId());

            List<Facility> facilities = facilityService.getAccessibleFacilities(organizationId);

            List<FacilityDTO> dtos = facilities.stream()
                    .map(f -> FacilityDTO.builder()
                            .id(f.getId())
                            .name(f.getName())
                            .country(f.getCountry())
                            .state(f.getState())
                            .city(f.getCity())
                            .productionCapacity(f.getProductionCapacity())
                            .productType(f.getProductType())
                            .status(f.getStatus())
                            .build())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Facilities fetched successfully", dtos));
        } catch (FacilityAccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
