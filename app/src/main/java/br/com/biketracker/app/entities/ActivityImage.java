package br.com.biketracker.app.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
public class ActivityImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Route route;

    @Column(nullable = false)
    private String objectKey;   // "activities/{uuid}/arquivo.jpg"

    private String originalFilename;

    private LocalDateTime uploadedAt;
}
