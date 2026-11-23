package br.com.biketracker.app.entities.dtos.user;

import br.com.biketracker.app.entities.enums.TipoSanguineo;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record UserRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
        String name,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
        String password,

        @Min(value = 1, message = "Idade mínima é 1 ano")
        @Max(value = 120, message = "Idade máxima é 120 anos")
        int age,

        @DecimalMin(value = "1.0", message = "Peso mínimo é 1kg")
        @DecimalMax(value = "500.0", message = "Peso máximo é 500kg")
        double weight,

        @NotNull(message = "Data de nascimento é obrigatória")
        @PastOrPresent(message = "Data de nascimento não pode ser futura")
        LocalDateTime bornAt,

        TipoSanguineo tipoSanguineo
) {
    @Override
    public String toString() {
        return "UserRequest{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", password='[PROTECTED]'" +
                ", age=" + age +
                ", weight=" + weight +
                ", bornAt=" + bornAt +
                ", tipoSanguineo=" + tipoSanguineo +
                '}';
    }
}
