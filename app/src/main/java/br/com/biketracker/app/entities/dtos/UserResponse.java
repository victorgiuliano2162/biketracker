package br.com.biketracker.app.entities.dtos;


import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.enums.TipoSanguineo;

import java.time.LocalDateTime;
import java.util.List;

public record UserResponse(
        String id,
        String name,
        String email,
        int age,
        double weight,
        LocalDateTime bornAt,
        TipoSanguineo tipoSanguineo,
        List<GoalResponse> goals
        //List<RideResponse> rides
        
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAge(),
                user.getWeight(),
                user.getBornAt(),
                user.getTipoSanguineo(),
                user.getGoals() == null ? List.of() : user.getGoals().stream().map(GoalResponse::from).toList()
                //user.getRides() == null ? List.of() : user.getRides().stream().map(RideResponse::from).toList()
        );
    }
}
