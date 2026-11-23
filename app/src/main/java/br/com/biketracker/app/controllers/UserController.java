package br.com.biketracker.app.controllers;

import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.user.UpdateUserRequest;
import br.com.biketracker.app.entities.dtos.user.UserRequest;
import br.com.biketracker.app.entities.dtos.user.UserResponse;
import br.com.biketracker.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        User user = new User(
                request.name(),
                request.email(),
                request.password(),
                request.age(),
                request.weight(),
                request.bornAt(),
                request.tipoSanguineo()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserResponse.from(userService.save(user)));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal Jwt jwt) {
        User user = resolveAuthenticatedUser(jwt);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        User current = resolveAuthenticatedUser(jwt);

        User updated = new User();
        updated.setId(current.getId());
        updated.setName(request.name());
        updated.setEmail(request.email());
        updated.setAge(request.age());
        updated.setWeight(request.weight());
        updated.setBornAt(request.bornAt());
        updated.setTipoSanguineo(request.tipoSanguineo());

        return ResponseEntity.ok(UserResponse.from(userService.update(updated)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String id
    ) {
        String authUserId = jwt.getClaimAsString("user_id");
        if (authUserId == null || !authUserId.equals(id)) {
            throw new AccessDeniedException("Acesso não permitido aos dados deste usuário");
        }
        User user = userService.findById(id);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    private User resolveAuthenticatedUser(Jwt jwt) {
        String authUserId = jwt.getClaimAsString("user_id");
        if (authUserId != null && !authUserId.isBlank()) {
            return userService.findById(authUserId);
        }
        return userService.findByEmail(jwt.getSubject());
    }
}
