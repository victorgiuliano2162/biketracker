package br.com.biketracker.app.entities.dtos.authDto;


public record ForgotPasswordRequest(String email) {
    public String getEmail() {
        return email;
    }
}
