package com.sportsanalytics.config;

import com.sportsanalytics.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AdminInitializer implements CommandLineRunner {
    
    @Autowired
    private AuthService authService;
    
    @Override
    public void run(String... args) throws Exception {
        authService.initializeAdmin();
    }
}

