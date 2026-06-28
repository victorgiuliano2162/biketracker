package br.com.biketracker.app.controllers;

import br.com.biketracker.app.services.ActivityImageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActivityImageControllerUnitTest {

    @Mock
    private ActivityImageService activityImageService;

    @InjectMocks
    private ActivityImageController controller;

    private Jwt fakeJwt;

    @BeforeEach
    void setUp() {
        fakeJwt = mock(Jwt.class);
    }

    @Test
    @DisplayName("upload() deve retornar 200 com as keys geradas")
    void upload_ReturnsKeys() {
        UUID activityId = UUID.randomUUID();
        MultipartFile file = new MockMultipartFile("files", "img.png", "image/png", "conteudo".getBytes());
        List<MultipartFile> files = List.of(file);
        List<String> expectedKeys = List.of("key-1");

        when(activityImageService.uploadImages(eq(activityId), any())).thenReturn(expectedKeys);

        ResponseEntity<List<String>> response = controller.upload(fakeJwt, activityId, files);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedKeys);
        verify(activityImageService).uploadImages(activityId, files);
    }

    @Test
    @DisplayName("getImageUrls() deve retornar 200 com as URLs")
    void getImageUrls_ReturnsUrls() {
        String activityId = UUID.randomUUID().toString();
        List<String> expectedUrls = List.of("https://s3.url/img1.png");

        when(activityImageService.getPresignedUrls(activityId)).thenReturn(expectedUrls);

        ResponseEntity<List<String>> response = controller.getImageUrls(fakeJwt, activityId);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedUrls);
    }

    @Test
    @DisplayName("upload() deve propagar exceção quando o service falha")
    void upload_ServiceThrows_PropagatesException() {
        UUID activityId = UUID.randomUUID();
        List<MultipartFile> files = List.of(new MockMultipartFile("files", "img.png", "image/png", "x".getBytes()));

        when(activityImageService.uploadImages(eq(activityId), any()))
                .thenThrow(new RuntimeException("Erro ao enviar para o MinIO"));

        org.junit.jupiter.api.Assertions.assertThrows(
                RuntimeException.class,
                () -> controller.upload(fakeJwt, activityId, files)
        );
    }
}
