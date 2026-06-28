package br.com.biketracker.app.controllers;

import br.com.biketracker.app.entities.dtos.route.*;
import br.com.biketracker.app.services.RouteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
public class RouteControllerTest {


        @Mock
        private RouteService routeService;

        @InjectMocks
        private RouteController controller;

        @Mock
        private Jwt jwt;

        @Mock
        private UserDetails userDetails;

        private final String userId = "victor@teste.com";

        @BeforeEach
        void setUp() {
            lenient().when(jwt.getSubject()).thenReturn(userId);
        }

        @Test
        @DisplayName("create() deve retornar 201 com a rota criada")
        void create_ReturnsCreated() {
            CreateRouteRequest request = mock(CreateRouteRequest.class);
            RouteResponse response = mock(RouteResponse.class);

            when(routeService.createRoute(userId, request)).thenReturn(response);

            ResponseEntity<RouteResponse> result = controller.create(jwt, request);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(result.getBody()).isEqualTo(response);
            verify(routeService).createRoute(userId, request);
        }

        @Test
        @DisplayName("listMine() deve retornar 200 com a página de rotas")
        void listMine_ReturnsPage() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<RouteResponse> page = new PageImpl<>(List.of(mock(RouteResponse.class)));

            when(routeService.listMyRoutes(userId, pageable)).thenReturn(page);

