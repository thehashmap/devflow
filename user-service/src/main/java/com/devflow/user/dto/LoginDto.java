package com.devflow.user.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginDto {
    @NotBlank
    private String usernameOrEmail;

    @NotBlank
    private String password;

    // Constructors
    public LoginDto() {}

    public LoginDto(String usernameOrEmail, String password) {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
    }

    // Getters and Setters
    public String getUsernameOrEmail() { return usernameOrEmail; }
    public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}