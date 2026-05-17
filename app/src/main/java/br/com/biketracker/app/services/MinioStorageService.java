package br.com.biketracker.app.services;

import io.minio.*;
import io.minio.http.Method;
import io.minio.messages.Item;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
public class MinioStorageService {

    private final MinioClient minioClient;

    @Value("${minio.endpoint}")
    private String minioEndpoint;

    @Value("${minio.public-endpoint}")
    private String minioPublicEndpoint;

    @Value("${minio.bucket}")
    private String bucket;

    // Faz upload de uma imagem e retorna o object key
    public String uploadActivityImage(UUID activityId, MultipartFile file) throws Exception {
        String extension = getExtension(file.getOriginalFilename());
        String objectKey = "activities/" + activityId + "/" + UUID.randomUUID() + extension;

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucket)
                        .object(objectKey)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );

        return objectKey;
    }

    // Lista todos os object keys de uma atividade
    public List<String> listActivityImageKeys(UUID activityId) throws Exception {
        String prefix = "activities/" + activityId + "/";
        List<String> keys = new ArrayList<>();

        Iterable<Result<Item>> results = minioClient.listObjects(
                ListObjectsArgs.builder()
                        .bucket(bucket)
                        .prefix(prefix)
                        .build()
        );

        for (Result<Item> result : results) {
            keys.add(result.get().objectName());
        }

        return keys;
    }


    public String generatePresignedUrl(String objectKey) throws Exception {
        String url = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .bucket(bucket)
                        .object(objectKey)
                        .method(Method.GET)
                        .expiry(1, TimeUnit.HOURS)
                        .build()
        );
        // Substitui o host interno pelo endpoint público acessível pelo browser
        return url.replace(minioEndpoint, minioPublicEndpoint);
    }

    // Remove uma imagem
    public void deleteImage(String objectKey) throws Exception {
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucket)
                        .object(objectKey)
                        .build()
        );
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }
}
