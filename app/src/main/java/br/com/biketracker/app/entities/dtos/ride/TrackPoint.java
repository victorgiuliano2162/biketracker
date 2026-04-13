package br.com.biketracker.app.entities.dtos.ride;

import java.time.LocalDateTime;

public record TrackPoint(
        double longitude,
        double latitude,
        double altitudeInMeters,
        LocalDateTime recordedAt
) {}