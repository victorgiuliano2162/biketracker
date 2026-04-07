package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.Ride;
import br.com.biketracker.app.entities.dtos.authDto.HomeStatsResponse;
import br.com.biketracker.app.repositories.GoalRepository;
import br.com.biketracker.app.repositories.RideRepository;
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


    private final RideRepository rideRepository;
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public HomeService(RideRepository rideRepository, GoalRepository goalRepository, UserRepository userRepository) {
        this.rideRepository = rideRepository;
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    public HomeStatsResponse getHomeStats(String userId) {

        // ── Estatísticas gerais ──────────────────────────────────────────
        double totalDistance  = rideRepository.sumDistanceByUserId(userId);
        double totalElevation = rideRepository.sumElevationByUserId(userId);
        long totalTime        = rideRepository.sumActivityTimeByUserId(userId);
        int totalRides        = rideRepository.countByUserId(userId);

        // ── Últimas 5 rides ──────────────────────────────────────────────
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        List<HomeStatsResponse.RideSummary> recentRides = rideRepository
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

        // ── Gráfico semanal — distância por dia nos últimos 7 dias ──────
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(6);
        List<Ride> weekRides = rideRepository.findByUserIdSince(userId, sevenDaysAgo);

        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("dd/MM");

        // Agrupa distância por dia
        Map<String, Double> distanceByDay = weekRides.stream().collect(
                Collectors.groupingBy(
                        r -> r.getStartTime().format(dayFormatter),
                        Collectors.summingDouble(Ride::getDistanceInKm)
                )
        );

        // Garante que todos os 7 dias apareçam no gráfico, mesmo sem rides
        List<HomeStatsResponse.DailyDistance> weeklyChart = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            String day = LocalDateTime.now().minusDays(i).format(dayFormatter);
            weeklyChart.add(new HomeStatsResponse.DailyDistance(day, distanceByDay.getOrDefault(day, 0.0)));
        }

        // ── Metas ativas ────────────────────────────────────────────────
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
                totalRides,
                recentRides,
                weeklyChart,
                activeGoals
        );
    }
}
