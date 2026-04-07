package br.com.biketracker.app.entities;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "goals")
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    // Valor alvo da meta — ex: 200 (km), 10 (rides), etc.
    private double targetValue;

    // Valor atual já conquistado
    private double currentValue;

    // Unidade da meta — ex: "km", "rides", "horas"
    private String unit;

    private LocalDateTime createdAt;
    private LocalDateTime deadLine;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    public Goal(String name, String description, double targetValue, String unit, LocalDateTime deadLine, User user) {
        this.name = name;
        this.description = description;
        this.targetValue = targetValue;
        this.currentValue = 0;
        this.unit = unit;
        this.createdAt = LocalDateTime.now();
        this.deadLine = deadLine;
        this.user = user;
    }

    public double getProgressPercent() {
        if (targetValue == 0) return 0;
        return Math.min((currentValue / targetValue) * 100, 100);
    }
}