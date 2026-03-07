package com.carbacount.emissions.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

@Value
@Builder
public class SubmissionDocumentResponse {
    UUID id;
    UUID submissionId;
    String fileName;
    String fileType;
    String fileUrl;
    String uploadedBy;
    LocalDateTime uploadedAt;
}
