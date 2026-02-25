package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Equipment;
import br.com.biketracker.app.repositories.EquipmentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository repository;

    public EquipmentService(EquipmentRepository repository) {
        this.repository = repository;
    }

    public List<Equipment> findAll() {
        return repository.findAll();
    }

    public Equipment findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found"));
    }

    @Transactional
    public Equipment save(Equipment entity) {
        return repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
