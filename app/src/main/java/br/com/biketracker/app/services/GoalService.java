package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Goal;
import br.com.biketracker.app.repositories.GoalRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoalService {

    private final GoalRepository repository;

    public GoalService(GoalRepository repository) {
        this.repository = repository;
    }

    public List<Goal> findAll() {
        return repository.findAll();
    }

    public Goal findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
    }

    @Transactional
    public Goal save(Goal entity) {
        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
