package br.com.biketracker.app.services;

import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class RouteService {

    private static final Logger logger = LoggerFactory.getLogger(RouteService.class);


    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final GeometryFactory geometryFactory =
            new GeometryFactory(new PrecisionModel(), 4326);
    private final MinioStorageService minioStorageService;
    private final ActivityImageService activityImageService;

    @Transactional
    public RouteResponse createRoute(String userId, CreateRouteRequest request) {
        User user = userRepository.findByEmail(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Route route = new Route();
        route.setDistanceInKm(request.distanceInKm());
        route.setElevationInMeters(request.elevationInMeters());
        route.setStartTime(request.startTime());
        route.setEndTime(request.endTime());
        route.setCreatedAt(LocalDateTime.now());
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
    public RouteResponse getRouteById(String userId, String routeId) {
        User user = userRepository.findByEmail(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Rota não encontrada: " + routeId));

        if (!route.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Essa rota não pertence ao usuário");
        }

        return RouteResponse.from(route);
    }

    @Transactional(readOnly = true)
    public Page<RouteResponse> listMyRoutes(String userId, Pageable pageable) {
        var u = userRepository.findByEmail(userId);
        return routeRepository
                .findByUserIdOrderByStartTimeDesc(u.get().getId(), pageable)
                .map(RouteResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<RouteResponse> listPublicRoutesNOUSAGE(Pageable pageable) {
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

    @Transactional
    public Route findRouteById(String id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found: " + id));
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
        log.info("Tentando deletar routeId={} userId={}", routeId, userId);
        logger.info("Exists check: {}", routeRepository.existsByIdAndUserId(routeId, userId));

        // garante que a rota pertence ao usuário antes de deletar
        boolean owns = routeRepository.existsByIdAndUserId(routeId, userId);
        if (!owns) return false;
        activityImageService.deleteImageByRouteId(routeId);
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


    // -------------------------------------------------------------------------

    //SVG for front end
    //SVG strateggy was deprecated thus ugly images
    public String buildSvgPreview(String routeId) {
        return routeRepository.findById(routeId)
                .filter(Route::isPublic)
                .map(route -> renderSvg(route.getPath()))
                .orElse(null);
    }


    private String renderSvg(org.locationtech.jts.geom.LineString path) {
        if (path == null || path.getNumPoints() < 2) return fallbackSvg();

        org.locationtech.jts.geom.Coordinate[] coords = path.getCoordinates();

        // Bounding box do traçado
        double minX = Double.MAX_VALUE, maxX = -Double.MAX_VALUE;
        double minY = Double.MAX_VALUE, maxY = -Double.MAX_VALUE;
        for (org.locationtech.jts.geom.Coordinate c : coords) {
            if (c.x < minX) minX = c.x;
            if (c.x > maxX) maxX = c.x;
            if (c.y < minY) minY = c.y;
            if (c.y > maxY) maxY = c.y;
        }

        double rangeX = maxX - minX;
        double rangeY = maxY - minY;
        if (rangeX == 0 || rangeY == 0) return fallbackSvg();

        // ViewBox com padding de 5%
        int W = 400, H = 300;
        double pad = 0.05;
        double scaleX = W * (1 - 2 * pad) / rangeX;
        double scaleY = H * (1 - 2 * pad) / rangeY;

        // Normaliza coordenadas para o SVG (Y invertido)
        StringBuilder points = new StringBuilder();
        for (org.locationtech.jts.geom.Coordinate c : coords) {
            double px = W * pad + (c.x - minX) * scaleX;
            double py = H - (H * pad + (c.y - minY) * scaleY); // inverte Y
            if (!points.isEmpty()) points.append(" ");
            points.append(String.format("%.1f,%.1f", px, py));
        }

        return """
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">
          <rect width="%d" height="%d" fill="#f1f8e9"/>
          <polyline
            points="%s"
            fill="none"
            stroke="#2e7d32"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        """.formatted(W, H, W, H, W, H, points.toString());
    }

    private String fallbackSvg() {
        return """
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
          <rect width="400" height="300" fill="#f5f5f5"/>
          <text x="200" y="155" text-anchor="middle" font-size="14" fill="#bdbdbd">sem traçado</text>
        </svg>
        """;
    }

    /**
            * Verifica se já existe preview para a rota e retorna a URL,
 * ou retorna null se ainda não foi gerado.
 * Usado pelo frontend para decidir se precisa renderizar o Leaflet.
            */
    public String getPreviewUrl(String routeId) {
        // Verifica se a rota existe e é pública antes de consultar MinIO
        routeRepository.findById(routeId)
                .filter(Route::isPublic)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rota não encontrada: " + routeId));

        return minioStorageService.getRoutePreviewUrl(routeId);
    }

    /**
     * Recebe o PNG gerado pelo Leaflet no frontend e persiste no MinIO.
     * Retorna a URL pública da imagem salva.
     */
    public String savePreview(String routeId, byte[] pngBytes) {
        routeRepository.findById(routeId)
                .filter(Route::isPublic)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rota não encontrada: " + routeId));

        try {
            return minioStorageService.uploadRoutePreview(routeId, pngBytes);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao salvar preview da rota " + routeId, e);
        }
    }

    public Page<RouteResponse> listPublicRoutes(Pageable pageable) {
        return routeRepository.findAllByIsPublicTrue(pageable)
                .map(RouteResponse::from);
    }

    public Page<RouteResponse> findPublicRoutesInBoundingBox(BoundingBoxRequest bbox, Pageable pageable) {
        // Passa Pageable sem sort — a ordenação está fixada na query nativa (ORDER BY r.start_time DESC)
        Pageable unsorted = org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        return routeRepository.findPublicRoutesInBoundingBox(
                bbox.minLon(),
                bbox.minLat(),
                bbox.maxLon(),
                bbox.maxLat(),
                unsorted
        ).map(RouteResponse::from);
    }
}
