package br.com.biketracker.app.entities.dtos;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.util.List;

public record HomeStatsResponse(

        double totalDistanceKm,
        double totalElevationMeters,
        long totalActivitySeconds,
        long totalRides,

        List<RideSummary> recentRides,

        List<DailyDistance> weeklyChart,

        List<GoalSummary> activeGoals

) {
    public double totalDistance() {
        return totalDistanceKm;
    }

    public long totalRoutes() {
        return totalRides;
    }

    public double totalElevation() {
        return totalElevationMeters;
    }

    public record RideSummary(
            String id,
            double distanceInKm,
            double elevationInMeters,
            long activityTimeInSeconds,
            String startTime
    ) {}

    public record DailyDistance(
            String date,   // formato "dd/MM"
            double distanceKm
    ) {
        public double distance() {
            return distanceKm;
        }

        public LocalDate day() {

            int currentYear = LocalDate.now().getYear();

            DateTimeFormatter formatter = new DateTimeFormatterBuilder()
                    .appendPattern("dd/MM")
                    .parseDefaulting(ChronoField.YEAR, currentYear)
                    .toFormatter();

            return LocalDate.parse(date, formatter);
        }
    }

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
