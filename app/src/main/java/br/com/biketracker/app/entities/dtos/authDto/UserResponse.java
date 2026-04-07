package br.com.biketracker.app.entities.dtos.authDto;


import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.enums.TipoSanguineo;

import java.time.LocalDateTime;

public record UserResponse(
        String id,
        String name,
        String email,
        int age,
        double weight,
        LocalDateTime bornAt,
        TipoSanguineo tipoSanguineo
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAge(),
                user.getWeight(),
                user.getBornAt(),
                user.getTipoSanguineo()
        );
    }
}
