package br.com.biketracker.app.repositories;

import br.com.biketracker.app.entities.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Goal> findByUserId(String userId);
}
