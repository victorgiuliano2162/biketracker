package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Goal;
import br.com.biketracker.app.entities.Route;
import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.HomeStatsResponse;
import br.com.biketracker.app.entities.dtos.route.RouteStatsResponse;
import br.com.biketracker.app.exceptions.ex.ResourceNotFoundException;
import br.com.biketracker.app.repositories.GoalRepository;
import br.com.biketracker.app.repositories.RouteRepository;
import br.com.biketracker.app.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HomeServiceTest {
    @Mock
    private RouteRepository routeRepository;

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private UserRepository userRepository;

    private HomeService homeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        homeService = new HomeService(routeRepository, goalRepository, userRepository);
    }

    @Nested
    @DisplayName("Testes para getHomeStats")
    class GetHomeStatsTests {

        private final String EMAIL = "victor@teste.com";
        private final String USER_ID = UUID.randomUUID().toString();
        private User user;

        @BeforeEach
        void setupUser() {
            user = new User();
            user.setId(USER_ID);
            user.setEmail(EMAIL);
        }

        @Test
        @DisplayName("Deve montar o HomeStatsResponse completo com sucesso quando houver dados")
        void getHomeStats_SucessoComDados() {
            // Arrange
            when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));

            // Mock das estatísticas gerais (via Projeção ou interface DTO)
            RouteStatsResponse statsMock = mock(RouteStatsResponse.class);
            when(statsMock.getTotalDistanceInKm()).thenReturn(150.5);
            when(statsMock.getTotalElevationInMeters()).thenReturn(1200.0);
            when(statsMock.getTotalActivityTimeInSeconds()).thenReturn(18000L); // 5 horas
            when(statsMock.getTotalRoutes()).thenReturn(4L);
            when(routeRepository.findStatsByUserId(USER_ID)).thenReturn(statsMock);
            var uuid_routeID = UUID.randomUUID().toString();
            // Mock das últimas rotas
            Route route = new Route();
            route.setId(uuid_routeID);
            route.setDistanceInKm(35.0);
            route.setElevationInMeters(300.0);
            route.setActivityTimeInSeconds(3600L);
            route.setStartTime(LocalDateTime.now());
            when(routeRepository.findTop5ByUserIdOrderByStartTimeDesc(USER_ID)).thenReturn(List.of(route));

            // Mock do gráfico semanal (Criando uma rota hoje)
            Route weekRoute = new Route();
            weekRoute.setDistanceInKm(15.0);
            weekRoute.setStartTime(LocalDateTime.now());
            when(routeRepository.findByUserIdSince(eq(USER_ID), any(LocalDateTime.class))).thenReturn(List.of(weekRoute));

            // Mock das metas
            Goal goal = new Goal();
            goal.setId(1L);
            goal.setName("Desafio Rapha 500");
            goal.setDescription("Meta de endurance");
            goal.setTargetValue(500.0);
            goal.setDeadLine(LocalDate.now().plusMonths(1));
            when(goalRepository.findByUserIdOrderByCreatedAtDesc(USER_ID)).thenReturn(List.of(goal));

            // Act
            HomeStatsResponse response = homeService.getHomeStats(EMAIL);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.totalDistance()).isEqualTo(150.5);
            assertThat(response.totalRoutes()).isEqualTo(4);
            assertThat(response.recentRides()).hasSize(1);
            assertThat(response.recentRides().get(0).id()).isEqualTo(uuid_routeID);

            // Verifica se o gráfico semanal mapeou corretamente a distância do dia de hoje
            LocalDate todayStr = LocalDate.now();
            HomeStatsResponse.DailyDistance todayData = response.weeklyChart().stream()
                    .filter(d -> d.day().equals(todayStr))
                    .findFirst()
                    .orElseThrow();
            assertThat(todayData.distance()).isEqualTo(15.0);

            assertThat(response.activeGoals()).hasSize(1);
            assertThat(response.activeGoals().get(0).name()).isEqualTo("Desafio Rapha 500");
        }

        @Test
        @DisplayName("Deve lidar defensivamente com nulos quando o usuário não tiver atividades ou metas")
        void getHomeStats_UsuarioNovoSemDados_Sucesso() {
            // Arrange
            when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
            when(routeRepository.findStatsByUserId(USER_ID)).thenReturn(null); // Sem estatísticas
            when(routeRepository.findTop5ByUserIdOrderByStartTimeDesc(USER_ID)).thenReturn(Collections.emptyList());
            when(routeRepository.findByUserIdSince(eq(USER_ID), any(LocalDateTime.class))).thenReturn(Collections.emptyList());
            when(goalRepository.findByUserIdOrderByCreatedAtDesc(USER_ID)).thenReturn(Collections.emptyList());

            // Act
            HomeStatsResponse response = homeService.getHomeStats(EMAIL);

            // Assert
            assertThat(response.totalDistance()).isEqualTo(0.0);
            assertThat(response.totalElevation()).isEqualTo(0.0);
            assertThat(response.totalRoutes()).isZero();
            assertThat(response.recentRides()).isEmpty();
            assertThat(response.activeGoals()).isEmpty();

            // O gráfico deve conter 7 dias com distância zerada
            assertThat(response.weeklyChart()).hasSize(7);
            assertThat(response.weeklyChart().get(0).distance()).isEqualTo(0.0);
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException se o email fornecido não existir")
        void getHomeStats_EmailInexistente_Erro() {
            String emailInvalido = "invalido@teste.com";
            when(userRepository.findByEmail(emailInvalido)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> homeService.getHomeStats(emailInvalido))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("User not found: " + emailInvalido);

            verifyNoInteractions(routeRepository, goalRepository);
        }
    }
}
