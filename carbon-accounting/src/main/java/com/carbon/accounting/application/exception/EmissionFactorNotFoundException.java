package com.carbon.accounting.application.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class EmissionFactorNotFoundException extends RuntimeException {
    public EmissionFactorNotFoundException(String message) {
        super(message);
    }
}
