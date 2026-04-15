package br.com.biketracker.app.entities.dtos.route;


import java.time.LocalDateTime;
import java.util.List;

public record CreateRouteRequest(
        double distanceInKm,
        double elevationInMeters,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String startCity,
        String country,
        boolean isPublic,
        List<TrackPoint> trackPoints
) {}
