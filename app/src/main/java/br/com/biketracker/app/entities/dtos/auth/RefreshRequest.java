package br.com.biketracker.app.entities.dtos.auth;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(
        @NotBlank(message = "Refresh token é obrigatório")
        String refreshToken
) {}
