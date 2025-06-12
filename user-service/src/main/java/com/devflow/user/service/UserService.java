package com.devflow.user.service;

import com.devflow.user.dto.UserRegistrationDto;
import com.devflow.user.dto.UserResponseDto;
import com.devflow.user.model.Role;
import com.devflow.user.model.User;
import com.devflow.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserResponseDto registerUser(UserRegistrationDto registrationDto) {
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }

        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setFirstName(registrationDto.getFirstName());
        user.setLastName(registrationDto.getLastName());
        user.setRoles(Set.of(Role.USER));

        User savedUser = userRepository.save(user);
        return convertToResponseDto(savedUser);
    }

    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByUsernameOrEmail(usernameOrEmail);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertToResponseDto(user);
    }

    public UserResponseDto updateUser(Long id, UserRegistrationDto updateDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Check if username is being changed and if it's already taken
        if (!user.getUsername().equals(updateDto.getUsername())
                && userRepository.existsByUsername(updateDto.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }

        // Check if email is being changed and if it's already taken
        if (!user.getEmail().equals(updateDto.getEmail())
                && userRepository.existsByEmail(updateDto.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        user.setUsername(updateDto.getUsername());
        user.setEmail(updateDto.getEmail());
        user.setFirstName(updateDto.getFirstName());
        user.setLastName(updateDto.getLastName());

        if (updateDto.getPassword() != null && !updateDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateDto.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return convertToResponseDto(updatedUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public UserResponseDto addRoleToUser(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.getRoles().add(role);
        User updatedUser = userRepository.save(user);
        return convertToResponseDto(updatedUser);
    }

    public UserResponseDto removeRoleFromUser(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.getRoles().remove(role);
        User updatedUser = userRepository.save(user);
        return convertToResponseDto(updatedUser);
    }

    private UserResponseDto convertToResponseDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRoles(user.getRoles());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setEnabled(user.isEnabled());
        return dto;
    }
}
