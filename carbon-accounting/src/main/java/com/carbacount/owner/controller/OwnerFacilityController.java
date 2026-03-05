package com.carbacount.owner.controller;

import com.carbacount.common.response.ApiResponse;
import com.carbacount.facility.dto.FacilityDTO;
import com.carbacount.owner.service.OwnerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/owner/facilities")
@PreAuthorize("hasRole('OWNER')")
public class OwnerFacilityController {

    @Autowired
    private OwnerService ownerService;

    @PostMapping
    public ResponseEntity<ApiResponse<FacilityDTO>> createFacility(@Valid @RequestBody FacilityDTO facilityDTO) {
        try {
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Facility created successfully", ownerService.createFacility(facilityDTO)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /** Edit an existing facility's details. */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FacilityDTO>> updateFacility(
            @PathVariable UUID id, @Valid @RequestBody FacilityDTO facilityDTO) {
        try {
            FacilityDTO updated = ownerService.updateFacility(id, facilityDTO);
            return ResponseEntity.ok(new ApiResponse<>(true, "Facility updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /** Toggle facility status between ACTIVE and INACTIVE. */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<FacilityDTO>> toggleFacilityStatus(@PathVariable UUID id) {
        try {
            FacilityDTO updated = ownerService.toggleFacilityStatus(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Status updated to " + updated.getStatus(), updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /** Permanently (hard) delete a facility and its user mappings. */
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<ApiResponse<String>> deleteFacilityPermanently(@PathVariable UUID id) {
        try {
            ownerService.deleteFacilityPermanently(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Facility permanently deleted", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /** Archive (soft-delete) – kept for backward compatibility. */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> archiveFacility(@PathVariable UUID id) {
        try {
            ownerService.archiveFacility(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Facility archived successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> getAllFacilities() {
        try {
            return ResponseEntity
                    .ok(new ApiResponse<>(true, "Facilities fetched successfully", ownerService.getAllFacilities()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "Failed to fetch facilities: " + e.getMessage(), null));
        }
    }
}
