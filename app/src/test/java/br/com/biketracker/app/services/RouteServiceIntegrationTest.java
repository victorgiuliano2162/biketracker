package br.com.biketracker.app.services;


import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.route.CreateRouteRequest;
import br.com.biketracker.app.entities.dtos.route.RouteReplayResponse;
import br.com.biketracker.app.entities.dtos.route.RouteResponse;
import br.com.biketracker.app.entities.dtos.route.TrackPoint;
import br.com.biketracker.app.entities.enums.RouteDifficulty;
import br.com.biketracker.app.entities.enums.TipoSanguineo;
import br.com.biketracker.app.repositories.RouteRepository;
import br.com.biketracker.app.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;

import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;


import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;



@DataJpaTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ContextConfiguration(classes = {
        RouteServiceIntegrationTest.TestApp.class,
        RouteServiceIntegrationTest.TestServicesConfig.class
})
@Testcontainers
class RouteServiceIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgisContainer = new PostgreSQLContainer<>(
            DockerImageName.parse("postgis/postgis:16-3.4")
                    .asCompatibleSubstituteFor("postgres")
    );

    @SpringBootConfiguration
    @EnableAutoConfiguration
    @EntityScan("br.com.biketracker.app.entities")
    @EnableJpaRepositories("br.com.biketracker.app.repositories")
    static class TestApp {
    }

    @TestConfiguration
    static class TestServicesConfig {
        @Bean
        RouteService routeService(RouteRepository routeRepository,
                                  UserRepository userRepository,
                                  MinioStorageService minioStorageService,
                                  ActivityImageService activityImageService) {
            return new RouteService(routeRepository, userRepository, minioStorageService, activityImageService);
        }
    }

    @MockitoBean
    private MinioStorageService minioStorageService;

    @MockitoBean
    private ActivityImageService activityImageService;

    @Autowired
    private RouteService routeService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RouteRepository routeRepository;

    private User savedUser;

    @BeforeEach
    void setUp() {
        routeRepository.deleteAll();
        userRepository.deleteAll();

        User user = new User(
                "Victor BikeTracker", "victor@teste.com", "senha123",
                26, 75.0, LocalDateTime.of(1998, 3, 19, 0, 0), TipoSanguineo.O_POSITIVO
        );
        user.setUserName("victor_endurance");
        savedUser = userRepository.save(user);
    }

    @Test
    @DisplayName("Cria rota e verifica a integridade dos dados persistidos")
    void getRouteReplay_IntegrationPostgis() {
        LocalDateTime now = LocalDateTime.now().withNano(0);
        List<TrackPoint> points = List.of(
                new TrackPoint(-34.87, -8.05, 10.0, now),
                new TrackPoint(-34.88, -8.06, 15.0, now.plusMinutes(5)),
                new TrackPoint(-34.89, -8.07, 20.0, now.plusMinutes(10))
        );

        CreateRouteRequest request = new CreateRouteRequest(
                15.0, "Pedal Recife Antigo", 50.0,
                now, now.plusMinutes(10),
                "Recife", "Brasil", true, RouteDifficulty.FACIL,
                points, "Passeio"
        );

        RouteResponse createdRoute = routeService.createRoute(savedUser.getEmail(), request);

        RouteReplayResponse replay = routeService.getRouteReplay(savedUser.getEmail(), createdRoute.id());

        assertThat(replay).isNotNull();
        assertThat(replay.points()).hasSize(3);
        assertThat(replay.points().get(0).longitude()).isEqualTo(-34.87);
        assertThat(replay.points().get(0).latitude()).isEqualTo(-8.05);
    }
}
