package br.com.biketracker.app.services;


import br.com.biketracker.app.entities.Comments;
import br.com.biketracker.app.repositories.CommentsRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class CommentsService  {

    private final CommentsRepository commentsRepository;

    public CommentsService(CommentsRepository commentsRepository) {
        this.commentsRepository = commentsRepository;
    }


    @Transactional
    public void update(Long id, String newContent) {
        Comments comment = commentsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        comment.editComment(newContent);
    }
}
