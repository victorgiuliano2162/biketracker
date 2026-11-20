package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.ActivityImage;
import br.com.biketracker.app.entities.Route;
import br.com.biketracker.app.exceptions.ex.ResourceNotFoundException;
import br.com.biketracker.app.repositories.ActivityImageRepository;
import br.com.biketracker.app.repositories.RouteRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityImageService {

    private final MinioStorageService minioStorageService;
    private final ActivityImageRepository activityImageRepository;
    private final RouteRepository routeRepository;

    @Transactional
    public List<String> uploadImages(UUID activityId, List<MultipartFile> files) {
        return uploadImages(activityId, files, null);
    }

    @Transactional
    public List<String> uploadImages(UUID activityId, List<MultipartFile> files, String userId) {
        for (MultipartFile file : files) {
            validateImageFile(file);
        }

        Route route = routeRepository.findById(activityId.toString())
                .orElseGet(() -> routeRepository.findRouteById(activityId.toString()));

        if (route == null) {
            throw new ResourceNotFoundException("Rota não encontrada: " + activityId);
        }

        if (userId != null && route.getUser() != null && !route.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Você não tem permissão para adicionar fotos a esta rota");
        }

        List<String> keys = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                String objectKey = minioStorageService.uploadActivityImage(activityId, file);
                ActivityImage image = new ActivityImage();
                image.setObjectKey(objectKey);
                image.setOriginalFilename(file.getOriginalFilename());
                image.setUploadedAt(LocalDateTime.now());
                image.setRoute(route);
                activityImageRepository.save(image);
                keys.add(objectKey);

            } catch (Exception e) {
                log.error("Erro ao fazer upload do arquivo {}: {}", file.getOriginalFilename(), e.getMessage());
                throw new RuntimeException("Erro ao fazer upload do arquivo: " + file.getOriginalFilename(), e);
            }
        }

        return keys;
    }

    public List<String> getPresignedUrls(String activityId) {
        return getPresignedUrls(activityId, null);
    }

    public List<String> getPresignedUrls(String activityId, String userId) {
        Route route = routeRepository.findById(activityId)
                .orElseGet(() -> routeRepository.findRouteById(activityId));

        if (route != null && !route.isPublic()) {
            if (userId == null || (route.getUser() != null && !route.getUser().getId().equals(userId))) {
                throw new AccessDeniedException("Essa rota é privada e não pertence ao usuário");
            }
        }

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
        List<ActivityImage> images = activityImageRepository.findByRouteId(routeId);
        for (ActivityImage activityImage : images) {
            try {
                minioStorageService.deleteImage(activityImage.getObjectKey());
            } catch (Exception e) {
                log.error("Erro ao deletar imagem do MinIO {}: {}", activityImage.getObjectKey(), e.getMessage());
            }
        }
        activityImageRepository.deleteByRouteId(routeId);
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
