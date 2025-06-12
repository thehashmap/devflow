package com.devflow.apigateway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/gateway")
public class HealthController {

    @Autowired
    private ReactiveStringRedisTemplate redisTemplate;

    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> getGatewayHealth() {
        return checkRedisHealth()
                .map(redisHealthy -> {
                    String status = redisHealthy ? "UP" : "DOWN";
                    return ResponseEntity.ok(Map.of(
                            "status", status,
                            "timestamp", Instant.now(),
                            "components", Map.of(
                                    "gateway", "UP",
                                    "redis", redisHealthy ? "UP" : "DOWN"
                            )
                    ));
                })
                .onErrorReturn(ResponseEntity.ok(Map.of(
                        "status", "UP",
                        "timestamp", Instant.now(),
                        "components", Map.of(
                                "gateway", "UP",
                                "redis", "UNKNOWN"
                        )
                )));
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getGatewayInfo() {
        return ResponseEntity.ok(Map.of(
                "application", Map.of(
                        "name", "DevFlow API Gateway",
                        "version", "1.0.0",
                        "description", "API Gateway for DevFlow microservices platform"
                ),
                "build", Map.of(
                        "time", Instant.now().toString(),
                        "java", System.getProperty("java.version")
                ),
                "routes", Map.of(
                        "user-service", "/api/users/**",
                        "auth-service", "/api/auth/**",
                        "analysis-service", "/api/analysis/**",
                        "report-service", "/api/reports/**",
                        "notification-service", "/api/notifications/**"
                )
        ));
    }

    @GetMapping("/metrics")
    public Mono<ResponseEntity<Map<String, Object>>> getBasicMetrics() {
        long uptimeMillis = System.currentTimeMillis() - getStartTime();

        return Mono.just(ResponseEntity.ok(Map.of(
                "uptime", Duration.ofMillis(uptimeMillis).toString(),
                "timestamp", Instant.now(),
                "memory", Map.of(
                        "total", Runtime.getRuntime().totalMemory(),
                        "free", Runtime.getRuntime().freeMemory(),
                        "used", Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory(),
                        "max", Runtime.getRuntime().maxMemory()
                ),
                "threads", Map.of(
                        "active", Thread.activeCount()
                )
        )));
    }

    private Mono<Boolean> checkRedisHealth() {
        return redisTemplate.opsForValue()
                .set("health:check", "ping", Duration.ofSeconds(5))
                .then(redisTemplate.opsForValue().get("health:check"))
                .map("ping"::equals)
                .timeout(Duration.ofSeconds(3))
                .onErrorReturn(false);
    }

    private long getStartTime() {
        // This is a simplified approach - in production you'd store this properly
        return System.currentTimeMillis() - 60000; // Assume started 1 minute ago for demo
    }
}