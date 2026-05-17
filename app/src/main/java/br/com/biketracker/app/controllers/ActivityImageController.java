package br.com.biketracker.app.controllers;

import br.com.biketracker.app.services.ActivityImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/activities/{activityId}/images")
@RequiredArgsConstructor
public class ActivityImageController {

    private final ActivityImageService activityImageService ;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<String>> upload(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID activityId,
            @RequestParam("files") List<MultipartFile> files) {

        List<String> keys = activityImageService.uploadImages(activityId, files);
        return ResponseEntity.ok(keys);
    }

    @GetMapping
    public ResponseEntity<List<String>> getImageUrls(@AuthenticationPrincipal Jwt jwt, @PathVariable String activityId) {

        List<String> urls = activityImageService.getPresignedUrls(activityId);
        return ResponseEntity.ok(urls);
    }
}