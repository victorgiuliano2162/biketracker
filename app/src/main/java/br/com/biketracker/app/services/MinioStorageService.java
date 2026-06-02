package br.com.biketracker.app.services;

import io.minio.*;
import io.minio.http.Method;
import io.minio.messages.Item;
import jakarta.annotation.PostConstruct;
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

    private static final String PREVIEW_BUCKET = "trakker-previews";

    @PostConstruct
    public void init() {
        try {
            ensurePreviewBucketExists();
        } catch (Exception e) {
            throw new RuntimeException("Falha ao inicializar bucket de previews no MinIO", e);
        }
    }


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
    // Chamar no @PostConstruct ou na inicialização do serviço,
// junto com a criação dos outros buckets
    private void ensurePreviewBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(
                io.minio.BucketExistsArgs.builder().bucket(PREVIEW_BUCKET).build()
        );
        if (!exists) {
            minioClient.makeBucket(
                    io.minio.MakeBucketArgs.builder().bucket(PREVIEW_BUCKET).build()
            );
            // Política pública de leitura para que o Nginx/browser acesse sem autenticação
            String policy = """
            {
              "Version": "2012-10-17",
              "Statement": [{
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetObject"],
                "Resource": ["arn:aws:s3:::%s/*"]
              }]
            }
            """.formatted(PREVIEW_BUCKET);
            minioClient.setBucketPolicy(
                    io.minio.SetBucketPolicyArgs.builder()
                            .bucket(PREVIEW_BUCKET)
                            .config(policy)
                            .build()
            );
        }
    }

    /**
     * Salva o PNG de preview de uma rota no bucket de previews.
     * Retorna a URL pública da imagem.
     */
    public String uploadRoutePreview(String routeId, byte[] pngBytes) throws Exception {
        ensurePreviewBucketExists();

        String objectKey = "previews/" + routeId + ".png";

        minioClient.putObject(
                io.minio.PutObjectArgs.builder()
                        .bucket(PREVIEW_BUCKET)
                        .object(objectKey)
                        .stream(new java.io.ByteArrayInputStream(pngBytes), pngBytes.length, -1)
                        .contentType("image/png")
                        .headers(java.util.Map.of(
                                "Cache-Control", "public, max-age=604800, immutable"
                        ))
                        .build()
        );

        return minioPublicEndpoint + "/" + PREVIEW_BUCKET + "/" + objectKey;
    }

    /**
     * Retorna a URL pública do preview se ele existir, ou null caso contrário.
     */
    public String getRoutePreviewUrl(String routeId) {
        String objectKey = "previews/" + routeId + ".png";
        try {
            // Verifica se o objeto existe — lança exceção se não existir
            minioClient.statObject(
                    io.minio.StatObjectArgs.builder()
                            .bucket(PREVIEW_BUCKET)
                            .object(objectKey)
                            .build()
            );
            return minioPublicEndpoint + "/" + PREVIEW_BUCKET + "/" + objectKey;
        } catch (io.minio.errors.ErrorResponseException e) {
            // Objeto não existe
            return null;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao verificar preview no MinIO", e);
        }

    }

}
