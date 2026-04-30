package br.com.biketracker.app.entities.dtos.route;

public record BoundingBoxRequest(
        double minLon,
        double minLat,
        double maxLon,
        double maxLat
) {}
