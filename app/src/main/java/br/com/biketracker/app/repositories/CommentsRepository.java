package br.com.biketracker.app.repositories;

import br.com.biketracker.app.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentsRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByRouteIdOrderByCreateAtDesc(String routeId);

    void deleteByRouteId(String routeId);
}
