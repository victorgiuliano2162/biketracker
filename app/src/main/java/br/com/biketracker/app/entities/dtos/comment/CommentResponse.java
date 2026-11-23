package br.com.biketracker.app.entities.dtos.comment;

import br.com.biketracker.app.entities.Comment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        String routeId,
        String authorId,
        String authorName,
        String content,
        boolean edited,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CommentResponse from(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getRoute() != null ? comment.getRoute().getId() : null,
                comment.getUser() != null ? comment.getUser().getId() : null,
                comment.getUser() != null ? comment.getUser().getName() : "Anônimo",
                comment.getContent(),
                comment.isEdited(),
                comment.getCreateAt(),
                comment.getUpdateAt()
        );
    }
}
