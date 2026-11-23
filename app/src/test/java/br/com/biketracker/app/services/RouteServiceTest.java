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

        @Mock
        private GoalService goalService;

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
            //testUser.setUserName("ciclista_pro");

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
            assertThat(response.description()).isEqualTo("Treino longo");
            verify(routeRepository, times(1)).save(any(Route.class));
        }

        @Test
        @DisplayName("Deve lançar AccessDeniedException ao buscar rota privada de outro usuário")
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
        @DisplayName("Deve permitir visualizar rota pública de outro usuário e retornar ownerId")
        void getRouteById_PublicRoute_AllowsOtherUser() {
            testRoute.setPublic(true);
            User otherUser = new User();
            otherUser.setId(UUID.randomUUID().toString());

            when(userRepository.findById("other@teste.com")).thenReturn(Optional.empty());
            when(userRepository.findByEmail("other@teste.com")).thenReturn(Optional.of(otherUser));
            when(routeRepository.findById(routeId)).thenReturn(Optional.of(testRoute));

            RouteResponse response = routeService.getRouteById("other@teste.com", routeId);

            assertThat(response.id()).isEqualTo(routeId);
            assertThat(response.ownerId()).isEqualTo(userId);
        }

        @Test
        @DisplayName("Deve negar savePreview quando o usuário não é dono da rota")
        void savePreview_NotOwner_ThrowsAccessDenied() {
            testRoute.setPublic(true);
            User otherUser = new User();
            otherUser.setId(UUID.randomUUID().toString());
            byte[] validPng = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00};

            when(userRepository.findById(otherUser.getId())).thenReturn(Optional.of(otherUser));
            when(routeRepository.findById(routeId)).thenReturn(Optional.of(testRoute));

            assertThatThrownBy(() -> routeService.savePreview(otherUser.getId(), routeId, validPng))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("Deve rejeitar savePreview com bytes que não são PNG")
        void savePreview_InvalidPng_ThrowsIllegalArgument() {
            byte[] invalidBytes = "not-a-png".getBytes();

            assertThatThrownBy(() -> routeService.savePreview(userId, routeId, invalidBytes))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Deve salvar preview quando o dono envia PNG válido para rota pública")
        void savePreview_OwnerValidPng_Success() throws Exception {
            testRoute.setPublic(true);
            byte[] validPng = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00};

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(routeRepository.findById(routeId)).thenReturn(Optional.of(testRoute));
            when(minioStorageService.uploadRoutePreview(routeId, validPng)).thenReturn("https://minio/preview.png");

            String url = routeService.savePreview(userId, routeId, validPng);

            assertThat(url).isEqualTo("https://minio/preview.png");
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

        @Test
        @DisplayName("Deve remover preview no MinIO ao tornar rota pública em privada")
        void toggleVisibility_ToPrivate_DeletesPreview() {
            testRoute.setPublic(true);
            when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));
            when(routeRepository.findById(routeId)).thenReturn(Optional.of(testRoute));
            when(routeRepository.save(any(Route.class))).thenReturn(testRoute);

            RouteResponse response = routeService.toggleVisibility(userEmail, routeId);

            assertThat(response.isPublic()).isFalse();
            verify(minioStorageService, times(1)).deleteRoutePreview(routeId);
        }

        @Test
        @DisplayName("Deve remover preview no MinIO ao deletar rota pertencente ao usuário")
        void deleteRoute_Owner_DeletesPreviewAndImages() {
            when(routeRepository.existsByIdAndUserId(routeId, userId)).thenReturn(true);

            boolean result = routeService.deleteRoute(routeId, userId);

            assertThat(result).isTrue();
            verify(activityImageService, times(1)).deleteImageByRouteId(routeId);
            verify(minioStorageService, times(1)).deleteRoutePreview(routeId);
            verify(routeRepository, times(1)).deleteById(routeId);
        }
    }

