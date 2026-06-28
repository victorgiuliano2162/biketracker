package br.com.biketracker.app.services;

import io.minio.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class MinioStorageServiceTest {

    @Mock
    private MinioClient minioClient;

    private MinioStorageService minioStorageService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        minioStorageService = new MinioStorageService(minioClient);
        // Injeta manualmente os valores que viriam do @Value do application.properties
        ReflectionTestUtils.setField(minioStorageService, "minioEndpoint", "http://localhost:9000");
        ReflectionTestUtils.setField(minioStorageService, "minioPublicEndpoint", "https://s3.biketracker.com");
        ReflectionTestUtils.setField(minioStorageService, "bucket", "biketracker-bucket");
    }

    @Test
    @DisplayName("Deve fazer upload de imagem da atividade e retornar a object key gerada")
    void uploadActivityImage_Sucesso() throws Exception {
        UUID activityId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile(
                "file", "foto.png", "image/png", "dados".getBytes()
        );

        // O putObject retorna um ObjectWriteResponse. Podemos mockar ou apenas garantir que não lança erro.
        when(minioClient.putObject(any(PutObjectArgs.class))).thenReturn(mock(ObjectWriteResponse.class));

        String resultKey = minioStorageService.uploadActivityImage(activityId, file);

        assertThat(resultKey)
                .startsWith("activities/" + activityId + "/")
                .endsWith(".png");

        verify(minioClient, times(1)).putObject(any(PutObjectArgs.class));
    }

    @Test
    @DisplayName("Deve gerar a URL assinada substituindo o host interno pelo público")
    void generatePresignedUrl_Sucesso() throws Exception {
        String objectKey = "activities/123/foto.jpg";
        String urlInterna = "http://localhost:9000/biketracker-bucket/activities/123/foto.jpg?token=abc";

        when(minioClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class)))
                .thenReturn(urlInterna);

        String urlPublica = minioStorageService.generatePresignedUrl(objectKey);

        // Verifica se substituiu "http://localhost:9000" por "https://s3.biketracker.com"
        assertThat(urlPublica).isEqualTo("https://s3.biketracker.com/biketracker-bucket/activities/123/foto.jpg?token=abc");
    }

    @Test
    @DisplayName("Deve chamar o removeObject ao deletar uma imagem")
    void deleteImage_Sucesso() throws Exception {
        String objectKey = "activities/123/foto.jpg";

        minioStorageService.deleteImage(objectKey);

        verify(minioClient, times(1)).removeObject(any(RemoveObjectArgs.class));
    }

    @Test
    @DisplayName("Deve fazer upload do preview da rota e retornar a URL pública estruturada")
    void uploadRoutePreview_Sucesso() throws Exception {
        String routeId = "rota-456";
        byte[] pngBytes = "imagem-bytes".getBytes();

        // Mocka a verificação se o bucket de preview existe (vamos simular que sim para ignorar criação)
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);
        when(minioClient.putObject(any(PutObjectArgs.class))).thenReturn(mock(ObjectWriteResponse.class));

        String urlGerada = minioStorageService.uploadRoutePreview(routeId, pngBytes);

        assertThat(urlGerada).isEqualTo("https://s3.biketracker.com/trakker-previews/previews/rota-456.png");
    }

    @Test
    @DisplayName("Deve retornar a URL do preview se o objeto correspondente existir no MinIO")
    void getRoutePreviewUrl_ObjetoExiste() throws Exception {
        String routeId = "rota-789";

        when(minioClient.statObject(any(StatObjectArgs.class))).thenReturn(mock(StatObjectResponse.class));

        String url = minioStorageService.getRoutePreviewUrl(routeId);

        assertThat(url).isEqualTo("https://s3.biketracker.com/trakker-previews/previews/rota-789.png");
    }

    @Test
    @DisplayName("Deve retornar null quando o preview da rota não existir no MinIO")
    void getRoutePreviewUrl_ObjetoNaoExiste_RetornaNull() throws Exception {
        String routeId = "rota-inexistente";

        // Simula a exceção que o MinIO lança quando não encontra o arquivo (ErrorResponseException)
        io.minio.errors.ErrorResponseException exceptionMock = mock(io.minio.errors.ErrorResponseException.class);

        when(minioClient.statObject(any(StatObjectArgs.class))).thenThrow(exceptionMock);

        String url = minioStorageService.getRoutePreviewUrl(routeId);

        assertThat(url).isNull();
    }
}
