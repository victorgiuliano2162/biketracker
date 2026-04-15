package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Route;
import br.com.biketracker.app.entities.dtos.HomeStatsResponse;
import br.com.biketracker.app.entities.dtos.route.RouteStatsResponse;
import br.com.biketracker.app.exceptions.ex.ResourceNotFoundException;
import br.com.biketracker.app.repositories.GoalRepository;
import br.com.biketracker.app.repositories.RouteRepository;
import br.com.biketracker.app.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HomeService {

    private final RouteRepository routeRepository;
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public HomeService(RouteRepository routeRepository, GoalRepository goalRepository, UserRepository userRepository) {
        this.routeRepository = routeRepository;
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    public HomeStatsResponse getHomeStats(String userEmail) {

        String userId = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail))
                .getId();

        // ── Estatísticas gerais — defensivo contra usuário sem rotas ────
        RouteStatsResponse stats = routeRepository.findStatsByUserId(userId);

        double totalDistance  = stats != null && stats.getTotalDistanceInKm()          != null ? stats.getTotalDistanceInKm()          : 0.0;
        double totalElevation = stats != null && stats.getTotalElevationInMeters()      != null ? stats.getTotalElevationInMeters()      : 0.0;
        long   totalTime      = stats != null && stats.getTotalActivityTimeInSeconds()  != null ? stats.getTotalActivityTimeInSeconds()  : 0L;
        long   totalRoutes    = stats != null && stats.getTotalRoutes()                 != null ? stats.getTotalRoutes()                 : 0L;

        // ── Últimas 5 rotas ──────────────────────────────────────────────
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        List<HomeStatsResponse.RideSummary> recentRides = routeRepository
                .findTop5ByUserIdOrderByStartTimeDesc(userId)
                .stream()
                .map(r -> new HomeStatsResponse.RideSummary(
                        r.getId(),
                        r.getDistanceInKm(),
                        r.getElevationInMeters(),
                        r.getActivityTimeInSeconds(),
                        r.getStartTime().format(formatter)
                ))
                .toList();

        // ── Gráfico semanal ──────────────────────────────────────────────
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(6);
        List<Route> weekRoutes = routeRepository.findByUserIdSince(userId, sevenDaysAgo);

        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("dd/MM");

        Map<String, Double> distanceByDay = weekRoutes.stream().collect(
                Collectors.groupingBy(
                        r -> r.getStartTime().format(dayFormatter),
                        Collectors.summingDouble(Route::getDistanceInKm)
                )
        );

        List<HomeStatsResponse.DailyDistance> weeklyChart = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            String day = LocalDateTime.now().minusDays(i).format(dayFormatter);
            weeklyChart.add(new HomeStatsResponse.DailyDistance(day, distanceByDay.getOrDefault(day, 0.0)));
        }

        // ── Metas ────────────────────────────────────────────────────────
        DateTimeFormatter deadlineFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        List<HomeStatsResponse.GoalSummary> activeGoals = goalRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(g -> new HomeStatsResponse.GoalSummary(
                        g.getId(),
                        g.getName(),
                        g.getDescription(),
                        g.getTargetValue(),
                        g.getCurrentValue(),
                        g.getProgressPercent(),
                        g.getUnit(),
                        g.getDeadLine() != null ? g.getDeadLine().format(deadlineFormatter) : "-"
                ))
                .toList();

        return new HomeStatsResponse(
                totalDistance,
                totalElevation,
                totalTime,
                (int) totalRoutes,
                recentRides,
                weeklyChart,
                activeGoals
        );
    }
}