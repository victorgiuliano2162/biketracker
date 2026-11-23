package br.com.biketracker.app.entities.dtos.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email
) {
    public String getEmail() {
        return email;
    }
}
