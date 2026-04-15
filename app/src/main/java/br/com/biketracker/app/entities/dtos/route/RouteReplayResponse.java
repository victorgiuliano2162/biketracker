package br.com.biketracker.app.entities.dtos.route;

import java.util.List;

public record RouteReplayResponse(
        String routeId,
        List<TrackPoint> points
) {}
