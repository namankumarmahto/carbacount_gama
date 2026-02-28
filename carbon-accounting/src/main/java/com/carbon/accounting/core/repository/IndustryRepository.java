package com.carbon.accounting.core.repository;

import com.carbon.accounting.core.domain.model.Industry;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface IndustryRepository {
    Industry save(Industry industry);

    Optional<Industry> findById(UUID id);

    List<Industry> findAllByTenant(UUID tenantId);
}
