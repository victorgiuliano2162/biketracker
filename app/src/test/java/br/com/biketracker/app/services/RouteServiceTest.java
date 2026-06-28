package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Route;
import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.route.CreateRouteRequest;
import br.com.biketracker.app.entities.dtos.route.RouteResponse;
import br.com.biketracker.app.entities.dtos.route.TrackPoint;
import br.com.biketracker.app.entities.enums.RouteDifficulty;
import br.com.biketracker.app.repositories.RouteRepository;
import br.com.biketracker.app.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
public class RouteServiceTest {

        @Mock
        private RouteRepository routeRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private MinioStorageService minioStorageService;

        @Mock
        private ActivityImageService activityImageService;

        @InjectMocks
        private RouteService routeService;

        private User testUser;
        private Route testRoute;
        private final String userEmail = "ciclista@teste.com";
        private final String userId = UUID.randomUUID().toString();
        private final String routeId = UUID.randomUUID().toString();

        @BeforeEach
        void setUp() {
            testUser = new User();
            testUser.setId(userId);
            testUser.setEmail(userEmail);
            testUser.setUserName("ciclista_pro");

            testRoute = new Route();
            testRoute.setId(routeId);
            testRoute.setUser(testUser);
            testRoute.setName("Giro de Domingo");
            testRoute.setPublic(false);
        }

        @Test
        @DisplayName("Deve criar uma rota com sucesso quando o usuário existir")
        void createRoute_Success() {
            // Arrange
            CreateRouteRequest request = new CreateRouteRequest(
                    50.5, "Giro de Domingo", 600.0,
                    LocalDateTime.now().minusHours(2), LocalDateTime.now(),
                    "Recife", "Brasil", true, RouteDifficulty.MODERADA,
                    List.of(new TrackPoint(-34.9, -8.0, 10.0, LocalDateTime.now()),
                            new TrackPoint(-35.9, -8.0, 11.0, LocalDateTime.now())),
                    "Treino longo"
            );

            when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));
            when(routeRepository.save(any(Route.class))).thenAnswer(invocation -> {
                Route savedRoute = invocation.getArgument(0);
                savedRoute.setId(routeId); // Simula o ID gerado pelo banco
                return savedRoute;
            });

            // Act
            RouteResponse response = routeService.createRoute(userEmail, request);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(routeId);
            assertThat(response.name()).isEqualTo("Giro de Domingo");
            verify(routeRepository, times(1)).save(any(Route.class));
        }

        @Test
        @DisplayName("Deve lançar AccessDeniedException ao buscar rota de outro usuário")
        void getRouteById_AccessDenied() {
            // Arrange
            User hacker = new User();
            hacker.setId(UUID.randomUUID().toString()); // ID diferente do dono da rota

            when(userRepository.findByEmail("hacker@teste.com")).thenReturn(Optional.of(hacker));
            when(routeRepository.findById(routeId)).thenReturn(Optional.of(testRoute));

            // Act & Assert
            assertThatThrownBy(() -> routeService.getRouteById("hacker@teste.com", routeId))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("Essa rota não pertence ao usuário");
        }

        @Test
        @DisplayName("Deve retornar false ao tentar deletar rota que não é dono")
        void deleteRoute_NotOwner() {
            // Arrange
            when(routeRepository.existsByIdAndUserId(routeId, "outro-id")).thenReturn(false);

            // Act
            boolean result = routeService.deleteRoute(routeId, "outro-id");

            // Assert
            assertThat(result).isFalse();
            verify(routeRepository, never()).deleteById(anyString());
            verify(activityImageService, never()).deleteImageByRouteId(anyString());
        }

        @Test
        @DisplayName("Deve inverter a visibilidade da rota com sucesso")
        void toggleVisibility_Success() {
            // Arrange
            when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));
            when(routeRepository.findById(routeId)).thenReturn(Optional.of(testRoute));
            when(routeRepository.save(any(Route.class))).thenReturn(testRoute);

            boolean initialVisibility = testRoute.isPublic();

            // Act
            RouteResponse response = routeService.toggleVisibility(userEmail, routeId);

            // Assert
            assertThat(response.isPublic()).isNotEqualTo(initialVisibility);
            assertThat(response.isPublic()).isTrue();
        }
    }

