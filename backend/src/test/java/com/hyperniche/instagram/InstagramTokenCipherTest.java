package com.hyperniche.instagram;

import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class InstagramTokenCipherTest {
    @Test
    void encryptsAndDecryptsWithoutStoringPlainText() {
        InstagramTokenCipher cipher = new InstagramTokenCipher(Base64.getEncoder().encodeToString(new byte[32]));
        String token = "meta-user-access-token";

        String encrypted = cipher.encrypt(token);

        assertNotEquals(token, encrypted);
        assertEquals(token, cipher.decrypt(encrypted));
    }

    @Test
    void refusesToEncryptWhenEncryptionKeyIsMissing() {
        InstagramTokenCipher cipher = new InstagramTokenCipher("");
        assertThrows(IllegalStateException.class, () -> cipher.encrypt("token"));
    }
}
