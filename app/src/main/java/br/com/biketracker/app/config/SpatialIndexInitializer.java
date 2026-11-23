package br.com.biketracker.app.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * Garante que os índices espaciais GiST da tabela {@code routes} existam sempre
 * que a aplicação iniciar (tanto em bancos novos quanto existentes), após o
 * Hibernate criar/atualizar o schema.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SpatialIndexInitializer {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @EventListener(ApplicationReadyEvent.class)
    public void ensureSpatialIndexes() {
        if (!isPostgreSql()) {
            log.debug("Banco não é PostgreSQL; criação de índices GiST ignorada.");
            return;
        }

        try {
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_route_path_gist ON routes USING GIST (path)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_route_path_geom_gist ON routes USING GIST ((path::geometry))");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_route_start_point_gist ON routes USING GIST (start_point)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_route_start_point_geom_gist ON routes USING GIST ((start_point::geometry))");
            log.info("Índices espaciais GiST verificados/criados com sucesso na tabela routes.");
        } catch (Exception e) {
            log.warn("Não foi possível garantir índices espaciais GiST na tabela routes: {}", e.getMessage());
        }
    }

    private boolean isPostgreSql() {
        try (Connection conn = dataSource.getConnection()) {
            String product = conn.getMetaData().getDatabaseProductName();
            return product != null && product.toLowerCase().contains("postgresql");
        } catch (Exception e) {
            log.warn("Não foi possível detectar o tipo de banco de dados: {}", e.getMessage());
            return false;
        }
    }
}
