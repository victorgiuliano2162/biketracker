package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Comment;
import br.com.biketracker.app.entities.Route;
import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.comment.CommentRequest;
import br.com.biketracker.app.entities.dtos.comment.CommentResponse;
import br.com.biketracker.app.repositories.CommentsRepository;
import br.com.biketracker.app.repositories.RouteRepository;
import br.com.biketracker.app.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentsServiceTest {

    @Mock
    private CommentsRepository commentsRepository;

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CommentsService commentsService;

    private User owner;
    private User visitor;
    private Route route;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId("owner-1");
        owner.setName("Victor");

        visitor = new User();
        visitor.setId("visitor-2");
        visitor.setName("Maria");

        route = new Route();
        route.setId("route-1");
        route.setUser(owner);
        route.setPublic(true);
    }

    @Test
    @DisplayName("Deve permitir listar e comentar em rota pública de outro usuário")
    void addComment_PublicRoute_Success() {
        when(userRepository.findById("visitor-2")).thenReturn(Optional.of(visitor));
        when(routeRepository.findById("route-1")).thenReturn(Optional.of(route));
        when(commentsRepository.save(any(Comment.class))).thenAnswer(inv -> {
            Comment c = inv.getArgument(0);
            c.setId(10L);
            return c;
        });

        CommentResponse res = commentsService.addComment("visitor-2", "route-1", new CommentRequest("Excelente trilha!"));

        assertThat(res.id()).isEqualTo(10L);
        assertThat(res.authorName()).isEqualTo("Maria");
        assertThat(res.content()).isEqualTo("Excelente trilha!");
    }

    @Test
    @DisplayName("Deve negar listagem de comentários em rota privada de outro usuário")
    void listByRoute_PrivateRoute_AccessDenied() {
        route.setPublic(false);
        when(userRepository.findById("visitor-2")).thenReturn(Optional.of(visitor));
        when(routeRepository.findById("route-1")).thenReturn(Optional.of(route));

        assertThatThrownBy(() -> commentsService.listByRoute("visitor-2", "route-1"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Deve permitir que o dono da rota exclua comentário de outro usuário")
    void deleteComment_RouteOwner_Success() {
        Comment comment = new Comment(visitor, route, "Comentário");
        comment.setId(5L);

        when(userRepository.findById("owner-1")).thenReturn(Optional.of(owner));
        when(commentsRepository.findById(5L)).thenReturn(Optional.of(comment));

        commentsService.deleteComment("owner-1", "route-1", 5L);

        verify(commentsRepository).delete(comment);
    }

    @Test
    @DisplayName("Deve negar exclusão de comentário por terceiro que não é autor nem dono da rota")
    void deleteComment_Stranger_AccessDenied() {
        User stranger = new User();
        stranger.setId("stranger-3");
        Comment comment = new Comment(visitor, route, "Comentário");
        comment.setId(5L);

        when(userRepository.findById("stranger-3")).thenReturn(Optional.of(stranger));
        when(commentsRepository.findById(5L)).thenReturn(Optional.of(comment));

        assertThatThrownBy(() -> commentsService.deleteComment("stranger-3", "route-1", 5L))
                .isInstanceOf(AccessDeniedException.class);
        verify(commentsRepository, never()).delete(any());
    }
}
