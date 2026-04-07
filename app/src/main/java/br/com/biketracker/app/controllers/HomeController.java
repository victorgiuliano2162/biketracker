package br.com.biketracker.app.controllers;

import br.com.biketracker.app.entities.dtos.authDto.HomeStatsResponse;
import br.com.biketracker.app.services.HomeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    // GET /api/home/stats
    // @AuthenticationPrincipal injeta o JWT do usuário logado automaticamente
    @GetMapping("/stats")
    public ResponseEntity<HomeStatsResponse> getStats(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject(); // subject = email do usuário
        return ResponseEntity.ok(homeService.getHomeStats(userId));
    }
}
