package com.carbacount.facility.repository;

import com.carbacount.facility.entity.Facility;
import com.carbacount.facility.entity.FacilityUserMapping;
import com.carbacount.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FacilityUserMappingRepository extends JpaRepository<FacilityUserMapping, UUID> {
    List<FacilityUserMapping> findByUserId(UUID userId);

    List<FacilityUserMapping> findByFacilityId(UUID facilityId);

    void deleteByFacilityIdAndUserId(UUID facilityId, UUID userId);

    boolean existsByFacilityIdAndUserId(UUID facilityId, UUID userId);

    void deleteByUser(User user);

    void deleteByFacility(Facility facility);

    /**
     * Returns only the facility UUIDs assigned to a user — avoids lazy-loading
     * the Facility entity for each mapping row.
     */
    @Query("SELECT m.facility.id FROM FacilityUserMapping m WHERE m.user.id = :userId")
    List<UUID> findFacilityIdsByUserId(@Param("userId") UUID userId);
}
