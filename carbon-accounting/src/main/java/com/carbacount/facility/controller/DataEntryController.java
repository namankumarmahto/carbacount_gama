package com.carbacount.facility.controller;

import com.carbacount.common.response.ApiResponse;
import com.carbacount.facility.entity.Facility;
import com.carbacount.facility.service.FacilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/data-entry")
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DATA_ENTRY')")
public class DataEntryController {

    @Autowired
    private FacilityService facilityService;

    @GetMapping("/facilities")
    public ResponseEntity<ApiResponse<List<Facility>>> getMyFacilities(@RequestParam UUID organizationId) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(true, "Facilities fetched successfully",
                    facilityService.getAccessibleFacilities(organizationId)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/facilities/{facilityId}/records")
    public ResponseEntity<ApiResponse<String>> addRecord(@PathVariable UUID facilityId,
            @RequestBody String recordData) {
        try {
            if (!facilityService.canAccessFacility(facilityId)) {
                return ResponseEntity.status(403)
                        .body(new ApiResponse<>(false, "Access denied to facility: " + facilityId, null));
            }
            // Logic to add emission record
            return ResponseEntity.ok(new ApiResponse<>(true, "Record added for facility: " + facilityId, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
