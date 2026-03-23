package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    // -------------------------
    // Buscas básicas
    // -------------------------

    public List<User> findAll() {
        return repository.findAll();
    }

    public User findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }

    public User findByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }

    public boolean emailExists(String email) {
        return repository.existsByEmail(email);
    }

    // -------------------------
    // Buscas por nome
    // -------------------------

    public List<User> findByName(String name) {
        return repository.findByNameContainingIgnoreCase(name);
    }

    // -------------------------
    // Buscas por idade
    // -------------------------

    public List<User> findByAge(int age) {
        return repository.findByAge(age);
    }

    public List<User> findByAgeBetween(int minAge, int maxAge) {
        if (minAge > maxAge) {
            throw new IllegalArgumentException("minAge não pode ser maior que maxAge");
        }
        return repository.findByAgeBetween(minAge, maxAge);
    }

    public List<User> findByAgeFrom(int minAge) {
        return repository.findByAgeGreaterThanEqual(minAge);
    }

    public List<User> findByAgeUpTo(int maxAge) {
        return repository.findByAgeLessThanEqual(maxAge);
    }

    // -------------------------
    // Buscas por peso
    // -------------------------

    public List<User> findByWeightBetween(double minWeight, double maxWeight) {
        if (minWeight > maxWeight) {
            throw new IllegalArgumentException("minWeight não pode ser maior que maxWeight");
        }
        return repository.findByWeightBetween(minWeight, maxWeight);
    }

    // -------------------------
    // Buscas por data de nascimento
    // -------------------------

    public List<User> findByBornAtBetween(LocalDateTime start, LocalDateTime end) {
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("A data inicial não pode ser posterior à data final");
        }
        return repository.findByBornAtBetween(start, end);
    }

    public List<User> findBornBefore(LocalDateTime date) {
        return repository.findByBornAtBefore(date);
    }

    public List<User> findBornAfter(LocalDateTime date) {
        return repository.findByBornAtAfter(date);
    }

    // -------------------------
    // Buscas por data de criação
    // -------------------------

    public List<User> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end) {
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("A data inicial não pode ser posterior à data final");
        }
        return repository.findByCreatedAtBetween(start, end);
    }

    public List<User> findRecentUsers(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return repository.findRecentUsers(since);
    }

    // -------------------------
    // Queries combinadas
    // -------------------------

    public List<User> findByAgeAndWeightRange(int minAge, int maxAge, double minWeight, double maxWeight) {
        if (minAge > maxAge) {
            throw new IllegalArgumentException("minAge não pode ser maior que maxAge");
        }
        if (minWeight > maxWeight) {
            throw new IllegalArgumentException("minWeight não pode ser maior que maxWeight");
        }
        return repository.findByAgeAndWeightRange(minAge, maxAge, minWeight, maxWeight);
    }

    public long countByAgeRange(int minAge, int maxAge) {
        if (minAge > maxAge) {
            throw new IllegalArgumentException("minAge não pode ser maior que maxAge");
        }
        return repository.countByAgeRange(minAge, maxAge);
    }

    // -------------------------
    // Persistência
    // -------------------------

    @Transactional
    public User save(User entity) {
        if (emailExists(entity.getEmail())) {
            throw new IllegalStateException("Já existe um usuário cadastrado com o email: " + entity.getEmail());
        }
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    @Transactional
    public User update(String id, User updated) {
        User existing = findById(id);

        // Verifica conflito de e-mail somente se o e-mail foi alterado
        if (!existing.getEmail().equals(updated.getEmail()) && emailExists(updated.getEmail())) {
            throw new IllegalStateException("Já existe um usuário cadastrado com o email: " + updated.getEmail());
        }

        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setAge(updated.getAge());
        existing.setWeight(updated.getWeight());
        existing.setBornAt(updated.getBornAt());
        existing.setTipoSanguineo(updated.getTipoSanguineo());

        return repository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("User not found with id: " + id);
        }
        repository.deleteById(id);
    }
}