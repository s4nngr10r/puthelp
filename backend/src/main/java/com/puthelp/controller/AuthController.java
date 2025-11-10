package com.puthelp.controller;

import com.puthelp.dto.auth.JwtResponse;
import com.puthelp.dto.auth.LoginRequest;
import com.puthelp.dto.auth.SignupRequest;
import com.puthelp.dto.auth.ChangePasswordRequest;
import com.puthelp.dto.auth.RefreshTokenRequest;
import com.puthelp.dto.response.MessageResponse;
import com.puthelp.entity.Kierunek;
import com.puthelp.entity.Role;
import com.puthelp.entity.User;
import com.puthelp.repository.KierunekRepository;
import com.puthelp.repository.RoleRepository;
import com.puthelp.repository.UserRepository;
import com.puthelp.security.CustomPasswordEncoder;
import com.puthelp.security.JwtUtils;
import com.puthelp.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    AuthenticationManager authenticationManager;
    
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    RoleRepository roleRepository;
    
    @Autowired
    KierunekRepository kierunekRepository;
    
    @Autowired
    CustomPasswordEncoder passwordEncoder;
    
    @Autowired
    JwtUtils jwtUtils;
    
    @Autowired
    RedisTemplate<String, String> redisTemplate;
    
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        
        // Custom authentication using our password encoder
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElse(null);
        
        if (user == null || !user.getIsActive()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid credentials!"));
        }
        
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword(), user.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid credentials!"));
        }
        
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String accessToken = jwtUtils.generateAccessToken(userPrincipal.getUsername());
        String refreshToken = jwtUtils.generateRefreshToken(userPrincipal.getUsername());
        
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        
        // Store both tokens in Redis
        String accessSessionKey = "access_session:" + user.getUsername();
        String refreshSessionKey = "refresh_session:" + user.getUsername();
        redisTemplate.opsForValue().set(accessSessionKey, accessToken, 15, TimeUnit.MINUTES);
        redisTemplate.opsForValue().set(refreshSessionKey, refreshToken, 3, TimeUnit.HOURS);
        
        return ResponseEntity.ok(new JwtResponse(accessToken, refreshToken,
                userPrincipal.getId(),
                userPrincipal.getUsername(),
                userPrincipal.getEmail(),
                roles));
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }
        
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }
        
        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                           signUpRequest.getEmail(),
                           passwordEncoder.encode(signUpRequest.getPassword(), signUpRequest.getUsername()));
        
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        
        // Set kierunek if provided
        if (signUpRequest.getKierunekId() != null) {
            Kierunek kierunek = kierunekRepository.findById(signUpRequest.getKierunekId())
                    .orElse(null);
            user.setKierunek(kierunek);
        }
        
        Set<Role> roles = new HashSet<>();
        
        // Assign default role (STUDENT)
        Role studentRole = roleRepository.findByName(Role.RoleName.STUDENT)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(studentRole);
        
        user.setRoles(roles);
        userRepository.save(user);
        
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
    
    @PostMapping("/signout")
    public ResponseEntity<?> logoutUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String username = userPrincipal.getUsername();
            
            // Remove both tokens from Redis
            String accessSessionKey = "access_session:" + username;
            String refreshSessionKey = "refresh_session:" + username;
            redisTemplate.delete(accessSessionKey);
            redisTemplate.delete(refreshSessionKey);
        }
        
        return ResponseEntity.ok(new MessageResponse("User signed out successfully!"));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        try {
            String refreshToken = refreshTokenRequest.getRefreshToken();
            
            // Validate refresh token
            if (!jwtUtils.validateJwtToken(refreshToken) || !jwtUtils.isRefreshToken(refreshToken)) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Invalid refresh token!"));
            }
            
            String username = jwtUtils.getUsernameFromJwtToken(refreshToken);
            
            // Check if refresh token exists in Redis
            String refreshSessionKey = "refresh_session:" + username;
            String storedRefreshToken = redisTemplate.opsForValue().get(refreshSessionKey);
            
            if (storedRefreshToken == null || !storedRefreshToken.equals(refreshToken)) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Refresh token not found or invalid!"));
            }
            
            // Get user details
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));
            
            if (!user.getIsActive()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: User account is inactive!"));
            }
            
            // Generate new token pair
            UserPrincipal userPrincipal = UserPrincipal.create(user);
            String newAccessToken = jwtUtils.generateAccessToken(username);
            String newRefreshToken = jwtUtils.generateRefreshToken(username);
            
            List<String> roles = userPrincipal.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());
            
            // Update tokens in Redis
            String accessSessionKey = "access_session:" + username;
            redisTemplate.opsForValue().set(accessSessionKey, newAccessToken, 15, TimeUnit.MINUTES);
            redisTemplate.opsForValue().set(refreshSessionKey, newRefreshToken, 3, TimeUnit.HOURS);
            
            return ResponseEntity.ok(new JwtResponse(newAccessToken, newRefreshToken,
                    userPrincipal.getId(),
                    userPrincipal.getUsername(),
                    userPrincipal.getEmail(),
                    roles));
                    
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String username = userPrincipal.getUsername();
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    @PreAuthorize("hasRole('STUDENT') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest,
                                           Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String username = userPrincipal.getUsername();
            
            // Get the current user
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));
            
            // Verify current password using custom encoder
            if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Current password is incorrect!"));
            }
            
            // Encode new password with username as salt
            String encodedNewPassword = passwordEncoder.encode(changePasswordRequest.getNewPassword());
            user.setPassword(encodedNewPassword);
            
            // Save the updated user
            userRepository.save(user);
            
            // Invalidate current session (optional - forces re-login)
            String sessionKey = "session:" + username;
            redisTemplate.delete(sessionKey);
            
            return ResponseEntity.ok(new MessageResponse("Password changed successfully!"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    // Admin-only user management endpoints
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        try {
            // Create pageable object
            Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<User> usersPage;
            
            if (search != null && !search.trim().isEmpty()) {
                // Search by name or email
                usersPage = userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search, search, search, pageable);
            } else if (role != null && !role.trim().isEmpty()) {
                // Filter by role
                Role.RoleName roleEnum = Role.RoleName.valueOf(role.toUpperCase());
                Role targetRole = roleRepository.findByName(roleEnum)
                    .orElseThrow(() -> new RuntimeException("Role not found"));
                usersPage = userRepository.findByRolesContaining(targetRole, pageable);
            } else {
                // Get all users
                usersPage = userRepository.findAll(pageable);
            }
            
            return ResponseEntity.ok(usersPage);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PutMapping("/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> roleData) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));
            
            String roleName = roleData.get("role");
            Role.RoleName roleEnum = Role.RoleName.valueOf(roleName.toUpperCase());
            
            Role newRole = roleRepository.findByName(roleEnum)
                    .orElseThrow(() -> new RuntimeException("Error: Role not found."));
            
            Set<Role> roles = new HashSet<>();
            roles.add(newRole);
            user.setRoles(roles);
            
            userRepository.save(user);
            
            return ResponseEntity.ok(new MessageResponse("User role updated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PutMapping("/admin/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> statusData) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));
            
            Boolean isActive = statusData.get("isActive");
            user.setIsActive(isActive);
            
            userRepository.save(user);
            
            return ResponseEntity.ok(new MessageResponse("User status updated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));
            
            userRepository.delete(user);
            
            return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
