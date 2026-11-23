package br.com.biketracker.app.controllers;

import br.com.biketracker.app.entities.dtos.comment.CommentRequest;
import br.com.biketracker.app.entities.dtos.comment.CommentResponse;
import br.com.biketracker.app.services.CommentsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes/{routeId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentsService commentsService;

    @GetMapping
    public ResponseEntity<List<CommentResponse>> list(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String routeId
    ) {
        String userId = extractUserId(jwt);
        return ResponseEntity.ok(commentsService.listByRoute(userId, routeId));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String routeId,
            @Valid @RequestBody CommentRequest request
    ) {
        String userId = extractUserId(jwt);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentsService.addComment(userId, routeId, request));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String routeId,
            @PathVariable Long commentId
    ) {
        String userId = extractUserId(jwt);
        commentsService.deleteComment(userId, routeId, commentId);
        return ResponseEntity.noContent().build();
    }

    private String extractUserId(Jwt jwt) {
        String id = jwt.getClaimAsString("user_id");
        return (id != null && !id.isBlank()) ? id : jwt.getSubject();
    }
}
