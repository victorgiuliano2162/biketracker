package br.com.biketracker.app.repositories;

import br.com.biketracker.app.entities.Route;
import br.com.biketracker.app.entities.dtos.route.RouteStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, String> {

    // Lista rotas do usuário, mais recentes primeiro
    Page<Route> findByUserIdOrderByStartTimeDesc(String userId, Pageable pageable);

    void deleteRouteById(String id);

    boolean existsByIdAndUserId(String id, String userId);
    @Query("""
        SELECT
            COUNT(r)                      AS totalRoutes,
            SUM(r.distanceInKm)           AS totalDistanceInKm,
            SUM(r.elevationInMeters)      AS totalElevationInMeters,
            SUM(r.activityTimeInSeconds)  AS totalActivityTimeInSeconds
        FROM Route r WHERE r.user.id = :userId
        """)
    RouteStatsResponse findStatsByUserId(@Param("userId") String userId);

    // Rotas públicas paginadas
    Page<Route> findByIsPublicTrueOrderByStartTimeDesc(Pageable pageable);

    // Replay: extrai os pontos da LineStringZM de uma rota
    @Query(value = """
SELECT
    ST_X((dp).geom::geometry)               AS longitude,
    ST_Y((dp).geom::geometry)               AS latitude,
    ST_Z((dp).geom::geometry)               AS altitude_in_meters,
    to_timestamp(ST_M((dp).geom::geometry)) AS recorded_at
FROM (
    SELECT ST_DumpPoints(r.path::geometry) AS dp
    FROM routes r
    WHERE r.id = ?1 AND r.user_id = ?2
) AS dumped
ORDER BY (dp).path[1]
            """, nativeQuery = true)
    List<Object[]> findRoutePointsByRouteId(
            @Param("routeId") String routeId,
            @Param("userId")  String userId
    );

    // Busca por bounding box
    @Query(value = """
            SELECT r.id
            FROM routes r
            WHERE r.user_id = :userId
              AND ST_Intersects(
                    r.path::geometry,
                    ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)
              )
            ORDER BY r.start_time DESC
            """, nativeQuery = true)
    List<String> findIdsByUserAndBoundingBox(
            @Param("userId") String userId,
            @Param("minLon") double minLon,
            @Param("minLat") double minLat,
            @Param("maxLon") double maxLon,
            @Param("maxLat") double maxLat
    );

    // RouteRepository.java — adicionar estes dois métodos

    List<Route> findTop5ByUserIdOrderByStartTimeDesc(String userId);

    @Query("SELECT r FROM Route r WHERE r.user.id = :userId AND r.startTime >= :since ORDER BY r.startTime DESC")
    List<Route> findByUserIdSince(@Param("userId") String userId, @Param("since") LocalDateTime since);

    @Query(value = """
    SELECT r.id
    FROM routes r
    WHERE r.user_id = :userId
      AND ST_Intersects(
            r.path,
            ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)
          )
    """, nativeQuery = true)
    List<Long> findIdsByUserAndBoundingBox(
            @Param("userId") Long userId,
            @Param("minLon") double minLon,
            @Param("minLat") double minLat,
            @Param("maxLon") double maxLon,
            @Param("maxLat") double maxLat
    );
}
