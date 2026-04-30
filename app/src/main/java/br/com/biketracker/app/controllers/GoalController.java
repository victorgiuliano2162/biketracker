package br.com.biketracker.app.controllers;


import br.com.biketracker.app.entities.dtos.goal.GoalRequest;
import br.com.biketracker.app.entities.dtos.goal.GoalResponse;
import br.com.biketracker.app.services.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goal")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<List<GoalResponse>> createGoals(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody List<GoalRequest> goals
    ) {
        String userId = jwt.getClaimAsString("user_id");
        return ResponseEntity.ok(goalService.createGoals(userId, goals));
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getGoals(
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getClaimAsString("user_id");
        return ResponseEntity.ok(goalService.findAllByUser(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @RequestBody GoalRequest request
    ) {
        String userId = jwt.getClaimAsString("user_id");
        return ResponseEntity.ok(goalService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {
        String userId = jwt.getClaimAsString("user_id");
        goalService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
