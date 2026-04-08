package br.com.biketracker.app.entities.dtos;

import java.util.List;

public record HomeStatsResponse(

        double totalDistanceKm,
        double totalElevationMeters,
        long totalActivitySeconds,
        int totalRides,


        List<RideSummary> recentRides,

        List<DailyDistance> weeklyChart,

        List<GoalSummary> activeGoals

) {
    public record RideSummary(
            Long id,
            double distanceInKm,
            double elevationInMeters,
            long activityTimeInSeconds,
            String startTime
    ) {}

    public record DailyDistance(
            String date,   // formato "dd/MM"
            double distanceKm
    ) {}

    public record GoalSummary(
            Long id,
            String name,
            String description,
            double targetValue,
            double currentValue,
            double progressPercent,
            String unit,
            String deadLine
    ) {}
}
