package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Comment;
import br.com.biketracker.app.entities.Route;
import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.comment.CommentRequest;
import br.com.biketracker.app.entities.dtos.comment.CommentResponse;
import br.com.biketracker.app.exceptions.ex.ResourceNotFoundException;
import br.com.biketracker.app.repositories.CommentsRepository;
import br.com.biketracker.app.repositories.RouteRepository;
import br.com.biketracker.app.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentsService {

    private final CommentsRepository commentsRepository;
    private final RouteRepository routeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CommentResponse> listByRoute(String userId, String routeId) {
        User user = resolveUser(userId);
        Route route = resolveReadableRoute(user, routeId);

        return commentsRepository.findByRouteIdOrderByCreateAtDesc(route.getId())
                .stream()
                .map(CommentResponse::from)
                .toList();
    }

    @Transactional
    public CommentResponse addComment(String userId, String routeId, CommentRequest request) {
        User user = resolveUser(userId);
        Route route = resolveReadableRoute(user, routeId);

        Comment comment = new Comment(user, route, request.content().trim());
        return CommentResponse.from(commentsRepository.save(comment));
    }

    @Transactional
    public void deleteComment(String userId, String routeId, Long commentId) {
        User user = resolveUser(userId);
        Comment comment = commentsRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comentário não encontrado: " + commentId));

        if (comment.getRoute() == null || !comment.getRoute().getId().equals(routeId)) {
            throw new ResourceNotFoundException("Comentário não encontrado para a rota informada");
        }

        boolean isCommentAuthor = comment.getUser() != null && comment.getUser().getId().equals(user.getId());
        boolean isRouteOwner = comment.getRoute().getUser() != null
                && comment.getRoute().getUser().getId().equals(user.getId());

        if (!isCommentAuthor && !isRouteOwner) {
            throw new AccessDeniedException("Você não tem permissão para excluir este comentário");
        }

        commentsRepository.delete(comment);
    }

    @Transactional
    public void update(Long id, String newContent) {
        Comment comment = commentsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        comment.editComment(newContent);
    }

    private User resolveUser(String userId) {
        return userRepository.findById(userId)
                .or(() -> userRepository.findByEmail(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }

    private Route resolveReadableRoute(User user, String routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Rota não encontrada: " + routeId));

        boolean isOwner = route.getUser() != null && route.getUser().getId().equals(user.getId());
        if (!route.isPublic() && !isOwner) {
            throw new AccessDeniedException("Essa rota é privada e não pertence ao usuário");
        }

        return route;
    }
}
