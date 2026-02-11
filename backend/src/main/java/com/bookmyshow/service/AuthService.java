package com.bookmyshow.service;

import com.bookmyshow.dto.AuthResponse;
import com.bookmyshow.dto.LoginRequest;
import com.bookmyshow.dto.SignupRequest;
import com.bookmyshow.entity.User;
import com.bookmyshow.repository.UserRepository;
import com.bookmyshow.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Service
@Transactional
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern MOBILE_PATTERN = Pattern.compile("^[0-9]{10}$");

    public AuthResponse signup(SignupRequest request) {
        // Validate password match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Check if mobile number already exists
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new RuntimeException("Mobile number already registered");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setMobileNumber(request.getMobileNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user = userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getMobileNumber());
    }

    public AuthResponse login(LoginRequest request) {
        String emailOrMobile = request.getEmailOrMobile().trim();
        User user;

        // Determine if input is email or mobile number
        if (EMAIL_PATTERN.matcher(emailOrMobile).matches()) {
            user = userRepository.findByEmail(emailOrMobile.toLowerCase())
                    .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        } else if (MOBILE_PATTERN.matcher(emailOrMobile).matches()) {
            user = userRepository.findByMobileNumber(emailOrMobile)
                    .orElseThrow(() -> new RuntimeException("Invalid mobile number or password"));
        } else {
            throw new RuntimeException("Invalid email or mobile number format");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getMobileNumber());
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

