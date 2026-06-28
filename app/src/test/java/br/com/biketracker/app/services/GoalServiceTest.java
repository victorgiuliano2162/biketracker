package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Goal;
import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.goal.GoalRequest;
import br.com.biketracker.app.entities.dtos.goal.GoalResponse;
import br.com.biketracker.app.exceptions.ex.ResourceNotFoundException;
import br.com.biketracker.app.repositories.GoalRepository;
import br.com.biketracker.app.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GoalServiceTest {
    @Mock
    private GoalRepository goalRepository;

    @Mock
    private UserRepository userRepository;

    private GoalService goalService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        goalService = new GoalService(goalRepository, userRepository);
    }

    @Nested
    @DisplayName("Testes para createGoals")
    class CreateGoalsTests {

        @Test
        @DisplayName("Deve criar metas com sucesso para um usuário existente")
        void createGoals_Sucesso() {
            String userId = "user-123";
            User user = new User();
            user.setId(userId);

            GoalRequest request = new GoalRequest("Pedalar 100km", "Meta do mês", 100.0, "KM", LocalDate.now().plusMonths(1));

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(goalRepository.save(any(Goal.class))).thenAnswer(invocation -> {
                Goal g = invocation.getArgument(0);
                g.setId(1L); // Simula ID gerado pelo banco
                return g;
            });

            List<GoalResponse> responses = goalService.createGoals(userId, List.of(request));

            assertThat(responses).hasSize(1);
            assertThat(responses.get(0).name()).isEqualTo("Pedalar 100km");
            verify(goalRepository, times(1)).save(any(Goal.class));
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException se o usuário não existir")
        void createGoals_UsuarioNaoEncontrado_Erro() {
            String userId = "usuario-fantasma";
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> goalService.createGoals(userId, List.of()))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Usuário não encontrado");

            verifyNoInteractions(goalRepository);
        }
    }

    @Nested
    @DisplayName("Testes para update")
    class UpdateTests {

        @Test
        @DisplayName("Deve atualizar a meta com sucesso se pertencer ao usuário")
        void update_Sucesso() {
            String userId = "user-123";
            Long goalId = 1L;

            User user = new User();
            user.setId(userId);

            Goal goalExistente = new Goal("Antigo Nome", "Antiga Desc", 50.0, "KM", LocalDate.now(), user);
            goalExistente.setId(goalId);

            GoalRequest updateRequest = new GoalRequest("Novo Nome", "Nova Desc", 80.0, "KM", LocalDate.now().plusDays(5));

            when(goalRepository.findById(goalId)).thenReturn(Optional.of(goalExistente));
            when(goalRepository.save(any(Goal.class))).thenAnswer(invocation -> invocation.getArgument(0));

            GoalResponse response = goalService.update(userId, goalId, updateRequest);

            assertThat(response.name()).isEqualTo("Novo Nome");
            assertThat(response.targetValue()).isEqualTo(80.0);
            verify(goalRepository, times(1)).save(goalExistente);
        }

        @Test
        @DisplayName("Deve lançar AccessDeniedException se a meta pertencer a outro usuário")
        void update_AcessoNegado_Erro() {
            String userIdDono = "user-123";
            String userIdInvasor = "user-999";
            Long goalId = 1L;

            User dono = new User();
            dono.setId(userIdDono);

            Goal goal = new Goal("Meta", "Desc", 10.0, "KM", LocalDate.now(), dono);

            when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal));

            GoalRequest request = new GoalRequest("Hack", "Hack", 0.0, "KM", LocalDate.now());

            assertThatThrownBy(() -> goalService.update(userIdInvasor, goalId, request))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("Essa meta não pertence ao usuário");

            verify(goalRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Testes para delete")
    class DeleteTests {

        @Test
        @DisplayName("Deve deletar a meta com sucesso")
        void delete_Sucesso() {
            String userId = "user-123";
            Long goalId = 1L;

            User user = new User();
            user.setId(userId);

            Goal goal = new Goal();
            goal.setUser(user);

            when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal));

            goalService.delete(userId, goalId);

            verify(goalRepository, times(1)).delete(goal);
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException ao tentar deletar meta inexistente")
        void delete_MetaInexistente_Erro() {
            Long goalId = 99L;
            when(goalRepository.findById(goalId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> goalService.delete("user-123", goalId))
                    .isInstanceOf(ResourceNotFoundException.class);

            verify(goalRepository, never()).delete(any());
        }
    }
}
