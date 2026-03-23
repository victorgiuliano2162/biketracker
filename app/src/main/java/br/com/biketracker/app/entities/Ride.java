package br.com.biketracker.app.entities;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private double distanceInKm;
    private double elevationInMeters;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private long activityTimeInSeconds;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Coordinate> coordinates;

    public void calculateActivityTime() {
        Duration duration = Duration.between(startTime, endTime);
        this.activityTimeInSeconds = duration.toSeconds();
    }

    public Ride(double distanceInKm, double elevationInMeters, LocalDateTime startTime, LocalDateTime endTime, List<Coordinate> coordinates) {
        this.distanceInKm = distanceInKm;
        this.elevationInMeters = elevationInMeters;
        this.startTime = startTime;
        this.endTime = endTime;
        this.coordinates = coordinates;
    }
}
