package br.com.biketracker.app.repositories;

import br.com.biketracker.app.entities.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {

    @Query(value = """
            SELECT
                ST_X((dp).geom)                AS longitude,
                ST_Y((dp).geom)                AS latitude,
                ST_Z((dp).geom)                AS altitude_in_meters,
                to_timestamp(ST_M((dp).geom))  AS recorded_at
            FROM (
                SELECT ST_DumpPoints(r.path) AS dp
                FROM routes r
                INNER JOIN rides ri ON ri.route_id = r.id
                WHERE ri.id = :rideId AND ri.user_id = :userId
            ) AS dumped
            ORDER BY (dp).path[1]
            """, nativeQuery = true)
    List<Object[]> findRoutePointsByRideId(
            @Param("rideId") Long rideId,
            @Param("userId") String userId
    );

    // ST_Intersects verifica se a rota cruza ou está dentro do bounding box
    // ST_MakeEnvelope(minLon, minLat, maxLon, maxLat, SRID) cria o polígono da região
    @Query(value = """
            SELECT ri.id
            FROM routes r
            INNER JOIN rides ri ON ri.route_id = r.id
            WHERE ri.user_id = :userId
              AND ST_Intersects(
                    r.path::geometry,
                    ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)
              )
            ORDER BY ri.start_time DESC
            """, nativeQuery = true)
    List<Long> findRideIdsByUserAndBoundingBox(
            @Param("userId")  String userId,
            @Param("minLon")  double minLon,
            @Param("minLat")  double minLat,
            @Param("maxLon")  double maxLon,
            @Param("maxLat")  double maxLat
    );
}
