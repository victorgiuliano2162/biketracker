package br.com.biketracker.app.entities.dtos.goal;

import java.time.LocalDate;

public record GoalRequest(
        String name,
        String description,
        double targetValue,
        String unit,
        LocalDate deadLine
) {}
