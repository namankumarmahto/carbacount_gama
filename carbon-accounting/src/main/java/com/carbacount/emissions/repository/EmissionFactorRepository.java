package com.carbacount.emissions.repository;

import com.carbacount.emissions.entity.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, UUID> {
    List<EmissionFactor> findByCountry(String country);

    List<EmissionFactor> findByCountryAndFuelType(String country, String fuelType);

    List<EmissionFactor> findByCountryAndElectricitySource(String country, String electricitySource);
}
