package com.sip.xsupply.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sip.xsupply.UserModule.role.RoleRepository;
import com.sip.xsupply.UserModule.user.*;
import com.sip.xsupply.exceptions.exception.ActivationTokenException;
import com.sip.xsupply.exceptions.exception.EmailAlreadyExistsException;
import com.sip.xsupply.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;

@RequiredArgsConstructor
@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RoleRepository roleRepository;
    private final TokenRepository tokenRepository;

    @Value("${application.frontend.login.url}")
    private String frontendLoginUrl;

    @Value("${application.frontend.new-password.url}")
    private String frontendNewPwdUrl;

    public void register(RegistrationRequest request) {
        var userRole = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new IllegalStateException("ROLE " + request.getRole() + " was not initiated"));

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("This email is already registered. Please use a different email.");
        }

        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .accountLocked(false)
                .enabled(true) // Set to false and use email verification if needed
                .roles(List.of(userRole))
                .build();

        userRepository.save(user);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = ((User) auth.getPrincipal());
        var claims = buildUserClaims(user);

        var jwtToken = jwtService.generateToken(claims, user);
        var refreshToken = jwtService.generateRefreshToken(claims, user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    private Map<String, Object> buildUserClaims(User user) {
        var claims = new HashMap<String, Object>();
        claims.put("fullName", user.fullName());
        claims.put("userId", user.getId());
        return claims;
    }

    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        final String authHeader = request.getHeader(AUTHORIZATION);
        final String refreshToken;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }

        refreshToken = authHeader.substring(7);
        try {
            userEmail = jwtService.extractUsername(refreshToken);
            if (userEmail != null) {
                var user = this.userRepository.findByEmail(userEmail).orElse(null);

                if (user != null && jwtService.isTokenValid(refreshToken, user)) {
                    var claims = buildUserClaims(user);
                    var token = jwtService.generateToken(claims, user);

                    var authResponse = AuthenticationResponse.builder()
                            .token(token)
                            .refreshToken(refreshToken)
                            .build();

                    new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                }
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }

    public void forgetPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Email not found: " + email));
        String resetToken = generateAndSaveToken(user);
        // TODO: Send reset password email with token
        // Token is: resetToken
        // Reset URL: frontendNewPwdUrl + "?token=" + resetToken
    }

    public ActivationResponse resetPasswordWithToken(String token, String newPwd) {
        try {
            Token savedToken = tokenRepository.findByToken(token).orElse(null);

            if (savedToken == null || LocalDateTime.now().isAfter(savedToken.getExpiresAt())) {
                return ActivationResponse.builder()
                        .success(false)
                        .message("Reset Failed")
                        .errorMessage("Token has expired or is invalid. Please request a new reset link.")
                        .build();
            }

            User user = savedToken.getUser();
            user.setPassword(passwordEncoder.encode(newPwd));
            userRepository.save(user);

            savedToken.setValidatedAt(LocalDateTime.now());
            tokenRepository.save(savedToken);

            return ActivationResponse.builder()
                    .success(true)
                    .message("Password reset successfully")
                    .frontendLoginUrl(frontendLoginUrl)
                    .build();

        } catch (Exception e) {
            return ActivationResponse.builder()
                    .success(false)
                    .message("Reset Failed")
                    .errorMessage("An unexpected error occurred.")
                    .build();
        }
    }

    private String generateAndSaveToken(User user) {
        String generatedToken = generateCode(32);
        var token = Token.builder()
                .token(generatedToken)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .user(user)
                .build();
        tokenRepository.save(token);
        return generatedToken;
    }

    private String generateCode(int length) {
        String characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        StringBuilder code = new StringBuilder();
        SecureRandom secureRandom = new SecureRandom();
        for (int i = 0; i < length; i++) {
            code.append(characters.charAt(secureRandom.nextInt(characters.length())));
        }
        return code.toString();
    }
}
