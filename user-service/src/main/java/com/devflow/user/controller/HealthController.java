package com.devflow.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController implements HealthIndicator {

    @Autowired
    private DataSource dataSource;

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "user-service");
        status.put("timestamp", System.currentTimeMillis());

        // Check database connectivity
        try (Connection connection = dataSource.getConnection()) {
            status.put("database", "UP");
        } catch (Exception e) {
            status.put("database", "DOWN");
            status.put("error", e.getMessage());
        }

        return ResponseEntity.ok(status);
    }

    @Override
    public Health health() {
        try (Connection connection = dataSource.getConnection()) {
            return Health.up()
                    .withDetail("database", "Available")
                    .withDetail("service", "user-service")
                    .build();
        } catch (Exception e) {
            return Health.down()
                    .withDetail("database", "Unavailable")
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}