            ResponseEntity<Page<RouteResponse>> result = controller.listMine(jwt, pageable);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(page);
        }

        @Test
        @DisplayName("stats() deve retornar 200 com as estatísticas do usuário")
        void stats_ReturnsStats() {
            when(userDetails.getUsername()).thenReturn(userId);
            RouteStatsResponse stats = mock(RouteStatsResponse.class);
            when(routeService.getStats(userId)).thenReturn(stats);

            ResponseEntity<RouteStatsResponse> result = controller.stats(userDetails);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(stats);
        }

        @Test
        @DisplayName("replay() deve retornar 200 com o replay da rota")
        void replay_ReturnsReplay() {
            String routeId = "route-1";
            RouteReplayResponse replay = mock(RouteReplayResponse.class);
            when(routeService.getRouteReplay(userId, routeId)).thenReturn(replay);

            ResponseEntity<RouteReplayResponse> result = controller.replay(jwt, routeId);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(replay);
        }

        @Test
        @DisplayName("findByRegion() deve retornar 200 com a lista de rotas na bbox")
        void findByRegion_ReturnsRoutes() {
            List<RouteResponse> routes = List.of(mock(RouteResponse.class));
            when(routeService.findByBoundingBox(eq(userId), any(BoundingBoxRequest.class)))
                    .thenReturn(routes);

            ResponseEntity<List<RouteResponse>> result =
                    controller.findByRegion(jwt, -34.9, -8.1, -34.8, -8.0);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(routes);
        }

        @Test
        @DisplayName("listPublic() deve retornar 200 com a página de rotas públicas")
        void listPublic_ReturnsPage() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<RouteResponse> page = new PageImpl<>(List.of(mock(RouteResponse.class)));

            when(routeService.listPublicRoutes(pageable)).thenReturn(page);

            ResponseEntity<Page<RouteResponse>> result = controller.listPublic(pageable);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(page);
        }

        @Test
        @DisplayName("delete() deve retornar 200 quando a rota é deletada")
        void delete_ReturnsOk_WhenDeleted() {
            String routeId = "route-1";
            when(jwt.getClaimAsString("user_id")).thenReturn("user-1");
            when(routeService.deleteRoute(routeId, "user-1")).thenReturn(true);

            ResponseEntity<?> result = controller.delete(jwt, routeId);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        }

        @Test
        @DisplayName("delete() deve retornar 404 quando a rota não existe ou não pertence ao usuário")
        void delete_ReturnsNotFound_WhenNotDeleted() {
            String routeId = "route-1";
            when(jwt.getClaimAsString("user_id")).thenReturn("user-1");
            when(routeService.deleteRoute(routeId, "user-1")).thenReturn(false);

            ResponseEntity<?> result = controller.delete(jwt, routeId);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }

        @Test
        @DisplayName("updateVisibility() deve retornar 200 com a rota atualizada")
        void updateVisibility_ReturnsUpdatedRoute() {
            String routeId = "route-1";
            RouteResponse response = mock(RouteResponse.class);
            when(routeService.toggleVisibility(userId, routeId)).thenReturn(response);

            ResponseEntity<RouteResponse> result = controller.updateVisibility(jwt, routeId);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(response);
        }

        @Test
        @DisplayName("getById() deve retornar 200 com a rota")
        void getById_ReturnsRoute() {
            String routeId = "route-1";
            RouteResponse response = mock(RouteResponse.class);
            when(routeService.getRouteById(userId, routeId)).thenReturn(response);

            ResponseEntity<RouteResponse> result = controller.getById(jwt, routeId);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(response);
        }

        @Test
        @DisplayName("findPublicByRegion() deve retornar 200 com a página filtrada")
        void findPublicByRegion_ReturnsPage() {
            Pageable pageable = PageRequest.of(0, 9);
            Page<RouteResponse> page = new PageImpl<>(List.of(mock(RouteResponse.class)));

            when(routeService.findPublicRoutesInBoundingBox(any(BoundingBoxRequest.class), eq(pageable)))
                    .thenReturn(page);

            ResponseEntity<Page<RouteResponse>> result =
                    controller.findPublicByRegion(-34.9, -8.1, -34.8, -8.0, pageable);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(page);
        }

        @Test
        @DisplayName("getPublicRouteSvgPreview() deve retornar 200 com o SVG")
        void getPublicRouteSvgPreview_ReturnsSvg() {
            String routeId = "route-1";
            String svg = "<svg></svg>";
            when(routeService.buildSvgPreview(routeId)).thenReturn(svg);

            ResponseEntity<String> result = controller.getPublicRouteSvgPreview(routeId);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(svg);
            assertThat(result.getHeaders().getFirst("Cache-Control")).contains("max-age=604800");
        }

        @Test
        @DisplayName("getPublicRouteSvgPreview() deve retornar 404 quando não há SVG")
        void getPublicRouteSvgPreview_ReturnsNotFound_WhenNull() {
            String routeId = "route-1";
            when(routeService.buildSvgPreview(routeId)).thenReturn(null);

            ResponseEntity<String> result = controller.getPublicRouteSvgPreview(routeId);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }

        @Test
        @DisplayName("getPreviewUrl() deve retornar 200 com a URL quando existe")
        void getPreviewUrl_ReturnsUrl() {
            String routeId = "route-1";
            String url = "https://minio/preview.png";
            when(routeService.getPreviewUrl(routeId)).thenReturn(url);

            ResponseEntity<String> result = controller.getPreviewUrl(routeId);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(url);
        }

        @Test
        @DisplayName("getPreviewUrl() deve retornar 204 quando ainda não foi gerado")
        void getPreviewUrl_ReturnsNoContent_WhenNull() {
            String routeId = "route-1";
            when(routeService.getPreviewUrl(routeId)).thenReturn(null);

            ResponseEntity<String> result = controller.getPreviewUrl(routeId);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        }

        @Test
        @DisplayName("uploadPreview() deve retornar 201 com a URL salva")
        void uploadPreview_ReturnsCreated() {
            String routeId = "route-1";
            byte[] png = "fake-png".getBytes();
            String url = "https://minio/preview.png";
            when(routeService.savePreview(routeId, png)).thenReturn(url);

            ResponseEntity<String> result = controller.uploadPreview(routeId, png);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(result.getBody()).isEqualTo(url);
        }

        @Test
        @DisplayName("uploadPreview() deve retornar 400 quando o PNG está vazio")
        void uploadPreview_ReturnsBadRequest_WhenEmpty() {
            String routeId = "route-1";

            ResponseEntity<String> result = controller.uploadPreview(routeId, new byte[0]);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            verify(routeService, never()).savePreview(any(), any());
        }

        @Test
        @DisplayName("uploadPreview() deve retornar 400 quando o PNG é null")
        void uploadPreview_ReturnsBadRequest_WhenNull() {
            String routeId = "route-1";

            ResponseEntity<String> result = controller.uploadPreview(routeId, null);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }

        @Test
        @DisplayName("uploadPreview() deve retornar 413 quando o PNG excede o tamanho máximo")
        void uploadPreview_ReturnsPayloadTooLarge() {
            String routeId = "route-1";
            byte[] tooLarge = new byte[3 * 1024 * 1024 + 1];

            ResponseEntity<String> result = controller.uploadPreview(routeId, tooLarge);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
            verify(routeService, never()).savePreview(any(), any());
        }

        @Test
        @DisplayName("create() deve propagar exceção quando o service falha (caso de erro)")
        void create_ServiceThrows_PropagatesException() {
            CreateRouteRequest request = mock(CreateRouteRequest.class);
            when(routeService.createRoute(eq(userId), eq(request)))
                    .thenThrow(new RuntimeException("Erro ao persistir rota"));

            assertThrows(RuntimeException.class, () -> controller.create(jwt, request));
        }

}
