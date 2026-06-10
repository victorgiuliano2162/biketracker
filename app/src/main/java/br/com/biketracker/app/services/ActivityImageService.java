package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.ActivityImage;
import br.com.biketracker.app.repositories.ActivityImageRepository;
import br.com.biketracker.app.repositories.RouteRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityImageService {

    private final MinioStorageService minioStorageService;
    private final ActivityImageRepository activityImageRepository;
    private final RouteRepository routeRepository;

    @Transactional
    public List<String> uploadImages(UUID activityId, List<MultipartFile> files) {
        List<String> keys = new ArrayList<>();

        for (MultipartFile file : files) {
            validateImageFile(file);

            try {
                String objectKey = minioStorageService.uploadActivityImage(activityId, file);
                var route = routeRepository.findRouteById(activityId.toString());
                ActivityImage image = new ActivityImage();
                image.setObjectKey(objectKey);
                image.setOriginalFilename(file.getOriginalFilename());
                image.setUploadedAt(LocalDateTime.now());
                image.setRoute(route);
                activityImageRepository.save(image);
                keys.add(objectKey);

            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException("Erro ao fazer upload do arquivo: " + file.getOriginalFilename(), e);
            }
        }

        return keys;
    }

    public List<String> getPresignedUrls(String activityId) {
        List<ActivityImage> images = activityImageRepository.findByRouteId(activityId);

        return images.stream()
                .map(image -> {
                    try {
                        return minioStorageService.generatePresignedUrl(image.getObjectKey());
                    } catch (Exception e) {
                        throw new RuntimeException("Erro ao gerar URL para: " + image.getObjectKey(), e);
                    }
                })
                .toList();
    }

    @Transactional
    public void deleteImage(Long imageId) {
        ActivityImage image = activityImageRepository.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException("Imagem não encontrada: " + imageId));

        try {
            minioStorageService.deleteImage(image.getObjectKey());
            activityImageRepository.delete(image);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar imagem: " + image.getObjectKey(), e);
        }
    }

    @Transactional
    public void deleteImageByRouteId(String routeId) {
        List<ActivityImage> image = activityImageRepository.findByRouteId(routeId);
        for (ActivityImage activityImage : image) {
            activityImageRepository.deleteByRouteId(activityImage.getRoute().getId());
            minioStorageService.deleteImage(activityImage.getObjectKey());
        }
    }

    @Transactional
    public void deleteAllActivityImages(String activityId) {
        List<ActivityImage> images = activityImageRepository.findByRouteId(activityId);

        images.forEach(image -> {
            try {
                minioStorageService.deleteImage(image.getObjectKey());
            } catch (Exception e) {
                throw new RuntimeException("Erro ao deletar imagem: " + image.getObjectKey(), e);
            }
        });

        activityImageRepository.deleteAll(images);
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio: " + file.getOriginalFilename());
        }

        List<String> allowedTypes = List.of("image/jpeg", "image/png", "image/webp", "image/gif");
        if (!allowedTypes.contains(file.getContentType())) {
            throw new IllegalArgumentException("Tipo de arquivo não permitido: " + file.getContentType());
        }

        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("Arquivo excede o tamanho máximo de 10MB: " + file.getOriginalFilename());
        }
    }
}
