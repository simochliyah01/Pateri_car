package ma.patericar.auth.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthResponse {

    String accessToken;
    String refreshToken;
    @Builder.Default String tokenType = "Bearer";
    long expiresIn;
    UserInfo user;

    @Value
    @Builder
    public static class UserInfo {
        Long id;
        String email;
        String firstName;
        String lastName;
        String phone;
        String role;
    }
}
