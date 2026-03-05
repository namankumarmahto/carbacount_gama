package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.infrastructure.persistence.entity.StateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataStateRepository extends JpaRepository<StateEntity, UUID> {
    List<StateEntity> findByCountryId(UUID countryId);
}
