package br.com.biketracker.app.entities.dtos.route;


import br.com.biketracker.app.entities.enums.RouteDifficulty;

import java.time.LocalDateTime;
import java.util.List;

public record CreateRouteRequest(
        double distanceInKm,
        String name,
        double elevationInMeters,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String startCity,
        String country,
        boolean isPublic,
        RouteDifficulty difficulty,
        List<TrackPoint> trackPoints,
        String description
) {}
