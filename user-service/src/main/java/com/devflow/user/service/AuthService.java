package com.devflow.user.service;

import com.devflow.user.dto.JwtResponseDto;
import com.devflow.user.dto.LoginDto;
import com.devflow.user.dto.UserRegistrationDto;
import com.devflow.user.dto.UserResponseDto;
import com.devflow.user.model.User;
import com.devflow.user.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    public JwtResponseDto login(LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getUsernameOrEmail(),
                        loginDto.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateToken(authentication);

        User user = userService.findByUsernameOrEmail(loginDto.getUsernameOrEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new JwtResponseDto(jwt, user.getUsername(), user.getEmail());
    }

    public UserResponseDto register(UserRegistrationDto registrationDto) {
        return userService.registerUser(registrationDto);
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    public String getUsernameFromToken(String token) {
        return jwtUtil.getUsernameFromToken(token);
    }

    public UserResponseDto getCurrentUser(String token) {
        if (!validateToken(token)) {
            throw new RuntimeException("Invalid or expired JWT token");
        }

        String username = getUsernameFromToken(token);
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userService.convertToResponseDto(user);
    }
}