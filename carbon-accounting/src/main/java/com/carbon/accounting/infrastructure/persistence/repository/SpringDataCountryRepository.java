package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.infrastructure.persistence.entity.CountryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringDataCountryRepository extends JpaRepository<CountryEntity, UUID> {
}
