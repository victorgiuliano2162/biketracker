package br.com.biketracker.app.controllers;

import br.com.biketracker.app.entities.dtos.auth.LoginRequest;
import br.com.biketracker.app.entities.dtos.auth.LoginResponse;
import br.com.biketracker.app.entities.dtos.auth.RefreshRequest;
import br.com.biketracker.app.entities.dtos.auth.ForgotPasswordRequest;
import br.com.biketracker.app.entities.dtos.auth.ResetPasswordRequest;
import br.com.biketracker.app.services.AuthService;
import br.com.biketracker.app.services.PasswordResetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest (controllers = AuthController.class, properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration"
})
public class AuthControllerTest {
    @Autowired
    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        // 2. Instancie manualmente se precisar de algum setup, ou inicialize direto na declaração
        this.objectMapper = new ObjectMapper();

        // Se o seu projeto usa as novas classes de Data/Time do Java 8 (como LocalDateTime nas requisições)
        // adicione a linha abaixo para o Jackson conseguir ler essas datas:
        this.objectMapper = JsonMapper.builder().build();;
    }

    @Nested
    @DisplayName("Testes de Autenticação (Login e Refresh)")
    class AuthenticationEndpoints {

        @Test
        @DisplayName("POST /api/auth/login - Deve retornar 200 e tokens se as credenciais forem válidas")
        void login_Sucesso() throws Exception {
            LoginRequest request = new LoginRequest("victor@teste.com", "senha123");
            LoginResponse response = new LoginResponse("access-token-123", "refresh-token-123");

            when(authService.login(any(LoginRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("access-token-123"))
                    .andExpect(jsonPath("$.refreshToken").value("refresh-token-123"));

            verify(authService, times(1)).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("POST /api/auth/refresh - Deve retornar 200 e novos tokens")
        void refresh_Sucesso() throws Exception {
            RefreshRequest request = new RefreshRequest("antigo-refresh-token");
            LoginResponse response = new LoginResponse("novo-access-token", "novo-refresh-token");

            when(authService.refresh(any(RefreshRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("novo-access-token"))
                    .andExpect(jsonPath("$.refreshToken").value("novo-refresh-token"));

            verify(authService, times(1)).refresh(any(RefreshRequest.class));
        }
    }

    @Nested
    @DisplayName("Testes de Recuperação de Senha")
    class PasswordResetEndpoints {

        @Test
        @DisplayName("POST /api/auth/forgot-password - Deve retornar 200 mesmo se o serviço processar com sucesso")
        void forgotPassword_Sucesso() throws Exception {
            ForgotPasswordRequest request = new ForgotPasswordRequest("victor@teste.com");


            doNothing().when(passwordResetService).requestPasswordReset(request.getEmail());

            mockMvc.perform(post("/api/auth/forgot-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());

            verify(passwordResetService, times(1)).requestPasswordReset("victor@teste.com");
        }

        @Test
        @DisplayName("POST /api/auth/reset-password - Deve retornar 200 após redefinir senha com token válido")
        void resetPassword_Sucesso() throws Exception {
            var uuid_validToken = UUID.randomUUID().toString();
            ResetPasswordRequest request = new ResetPasswordRequest(uuid_validToken, "novaSenhaGravel");

            doNothing().when(passwordResetService).resetPassword(request.getToken(), request.getNewPassword());

            mockMvc.perform(post("/api/auth/reset-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());

            verify(passwordResetService, times(1)).resetPassword(uuid_validToken, "novaSenhaGravel");
        }
    }
}
