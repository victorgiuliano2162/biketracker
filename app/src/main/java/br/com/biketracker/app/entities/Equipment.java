package br.com.biketracker.app.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @OneToOne
    private User user;
    private String name;
    private String description;

    private Long kilometersRidden;

    public Equipment(String name, String description, Long kilometersRidden) {
        this.name = name;
        this.description = description;
        this.kilometersRidden = kilometersRidden;
    }

    public void increaseKilometersRidden(Long kilometersRidden) {
        this.kilometersRidden += kilometersRidden;
    }
}
