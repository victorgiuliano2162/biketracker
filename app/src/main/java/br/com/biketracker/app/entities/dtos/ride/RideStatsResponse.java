package br.com.biketracker.app.entities.dtos.ride;

public record RideStatsResponse(
        long totalRides,
        double totalDistanceInKm,
        double totalElevationInMeters,
        long totalActivityTimeInSeconds
) {}