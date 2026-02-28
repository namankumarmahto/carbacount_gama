package com.carbon.accounting.application.exception;

public class InvalidEmissionDataException extends RuntimeException {
    public InvalidEmissionDataException(String message) {
        super(message);
    }
}
