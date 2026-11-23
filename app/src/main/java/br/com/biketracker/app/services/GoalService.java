package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Goal;
import br.com.biketracker.app.entities.Route;
import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.goal.GoalRequest;
import br.com.biketracker.app.entities.dtos.goal.GoalResponse;
import br.com.biketracker.app.exceptions.ex.ResourceNotFoundException;
import br.com.biketracker.app.repositories.GoalRepository;
import br.com.biketracker.app.repositories.RouteRepository;
import br.com.biketracker.app.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final RouteRepository routeRepository;

    @Transactional
    public List<GoalResponse> createGoals(String userId, List<GoalRequest> requests) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        List<Goal> saved = requests.stream()
                .map(r -> {
                    Goal g = new Goal(r.name(), r.description(), r.targetValue(), r.unit(), r.deadLine(), user);
                    return goalRepository.save(g);
                })
                .toList();

        recalculateProgressForGoals(userId, saved);

        return saved.stream().map(GoalResponse::from).toList();
    }

    @Transactional
    public List<GoalResponse> findAllByUser(String userId) {
        return goalRepository.findByUserId(userId)
                .stream().map(GoalResponse::from).toList();
    }

    @Transactional
    public GoalResponse update(String userId, Long goalId, GoalRequest request) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Essa meta não pertence ao usuário");
        }

        goal.setName(request.name());
        goal.setDescription(request.description());
        goal.setTargetValue(request.targetValue());
        goal.setUnit(request.unit());
        goal.setDeadLine(request.deadLine());

        Goal saved = goalRepository.save(goal);
        recalculateProgressForGoals(userId, List.of(saved));

        return GoalResponse.from(saved);
    }

    @Transactional
    public void delete(String userId, Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Essa meta não pertence ao usuário");
        }

        goalRepository.delete(goal);
    }

    @Transactional
    public void recalculateProgressForUser(String userId) {
        List<Goal> goals = goalRepository.findByUserId(userId);
        recalculateProgressForGoals(userId, goals);
    }

    private void recalculateProgressForGoals(String userId, List<Goal> goals) {
        if (goals == null || goals.isEmpty()) {
            return;
        }

        LocalDate earliestCreatedAt = goals.stream()
                .map(g -> g.getCreatedAt() != null ? g.getCreatedAt() : LocalDate.now())
                .min(LocalDate::compareTo)
                .orElse(LocalDate.now());

        List<Route> routes = routeRepository.findByUserIdSince(userId, earliestCreatedAt.atStartOfDay());
        if (routes == null) {
            routes = List.of();
        }

        for (Goal goal : goals) {
            LocalDateTime windowStart = (goal.getCreatedAt() != null ? goal.getCreatedAt() : LocalDate.now()).atStartOfDay();
            LocalDateTime windowEnd = goal.getDeadLine() != null
                    ? goal.getDeadLine().atTime(LocalTime.MAX)
                    : LocalDateTime.MAX;

            double value = calculateValueForGoal(goal, routes, windowStart, windowEnd);
            goal.setCurrentValue(Math.round(value * 100.0) / 100.0);
        }

        goalRepository.saveAll(goals);
    }

    private double calculateValueForGoal(
            Goal goal,
            List<Route> routes,
            LocalDateTime windowStart,
            LocalDateTime windowEnd
    ) {
        String unit = goal.getUnit() != null ? goal.getUnit().trim().toLowerCase(Locale.ROOT) : "";

        List<Route> matching = routes.stream()
                .filter(r -> r.getStartTime() != null
                        && !r.getStartTime().isBefore(windowStart)
                        && !r.getStartTime().isAfter(windowEnd))
                .toList();

        return switch (unit) {
            case "km" -> matching.stream().mapToDouble(Route::getDistanceInKm).sum();
            case "rides" -> matching.size();
            case "metros", "m" -> matching.stream().mapToDouble(Route::getElevationInMeters).sum();
            case "horas", "h" -> matching.stream()
                    .filter(r -> r.getEndTime() != null && !r.getEndTime().isBefore(r.getStartTime()))
                    .mapToDouble(r -> Duration.between(r.getStartTime(), r.getEndTime()).toSeconds() / 3600.0)
                    .sum();
            default -> 0.0;
        };
    }
}
