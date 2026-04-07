package br.com.biketracker.app.exceptions;

public class Exceptions {
    // ─── Recurso não encontrado (404) ───────────────────────────────────────────
    public class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String resource, String field, Object value) {
            super(String.format("%s não encontrado(a) com %s: '%s'", resource, field, value));
        }
    }

    // ─── Conflito de dados — ex: e-mail já cadastrado (409) ─────────────────────
    public class DuplicateResourceException extends RuntimeException {
        public DuplicateResourceException(String resource, String field, Object value) {
            super(String.format("Já existe um(a) %s com %s: '%s'", resource, field, value));
        }
    }

    // ─── Regra de negócio violada (422) ─────────────────────────────────────────
    public class BusinessException extends RuntimeException {
        public BusinessException(String message) {
            super(message);
        }
    }

    // ─── Acesso não autorizado (401) ────────────────────────────────────────────
    public class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) {
            super(message);
        }
    }

    // ─── Acesso proibido (403) ──────────────────────────────────────────────────
    public class ForbiddenException extends RuntimeException {
        public ForbiddenException(String message) {
            super(message);
        }
    }
}
