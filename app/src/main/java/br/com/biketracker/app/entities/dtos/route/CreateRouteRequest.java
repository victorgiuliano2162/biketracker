package br.com.biketracker.app.entities.dtos.route;


import br.com.biketracker.app.entities.enums.RouteDifficulty;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public record CreateRouteRequest(
        @PositiveOrZero(message = "Distância não pode ser negativa")
        double distanceInKm,

        @NotBlank(message = "Nome da rota é obrigatório")
        @Size(max = 150, message = "Nome da rota deve ter no máximo 150 caracteres")
        String name,

        @PositiveOrZero(message = "Elevação não pode ser negativa")
        double elevationInMeters,

        @NotNull(message = "Data/hora de início é obrigatória")
        LocalDateTime startTime,

        @NotNull(message = "Data/hora de término é obrigatória")
        LocalDateTime endTime,

        String startCity,
        String country,
        boolean isPublic,

        @NotNull(message = "Dificuldade da rota é obrigatória")
        RouteDifficulty difficulty,

        @NotEmpty(message = "A rota deve conter ao menos um ponto de traçado")
        List<TrackPoint> trackPoints,

        @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
        String description
) {}
