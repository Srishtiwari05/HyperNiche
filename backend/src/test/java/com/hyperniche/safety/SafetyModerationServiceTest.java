package com.hyperniche.safety;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SafetyModerationServiceTest {

    private SafetyModerationService safetyService;

    @BeforeEach
    void setUp() {
        safetyService = new SafetyModerationService();
    }

    @Test
    void testAllowedContentPasses() {
        var res = safetyService.validateContent("Hey! Excited to collaborate on your summer campaign.");
        assertTrue(res.allowed());
        assertNull(res.reason());
    }

    @Test
    void testBlocksPhoneNumber() {
        var res = safetyService.validateContent("Call me directly at 9876543210 to discuss terms.");
        assertFalse(res.allowed());
        assertNotNull(res.reason());
    }

    @Test
    void testBlocksEmailAddress() {
        var res = safetyService.validateContent("Send the brief to creator@externalmail.com");
        assertFalse(res.allowed());
        assertNotNull(res.reason());
    }

    @Test
    void testBlocksWhatsAppOrTelegramLeaks() {
        var res = safetyService.validateContent("Message me on whatsapp or t.me/mycreatorchannel");
        assertFalse(res.allowed());
        assertNotNull(res.reason());
    }
}
