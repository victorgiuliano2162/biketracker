package br.com.biketracker.app.entities.dtos.ride;

import br.com.biketracker.app.entities.Ride;

import java.time.LocalDateTime;

public record RideResponse(
        Long id,
        double distanceInKm,
        double elevationInMeters,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String startCity,
        String country,
        long activityTimeInSeconds
) {
    public static RideResponse from(Ride ride) {
        return new RideResponse(
                ride.getId(),
                ride.getDistanceInKm(),
                ride.getElevationInMeters(),
                ride.getStartTime(),
                ride.getEndTime(),
                ride.getStartCity(),
                ride.getCountry(),
                ride.getActivityTimeInSeconds()
        );
    }
}
