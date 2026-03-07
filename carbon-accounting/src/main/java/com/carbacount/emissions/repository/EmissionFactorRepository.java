package com.carbacount.emissions.repository;

import com.carbacount.emissions.entity.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, UUID> {
    List<EmissionFactor> findByCountry(String country);

    List<EmissionFactor> findByCountryAndFuelType(String country, String fuelType);

    List<EmissionFactor> findByCountryAndElectricitySource(String country, String electricitySource);

    Optional<EmissionFactor> findTopByCountryAndFuelTypeAndUnitIgnoreCaseOrderByFactorYearDesc(String country, String fuelType, String unit);

    Optional<EmissionFactor> findTopByCountryAndElectricitySourceAndUnitIgnoreCaseOrderByFactorYearDesc(String country, String electricitySource, String unit);

    Optional<EmissionFactor> findTopByCountryAndFuelTypeIgnoreCaseOrderByFactorYearDesc(String country, String fuelType);

    Optional<EmissionFactor> findTopByCountryAndElectricitySourceIgnoreCaseOrderByFactorYearDesc(String country, String electricitySource);

    Optional<EmissionFactor> findTopByFuelTypeIgnoreCaseOrderByFactorYearDesc(String fuelType);

    Optional<EmissionFactor> findTopByElectricitySourceIgnoreCaseOrderByFactorYearDesc(String electricitySource);

    List<EmissionFactor> findByScopeTypeOrderByFactorYearDescCreatedAtDesc(String scopeType);

    List<EmissionFactor> findAllByOrderByFactorYearDescCreatedAtDesc();

    Optional<EmissionFactor> findTopByScopeTypeAndSourceNameIgnoreCaseAndUnitIgnoreCaseOrderByFactorYearDesc(String scopeType, String sourceName, String unit);

    Optional<EmissionFactor> findTopByScopeTypeAndSourceNameIgnoreCaseOrderByFactorYearDesc(String scopeType, String sourceName);

    Optional<EmissionFactor> findTopByCountryAndScopeTypeAndSourceNameIgnoreCaseAndUnitIgnoreCaseOrderByFactorYearDesc(
            String country, String scopeType, String sourceName, String unit);

    Optional<EmissionFactor> findTopByCountryAndScopeTypeAndSourceNameIgnoreCaseOrderByFactorYearDesc(
            String country, String scopeType, String sourceName);

    @Query("""
            SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END
            FROM EmissionFactor e
            WHERE LOWER(COALESCE(e.scopeType, '')) = LOWER(COALESCE(:scopeType, ''))
              AND LOWER(COALESCE(e.sourceName, '')) = LOWER(COALESCE(:sourceName, ''))
              AND LOWER(COALESCE(e.unit, '')) = LOWER(COALESCE(:unit, ''))
              AND COALESCE(e.factorYear, -1) = COALESCE(:factorYear, -1)
            """)
    boolean existsDuplicate(@Param("scopeType") String scopeType,
                            @Param("sourceName") String sourceName,
                            @Param("unit") String unit,
                            @Param("factorYear") Integer factorYear);

    @Query("""
            SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END
            FROM EmissionFactor e
            WHERE e.id <> :id
              AND LOWER(COALESCE(e.scopeType, '')) = LOWER(COALESCE(:scopeType, ''))
              AND LOWER(COALESCE(e.sourceName, '')) = LOWER(COALESCE(:sourceName, ''))
              AND LOWER(COALESCE(e.unit, '')) = LOWER(COALESCE(:unit, ''))
              AND COALESCE(e.factorYear, -1) = COALESCE(:factorYear, -1)
            """)
    boolean existsDuplicateExcludingId(@Param("id") UUID id,
                                       @Param("scopeType") String scopeType,
                                       @Param("sourceName") String sourceName,
                                       @Param("unit") String unit,
                                       @Param("factorYear") Integer factorYear);

    @Query("""
            SELECT DISTINCT e.activityType
            FROM EmissionFactor e
            WHERE UPPER(COALESCE(e.scopeType, '')) = UPPER(:scopeType)
              AND (LOWER(COALESCE(e.industryType, 'all')) = LOWER(:industryType)
                   OR LOWER(COALESCE(e.industryType, 'all')) = 'all')
              AND e.sourceName IS NOT NULL
            ORDER BY e.activityType
            """)
    List<String> findDistinctActivityTypesForScopeAndIndustry(@Param("scopeType") String scopeType,
                                                              @Param("industryType") String industryType);

    @Query("""
            SELECT DISTINCT e.sourceName
            FROM EmissionFactor e
            WHERE UPPER(COALESCE(e.scopeType, '')) = UPPER(:scopeType)
              AND (LOWER(COALESCE(e.industryType, 'all')) = LOWER(:industryType)
                   OR LOWER(COALESCE(e.industryType, 'all')) = 'all')
            ORDER BY e.sourceName
            """)
    List<String> findDistinctSourcesForScopeAndIndustry(@Param("scopeType") String scopeType,
                                                        @Param("industryType") String industryType);

    @Query("""
            SELECT DISTINCT e.unit
            FROM EmissionFactor e
            WHERE UPPER(COALESCE(e.scopeType, '')) = UPPER(:scopeType)
              AND LOWER(COALESCE(e.sourceName, '')) = LOWER(:sourceName)
              AND (LOWER(COALESCE(e.industryType, 'all')) = LOWER(:industryType)
                   OR LOWER(COALESCE(e.industryType, 'all')) = 'all')
            ORDER BY e.unit
            """)
    List<String> findDistinctUnitsForSource(@Param("scopeType") String scopeType,
                                            @Param("sourceName") String sourceName,
                                            @Param("industryType") String industryType);

    @Query("""
            SELECT DISTINCT e.unit
            FROM EmissionFactor e
            WHERE LOWER(COALESCE(e.sourceName, '')) = LOWER(:sourceName)
              AND (LOWER(COALESCE(e.industryType, 'all')) = LOWER(:industryType)
                   OR LOWER(COALESCE(e.industryType, 'all')) = 'all')
            ORDER BY e.unit
            """)
    List<String> findDistinctUnitsForSourceAcrossScopes(@Param("sourceName") String sourceName,
                                                        @Param("industryType") String industryType);

    @Query("""
            SELECT e
            FROM EmissionFactor e
            WHERE UPPER(COALESCE(e.scopeType, '')) = UPPER(:scopeType)
              AND LOWER(COALESCE(e.sourceName, '')) = LOWER(:sourceName)
              AND LOWER(COALESCE(e.unit, '')) = LOWER(:unit)
              AND (:activityType IS NULL OR :activityType = '' OR LOWER(COALESCE(e.activityType, '')) = LOWER(:activityType))
              AND (:country IS NULL OR :country = '' OR LOWER(COALESCE(e.country, '')) = LOWER(:country))
              AND (LOWER(COALESCE(e.industryType, 'all')) = LOWER(:industryType)
                   OR LOWER(COALESCE(e.industryType, 'all')) = 'all')
            ORDER BY e.factorYear DESC NULLS LAST, e.createdAt DESC
            """)
    List<EmissionFactor> findLatestFactorCandidates(@Param("scopeType") String scopeType,
                                                    @Param("sourceName") String sourceName,
                                                    @Param("unit") String unit,
                                                    @Param("activityType") String activityType,
                                                    @Param("country") String country,
                                                    @Param("industryType") String industryType);

    @Query("""
            SELECT e
            FROM EmissionFactor e
            WHERE LOWER(COALESCE(e.sourceName, '')) = LOWER(:sourceName)
              AND LOWER(COALESCE(e.unit, '')) = LOWER(:unit)
              AND (:activityType IS NULL OR :activityType = '' OR LOWER(COALESCE(e.activityType, '')) = LOWER(:activityType))
              AND (:country IS NULL OR :country = '' OR LOWER(COALESCE(e.country, '')) = LOWER(:country))
              AND (LOWER(COALESCE(e.industryType, 'all')) = LOWER(:industryType)
                   OR LOWER(COALESCE(e.industryType, 'all')) = 'all')
            ORDER BY e.factorYear DESC NULLS LAST, e.createdAt DESC
            """)
    List<EmissionFactor> findLatestFactorCandidatesAcrossScopes(@Param("sourceName") String sourceName,
                                                                @Param("unit") String unit,
                                                                @Param("activityType") String activityType,
                                                                @Param("country") String country,
                                                                @Param("industryType") String industryType);

    @Query("""
            SELECT e
            FROM EmissionFactor e
            WHERE UPPER(COALESCE(e.scopeType, '')) = UPPER(:scopeType)
              AND (LOWER(COALESCE(e.industryType, 'all')) = LOWER(:industryType)
                   OR LOWER(COALESCE(e.industryType, 'all')) = 'all')
            ORDER BY e.activityType ASC, e.sourceName ASC, e.unit ASC, e.factorYear DESC NULLS LAST, e.createdAt DESC
            """)
    List<EmissionFactor> findAllByScopeAndIndustry(@Param("scopeType") String scopeType,
                                                   @Param("industryType") String industryType);
}
