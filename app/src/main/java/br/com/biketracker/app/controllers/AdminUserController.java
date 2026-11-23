package br.com.biketracker.app.controllers;

import br.com.biketracker.app.entities.dtos.user.AdminUserResponse;
import br.com.biketracker.app.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> listAll() {
        List<AdminUserResponse> users = userService.findAll()
                .stream()
                .map(AdminUserResponse::from)
                .toList();
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<AdminUserResponse> toggleActive(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String id
    ) {
        String adminId = jwt.getClaimAsString("user_id");
        return ResponseEntity.ok(AdminUserResponse.from(userService.toggleActive(id, adminId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String id
    ) {
        String adminId = jwt.getClaimAsString("user_id");
        userService.deleteByAdmin(id, adminId);
        return ResponseEntity.noContent().build();
    }
}
