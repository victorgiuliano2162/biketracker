package br.com.biketracker.app.entities;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private String name;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime deadLine;

}
