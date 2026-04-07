package br.com.biketracker.app.entities.dtos.authDto;

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
) {}
