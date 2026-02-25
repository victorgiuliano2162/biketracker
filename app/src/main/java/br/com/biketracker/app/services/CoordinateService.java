package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Coordinate;
import br.com.biketracker.app.repositories.CoordinateRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CoordinateService {

    private final CoordinateRepository repository;

    public CoordinateService(CoordinateRepository repository) {
        this.repository = repository;
    }

    public List<Coordinate> findAll() {
        return repository.findAll();
    }

    public Coordinate findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Coordinate not found"));
    }

    @Transactional
    public Coordinate save(Coordinate entity) {
        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
