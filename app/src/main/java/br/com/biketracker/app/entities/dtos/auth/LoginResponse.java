package br.com.biketracker.app.entities.dtos.auth;

public record LoginResponse(String accessToken, String refreshToken) {}
