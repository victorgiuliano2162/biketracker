package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.RefreshToken;
import br.com.biketracker.app.entities.enums.Role;
import br.com.biketracker.app.entities.dtos.auth.LoginRequest;
import br.com.biketracker.app.entities.dtos.auth.LoginResponse;
import br.com.biketracker.app.entities.dtos.auth.RefreshRequest;
import br.com.biketracker.app.exceptions.ex.UnauthorizedException;
import br.com.biketracker.app.repositories.RefreshTokenRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final UserService userService;
    private final RefreshTokenRepository refreshTokenRepository;


    private static final long ACCESS_TOKEN_EXPIRY_MINUTES = 35;

    
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 7;

    public AuthService(
                        @Lazy AuthenticationManager authenticationManager,
                       JwtEncoder jwtEncoder,
                       JwtDecoder jwtDecoder,
                        UserService userService,
                        RefreshTokenRepository refreshTokenRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
        this.userService = userService;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
            String email = authentication.getName();
            String accessToken  = generateAccessToken(email);
            String refreshToken = generateAndPersistRefreshToken(email);
            return new LoginResponse(accessToken, refreshToken);

        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("E-mail ou senha incorretos");
        }
    }

    @Transactional
    public LoginResponse refresh(RefreshRequest request) {
        
        var jwt = jwtDecoder.decode(request.refreshToken());

    
        String tokenType = jwt.getClaimAsString("token_type");
        if (!"refresh".equals(tokenType)) {
            throw new IllegalArgumentException("Token inválido para refresh");
        }

        String tokenHash = sha256(request.refreshToken());
        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token inválido ou revogado"));

        if (stored.isRevoked() || stored.isExpired()) {
            throw new UnauthorizedException("Refresh token expirado ou revogado");
        }

        // Rotação: revoga o refresh token utilizado antes de emitir um novo
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        String email = jwt.getSubject();

        String newAccessToken  = generateAccessToken(email);
        String newRefreshToken = generateAndPersistRefreshToken(email);

        return new LoginResponse(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        String tokenHash = sha256(refreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(stored -> {
            stored.setRevoked(true);
            refreshTokenRepository.save(stored);
        });
    }

    private String generateAccessToken(String email) {
        Instant now = Instant.now();
        var user = userService.findByEmail(email);
        if (!user.isActive()) {
            throw new UnauthorizedException("Conta desativada");
        }
        Role role = user.getRole() != null ? user.getRole() : Role.USER;
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("biketracker")
                .subject(email)
                .issuedAt(now)
                .expiresAt(now.plus(ACCESS_TOKEN_EXPIRY_MINUTES, ChronoUnit.MINUTES))
                .claim("token_type", "access")
                .claim("user_id", user.getId())
                .claim("role", role.name())
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    private String generateAndPersistRefreshToken(String email) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(REFRESH_TOKEN_EXPIRY_DAYS, ChronoUnit.DAYS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("biketracker")
                .subject(email)
                .id(UUID.randomUUID().toString())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim("token_type", "refresh")
                .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        refreshTokenRepository.save(new RefreshToken(sha256(token), email, expiresAt));
        return token;
    }

    static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponível", e);
        }
    }
}
