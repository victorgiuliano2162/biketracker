package br.com.biketracker.app.entities.dtos.route;

import br.com.biketracker.app.entities.enums.RouteDifficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateRouteRequest(
        @NotBlank(message = "Nome da rota é obrigatório")
        @Size(max = 150, message = "Nome da rota deve ter no máximo 150 caracteres")
        String name,

        @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
        String description,

        @NotNull(message = "Dificuldade da rota é obrigatória")
        RouteDifficulty difficulty,

        String country,
        String startCity
) {}
