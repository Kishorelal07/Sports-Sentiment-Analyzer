package com.sportsanalytics.service;

import com.sportsanalytics.model.User;
import com.sportsanalytics.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public Optional<User> getUser(String userId) {
        return userRepository.findByUserId(userId);
    }
    
    public User createUser(User user) {
        if (user.getUserId() == null || user.getUserId().isBlank()) {
            user.setUserId(user.getUsername() != null ? user.getUsername() : user.getEmail());
        }
        if (user.getPreferences() == null) {
            user.setPreferences(User.UserPreferences.defaultPreferences());
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    public User updateUserPreferences(String userId, User.UserPreferences preferences) {
        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPreferences(preferences);
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found: " + userId);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}

