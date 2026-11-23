package br.com.biketracker.app.controllers;

import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.user.AdminUserResponse;
import br.com.biketracker.app.entities.enums.Role;
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

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private Jwt jwt;

    @InjectMocks
    private AdminUserController controller;

    @Test
    @DisplayName("listAll() deve retornar 200 com todos os usuários")
    void listAll_ReturnsUsers() {
        User u = new User();
        u.setId("u-1");
        u.setName("Atleta");
        u.setEmail("atleta@teste.com");
        u.setRole(Role.USER);
        u.setActive(true);

        when(userService.findAll()).thenReturn(List.of(u));

        ResponseEntity<List<AdminUserResponse>> res = controller.listAll();

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).hasSize(1);
        assertThat(res.getBody().get(0).role()).isEqualTo(Role.USER);
    }

    @Test
    @DisplayName("toggleActive() deve retornar 200 com status atualizado")
    void toggleActive_ReturnsUpdatedUser() {
        User target = new User();
        target.setId("u-2");
        target.setActive(false);

        when(jwt.getClaimAsString("user_id")).thenReturn("admin-1");
        when(userService.toggleActive("u-2", "admin-1")).thenReturn(target);

        ResponseEntity<AdminUserResponse> res = controller.toggleActive(jwt, "u-2");

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().active()).isFalse();
    }

    @Test
    @DisplayName("deleteUser() deve retornar 204 ao excluir usuário")
    void deleteUser_ReturnsNoContent() {
        when(jwt.getClaimAsString("user_id")).thenReturn("admin-1");

        ResponseEntity<Void> res = controller.deleteUser(jwt, "u-2");

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(userService).deleteByAdmin("u-2", "admin-1");
    }
}
