package br.com.biketracker.app.entities.dtos.ride;

import java.util.List;

public record RouteReplayResponse(
        Long rideId,
        List<TrackPoint> points
) {}