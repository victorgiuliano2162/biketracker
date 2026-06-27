package br.com.biketracker.app.controllers;

import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthCheckController {

    private final DataSource dataSource;
    private final MinioClient minioClient;

    @GetMapping("/hello")
    public String hello() {
        return "Hello World";
    }


    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> details = new LinkedHashMap<>();
        boolean isHealthy = true;

        // 1. Testar conexão com o Banco de Dados
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                details.put("database", "UP");
            } else {
                isHealthy = false;
                details.put("database", "DOWN (Invalid connection)");
            }
        } catch (Exception e) {
            isHealthy = false;
            details.put("database", "DOWN (" + e.getMessage() + ")");
        }

        // 2. Testar conexão com o Minio
        try {
            // Executa uma chamada leve, como listar os buckets existentes
            minioClient.listBuckets();
            details.put("minio", "UP");
        } catch (Exception e) {
            isHealthy = false;
            details.put("minio", "DOWN (" + e.getMessage() + ")");
        }

        // Status geral da aplicação
        details.put("status", isHealthy ? "UP" : "DOWN");

        if (isHealthy) {
            return ResponseEntity.ok(details); // Retorna 200 OK
        } {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(details); // Retorna 503
        }
    }
}

