package com.carbacount.common.exception;

/**
 * Thrown when a DATA_ENTRY user tries to submit data for a facility
 * that is not assigned to them. Maps to HTTP 403 Forbidden.
 */
public class FacilityAccessDeniedException extends RuntimeException {
    public FacilityAccessDeniedException(String facilityId) {
        super("Access denied: You are not assigned to facility " + facilityId);
    }

    public FacilityAccessDeniedException(String facilityId, String detail) {
        super("Access denied: " + detail + " (facilityId=" + facilityId + ")");
    }
}
