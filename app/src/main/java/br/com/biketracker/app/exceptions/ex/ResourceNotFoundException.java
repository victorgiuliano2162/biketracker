package br.com.biketracker.app.exceptions.ex;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, String field, Object value) {
        super(String.format("%s não encontrado(a) com %s: '%s'", resource, field, value));
    }

    public ResourceNotFoundException(String resource) {
        super("Resource not found: " + resource);
    }
}
