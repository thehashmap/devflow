package com.devflow.apigateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> userServiceFallback() {
        return createFallbackResponse("User service is temporarily unavailable");
    }

    @GetMapping("/auth")
    public ResponseEntity<Map<String, Object>> authServiceFallback() {
        return createFallbackResponse("Authentication service is temporarily unavailable");
    }

    @GetMapping("/analysis")
    public ResponseEntity<Map<String, Object>> codeAnalysisServiceFallback() {
        return createFallbackResponse("Code analysis service is temporarily unavailable");
    }

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> reportServiceFallback() {
        return createFallbackResponse("Report generation service is temporarily unavailable");
    }

    @GetMapping("/notifications")
    public ResponseEntity<Map<String, Object>> notificationServiceFallback() {
        return createFallbackResponse("Notification service is temporarily unavailable");
    }

    private ResponseEntity<Map<String, Object>> createFallbackResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", true);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("suggestion", "Please try again later or contact support if the issue persists");

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}