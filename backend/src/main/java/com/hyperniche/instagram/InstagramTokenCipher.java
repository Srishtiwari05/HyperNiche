package com.hyperniche.instagram;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

@Component
public class InstagramTokenCipher {
    private static final int NONCE_BYTES = 12;
    private final String encodedKey;
    private final SecureRandom random = new SecureRandom();

    public InstagramTokenCipher(@Value("${instagram.token-encryption-key:}") String encodedKey) {
        this.encodedKey = encodedKey;
    }

    public String encrypt(String token) {
        try {
            byte[] nonce = new byte[NONCE_BYTES];
            random.nextBytes(nonce);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key(), new GCMParameterSpec(128, nonce));
            byte[] encrypted = cipher.doFinal(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            byte[] output = Arrays.copyOf(nonce, nonce.length + encrypted.length);
            System.arraycopy(encrypted, 0, output, nonce.length, encrypted.length);
            return Base64.getEncoder().encodeToString(output);
        } catch (Exception ex) {
            throw new IllegalStateException("Instagram token encryption is unavailable", ex);
        }
    }

    public String decrypt(String encryptedToken) {
        try {
            byte[] input = Base64.getDecoder().decode(encryptedToken);
            if (input.length <= NONCE_BYTES) throw new IllegalArgumentException("Invalid encrypted token");
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, input, 0, NONCE_BYTES));
            return new String(cipher.doFinal(input, NONCE_BYTES, input.length - NONCE_BYTES), java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception ex) {
            throw new IllegalStateException("Instagram token could not be decrypted", ex);
        }
    }

    private SecretKeySpec key() {
        byte[] key = Base64.getDecoder().decode(encodedKey);
        if (key.length != 32) throw new IllegalStateException("INSTAGRAM_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
        return new SecretKeySpec(key, "AES");
    }
}
