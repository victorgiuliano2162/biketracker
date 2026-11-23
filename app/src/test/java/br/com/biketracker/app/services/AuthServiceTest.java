package br.com.biketracker.app.services;


import br.com.biketracker.app.entities.RefreshToken;
import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.auth.LoginRequest;
import br.com.biketracker.app.entities.dtos.auth.LoginResponse;
import br.com.biketracker.app.entities.dtos.auth.RefreshRequest;
import br.com.biketracker.app.exceptions.ex.UnauthorizedException;
import br.com.biketracker.app.repositories.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtEncoder jwtEncoder;

    @Mock
    private JwtDecoder jwtDecoder;

    @Mock
    private UserService userService;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        authService = new AuthService(authenticationManager, jwtEncoder, jwtDecoder, userService, refreshTokenRepository);
    }

    @Nested
    @DisplayName("Testes para Login")
    class LoginTests {

        @Test
        @DisplayName("Deve realizar login com sucesso e retornar os tokens")
        void login_Sucesso() {
            LoginRequest request = new LoginRequest("vitor@teste.com", "senha123");
            Authentication authenticationMock = mock(Authentication.class);
            User userMock = new User();
            userMock.setId(UUID.randomUUID().toString());

            Jwt mockAccessToken = mock(Jwt.class);
            Jwt mockRefreshToken = mock(Jwt.class);

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authenticationMock);
            when(authenticationMock.getName()).thenReturn("vitor@teste.com");
            when(userService.findByEmail("vitor@teste.com")).thenReturn(userMock);

            // Mockando as duas chamadas consecutivas ao encoder (access e refresh token)
            when(mockAccessToken.getTokenValue()).thenReturn("access-token-string");
            when(mockRefreshToken.getTokenValue()).thenReturn("refresh-token-string");
            when(jwtEncoder.encode(any(JwtEncoderParameters.class)))
                    .thenReturn(mockAccessToken)
                    .thenReturn(mockRefreshToken);

            LoginResponse response = authService.login(request);

            assertThat(response).isNotNull();
            assertThat(response.accessToken()).isEqualTo("access-token-string");
            assertThat(response.refreshToken()).isEqualTo("refresh-token-string");
            verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        }

        @Test
        @DisplayName("Deve lançar UnauthorizedException quando as credenciais forem incorretas")
        void login_CredenciaisIncorretas_Erro() {
            LoginRequest request = new LoginRequest("vitor@teste.com", "senhaErrada");

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("E-mail ou senha incorretos");

            verifyNoInteractions(jwtEncoder, userService);
        }
    }

    @Nested
    @DisplayName("Testes para Refresh Token")
    class RefreshTests {

        @Test
        @DisplayName("Deve renovar o access token com sucesso se o refresh token for válido")
        void refresh_Sucesso() {
            RefreshRequest request = new RefreshRequest("valido-refresh-token");
            Jwt jwtMock = mock(Jwt.class);
            User userMock = new User();
            userMock.setId(UUID.randomUUID().toString());

            Jwt mockNewAccessToken = mock(Jwt.class);
            Jwt mockNewRefreshToken = mock(Jwt.class);

            when(jwtDecoder.decode("valido-refresh-token")).thenReturn(jwtMock);
            when(jwtMock.getClaimAsString("token_type")).thenReturn("refresh");
            when(jwtMock.getSubject()).thenReturn("vitor@teste.com");
            when(userService.findByEmail("vitor@teste.com")).thenReturn(userMock);

            RefreshToken stored = new RefreshToken(
                    AuthService.sha256("valido-refresh-token"),
                    "vitor@teste.com",
                    Instant.now().plus(7, ChronoUnit.DAYS)
            );
            when(refreshTokenRepository.findByTokenHash(AuthService.sha256("valido-refresh-token")))
                    .thenReturn(Optional.of(stored));

            when(mockNewAccessToken.getTokenValue()).thenReturn("novo-access-token");
            when(mockNewRefreshToken.getTokenValue()).thenReturn("novo-refresh-token");
            when(jwtEncoder.encode(any(JwtEncoderParameters.class)))
                    .thenReturn(mockNewAccessToken)
                    .thenReturn(mockNewRefreshToken);

            LoginResponse response = authService.refresh(request);

            assertThat(response).isNotNull();
            assertThat(response.accessToken()).isEqualTo("novo-access-token");
            assertThat(response.refreshToken()).isEqualTo("novo-refresh-token");
            assertThat(stored.isRevoked()).isTrue();
            verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("Deve lançar UnauthorizedException quando o refresh token já foi revogado")
        void refresh_TokenRevogado_Erro() {
            RefreshRequest request = new RefreshRequest("revogado-refresh-token");
            Jwt jwtMock = mock(Jwt.class);
            when(jwtDecoder.decode("revogado-refresh-token")).thenReturn(jwtMock);
            when(jwtMock.getClaimAsString("token_type")).thenReturn("refresh");

            RefreshToken stored = new RefreshToken(
                    AuthService.sha256("revogado-refresh-token"),
                    "vitor@teste.com",
                    Instant.now().plus(7, ChronoUnit.DAYS)
            );
            stored.setRevoked(true);
            when(refreshTokenRepository.findByTokenHash(AuthService.sha256("revogado-refresh-token")))
                    .thenReturn(Optional.of(stored));

            assertThatThrownBy(() -> authService.refresh(request))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("revogado");
        }

        @Test
        @DisplayName("logout() deve marcar o refresh token como revogado")
        void logout_RevogaRefreshToken() {
            RefreshToken stored = new RefreshToken(
                    AuthService.sha256("meu-refresh-token"),
                    "vitor@teste.com",
                    Instant.now().plus(7, ChronoUnit.DAYS)
            );
            when(refreshTokenRepository.findByTokenHash(AuthService.sha256("meu-refresh-token")))
                    .thenReturn(Optional.of(stored));

            authService.logout("meu-refresh-token");

            assertThat(stored.isRevoked()).isTrue();
            verify(refreshTokenRepository, times(1)).save(stored);
        }

        @Test
        @DisplayName("Deve lançar IllegalArgumentException quando o token_type não for 'refresh'")
        void refresh_TokenTypeInvalido_Erro() {
            RefreshRequest request = new RefreshRequest("access-token-invalido-para-isso");
            Jwt jwtMock = mock(Jwt.class);

            when(jwtDecoder.decode(anyString())).thenReturn(jwtMock);
            when(jwtMock.getClaimAsString("token_type")).thenReturn("access"); // Tipo errado

            assertThatThrownBy(() -> authService.refresh(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Token inválido para refresh");

            verifyNoInteractions(userService, jwtEncoder);
        }
    }
}
