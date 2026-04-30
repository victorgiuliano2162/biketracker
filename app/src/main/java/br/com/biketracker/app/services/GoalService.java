package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Goal;
import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.goal.GoalRequest;
import br.com.biketracker.app.entities.dtos.goal.GoalResponse;
import br.com.biketracker.app.exceptions.ex.ResourceNotFoundException;
import br.com.biketracker.app.repositories.GoalRepository;
import br.com.biketracker.app.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

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

        return GoalResponse.from(goalRepository.save(goal));
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
}
