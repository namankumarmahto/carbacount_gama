package com.carbacount.emissions.repository;

import com.carbacount.emissions.entity.SubmissionDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionDocumentRepository extends JpaRepository<SubmissionDocument, UUID> {
    List<SubmissionDocument> findBySubmissionId(UUID submissionId);
}
