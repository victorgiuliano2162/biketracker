package br.com.biketracker.app.entities;

import br.com.biketracker.app.entities.enums.TipoSanguineo;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
    private String name;

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    private String password;

    @Min(value = 1, message = "Idade mínima é 1 ano")
    @Max(value = 120, message = "Idade máxima é 120 anos")
    private int age;

    @DecimalMin(value = "1.0", message = "Peso mínimo é 1kg")
    @DecimalMax(value = "500.0", message = "Peso máximo é 500kg")
    private double weight;

    private LocalDateTime createdAt;

    @NotNull(message = "Data de nascimento é obrigatória")
    @PastOrPresent(message = "Data de nascimento não pode ser futura")
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
