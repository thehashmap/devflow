package com.devflow.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@SpringBootApplication
public class ApiGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

	@Bean
	public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
		return builder.routes()
				// User Service Routes
				.route("user-service", r -> r
						.path("/api/users/**")
						.filters(f -> f
								.stripPrefix(1)
								.circuitBreaker(config -> config
										.setName("user-service")
										.setFallbackUri("forward:/fallback/users"))
								.retry(config -> config.setRetries(3)))
						.uri("http://user-service:8081"))

				// Auth routes (direct to user service)
				.route("auth-service", r -> r
						.path("/api/auth/**")
						.filters(f -> f
								.stripPrefix(1)
								.circuitBreaker(config -> config
										.setName("auth-service")
										.setFallbackUri("forward:/fallback/auth")))
						.uri("http://user-service:8081"))

				// Code Analysis Service Routes
				.route("code-analysis-service", r -> r
						.path("/api/analysis/**")
						.filters(f -> f
								.stripPrefix(1)
								.circuitBreaker(config -> config
										.setName("code-analysis-service")
										.setFallbackUri("forward:/fallback/analysis"))
								.retry(config -> config.setRetries(2)))
						.uri("http://code-analysis-service:8082"))

				// Report Generation Service Routes
				.route("report-service", r -> r
						.path("/api/reports/**")
						.filters(f -> f
								.stripPrefix(1)
								.circuitBreaker(config -> config
										.setName("report-service")
										.setFallbackUri("forward:/fallback/reports")))
						.uri("http://report-service:8083"))

				// Notification Service Routes
				.route("notification-service", r -> r
						.path("/api/notifications/**")
						.filters(f -> f
								.stripPrefix(1)
								.circuitBreaker(config -> config
										.setName("notification-service")
										.setFallbackUri("forward:/fallback/notifications")))
						.uri("http://notification-service:8084"))

				// WebSocket routes for notifications
				.route("notification-websocket", r -> r
						.path("/ws/**")
						.uri("http://notification-service:8084"))

				.build();
	}

	@Bean
	public CorsWebFilter corsWebFilter() {
		CorsConfiguration corsConfig = new CorsConfiguration();
		corsConfig.setAllowedOriginPatterns(Arrays.asList("*"));
		corsConfig.setMaxAge(3600L);
		corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		corsConfig.setAllowedHeaders(Arrays.asList("*"));
		corsConfig.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", corsConfig);

		return new CorsWebFilter(source);
	}
}