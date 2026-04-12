package br.com.biketracker.app.entities;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
@Table(name = "rides")
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

    private String startCity;
    private String country;

    private long activityTimeInSeconds;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", referencedColumnName = "id")
    @JsonManagedReference
    private Route route;

    public void calculateActivityTime() {
        Duration duration = Duration.between(startTime, endTime);
        this.activityTimeInSeconds = duration.toSeconds();
    }

    public Ride(double distanceInKm, double elevationInMeters,
                LocalDateTime startTime, LocalDateTime endTime, Route route) {
        this.distanceInKm = distanceInKm;
        this.elevationInMeters = elevationInMeters;
        this.startTime = startTime;
        this.endTime = endTime;
        this.route = route;
    }
}
