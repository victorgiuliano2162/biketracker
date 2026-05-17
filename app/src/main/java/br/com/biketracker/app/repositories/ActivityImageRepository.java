package br.com.biketracker.app.repositories;

import br.com.biketracker.app.entities.ActivityImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityImageRepository extends JpaRepository<ActivityImage, Long> {
    List<ActivityImage> findByRouteId( String routeId);
    void deleteByRouteId(String routeId);
}