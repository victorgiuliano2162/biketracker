package br.com.biketracker.app.exceptions;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponse(
        int status,
        String error,
        String message,
        String path,

        @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
        LocalDateTime timestamp,

        List<FieldError> fields  // preenchido apenas em erros de validação
) {
    // Construtor sem fields — para erros simples
    public ErrorResponse(int status, String error, String message, String path) {
        this(status, error, message, path, LocalDateTime.now(), null);
    }

    // Construtor com fields — para erros de validação (@Valid)
    public ErrorResponse(int status, String error, String message, String path, List<FieldError> fields) {
        this(status, error, message, path, LocalDateTime.now(), fields);
    }

    public record FieldError(String field, String message) {}
}
