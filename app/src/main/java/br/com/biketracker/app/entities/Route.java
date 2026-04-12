package br.com.biketracker.app.entities;

import br.com.biketracker.app.entities.dtos.TrackPoint;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.CoordinateXYZM;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.Point;

import java.time.ZoneOffset;
import java.util.List;

@Entity
@Table(name = "routes")
@NoArgsConstructor
@Getter
@Setter
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(columnDefinition = "geography(Point, 4326)")
    private Point startPoint;

    @Column(columnDefinition = "geography(Point, 4326)")
    private Point endPoint;

    // LineStringZM: cada ponto carrega X(lon), Y(lat), Z(altitude), M(timestamp Unix)
    @Column(columnDefinition = "geography(LineStringZM, 4326)")
    private LineString path;

    @OneToOne(mappedBy = "route", fetch = FetchType.LAZY)
    @JsonBackReference
    private Ride ride;

    //CoordinateXYZM(longitude, latitude, altimetria, timestamp)
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
