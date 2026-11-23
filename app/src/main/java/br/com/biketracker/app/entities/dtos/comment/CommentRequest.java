package br.com.biketracker.app.entities.dtos.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank(message = "O comentário não pode estar vazio")
        @Size(max = 1000, message = "O comentário deve ter no máximo 1000 caracteres")
        String content
) {}
