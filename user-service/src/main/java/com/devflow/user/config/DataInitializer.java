package com.devflow.user.config;

import com.devflow.user.model.User;
import com.devflow.user.model.Role;
import com.devflow.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 Initializing default users...");

        createUserIfNotExists(
                "admin",
                "admin@devflow.com",
                "admin123",
                Role.ADMIN,
                "Admin - System Administrator"
        );

        createUserIfNotExists(
                "john_dev",
                "john@devflow.com",
                "dev123",
                Role.DEVELOPER,
                "John Smith - Senior Developer"
        );

        createUserIfNotExists(
                "sarah_dev",
                "sarah@devflow.com",
                "dev123",
                Role.REVIEWER,
                "Sarah Johnson - Frontend Developer"
        );

        createUserIfNotExists(
                "mike_lead",
                "mike@devflow.com",
                "lead123",
                Role.USER,
                "Mike Wilson - User"
        );

        createUserIfNotExists(
                "testuser",
                "test@devflow.com",
                "test123",
                Role.USER,
                "User - Test User Account"
        );

        System.out.println("✅ User initialization completed!");
        System.out.println("📋 Available accounts:");
        System.out.println("   👑 Admin: admin/admin123");
        System.out.println("   👨‍💻 Developer: john_dev/dev123");
        System.out.println("   👩‍💻 Developer: sarah_dev/dev123");
        System.out.println("   👨‍💼 Team User: mike_user/user123");
        System.out.println("   🧪 Test User: testuser/test123");
    }

    private void createUserIfNotExists(String username, String email, String password, Role role, String description) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setEnabled(true);
            user.setFirstName(extractFirstName(description));
            user.setLastName(extractLastName(description));
            user.setCreatedAt(java.time.LocalDateTime.now());

            userRepository.save(user);
            System.out.println("✅ Created user: " + username + " (" + description + ")");
        } else {
            System.out.println("⏭️  User already exists: " + username);
        }
    }

    private String extractFirstName(String description) {
        if (description.contains(" - ")) {
            String name = description.split(" - ")[0];
            return name.split(" ")[0];
        }
        return "Default";
    }

    private String extractLastName(String description) {
        if (description.contains(" - ")) {
            String name = description.split(" - ")[0];
            String[] parts = name.split(" ");
            return parts.length > 1 ? parts[1] : "";
        }
        return "User";
    }
}