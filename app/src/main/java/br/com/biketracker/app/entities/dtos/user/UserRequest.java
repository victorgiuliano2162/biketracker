package br.com.biketracker.app.entities.dtos.user;

import br.com.biketracker.app.entities.enums.TipoSanguineo;

import java.time.LocalDateTime;

public record UserRequest(
        String name,
        String email,
        String password,
        int age,
        double weight,
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
