package br.com.biketracker.app.entities;

import br.com.biketracker.app.entities.enums.TipoSanguineo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String email;
    private String password;
    private int age;
    private double weight;
    private LocalDateTime createdAt;
    private LocalDateTime bornAt;
    private TipoSanguineo tipoSanguineo;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Goal> goals;

    @OneToMany(fetch = FetchType.LAZY)
    private List<Ride> rides;

    public User(String name,
                String email,
                String password,
                int age,
                double weight,
                LocalDateTime bornAt,
                TipoSanguineo tipoSanguineo
    ) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.age = age;
        this.weight = weight;
        this.createdAt = LocalDateTime.now();
        this.bornAt = bornAt;
        this.tipoSanguineo =  tipoSanguineo;
    }

}
