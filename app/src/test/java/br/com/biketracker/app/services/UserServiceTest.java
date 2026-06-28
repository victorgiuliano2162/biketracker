package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Nested
    @DisplayName("Testes de Busca Básica")
    class FindTests {

        @Test
        @DisplayName("Deve retornar todos os usuários")
        void findAll_Sucesso() {
            when(userRepository.findAll()).thenReturn(List.of(new User(), new User()));
            List<User> result = userService.findAll();
            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("Deve encontrar usuário por ID com sucesso")
        void findById_Sucesso() {
            User user = new User();
            user.setId("123");
            when(userRepository.findById("123")).thenReturn(Optional.of(user));

            User result = userService.findById("123");
            assertThat(result.getId()).isEqualTo("123");
        }

        @Test
        @DisplayName("Deve lançar EntityNotFoundException quando ID não existir")
        void findById_NaoEncontrado_Erro() {
            when(userRepository.findById("999")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.findById("999"))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("User not found with id: 999");
        }
    }

    @Nested
    @DisplayName("Testes de Validação de Intervalos")
    class ValidationRangeTests {

        @Test
        @DisplayName("Deve lançar IllegalArgumentException quando minAge > maxAge")
        void findByAgeBetween_Invalido_Erro() {
            assertThatThrownBy(() -> userService.findByAgeBetween(30, 20))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("minAge não pode ser maior que maxAge");
        }

        @Test
        @DisplayName("Deve retornar usuários se o intervalo de idade for válido")
        void findByAgeBetween_Valido_Sucesso() {
            when(userRepository.findByAgeBetween(20, 30)).thenReturn(List.of(new User()));
            List<User> result = userService.findByAgeBetween(20, 30);
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Deve lançar IllegalArgumentException quando data inicial for posterior à final")
        void findByBornAtBetween_Invalido_Erro() {
            LocalDateTime start = LocalDateTime.now();
            LocalDateTime end = start.minusDays(1);

            assertThatThrownBy(() -> userService.findByBornAtBetween(start, end))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("A data inicial não pode ser posterior à data final");
        }
    }

    @Nested
    @DisplayName("Testes de Persistência (Salvar, Atualizar, Deletar)")
    class PersistenceTests {

        @Test
        @DisplayName("Deve criptografar a senha e salvar o usuário com sucesso")
        void save_Sucesso() {
            User user = new User();
            user.setEmail("vitor@teste.com");
            user.setPassword("rawPassword");

            when(userRepository.existsByEmail("vitor@teste.com")).thenReturn(false);
            when(passwordEncoder.encode("rawPassword")).thenReturn("encryptedPassword");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            User saved = userService.save(user);

            assertThat(saved.getPassword()).isEqualTo("encryptedPassword");
            assertThat(saved.getCreatedAt()).isNotNull();
            verify(userRepository, times(1)).save(user);
        }

        @Test
        @DisplayName("Deve lançar IllegalStateException ao tentar cadastrar e-mail já existente")
        void save_EmailDuplicado_Erro() {
            User user = new User();
            user.setEmail("vitor@teste.com");

            when(userRepository.existsByEmail("vitor@teste.com")).thenReturn(true);

            assertThatThrownBy(() -> userService.save(user))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Já existe um usuário cadastrado com o email");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Deve atualizar dados do usuário sem alterar a senha")
        void update_Sucesso() {
            User existing = new User();
            existing.setId("123");
            existing.setEmail("vitor@teste.com");
            existing.setName("Vitor Velho");

            User updated = new User();
            updated.setId("123");
            updated.setEmail("vitor.novo@teste.com");
            updated.setName("Vitor Novo");

            when(userRepository.findById("123")).thenReturn(Optional.of(existing));
            when(userRepository.existsByEmail("vitor.novo@teste.com")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            User result = userService.update(updated);

            assertThat(result.getName()).isEqualTo("Vitor Novo");
            assertThat(result.getEmail()).isEqualTo("vitor.novo@teste.com");
        }

        @Test
        @DisplayName("Deve deletar usuário por ID se ele existir")
        void delete_Sucesso() {
            when(userRepository.existsById("123")).thenReturn(true);

            userService.delete("123");

            verify(userRepository, times(1)).deleteById("123");
        }

        @Test
        @DisplayName("Deve lançar EntityNotFoundException ao tentar deletar ID inexistente")
        void delete_Inexistente_Erro() {
            when(userRepository.existsById("999")).thenReturn(false);

            assertThatThrownBy(() -> userService.delete("999"))
                    .isInstanceOf(EntityNotFoundException.class);

            verify(userRepository, never()).deleteById(anyString());
        }
    }
}
