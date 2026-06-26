package com.sportsanalytics.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
public class MediaController {
    
    private final String mediaPath;
    
    public MediaController(@Value("${cricket.data.media-path:../cricket-data/media}") String mediaPath) {
        this.mediaPath = mediaPath;
    }
    
    @GetMapping("/match/{matchId}")
    public ResponseEntity<List<Map<String, String>>> getMatchMedia(@PathVariable String matchId) {
        List<Map<String, String>> mediaList = new ArrayList<>();
        
        try {
            Path mediaDir = Paths.get(mediaPath);
            if (Files.exists(mediaDir) && Files.isDirectory(mediaDir)) {
                Files.list(mediaDir)
                    .filter(Files::isRegularFile)
                    .forEach(file -> {
                        Map<String, String> media = new HashMap<>();
                        media.put("url", "/api/media/file/" + file.getFileName().toString());
                        media.put("type", getMediaType(file.getFileName().toString()));
                        media.put("name", file.getFileName().toString());
                        mediaList.add(media);
                    });
            }
        } catch (IOException e) {
            // Return empty list if media directory doesn't exist
        }
        
        return ResponseEntity.ok(mediaList);
    }
    
    @GetMapping("/file/{filename:.+}")
    public ResponseEntity<Resource> getMediaFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(mediaPath).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
            }
        } catch (IOException e) {
            // File not found
        }
        
        return ResponseEntity.notFound().build();
    }
    
    private String getMediaType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".gif")) {
            return "image";
        } else if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov")) {
            return "video";
        }
        return "unknown";
    }
}

