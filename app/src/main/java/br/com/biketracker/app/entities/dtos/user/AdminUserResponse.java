package br.com.biketracker.app.entities.dtos.user;

import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.enums.Role;

import java.time.LocalDateTime;

public record AdminUserResponse(
        String id,
        String name,
        String email,
        int age,
        double weight,
        Role role,
        boolean active,
        LocalDateTime createdAt
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAge(),
                user.getWeight(),
                user.getRole() != null ? user.getRole() : Role.USER,
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
