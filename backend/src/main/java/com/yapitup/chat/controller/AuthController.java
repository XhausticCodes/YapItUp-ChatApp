package com.yapitup.chat.controller;

import com.yapitup.chat.dto.AuthResponse;
import com.yapitup.chat.dto.LoginRequest;
import com.yapitup.chat.dto.RegisterRequest;
import com.yapitup.chat.model.User;
import com.yapitup.chat.service.UserService;
import com.yapitup.chat.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for authentication endpoints
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Register a new user
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        // Check if username already exists
        if (userService.usernameExists(request.getUsername())) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new AuthResponse(null, null, null, "Username already exists"));
        }
        
        // Check if email already exists
        if (userService.emailExists(request.getEmail())) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new AuthResponse(null, null, null, "Email already exists"));
        }
        
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Hash password
        user.setIsOnline(false);
        
        // Save user
        User savedUser = userService.saveUser(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getId());
        
        return ResponseEntity.ok(new AuthResponse(
            token,
            savedUser.getUsername(),
            savedUser.getId(),
            "User registered successfully"
        ));
    }
    
    /**
     * Login user
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        // Find user by username
        var userOpt = userService.getUserByUsername(request.getUsername());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse(null, null, null, "Invalid username or password"));
        }
        
        User user = userOpt.get();
        
        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse(null, null, null, "Invalid username or password"));
        }
        
        // Update online status
        user.setIsOnline(true);
        userService.saveUser(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername(), user.getId());
        
        return ResponseEntity.ok(new AuthResponse(
            token,
            user.getUsername(),
            user.getId(),
            "Login successful"
        ));
    }
}