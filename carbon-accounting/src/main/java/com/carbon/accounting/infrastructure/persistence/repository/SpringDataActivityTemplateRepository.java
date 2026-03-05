package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.infrastructure.persistence.entity.ActivityTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataActivityTemplateRepository extends JpaRepository<ActivityTemplateEntity, UUID> {
    List<ActivityTemplateEntity> findByIndustryTypeIdAndCategoryId(UUID industryTypeId, UUID categoryId);
}
