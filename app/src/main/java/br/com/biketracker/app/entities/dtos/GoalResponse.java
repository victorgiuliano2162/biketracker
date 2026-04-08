package br.com.biketracker.app.entities.dtos;

import br.com.biketracker.app.entities.Goal;

import java.time.LocalDate;

public record GoalResponse(
        Long id,
        String name,
        String description,
        double targetValue,
        double currentValue,
        double progressPercent, // Calculado para o Angular usar na barra de progresso
        String unit,
        LocalDate createdAt,
        LocalDate deadLine

) {
    public static GoalResponse from(Goal goal) {
        if (goal == null) return null;

        return new GoalResponse(
                goal.getId(),
                goal.getName(),
                goal.getDescription(),
                goal.getTargetValue(),
                goal.getCurrentValue(),
                goal.getProgressPercent(),
                goal.getUnit(),
                goal.getCreatedAt(),
                goal.getDeadLine()

        );
    }
}
