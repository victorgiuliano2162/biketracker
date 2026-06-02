package br.com.biketracker.app.controllers;

import br.com.biketracker.app.entities.dtos.route.BoundingBoxRequest;
import br.com.biketracker.app.entities.dtos.route.CreateRouteRequest;
import br.com.biketracker.app.entities.dtos.route.RouteReplayResponse;
import br.com.biketracker.app.entities.dtos.route.RouteResponse;
import br.com.biketracker.app.entities.dtos.route.RouteStatsResponse;
import br.com.biketracker.app.services.RouteService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;
    private static final Logger logger = LoggerFactory.getLogger(RouteController.class);

    // Registra nova rota
    @PostMapping
    public ResponseEntity<RouteResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CreateRouteRequest request
    ) {
        System.out.println(jwt);
        System.out.println(jwt.getSubject());
        String userId = jwt.getSubject();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(routeService.createRoute(userId, request));
    }

    // Lista rotas do usuário autenticado
    @GetMapping("/my")
    public ResponseEntity<Page<RouteResponse>> listMine(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 10, sort = "startTime", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(routeService.listMyRoutes(userId, pageable));
    }

    // Stats do usuário autenticado
    @GetMapping("/my/stats")
    public ResponseEntity<RouteStatsResponse> stats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        return ResponseEntity.ok(routeService.getStats(userId));
    }

    // Replay de uma rota específica do usuário
    @GetMapping("/my/{routeId}/replay")
    public ResponseEntity<RouteReplayResponse> replay(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String routeId
    ) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(routeService.getRouteReplay(userId, routeId));
    }

    // Busca rotas do usuário por região geográfica
    @GetMapping("/my/search/region")
    public ResponseEntity<List<RouteResponse>> findByRegion(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam double minLon,
            @RequestParam double minLat,
            @RequestParam double maxLon,
            @RequestParam double maxLat
    ) {
        String userId = jwt.getSubject();
        var bbox = new BoundingBoxRequest(minLon, minLat, maxLon, maxLat);
        return ResponseEntity.ok(routeService.findByBoundingBox(userId, bbox));
    }

    // Lista rotas públicas (não requer autenticação — ajustar no SecurityConfig se necessário)
    @GetMapping("/public")
    public ResponseEntity<Page<RouteResponse>> listPublic(
            @PageableDefault(size = 10, sort = "startTime", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(routeService.listPublicRoutes(pageable));
    }

    @DeleteMapping("/del/{routeId}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal Jwt jwt,
                                    @PathVariable String routeId) {
        String userId = jwt.getClaimAsString("user_id");
        boolean deleted = routeService.deleteRoute(routeId, userId);
        return deleted ? ResponseEntity.ok().build()
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PatchMapping("/{routeId}/visibility")
    public ResponseEntity<RouteResponse> updateVisibility(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String routeId
    ) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(routeService.toggleVisibility(userId, routeId));
    }

    @GetMapping("/my/{routeId}")
    public ResponseEntity<RouteResponse> getById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String routeId
    ) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(routeService.getRouteById(userId, routeId));
    }

    @GetMapping("/public/search/region")
    public ResponseEntity<Page<RouteResponse>> findPublicByRegion(
            @RequestParam double minLon,
            @RequestParam double minLat,
            @RequestParam double maxLon,
            @RequestParam double maxLat,
            @PageableDefault(size = 9, sort = "startTime", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        var bbox = new BoundingBoxRequest(minLon, minLat, maxLon, maxLat);
        return ResponseEntity.ok(routeService.findPublicRoutesInBoundingBox(bbox, pageable));
    }


    @GetMapping(value = "/public/{routeId}/preview.svg", produces = "image/svg+xml")
    public ResponseEntity<String> getPublicRouteSvgPreview(@PathVariable String routeId) {
        String svg = routeService.buildSvgPreview(routeId);
        if (svg == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok()
                // Cache de 7 dias no browser e CDN — o traçado de uma rota nunca muda
                .header("Cache-Control", "public, max-age=604800, immutable")
                .body(svg);
    }

    /**
     * Verifica se já existe preview gerado para a rota.
     * Retorna 200 com a URL pública ou 204 se ainda não foi gerado.
     * Não requer autenticação — rotas públicas.
     */
    @GetMapping("/public/{routeId}/preview")
    public ResponseEntity<String> getPreviewUrl(@PathVariable String routeId) {
        String url = routeService.getPreviewUrl(routeId);
        if (url == null) return ResponseEntity.noContent().build(); // 204 → frontend precisa gerar
        return ResponseEntity.ok(url);
    }

    /**
     * Recebe o PNG gerado pelo Leaflet no frontend e persiste no MinIO.
     * Requer autenticação para evitar uploads arbitrários.
     */
    @PostMapping("/public/{routeId}/preview")
    public ResponseEntity<String> uploadPreview(
            @PathVariable String routeId,
            @RequestBody byte[] pngBytes
    ) {
        if (pngBytes == null || pngBytes.length == 0) {
            return ResponseEntity.badRequest().build();
        }
        // Limite de 2MB para o PNG
        if (pngBytes.length > 3 * 1024 * 1024) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).build();
        }
        String url = routeService.savePreview(routeId, pngBytes);
        return ResponseEntity.status(HttpStatus.CREATED).body(url);
    }


}