package br.com.biketracker.app.entities.dtos.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Token é obrigatório")
        String token,

        @NotBlank(message = "Nova senha é obrigatória")
        @Size(min = 8, message = "A nova senha deve ter no mínimo 8 caracteres")
        String newPassword
) {
    public String getToken() {
        return token;
    }

    public String getNewPassword() {
        return newPassword;
    }
}
