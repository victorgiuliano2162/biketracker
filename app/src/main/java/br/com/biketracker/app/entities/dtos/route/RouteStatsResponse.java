package br.com.biketracker.app.entities.dtos.route;

public interface RouteStatsResponse {
    Long getTotalRoutes();
    Double getTotalDistanceInKm();
    Double getTotalElevationInMeters();
    Long getTotalActivityTimeInSeconds();
}
