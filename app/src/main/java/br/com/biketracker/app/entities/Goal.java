package br.com.biketracker.app.entities;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

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

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deadLine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference
    private User user;

    public Goal(String name, String description, double targetValue, String unit, LocalDate deadLine, User user) {
        this.name = name;
        this.description = description;
        this.targetValue = targetValue;
        this.currentValue = 0;
        this.unit = unit;
        this.deadLine = deadLine;
        this.createdAt = LocalDate.now();
        this.user = user;
    }

    public double getProgressPercent() {
        if (targetValue == 0) return 0;
        return Math.min((currentValue / targetValue) * 100, 100);
    }
}