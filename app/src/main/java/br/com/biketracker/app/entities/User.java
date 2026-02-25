package br.com.biketracker.app.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String email;
    private String password;
    private int age;
    private int weight;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Goal> goals;

    @OneToMany(fetch = FetchType.LAZY)
    private List<Ride> rides;


}
