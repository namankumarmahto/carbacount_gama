package com.carbon.accounting.interfaces.rest;

import com.carbon.accounting.core.domain.model.Industry;
import com.carbon.accounting.core.repository.IndustryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {

    private final IndustryRepository industryRepository;

    @PostMapping("/saveIndustry")
    public Industry saveIndustry(@RequestBody IndustryTestRequest request) {
        Industry industry = Industry.builder()
                .id(UUID.randomUUID())
                .name(request.getName())
                .sector(request.getSector())
                .location(request.getLocation())
                .createdAt(LocalDateTime.now())
                .build();

        return industryRepository.save(industry);
    }

    @lombok.Data
    public static class IndustryTestRequest {
        private String name;
        private String sector;
        private String location;
    }
}
