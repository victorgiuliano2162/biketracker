package br.com.biketracker.app.controllers;

import br.com.biketracker.app.entities.dtos.BoundingBoxRequest;
import br.com.biketracker.app.entities.dtos.ride.CreateRideRequest;
import br.com.biketracker.app.entities.dtos.ride.RideResponse;
import br.com.biketracker.app.entities.dtos.ride.RideStatsResponse;
import br.com.biketracker.app.entities.dtos.ride.RouteReplayResponse;
import br.com.biketracker.app.services.RideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;

    @PostMapping
    public ResponseEntity<RideResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid CreateRideRequest request
    ) {
        String userId = userDetails.getUsername();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(rideService.createRide(userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<RideResponse>> list(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "startTime", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        String userId = userDetails.getUsername();
        return ResponseEntity.ok(rideService.listRides(userId, pageable));
    }

    @GetMapping("/stats")
    public ResponseEntity<RideStatsResponse> stats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = userDetails.getUsername();
        return ResponseEntity.ok(rideService.getStats(userId));
    }

    @GetMapping("/{rideId}/replay")
    public ResponseEntity<RouteReplayResponse> replay(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long rideId
    ) {
        String userId = userDetails.getUsername();
        return ResponseEntity.ok(rideService.getRouteReplay(userId, rideId));
    }

//    @GetMapping("/search/region")
//    public ResponseEntity<List<RideResponse>> findByRegion(
//            @AuthenticationPrincipal UserDetails userDetails,
//            @RequestBody @Valid BoundingBoxRequest bbox
//    ) {
//        String userId = userDetails.getUsername();
//        return ResponseEntity.ok(rideService.findByBoundingBox(userId, bbox));
//    }

    @GetMapping("/search/region")
    public ResponseEntity<List<RideResponse>> findByRegion(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam double minLon,
            @RequestParam double minLat,
            @RequestParam double maxLon,
            @RequestParam double maxLat
    ) {
        String userId = userDetails.getUsername();
        var bbox = new BoundingBoxRequest(minLon, minLat, maxLon, maxLat);
        return ResponseEntity.ok(rideService.findByBoundingBox(userId, bbox));
    }
}