package com.carbon.accounting.interfaces.rest;

import com.carbon.accounting.infrastructure.service.ReportService;
import com.carbacount.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/download")
    @PreAuthorize("hasRole('INDUSTRY') or hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadReport(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) Instant endDate) {

        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID tenantId = principal.getTenantId();
        UUID industryTypeId = principal.getIndustryTypeId();

        // In a real app we might fetch Company Name from an Industry entity.
        // For now, let's use a placeholder or use the user's name as company for the
        // report.
        String companyName = principal.getUsername().split("@")[0].toUpperCase();

        byte[] pdf = reportService.generateEmissionReport(tenantId, industryTypeId, companyName, startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Emission_Report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
