package br.com.biketracker.app.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import br.com.biketracker.app.entities.Route;
import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.route.BoundingBoxRequest;
import br.com.biketracker.app.entities.dtos.route.*;
import br.com.biketracker.app.exceptions.ex.ResourceNotFoundException;
import br.com.biketracker.app.repositories.RouteRepository;
import br.com.biketracker.app.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;


@Service
@RequiredArgsConstructor
public class RouteService {

    private static final Logger logger = LoggerFactory.getLogger(RouteService.class);


    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final GeometryFactory geometryFactory =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional
    public RouteResponse createRoute(String userId, CreateRouteRequest request) {
        User user = userRepository.findByEmail(userId)
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
        route.setName(request.name());
        route.buildPath(geometryFactory, request.trackPoints());
        route.calculateActivityTime();

        return RouteResponse.from(routeRepository.save(route));
    }

    @Transactional(readOnly = true)
    public Page<RouteResponse> listMyRoutes(String userId, Pageable pageable) {
        var u = userRepository.findByEmail(userId);
        return routeRepository
                .findByUserIdOrderByStartTimeDesc(u.get().getId(), pageable)
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
        var u = userRepository.findByEmail(userId);
        List<Object[]> rows = routeRepository.findRoutePointsByRouteId(routeId, u.get().getId());

        if (rows.isEmpty()) {
            throw new ResourceNotFoundException("Route not found: " + routeId);
        }

        List<TrackPoint> points = rows.stream()
                .map(row -> {
                    LocalDateTime recordedAt;
                    if (row[3] instanceof Timestamp ts) {
                        recordedAt = ts.toLocalDateTime();
                    } else if (row[3] instanceof Instant instant) {
                        recordedAt = instant.atZone(ZoneOffset.UTC).toLocalDateTime();
                    } else {
                        throw new IllegalStateException("Tipo inesperado para recorded_at: " + row[3].getClass());
                    }

                    return new TrackPoint(
                            ((Number) row[0]).doubleValue(),
                            ((Number) row[1]).doubleValue(),
                            ((Number) row[2]).doubleValue(),
                            recordedAt
                    );
                })
                .toList();

        return new RouteReplayResponse(routeId, points);
    }

    @Transactional(readOnly = true)
    public List<RouteResponse> findByBoundingBox(String userId, BoundingBoxRequest bbox) {
        var u = userRepository.findByEmail(userId);
        List<String> ids = routeRepository.findIdsByUserAndBoundingBox(
                u.get().getId(),
                bbox.minLon(), bbox.minLat(),
                bbox.maxLon(), bbox.maxLat()
        );

        if (ids.isEmpty()) return List.of();

        return routeRepository.findAllById(ids)
                .stream()
                .map(RouteResponse::from)
                .toList();
    }

    @Transactional
    public boolean deleteRoute(String routeId, String userId) {
        logger.info("Tentando deletar routeId={} userId={}", routeId, userId);
        logger.info("Exists check: {}", routeRepository.existsByIdAndUserId(routeId, userId));

        // garante que a rota pertence ao usuário antes de deletar
        boolean owns = routeRepository.existsByIdAndUserId(routeId, userId);
        if (!owns) return false;

        routeRepository.deleteById(routeId);
        return true;
    }

    @Transactional
    public RouteResponse toggleVisibility(String userId, String routeId) {
        User user = userRepository.findByEmail(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Rota não encontrada"));

        if (!route.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Essa rota não pertence ao usuário");
        }

        route.setPublic(!route.isPublic());
        return RouteResponse.from(routeRepository.save(route));
    }
}
