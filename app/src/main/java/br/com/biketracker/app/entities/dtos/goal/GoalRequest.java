package br.com.biketracker.app.entities.dtos.goal;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record GoalRequest(
        @NotBlank(message = "Nome da meta é obrigatório")
        @Size(max = 120, message = "Nome da meta deve ter no máximo 120 caracteres")
        String name,

        @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
        String description,

        @Positive(message = "Valor alvo deve ser maior que zero")
        double targetValue,

        @NotBlank(message = "Unidade da meta é obrigatória")
        String unit,

        @NotNull(message = "Prazo da meta é obrigatório")
        LocalDate deadLine
) {}
