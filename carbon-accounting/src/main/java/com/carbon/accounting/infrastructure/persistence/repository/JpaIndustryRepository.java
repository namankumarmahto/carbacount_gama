package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.core.domain.model.Industry;
import com.carbon.accounting.core.repository.IndustryRepository;
import com.carbon.accounting.infrastructure.persistence.entity.IndustryEntity;
import com.carbon.accounting.infrastructure.persistence.mapper.IndustryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JpaIndustryRepository implements IndustryRepository {

    private final SpringDataIndustryRepository repository;
    private final IndustryMapper mapper;

    @Override
    public Industry save(Industry industry) {
        IndustryEntity entity = mapper.toEntity(industry);
        IndustryEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Industry> findById(UUID id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Industry> findAllByTenant(UUID tenantId) {
        return repository.findByTenantId(tenantId).stream().map(mapper::toDomain).collect(Collectors.toList());
    }
}
