package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.PasswordResetToken;
import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.exceptions.ex.BusinessException;
import br.com.biketracker.app.repositories.PasswordResetTokenRepository;
import br.com.biketracker.app.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PasswordResetServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        passwordResetService = new PasswordResetService(
                userRepository, tokenRepository, emailService, passwordEncoder
        );
    }

    @Nested
    @DisplayName("Testes para requestPasswordReset")
    class RequestPasswordResetTests {

        @Test
        @DisplayName("Deve gerar token e enviar email se o usuário existir")
        void requestPasswordReset_UsuarioExiste_Sucesso() {
            String email = "vitor@teste.com";
            User user = new User();
            user.setId(UUID.randomUUID().toString());

            when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

            passwordResetService.requestPasswordReset(email);

            verify(tokenRepository, times(1)).deleteAllByUserId(user.getId());
            verify(tokenRepository, times(1)).save(any(PasswordResetToken.class));
            verify(emailService, times(1)).sendPasswordResetEmail(eq(email), anyString());
        }

        @Test
        @DisplayName("Não deve fazer nada se o usuário não for encontrado")
        void requestPasswordReset_UsuarioNaoExiste_Ignora() {
            String email = "invalido@teste.com";
            when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

            passwordResetService.requestPasswordReset(email);

            verifyNoInteractions(tokenRepository, emailService);
        }
    }

    @Nested
    @DisplayName("Testes para resetPassword")
    class ResetPasswordTests {

        @Test
        @DisplayName("Deve redefinir a senha com sucesso quando o token for válido")
        void resetPassword_Sucesso() {
            String token = UUID.randomUUID().toString();
            String novaSenha = "novaSenha123";

            User user = new User();
            PasswordResetToken resetToken = new PasswordResetToken(token, user, LocalDateTime.now().plusHours(1));

            when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));
            when(passwordEncoder.encode(novaSenha)).thenReturn("senhaCriptografada");

            passwordResetService.resetPassword(token, novaSenha);

            verify(passwordEncoder, times(1)).encode(novaSenha);
            verify(userRepository, times(1)).save(user);
            verify(tokenRepository, times(1)).save(resetToken);
        }

        @Test
        @DisplayName("Deve lançar BusinessException quando o token não for encontrado")
        void resetPassword_TokenInvalido_Erro() {
            String token = "token-fantasma";
            when(tokenRepository.findByToken(token)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> passwordResetService.resetPassword(token, "novaSenha123"))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Token inválido");

            verifyNoInteractions(passwordEncoder, userRepository);
        }

        @Test
        @DisplayName("Deve lançar BusinessException quando o token já tiver sido utilizado")
        void resetPassword_TokenJaUtilizado_Erro() {
            String token = "token-usado";
            PasswordResetToken resetToken = new PasswordResetToken(token, new User(), LocalDateTime.now().plusHours(1));
            resetToken.setUsed(true);

            when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));

            assertThatThrownBy(() -> passwordResetService.resetPassword(token, "novaSenha123"))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Token já utilizado");
        }

        @Test
        @DisplayName("Deve lançar BusinessException quando o token estiver expirado")
        void resetPassword_TokenExpirado_Erro() {
            String token = "token-expirado";
            PasswordResetToken resetToken = new PasswordResetToken(token, new User(), LocalDateTime.now().minusHours(1));

            when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));

            assertThatThrownBy(() -> passwordResetService.resetPassword(token, "novaSenha123"))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Token expirado");
        }

        @Test
        @DisplayName("Deve lançar BusinessException quando a nova senha tiver menos de 8 caracteres")
        void resetPassword_SenhaFraca_Erro() {
            String token = "token-valido";
            PasswordResetToken resetToken = new PasswordResetToken(token, new User(), LocalDateTime.now().plusHours(1));

            when(tokenRepository.findByToken(token)).thenReturn(Optional.of(resetToken));

            assertThatThrownBy(() -> passwordResetService.resetPassword(token, "1234567"))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("no mínimo 8 caracteres");

            verifyNoInteractions(passwordEncoder, userRepository);
        }
    }
}

