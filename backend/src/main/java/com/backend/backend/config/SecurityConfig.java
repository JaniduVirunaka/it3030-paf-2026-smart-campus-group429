package com.backend.backend.config;

import java.util.HashSet;
import java.util.Set;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

   @Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/", "/login", "/static/**", "/oauth2/**").permitAll()
            // ONLY Admins can modify data (POST, PUT, DELETE)
            .requestMatchers(HttpMethod.POST, "/api/resources/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/resources/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/resources/**").hasRole("ADMIN")
            // Everyone logged in can view
            .requestMatchers(HttpMethod.GET, "/api/resources/**").authenticated()
            .anyRequest().authenticated()
        )
        .oauth2Login(oauth2 -> oauth2
            .defaultSuccessUrl("http://localhost:5173/dashboard", true)
        );
    return http.build();
}

// Helper to assign the ADMIN role to your specific email
@Bean
public GrantedAuthoritiesMapper userAuthoritiesMapper() {
    return (authorities) -> {
        Set<GrantedAuthority> mappedAuthorities = new HashSet<>();
        authorities.forEach(authority -> {
            if (authority instanceof OidcUserAuthority oidcAuth) {
                
                if ("janiduvirunkadev@gmail.com".equals(oidcAuth.getIdToken().getEmail())) {
                    mappedAuthorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                }
            }
            mappedAuthorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        });
        return mappedAuthorities;
    };
}
}