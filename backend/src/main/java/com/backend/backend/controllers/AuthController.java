package com.backend.backend.controllers;

import com.backend.backend.models.User;
import com.backend.backend.repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${app.admin.emails:}")
    private String adminEmailsConfig;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private boolean isAdminEmail(String email) {
        if (adminEmailsConfig == null || adminEmailsConfig.trim().isEmpty()) {
            return false;
        }
        List<String> adminEmails = Arrays.stream(adminEmailsConfig.split(","))
                .map(String::trim)
                .collect(Collectors.toList());
        return adminEmails.contains(email);
    }

    // 1. STANDARD LOGIN ENDPOINT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        try {
            // Check credentials against the database
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Set the session context manually so Spring remembers them
            SecurityContextHolder.getContext().setAuthentication(authentication);
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());

            return ResponseEntity.ok(Map.of("success", true, "message", "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid email or password"));
        }
    }

    // 2. REGISTRATION ENDPOINT (With Magic @admin rule)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already in use!"));
        }

        Set<String> roles = new HashSet<>();
        roles.add("ROLE_USER"); // Everyone gets USER

        // Grant ADMIN role only to emails on the configurable allowlist
        if (isAdminEmail(email)) {
            roles.add("ROLE_ADMIN");
        }

        // Create and save the new user (encrypting the password securely!)
        User user = new User(email, passwordEncoder.encode(password), roles);
        user.setDisplayName(body.get("displayName"));
        user.setRegistrationNumber(body.get("registrationNumber"));
        user.setPhone(body.get("phone"));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("success", true, "message", "User registered successfully!"));
    }

    // 3. UNIFIED USER CHECK (Handles both Google and Standard Logins)
    @GetMapping("/user")
    public Map<String, Object> getUser(Authentication authentication) {
        // If no one is logged in
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return Map.of("authenticated", false);
        }

        String email = "";
        String name = "";

        // Identify if they logged in with Google
        if (authentication.getPrincipal() instanceof OidcUser oidcUser) {
            email = oidcUser.getEmail();
            name = oidcUser.getFullName();
        }
        // Identify if they logged in with standard email/password
        else if (authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.User springUser) {
            email = springUser.getUsername();
            name = email.split("@")[0]; // Use the first part of the email as a display name
        }

        Optional<User> user = userRepository.findByEmail(email);

        Map<String, Object> map = new HashMap<>();
        map.put("authenticated", true);
        map.put("name", name);
        map.put("email", email);
        map.put("roles", authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        map.put("registrationNumber", user.map(User::getRegistrationNumber).orElse(null));
        map.put("phone", user.map(User::getPhone).orElse(null));
        map.put("displayName", user.map(User::getDisplayName).orElse(null));
        return map;
    }

    // 4. GET PROFILE
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = extractEmail(authentication);
        Optional<User> userOpt = userRepository.findByEmail(email);
        Map<String, Object> profile = new HashMap<>();
        profile.put("email", email);
        profile.put("displayName", userOpt.map(User::getDisplayName).orElse(null));
        profile.put("registrationNumber", userOpt.map(User::getRegistrationNumber).orElse(null));
        profile.put("phone", userOpt.map(User::getPhone).orElse(null));
        return ResponseEntity.ok(profile);
    }

    // 5. UPDATE PROFILE
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication,
                                            @RequestBody Map<String, String> body) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = extractEmail(authentication);
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setRoles(Set.of("ROLE_USER"));
            return u;
        });
        if (body.containsKey("displayName"))        user.setDisplayName(body.get("displayName"));
        if (body.containsKey("registrationNumber")) user.setRegistrationNumber(body.get("registrationNumber"));
        if (body.containsKey("phone"))              user.setPhone(body.get("phone"));
        userRepository.save(user);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("email", email);
        result.put("displayName", user.getDisplayName());
        result.put("registrationNumber", user.getRegistrationNumber());
        result.put("phone", user.getPhone());
        return ResponseEntity.ok(result);
    }

    // Helper: extract email from either OIDC (Google) or standard Spring Security principal
    private String extractEmail(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OidcUser oidcUser) {
            return oidcUser.getEmail();
        } else if (authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.User springUser) {
            return springUser.getUsername();
        }
        return "";
    }

    // Simple DTO to catch incoming JSON requests from React
    public static class AuthRequest {
        private String email;
        private String password;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}