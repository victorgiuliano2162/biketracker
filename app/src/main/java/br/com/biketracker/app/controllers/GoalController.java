package br.com.biketracker.app.controllers;


import br.com.biketracker.app.entities.Goal;
import br.com.biketracker.app.entities.User;
import br.com.biketracker.app.entities.dtos.GoalResponse;
import br.com.biketracker.app.repositories.GoalRepository;
import br.com.biketracker.app.services.GoalService;
import br.com.biketracker.app.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/goal")
public class GoalController {

    private GoalService goalService;
    private UserService userService;

    public GoalController(GoalService goalService, UserService userService) {
        this.goalService = goalService;
        this.userService = userService;
    }

    //TODO allowing only jwt requests
    @PostMapping
    public ResponseEntity<List<Goal>> createGoals(@RequestBody List<Goal> goals) {
        List<Goal> goalList = new ArrayList<>();
        if (goals.isEmpty()) return null;
        User u = userService.findById(goals.get(0).getUser().getId());
        for (Goal goal : goals) {
            u.addGoal(goal);
        }

        return userService.save(u) == u ? ResponseEntity.ok(u.getGoals()) : ResponseEntity.internalServerError().build();
    }


    @GetMapping
    public ResponseEntity<List<GoalResponse>> getGoals() {
        List<Goal> goals = goalService.findAll();
        List<GoalResponse> goalResponse = goals.stream().map(GoalResponse::from).toList();
        return ResponseEntity.ok(goalResponse);
    }
}
