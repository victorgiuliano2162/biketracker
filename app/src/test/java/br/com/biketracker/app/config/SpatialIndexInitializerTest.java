package br.com.biketracker.app.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SpatialIndexInitializerTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private DataSource dataSource;

    @InjectMocks
    private SpatialIndexInitializer initializer;

    @Test
    @DisplayName("Deve criar índices espaciais GiST quando o banco for PostgreSQL")
    void ensureSpatialIndexes_PostgreSql_CreatesIndexes() throws Exception {
        Connection connection = mock(Connection.class);
        DatabaseMetaData metaData = mock(DatabaseMetaData.class);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metaData);
        when(metaData.getDatabaseProductName()).thenReturn("PostgreSQL");

        initializer.ensureSpatialIndexes();

        verify(jdbcTemplate).execute(contains("idx_route_path_gist"));
        verify(jdbcTemplate).execute(contains("idx_route_path_geom_gist"));
        verify(jdbcTemplate).execute(contains("idx_route_start_point_gist"));
        verify(jdbcTemplate).execute(contains("idx_route_start_point_geom_gist"));
    }

    @Test
    @DisplayName("Não deve executar DDL de índices GiST em bancos que não sejam PostgreSQL")
    void ensureSpatialIndexes_NonPostgres_Skips() throws Exception {
        Connection connection = mock(Connection.class);
        DatabaseMetaData metaData = mock(DatabaseMetaData.class);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metaData);
        when(metaData.getDatabaseProductName()).thenReturn("H2");

        initializer.ensureSpatialIndexes();

        verifyNoInteractions(jdbcTemplate);
    }
}
