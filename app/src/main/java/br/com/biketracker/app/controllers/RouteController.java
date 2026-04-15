package br.com.biketracker.app.controllers;

import br.com.biketracker.app.entities.dtos.BoundingBoxRequest;
import br.com.biketracker.app.entities.dtos.route.CreateRouteRequest;
import br.com.biketracker.app.entities.dtos.route.RouteReplayResponse;
import br.com.biketracker.app.entities.dtos.route.RouteResponse;
import br.com.biketracker.app.entities.dtos.route.RouteStatsResponse;
import br.com.biketracker.app.services.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    // Registra nova rota
    @PostMapping
    public ResponseEntity<RouteResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreateRouteRequest request
    ) {
        String userId = userDetails.getUsername();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(routeService.createRoute(userId, request));
    }

    // Lista rotas do usuário autenticado
    @GetMapping("/my")
    public ResponseEntity<Page<RouteResponse>> listMine(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "startTime", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        String userId = userDetails.getUsername();
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
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String routeId
    ) {
        String userId = userDetails.getUsername();
        return ResponseEntity.ok(routeService.getRouteReplay(userId, routeId));
    }

    // Busca rotas do usuário por região geográfica
    @GetMapping("/my/search/region")
    public ResponseEntity<List<RouteResponse>> findByRegion(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam double minLon,
            @RequestParam double minLat,
            @RequestParam double maxLon,
            @RequestParam double maxLat
    ) {
        String userId = userDetails.getUsername();
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
}