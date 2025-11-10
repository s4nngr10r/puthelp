package com.puthelp.security;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Component
public class CustomPasswordEncoder implements PasswordEncoder {
    
    private static final String ALGORITHM = "SHA-256";
    
    @Override
    public String encode(CharSequence rawPassword) {
        throw new UnsupportedOperationException("Use encode(CharSequence, String) with username as salt");
    }
    
    /**
     * Encodes the password using the username as salt
     * @param rawPassword the raw password
     * @param username the username to use as salt
     * @return the encoded password
     */
    public String encode(CharSequence rawPassword, String username) {
        try {
            MessageDigest digest = MessageDigest.getInstance(ALGORITHM);
            
            // Use username as salt
            String saltedPassword = username + rawPassword.toString();
            byte[] hash = digest.digest(saltedPassword.getBytes(StandardCharsets.UTF_8));
            
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Password encoding failed", e);
        }
    }
    
    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        throw new UnsupportedOperationException("Use matches(CharSequence, String, String) with username as salt");
    }
    
    /**
     * Verifies the password using the username as salt
     * @param rawPassword the raw password
     * @param encodedPassword the encoded password
     * @param username the username used as salt
     * @return true if passwords match
     */
    public boolean matches(CharSequence rawPassword, String encodedPassword, String username) {
        String encodedRawPassword = encode(rawPassword, username);
        return encodedRawPassword.equals(encodedPassword);
    }
}
