package br.com.biketracker.app.controllers;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;

import br.com.biketracker.app.services.ActivityImageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@ExtendWith(MockitoExtension.class)
class ActivityImageControllerIntegrationTest {

    @Mock
    private ActivityImageService activityImageService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        ActivityImageController controller = new ActivityImageController(activityImageService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();

        Jwt fakeJwt = Jwt.withTokenValue("fake-token")
                .header("alg", "RS256")
                .claim("sub", "victor@teste.com")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(fakeJwt, null, List.of())
        );
    }

    @Test
    @DisplayName("POST /images deve retornar 200 com as keys")
    void uploadImagesSuccess() throws Exception {
        UUID activityId = UUID.randomUUID();
        MockMultipartFile file1 = new MockMultipartFile("files", "image1.png", MediaType.IMAGE_PNG_VALUE, "file1-content".getBytes());
        MockMultipartFile file2 = new MockMultipartFile("files", "image2.jpg", MediaType.IMAGE_JPEG_VALUE, "file2-content".getBytes());

        List<String> mockKeys = List.of("key-1", "key-2");
        when(activityImageService.uploadImages(eq(activityId), any())).thenReturn(mockKeys);

        mockMvc.perform(multipart("/api/activities/{activityId}/images", activityId)
                        .file(file1)
                        .file(file2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("key-1"))
                .andExpect(jsonPath("$[1]").value("key-2"));
    }

    @Test
    @DisplayName("GET /images deve retornar 200 com as URLs")
    void getImageUrlsSuccess() throws Exception {
        String activityId = UUID.randomUUID().toString();
        List<String> mockUrls = List.of("https://s3.url/img1.png", "https://s3.url/img2.jpg");

        when(activityImageService.getPresignedUrls(activityId)).thenReturn(mockUrls);

        mockMvc.perform(get("/api/activities/{activityId}/images", activityId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("https://s3.url/img1.png"))
                .andExpect(jsonPath("$[1]").value("https://s3.url/img2.jpg"));
    }

    @Test
    @DisplayName("upload() deve lançar exceção quando o service falha")
    void uploadImages_ServiceThrows_PropagatesException() {
        UUID activityId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile("files", "img.png", MediaType.IMAGE_PNG_VALUE, "x".getBytes());

        when(activityImageService.uploadImages(eq(activityId), any()))
                .thenThrow(new RuntimeException("Falha no MinIO"));

        assertThrows(jakarta.servlet.ServletException.class, () ->
                mockMvc.perform(multipart("/api/activities/{activityId}/images", activityId)
                        .file(file))
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }
}