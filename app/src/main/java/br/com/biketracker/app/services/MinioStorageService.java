package br.com.biketracker.app.services;

import io.minio.*;
import io.minio.http.Method;
import io.minio.messages.Item;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service
@RequiredArgsConstructor
public class MinioStorageService {

    //private static final Logger log = LoggerFactory.getLogger(MinioStorageService.class);

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
            // 1. Bucket Principal Privado (fotos de atividades, uploads de usuários)
            ensureBucketExists(bucket, false);

            // 2. Bucket Público (previews PNG de rotas acessíveis diretamente por Nginx/Browser)
            ensureBucketExists(PREVIEW_BUCKET, true);

            log.info("Buckets do MinIO inicializados com sucesso: ['{}', '{}']", bucket, PREVIEW_BUCKET);
        } catch (Exception e) {
            log.error("Falha ao inicializar buckets no MinIO: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao inicializar buckets no MinIO", e);
        }
    }

    private void ensureBucketExists(String bucketName, boolean makePublic) throws Exception {
        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucketName).build()
        );

        if (!exists) {
            log.info("Criando bucket no MinIO: {}", bucketName);
            minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(bucketName).build()
            );

            if (makePublic) {
                applyPublicReadPolicy(bucketName);
            }
        }
    }

    private void applyPublicReadPolicy(String bucketName) throws Exception {
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
        """.formatted(bucketName);

        minioClient.setBucketPolicy(
                SetBucketPolicyArgs.builder()
                        .bucket(bucketName)
                        .config(policy)
                        .build()
        );
        log.info("Política de leitura pública aplicada ao bucket: {}", bucketName);
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
    public void deleteImage(String objectKey) {

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }


    public String uploadRoutePreview(String routeId, byte[] pngBytes) throws Exception {

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


     //Retorna a URL pública do preview se ele existir, ou null caso contrário.

    public String getRoutePreviewUrl(String routeId) {
        String objectKey = "previews/" + routeId + ".png";
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(PREVIEW_BUCKET)
                            .object(objectKey)
                            .build()
            );
            return minioPublicEndpoint + "/" + PREVIEW_BUCKET + "/" + objectKey;
        } catch (io.minio.errors.ErrorResponseException e) {
            if ("NoSuchKey".equals(e.errorResponse().code()) || "NoSuchBucket".equals(e.errorResponse().code())) {
                return null;
            }
            throw new RuntimeException("Erro MinIO ao verificar preview da rota " + routeId, e);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao verificar preview no MinIO", e);
        }
    }

}
