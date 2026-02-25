package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Ride;
import br.com.biketracker.app.repositories.RideRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RideService {

    private final RideRepository repository;

    public RideService(RideRepository repository) {
        this.repository = repository;
    }

    public List<Ride> findAll() {
        return repository.findAll();
    }

    public Ride findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ride not found"));
    }

    @Transactional
    public Ride save(Ride entity) {
        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
