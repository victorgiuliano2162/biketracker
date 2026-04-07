package br.com.biketracker.app.exceptions;


import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);


    // ─── Exceções customizadas ───────────────────────────────────────────────

    @ExceptionHandler(Exceptions.ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            Exceptions.ResourceNotFoundException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ErrorResponse(404, "Not Found", ex.getMessage(), request.getRequestURI())
        );
    }

    @ExceptionHandler(Exceptions.DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(
            Exceptions.DuplicateResourceException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ErrorResponse(409, "Conflict", ex.getMessage(), request.getRequestURI())
        );
    }

    @ExceptionHandler(Exceptions.BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(
            Exceptions.BusinessException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
                new ErrorResponse(422, "Unprocessable Entity", ex.getMessage(), request.getRequestURI())
        );
    }

    @ExceptionHandler(Exceptions.UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            Exceptions.UnauthorizedException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ErrorResponse(401, "Unauthorized", ex.getMessage(), request.getRequestURI())
        );
    }

    @ExceptionHandler(Exceptions.ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(
            Exceptions.ForbiddenException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                new ErrorResponse(403, "Forbidden", ex.getMessage(), request.getRequestURI())
        );
    }

    // ─── Spring Security ─────────────────────────────────────────────────────

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(
            AuthenticationException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ErrorResponse(401, "Unauthorized", "Credenciais inválidas", request.getRequestURI())
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                new ErrorResponse(403, "Forbidden", "Acesso não permitido", request.getRequestURI())
        );
    }

    // ─── JPA ─────────────────────────────────────────────────────────────────

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(
            EntityNotFoundException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ErrorResponse(404, "Not Found", ex.getMessage(), request.getRequestURI())
        );
    }

    // ─── Validação de campos (@Valid / @Validated) ───────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<ErrorResponse.FieldError> fields = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> new ErrorResponse.FieldError(e.getField(), e.getDefaultMessage()))
                .toList();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ErrorResponse(400, "Bad Request", "Erro de validação nos campos enviados",
                        request.getRequestURI(), fields)
        );
    }

    // ─── Argumentos ilegais ──────────────────────────────────────────────────

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ErrorResponse(400, "Bad Request", ex.getMessage(), request.getRequestURI())
        );
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(
            IllegalStateException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ErrorResponse(409, "Conflict", ex.getMessage(), request.getRequestURI())
        );
    }

    // ─── Fallback — qualquer exceção não mapeada (500) ───────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(
            Exception ex, HttpServletRequest request) {

        log.error("Erro inesperado em {}: ", request.getRequestURI(), ex); // ← adicione isso

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse(500, "Internal Server Error",
                        "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                        request.getRequestURI())
        );
    }
}
