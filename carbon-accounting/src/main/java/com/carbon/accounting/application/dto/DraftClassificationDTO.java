package com.carbon.accounting.application.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class DraftClassificationDTO {
    private String scope;
    private UUID categoryId;
    private String customCategoryName;
}
