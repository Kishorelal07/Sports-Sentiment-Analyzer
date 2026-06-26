package com.sportsanalytics.controller;

import com.sportsanalytics.model.User;
import com.sportsanalytics.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/user")
@Tag(name = "Users", description = "User management and preferences APIs")
public class UserController {
    
    private final UserService userService;
    
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<User> getUser(@PathVariable String userId) {
        Optional<User> user = userService.getUser(userId);
        return user.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User created = userService.createUser(user);
        return ResponseEntity.ok(created);
    }
    
    @PostMapping("/preferences")
    @Operation(summary = "Update user preferences")
    public ResponseEntity<User> updatePreferences(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // Convert request to UserPreferences
        User.UserPreferences preferences = new User.UserPreferences();
        if (request.containsKey("favoriteTeams")) {
            preferences.setFavoriteTeams((List<String>) request.get("favoriteTeams"));
        }
        if (request.containsKey("favoritePlayers")) {
            preferences.setFavoritePlayers((List<String>) request.get("favoritePlayers"));
        }
        if (request.containsKey("commentaryStyle")) {
            preferences.setCommentaryStyle((String) request.get("commentaryStyle"));
        }
        if (request.containsKey("showPredictions")) {
            preferences.setShowPredictions((Boolean) request.get("showPredictions"));
        }
        if (request.containsKey("showSentiment")) {
            preferences.setShowSentiment((Boolean) request.get("showSentiment"));
        }
        if (request.containsKey("language")) {
            preferences.setLanguage((String) request.get("language"));
        }
        
        User updated = userService.updateUserPreferences(userId, preferences);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/{userId}/preferences")
    @Operation(summary = "Get user preferences")
    public ResponseEntity<User.UserPreferences> getPreferences(@PathVariable String userId) {
        Optional<User> user = userService.getUser(userId);
        if (user.isPresent() && user.get().getPreferences() != null) {
            return ResponseEntity.ok(user.get().getPreferences());
        }
        return ResponseEntity.notFound().build();
    }
}
