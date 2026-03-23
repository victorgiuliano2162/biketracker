package br.com.biketracker.app.repositories;

import br.com.biketracker.app.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // -------------------------
    // Buscas por nome
    // -------------------------

    List<User> findByNameContainingIgnoreCase(String name);

    // -------------------------
    // Buscas por idade
    // -------------------------

    List<User> findByAge(int age);

    List<User> findByAgeBetween(int minAge, int maxAge);

    List<User> findByAgeGreaterThanEqual(int minAge);

    List<User> findByAgeLessThanEqual(int maxAge);

    // -------------------------
    // Buscas por peso
    // -------------------------

    List<User> findByWeightBetween(double minWeight, double maxWeight);

    // -------------------------
    // Buscas por data de nascimento
    // -------------------------

    List<User> findByBornAtBetween(LocalDateTime start, LocalDateTime end);

    List<User> findByBornAtBefore(LocalDateTime date);

    List<User> findByBornAtAfter(LocalDateTime date);

    // -------------------------
    // Buscas por data de criação
    // -------------------------

    List<User> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<User> findByCreatedAtAfter(LocalDateTime since);

    // -------------------------
    // Queries customizadas JPQL
    // -------------------------

    // Busca usuários dentro de uma faixa etária e de peso — útil para segmentação de treino
    @Query("SELECT u FROM User u WHERE u.age BETWEEN :minAge AND :maxAge AND u.weight BETWEEN :minWeight AND :maxWeight")
    List<User> findByAgeAndWeightRange(
            @Param("minAge")    int minAge,
            @Param("maxAge")    int maxAge,
            @Param("minWeight") double minWeight,
            @Param("maxWeight") double maxWeight
    );

    // Busca usuários cadastrados nos últimos N dias
    @Query("SELECT u FROM User u WHERE u.createdAt >= :since ORDER BY u.createdAt DESC")
    List<User> findRecentUsers(@Param("since") LocalDateTime since);

    // Conta usuários por faixa etária — útil para relatórios
    @Query("SELECT COUNT(u) FROM User u WHERE u.age BETWEEN :minAge AND :maxAge")
    long countByAgeRange(@Param("minAge") int minAge, @Param("maxAge") int maxAge);
}
