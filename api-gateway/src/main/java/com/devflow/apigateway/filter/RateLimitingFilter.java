package com.devflow.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
public class RateLimitingFilter implements WebFilter {

    private final ReactiveRedisTemplate<String, String> redisTemplate;
    private final int maxRequests = 100; // requests per window
    private final int windowSizeInSeconds = 60; // 1 minute window

    public RateLimitingFilter(ReactiveRedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String clientId = getClientId(exchange);
        String key = "rate_limit:" + clientId;

        return redisTemplate.opsForValue()
                .increment(key)
                .cast(Long.class)
                .flatMap(count -> {
                    if (count == 1) {
                        // Set expiration for new key
                        return redisTemplate.expire(key, Duration.ofSeconds(windowSizeInSeconds))
                                .then(Mono.just(count));
                    }
                    return Mono.just(count);
                })
                .flatMap(count -> {
                    if (count > maxRequests) {
                        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                        exchange.getResponse().getHeaders().add("X-RateLimit-Limit", String.valueOf(maxRequests));
                        exchange.getResponse().getHeaders().add("X-RateLimit-Remaining", "0");
                        return exchange.getResponse().setComplete();
                    }

                    exchange.getResponse().getHeaders().add("X-RateLimit-Limit", String.valueOf(maxRequests));
                    exchange.getResponse().getHeaders().add("X-RateLimit-Remaining",
                            String.valueOf(Math.max(0, maxRequests - count)));

                    return chain.filter(exchange);
                })
                .onErrorResume(ex -> {
                    // If Redis is down, allow the request to proceed
                    return chain.filter(exchange);
                });
    }

    private String getClientId(ServerWebExchange exchange) {
        // Get client IP or use authenticated user
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                // Extract user from token for authenticated requests
                return "user:" + extractUserFromToken(token);
            } catch (Exception e) {
                // Fall back to IP
            }
        }

        // Use IP address for unauthenticated requests
        String xForwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return "ip:" + xForwardedFor.split(",")[0].trim();
        }

        return "ip:" + exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
    }

    private String extractUserFromToken(String token) {
        // Simple token parsing - in production use proper JWT parsing
        return "anonymous";
    }

}