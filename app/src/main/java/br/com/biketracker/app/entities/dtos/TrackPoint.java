package br.com.biketracker.app.entities.dtos;

import java.time.LocalDateTime;

public record TrackPoint(
        double longitude,
        double latitude,
        double altitudeInMeters,
        LocalDateTime recordedAt
) {}