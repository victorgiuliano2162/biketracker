package br.com.biketracker.app.entities.dtos.ride;

import java.time.LocalDateTime;
import java.util.List;

public record CreateRideRequest(
        double distanceInKm,
        double elevationInMeters,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String startCity,
        String country,
        List<TrackPoint> trackPoints
) {}
