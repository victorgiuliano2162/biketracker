package br.com.biketracker.app.entities.dtos.auth;

public record ResetPasswordRequest(String token, String newPassword) {
    public String getToken() {
        return token;
    }

    public String getNewPassword() {
        return newPassword;
    }
}
