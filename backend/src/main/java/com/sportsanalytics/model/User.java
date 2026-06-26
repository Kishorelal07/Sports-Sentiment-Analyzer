package com.sportsanalytics.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    
    @Id
    private String id;
    
    /** Stable identifier used by frontend/preferences flows */
    private String userId;
    private String username;
    private String email;
    private String password;
    private String role; // ADMIN, USER
    private boolean enabled = true;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private LocalDateTime updatedAt;
    private UserPreferences preferences;
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPreferences {
        private java.util.List<String> favoriteTeams;
        private java.util.List<String> favoritePlayers;
        private String commentaryStyle;
        private Boolean showPredictions;
        private Boolean showSentiment;
        private String language;
        
        public static UserPreferences defaultPreferences() {
            UserPreferences preferences = new UserPreferences();
            preferences.setFavoriteTeams(new java.util.ArrayList<>());
            preferences.setFavoritePlayers(new java.util.ArrayList<>());
            preferences.setCommentaryStyle("balanced");
            preferences.setShowPredictions(true);
            preferences.setShowSentiment(true);
            preferences.setLanguage("en");
            return preferences;
        }
    }
}
