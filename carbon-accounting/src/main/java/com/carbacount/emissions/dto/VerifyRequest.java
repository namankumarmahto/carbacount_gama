package com.carbacount.emissions.dto;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyRequest {
    private String type; // FUEL | ELECTRICITY | SCOPE3
    private String action; // APPROVE | REJECT
    private String reason; // required if REJECT
}
