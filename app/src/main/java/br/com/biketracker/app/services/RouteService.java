package br.com.biketracker.app.services;

import org.springframework.stereotype.Service;

import br.com.biketracker.app.entities.Route;
import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.BoundingBoxRequest;
import br.com.biketracker.app.entities.dtos.route.*;
import br.com.biketracker.app.exceptions.ex.ResourceNotFoundException;
import br.com.biketracker.app.repositories.RouteRepository;
import br.com.biketracker.app.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final GeometryFactory geometryFactory =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional
    public RouteResponse createRoute(String userId, CreateRouteRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Route route = new Route();
        route.setDistanceInKm(request.distanceInKm());
        route.setElevationInMeters(request.elevationInMeters());
        route.setStartTime(request.startTime());
        route.setEndTime(request.endTime());
        route.setStartCity(request.startCity());
        route.setCountry(request.country());
        route.setPublic(request.isPublic());
        route.setUser(user);
        route.buildPath(geometryFactory, request.trackPoints());
        route.calculateActivityTime();

        return RouteResponse.from(routeRepository.save(route));
    }

    @Transactional(readOnly = true)
    public Page<RouteResponse> listMyRoutes(String userId, Pageable pageable) {
        return routeRepository
                .findByUserIdOrderByStartTimeDesc(userId, pageable)
                .map(RouteResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<RouteResponse> listPublicRoutes(Pageable pageable) {
        return routeRepository
                .findByIsPublicTrueOrderByStartTimeDesc(pageable)
                .map(RouteResponse::from);
    }

    @Transactional(readOnly = true)
    public RouteStatsResponse getStats(String userId) {
        return routeRepository.findStatsByUserId(userId);
    }

    @Transactional(readOnly = true)
    public RouteReplayResponse getRouteReplay(String userId, String routeId) {
        List<Object[]> rows = routeRepository.findRoutePointsByRouteId(routeId, userId);

        if (rows.isEmpty()) {
            throw new ResourceNotFoundException("Route not found: " + routeId);
        }

        List<TrackPoint> points = rows.stream()
                .map(row -> new TrackPoint(
                        ((Number) row[0]).doubleValue(),
                        ((Number) row[1]).doubleValue(),
                        ((Number) row[2]).doubleValue(),
                        ((Timestamp) row[3]).toLocalDateTime()
                ))
                .toList();

        return new RouteReplayResponse(routeId, points);
    }

    @Transactional(readOnly = true)
    public List<RouteResponse> findByBoundingBox(String userId, BoundingBoxRequest bbox) {
        List<Long> ids = routeRepository.findIdsByUserAndBoundingBox(
                userId,
                bbox.minLon(), bbox.minLat(),
                bbox.maxLon(), bbox.maxLat()
        );

        if (ids.isEmpty()) return List.of();

        return routeRepository.findAllById(ids)
                .stream()
                .map(RouteResponse::from)
                .toList();
    }
}
