package com.devflow.user.controller;

import com.devflow.user.dto.JwtResponseDto;
import com.devflow.user.dto.LoginDto;
import com.devflow.user.dto.UserRegistrationDto;
import com.devflow.user.dto.UserResponseDto;
import com.devflow.user.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
//@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get details of the currently authenticated user")
    public ResponseEntity<UserResponseDto> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from Authorization header (remove "Bearer " prefix)
            String token = authHeader;
            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }

            UserResponseDto userDetails = authService.getCurrentUser(token);
            return ResponseEntity.ok(userDetails);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<JwtResponseDto> authenticateUser(@Valid @RequestBody LoginDto loginDto) {
        try {
            JwtResponseDto jwtResponse = authService.login(loginDto);
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Register a new user")
    public ResponseEntity<UserResponseDto> registerUser(@Valid @RequestBody UserRegistrationDto registrationDto) {
        try {
            UserResponseDto user = authService.register(registrationDto);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate JWT token", description = "Validate JWT token")
    public ResponseEntity<Boolean> validateToken(@RequestParam String token) {
        boolean isValid = authService.validateToken(token);
        return ResponseEntity.ok(isValid);
    }

    @GetMapping("/user")
    @Operation(summary = "Get user from token", description = "Extract username from JWT token")
    public ResponseEntity<String> getUserFromToken(@RequestParam String token) {
        try {
            String username = authService.getUsernameFromToken(token);
            return ResponseEntity.ok(username);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}