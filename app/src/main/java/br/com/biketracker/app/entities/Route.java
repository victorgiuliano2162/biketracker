package br.com.biketracker.app.entities;

import br.com.biketracker.app.entities.dtos.route.TrackPoint;
import br.com.biketracker.app.entities.enums.RouteDifficulty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicUpdate;
import org.locationtech.jts.geom.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Entity
@Table(name = "routes")
@NoArgsConstructor
@Getter
@Setter
@DynamicUpdate
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    private double distanceInKm;
    private double elevationInMeters;

    private LocalDateTime createdAt;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private RouteDifficulty difficulty;

    private String startCity;
    private String country;

    private long activityTimeInSeconds;

    private boolean isPublic;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "geography(PointZ, 4326)")
    private Point startPoint;

    @Column(columnDefinition = "geography(PointZ, 4326)")
    private Point endPoint;

    @Column(columnDefinition = "geography(LineStringZM, 4326)")
    private LineString path;

    public void calculateActivityTime() {
        Duration duration = Duration.between(startTime, endTime);
        this.activityTimeInSeconds = duration.toSeconds();
    }

    public void buildPathWithoutZDimension(GeometryFactory factory, List<TrackPoint> trackPoints) {
        CoordinateXYZM[] coords = trackPoints.stream()
                .map(tp -> new CoordinateXYZM(
                        tp.longitude(),
                        tp.latitude(),
                        tp.altitudeInMeters(),
                        tp.recordedAt().toEpochSecond(ZoneOffset.UTC)
                ))
                .toArray(CoordinateXYZM[]::new);
        Coordinate startCoord = new Coordinate(coords[0].x, coords[0].y);
        Coordinate endCoord   = new Coordinate(coords[coords.length - 1].x, coords[coords.length - 1].y);

        this.startPoint = factory.createPoint(startCoord);
        this.endPoint   = factory.createPoint(endCoord);
        this.path = factory.createLineString(coords);

    }

    public void buildPath(GeometryFactory factory, List<TrackPoint> trackPoints) {
        CoordinateXYZM[] coords = trackPoints.stream()
                .map(tp -> new CoordinateXYZM(
                        tp.longitude(),
                        tp.latitude(),
                        tp.altitudeInMeters(),
                        tp.recordedAt().toEpochSecond(ZoneOffset.UTC)
                ))
                .toArray(CoordinateXYZM[]::new);
        Coordinate startCoord = new Coordinate(coords[0].x, coords[0].y, coords[0].z);
        Coordinate endCoord = new Coordinate(coords[coords.length - 1].x, coords[coords.length - 1].y, coords[coords.length - 1].z);

        this.startPoint = factory.createPoint(startCoord);
        this.endPoint   = factory.createPoint(endCoord);
        this.path = factory.createLineString(coords);

    }
}
