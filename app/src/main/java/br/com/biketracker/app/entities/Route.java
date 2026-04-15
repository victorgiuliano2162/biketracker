package br.com.biketracker.app.entities;

import br.com.biketracker.app.entities.dtos.route.TrackPoint;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.CoordinateXYZM;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.Point;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Entity
@Table(name = "routes")
@NoArgsConstructor
@Getter
@Setter
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private double distanceInKm;
    private double elevationInMeters;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String startCity;
    private String country;

    private long activityTimeInSeconds;

    private boolean isPublic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "geography(Point, 4326)")
    private Point startPoint;

    @Column(columnDefinition = "geography(Point, 4326)")
    private Point endPoint;

    @Column(columnDefinition = "geography(LineStringZM, 4326)")
    private LineString path;

    public void calculateActivityTime() {
        Duration duration = Duration.between(startTime, endTime);
        this.activityTimeInSeconds = duration.toSeconds();
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

        this.path = factory.createLineString(coords);
        this.startPoint = factory.createPoint(coords[0]);
        this.endPoint   = factory.createPoint(coords[coords.length - 1]);
    }
}
