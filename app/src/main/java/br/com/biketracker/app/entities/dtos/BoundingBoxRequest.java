package br.com.biketracker.app.entities.dtos;

public record BoundingBoxRequest(
        double minLon,
        double minLat,
        double maxLon,
        double maxLat
) {}
