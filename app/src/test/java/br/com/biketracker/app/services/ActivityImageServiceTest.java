package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.ActivityImage;
import br.com.biketracker.app.entities.Route;
import br.com.biketracker.app.repositories.ActivityImageRepository;
import br.com.biketracker.app.repositories.RouteRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ActivityImageServiceTest {

    @Mock
    private MinioStorageService minioStorageService;

    @Mock
    private ActivityImageRepository activityImageRepository;

    @Mock
    private RouteRepository routeRepository;

    @InjectMocks
    private ActivityImageService activityImageService;

    @Nested
    @DisplayName("Testes para uploadImages")
    class UploadImagesTests {

        @Test
        @DisplayName("Deve fazer upload com sucesso quando os arquivos forem válidos")
        void uploadImages_Sucesso() throws Exception {
            UUID activityId = UUID.randomUUID();
            MockMultipartFile file = new MockMultipartFile(
                    "files", "foto.jpg", "image/jpeg", "conteudo".getBytes()
            );
            Route mockRoute = new Route();

            when(minioStorageService.uploadActivityImage(eq(activityId), any(MultipartFile.class)))
                    .thenReturn("activities/" + activityId + "/foto.jpg");
            when(routeRepository.findRouteById(activityId.toString())).thenReturn(mockRoute);

            List<String> keys = activityImageService.uploadImages(activityId, List.of(file));

            assertThat(keys).hasSize(1).contains("activities/" + activityId + "/foto.jpg");
            verify(activityImageRepository, times(1)).save(any(ActivityImage.class));
        }

        @Test
        @DisplayName("Deve lançar exceção quando o arquivo estiver vazio")
        void uploadImages_ArquivoVazio_Erro() {
            UUID activityId = UUID.randomUUID();
            MockMultipartFile file = new MockMultipartFile("files", "foto.jpg", "image/jpeg", new byte[0]);

            assertThatThrownBy(() -> activityImageService.uploadImages(activityId, List.of(file)))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Arquivo vazio"); // Valida o texto da exceção do seu código

            verifyNoInteractions(minioStorageService, activityImageRepository);
        }

        @Test
        @DisplayName("Deve lançar exceção quando o tipo do arquivo não for permitido")
        void uploadImages_TipoInvalido_Erro() {
            UUID activityId = UUID.randomUUID();
            MockMultipartFile file = new MockMultipartFile("files", "documento.pdf", "application/pdf", "conteudo".getBytes());

            assertThatThrownBy(() -> activityImageService.uploadImages(activityId, List.of(file)))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Deve lançar exceção quando o arquivo exceder o tamanho máximo")
        void uploadImages_TamanhoExcedido_Erro() {
            UUID activityId = UUID.randomUUID();
            byte[] grandeQuantidadeDeDados = new byte[11 * 1024 * 1024]; // 11MB
            MockMultipartFile file = new MockMultipartFile("files", "foto.jpg", "image/jpeg", grandeQuantidadeDeDados);

            assertThatThrownBy(() -> activityImageService.uploadImages(activityId, List.of(file)))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("Testes para getPresignedUrls")
    class GetPresignedUrlsTests {

        @Test
        @DisplayName("Deve retornar lista de URLs assinadas com sucesso")
        void getPresignedUrls_Sucesso() throws Exception {
            String activityId = "route-uuid";
            ActivityImage img = new ActivityImage();
            img.setObjectKey("key1");

            when(activityImageRepository.findByRouteId(activityId)).thenReturn(List.of(img));
            when(minioStorageService.generatePresignedUrl("key1")).thenReturn("http://mockurl.com/key1");

            List<String> urls = activityImageService.getPresignedUrls(activityId);

            assertThat(urls).hasSize(1).contains("http://mockurl.com/key1");
        }
    }

    @Nested
    @DisplayName("Testes para deleteImage")
    class DeleteImageTests {

        @Test
        @DisplayName("Deve deletar a imagem com sucesso por ID")
        void deleteImage_Sucesso() throws Exception {
            Long imageId = 1L;
            ActivityImage img = new ActivityImage();
            img.setObjectKey("key1");

            when(activityImageRepository.findById(imageId)).thenReturn(Optional.of(img));

            activityImageService.deleteImage(imageId);

            verify(minioStorageService, times(1)).deleteImage("key1");
            verify(activityImageRepository, times(1)).delete(img);
        }

        @Test
        @DisplayName("Deve lançar EntityNotFoundException quando o ID não existir")
        void deleteImage_NaoEncontrado_Erro() {
            Long imageId = 99L;
            when(activityImageRepository.findById(imageId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> activityImageService.deleteImage(imageId))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Testes para deleteImageByRouteId e deleteAllActivityImages")
    class DeleteBulkTests {

        @Test
        @DisplayName("Deve deletar todas as imagens da atividade com sucesso")
        void deleteAllActivityImages_Sucesso() throws Exception {
            String activityId = "route-uuid";
            ActivityImage img = new ActivityImage();
            img.setObjectKey("key1");

            List<ActivityImage> images = List.of(img);
            when(activityImageRepository.findByRouteId(activityId)).thenReturn(images);

            activityImageService.deleteAllActivityImages(activityId);

            verify(minioStorageService, times(1)).deleteImage("key1");
            verify(activityImageRepository, times(1)).deleteAll(images);
        }
    }
}
