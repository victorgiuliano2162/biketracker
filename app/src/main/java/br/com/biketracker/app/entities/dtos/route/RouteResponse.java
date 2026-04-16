package br.com.biketracker.app.entities.dtos.route;

import br.com.biketracker.app.entities.Route;

import java.time.LocalDateTime;

public record RouteResponse(
        String id,
        String name,
        double distanceInKm,
        double elevationInMeters,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String startCity,
        String country,
        long activityTimeInSeconds,
        boolean isPublic
) {
    public static RouteResponse from(Route route) {
        return new RouteResponse(
                route.getId(),
                route.getName(),
                route.getDistanceInKm(),
                route.getElevationInMeters(),
                route.getStartTime(),
                route.getEndTime(),
                route.getStartCity(),
                route.getCountry(),
                route.getActivityTimeInSeconds(),
                route.isPublic()
        );
    }
}
