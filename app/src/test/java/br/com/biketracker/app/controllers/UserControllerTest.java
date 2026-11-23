package br.com.biketracker.app.controllers;

import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.user.UpdateUserRequest;
import br.com.biketracker.app.entities.dtos.user.UserResponse;
import br.com.biketracker.app.entities.enums.TipoSanguineo;
import br.com.biketracker.app.services.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private Jwt jwt;

    @InjectMocks
    private UserController controller;

    @Test
    @DisplayName("getMe() deve retornar 200 com os dados do usuário autenticado")
    void getMe_ReturnsAuthenticatedUser() {
        User user = new User("Victor", "victor@teste.com", "hash", 26, 74.5,
                LocalDateTime.of(1998, 3, 19, 0, 0), TipoSanguineo.O_POSITIVO);
        user.setId("user-1");

        when(jwt.getClaimAsString("user_id")).thenReturn("user-1");
        when(userService.findById("user-1")).thenReturn(user);

        ResponseEntity<UserResponse> response = controller.getMe(jwt);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().id()).isEqualTo("user-1");
        assertThat(response.getBody().name()).isEqualTo("Victor");
    }

    @Test
    @DisplayName("updateMe() deve atualizar os dados do usuário autenticado e retornar 200")
    void updateMe_UpdatesAndReturnsUser() {
        User existing = new User("Victor", "victor@teste.com", "hash", 26, 74.5,
                LocalDateTime.of(1998, 3, 19, 0, 0), TipoSanguineo.O_POSITIVO);
        existing.setId("user-1");

        User saved = new User("Victor Atualizado", "victor.novo@teste.com", "hash", 27, 72.0,
                LocalDateTime.of(1998, 3, 19, 0, 0), TipoSanguineo.A_POSITIVO);
        saved.setId("user-1");

        UpdateUserRequest req = new UpdateUserRequest(
                "Victor Atualizado",
                "victor.novo@teste.com",
                27,
                72.0,
                LocalDateTime.of(1998, 3, 19, 0, 0),
                TipoSanguineo.A_POSITIVO
        );

        when(jwt.getClaimAsString("user_id")).thenReturn("user-1");
        when(userService.findById("user-1")).thenReturn(existing);
        when(userService.update(any(User.class))).thenReturn(saved);

        ResponseEntity<UserResponse> response = controller.updateMe(jwt, req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().name()).isEqualTo("Victor Atualizado");
        assertThat(response.getBody().weight()).isEqualTo(72.0);
        verify(userService).update(argThat(u -> "user-1".equals(u.getId()) && "Victor Atualizado".equals(u.getName())));
    }
}
