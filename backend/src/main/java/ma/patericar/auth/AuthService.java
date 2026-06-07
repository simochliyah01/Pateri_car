package ma.patericar.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.patericar.auth.dto.AuthResponse;
import ma.patericar.auth.dto.LoginRequest;
import ma.patericar.auth.dto.RefreshTokenRequest;
import ma.patericar.auth.dto.RegisterRequest;
import ma.patericar.auth.dto.UpdateProfileRequest;
import ma.patericar.client.Client;
import ma.patericar.client.ClientRepository;
import ma.patericar.common.exceptions.ConflictException;
import ma.patericar.common.exceptions.ResourceNotFoundException;
import ma.patericar.user.Role;
import ma.patericar.user.RoleRepository;
import ma.patericar.user.User;
import ma.patericar.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email '" + request.getEmail() + "' is already in use");
        }
        Role role = roleRepository.findByName(request.getRoleName().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role '" + request.getRoleName() + "' not found"));

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(role)
                .active(true)
                .build();

        userRepository.save(user);

        // For CLIENT role: create a matching Client record so reservations can be linked.
        if ("CLIENT".equalsIgnoreCase(role.getName())
                && !clientRepository.existsByEmail(request.getEmail())) {
            clientRepository.save(Client.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .build());
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setLastLogin(OffsetDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String email = jwtService.extractEmail(request.getRefreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (jwtService.isTokenExpired(request.getRefreshToken())) {
            throw new ma.patericar.common.exceptions.ConflictException("Refresh token has expired");
        }
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse.UserInfo updateProfile(String currentEmail, UpdateProfileRequest req) {
        User user = userRepository.findByEmail(currentEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        if (!req.email().equals(currentEmail)) {
            userRepository.findByEmail(req.email()).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new ConflictException("Cet email est déjà utilisé");
                }
            });
        }

        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setEmail(req.email());
        if (req.phone() != null && !req.phone().isBlank()) {
            user.setPhone(req.phone());
        }
        User saved = userRepository.save(user);

        // Keep the Client record in sync for CLIENT role users
        if ("CLIENT".equalsIgnoreCase(saved.getRole().getName())) {
            clientRepository.findByEmail(currentEmail).ifPresent(client -> {
                client.setFirstName(saved.getFirstName());
                client.setLastName(saved.getLastName());
                client.setEmail(saved.getEmail());
                if (saved.getPhone() != null) client.setPhone(saved.getPhone());
                clientRepository.save(client);
            });
        }

        return AuthResponse.UserInfo.builder()
            .id(saved.getId())
            .email(saved.getEmail())
            .firstName(saved.getFirstName())
            .lastName(saved.getLastName())
            .phone(saved.getPhone())
            .role(saved.getRole().getName())
            .build();
    }

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        log.info("changePassword called for email: {}", email);

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        log.info("User found: id={}", user.getId());

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            log.warn("Current password mismatch for {}", email);
            throw new IllegalArgumentException("Le mot de passe actuel est incorrect");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Le nouveau mot de passe doit contenir au moins 8 caractères");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed successfully for {}", email);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(86400000L)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .phone(user.getPhone())
                        .role(user.getRole().getName())
                        .build())
                .build();
    }
}
