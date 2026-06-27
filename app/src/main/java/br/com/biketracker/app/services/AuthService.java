package br.com.biketracker.app.services;

import br.com.biketracker.app.entities.dtos.auth.LoginRequest;
import br.com.biketracker.app.entities.dtos.auth.LoginResponse;
import br.com.biketracker.app.entities.dtos.auth.RefreshRequest;
import br.com.biketracker.app.exceptions.ex.UnauthorizedException;
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

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final UserService userService;


    private static final long ACCESS_TOKEN_EXPIRY_MINUTES = 35;

    
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 7;

    public AuthService(
                        @Lazy AuthenticationManager authenticationManager,
                       JwtEncoder jwtEncoder,
                       JwtDecoder jwtDecoder,
                        UserService userService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
        this.userService = userService;
    }

    public LoginResponse login(LoginRequest request) {

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
            String accessToken  = generateAccessToken(authentication.getName());
            String refreshToken = generateRefreshToken(authentication.getName());
            return new LoginResponse(accessToken, refreshToken);

        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("E-mail ou senha incorretos");
        }
    }

    public LoginResponse refresh(RefreshRequest request) {
        
        var jwt = jwtDecoder.decode(request.refreshToken());

    
        String tokenType = jwt.getClaimAsString("token_type");
        if (!"refresh".equals(tokenType)) {
            throw new IllegalArgumentException("Token inválido para refresh");
        }

        String email = jwt.getSubject();

        String newAccessToken  = generateAccessToken(email);
        String newRefreshToken = generateRefreshToken(email);

        return new LoginResponse(newAccessToken, newRefreshToken);
    }

    private String generateAccessToken(String email) {
        Instant now = Instant.now();
        var user = userService.findByEmail(email);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("biketracker")
                .subject(email)
                .issuedAt(now)
                .expiresAt(now.plus(ACCESS_TOKEN_EXPIRY_MINUTES, ChronoUnit.MINUTES))
                .claim("token_type", "access")
                .claim("user_id", user.getId())
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    private String generateRefreshToken(String email) {
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("biketracker")
                .subject(email)
                .issuedAt(now)
                .expiresAt(now.plus(REFRESH_TOKEN_EXPIRY_DAYS, ChronoUnit.DAYS))
                .claim("token_type", "refresh")
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}
