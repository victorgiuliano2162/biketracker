package br.com.biketracker.app.entities.dtos.route;

import br.com.biketracker.app.entities.Route;
import br.com.biketracker.app.entities.enums.RouteDifficulty;

import java.time.LocalDateTime;

public record RouteResponse(
        String id,
        String name,
        double distanceInKm,
        double elevationInMeters,
        LocalDateTime startTime,
        LocalDateTime endTime,
        LocalDateTime createdAt,
        String startCity,
        String country,
        long activityTimeInSeconds,
        boolean isPublic,
        RouteDifficulty routeDifficulty,
        String userName,   // <-- adicionado
        String description
) {
    public static RouteResponse from(Route route) {
        return new RouteResponse(
                route.getId(),
                route.getName(),
                route.getDistanceInKm(),
                route.getElevationInMeters(),
                route.getStartTime(),
                route.getEndTime(),
                route.getCreatedAt(),
                route.getStartCity(),
                route.getCountry(),
                route.getActivityTimeInSeconds(),
                route.isPublic(),
                route.getDifficulty(),
                route.getUser() != null ? route.getUser().getUserName() : null,  // <-- adicionado
                route.getDescription()
        );
    }
}
