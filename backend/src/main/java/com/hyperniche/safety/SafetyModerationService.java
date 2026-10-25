package com.hyperniche.safety;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class SafetyModerationService {

    private static final List<Pattern> OFF_PLATFORM_PATTERNS = List.of(
            // Phone numbers
            Pattern.compile("(\\+?\\d{1,4}[\\s.-]?)?(\\d{10}|\\d{5}[\\s.-]?\\d{5}|\\d{3}[\\s.-]?\\d{3}[\\s.-]?\\d{4})"),
            // Email addresses
            Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}"),
            // Social & Messaging keywords (WhatsApp, Telegram, GPay, PhonePe, Paytm, etc.)
            Pattern.compile("(?i)(whatsapp|wa\\.me|wapp|tele|telegram|t\\.me|insta\\s*dm|dm\\s*me|call\\s*me|reach\\s*me\\s*at|gpay|phonepe|paytm|upi\\s*id|@okaxis|@okhdfcbank|@ibl|@ybl|contact\\s*outside)"),
            // Direct handle prompts
            Pattern.compile("(?i)(my\\s*(number|no|num|contact|cell|phone)\\s*(is|:)?\\s*\\d+)")
    );

    public record SafetyResult(boolean allowed, String reason, String matchedPattern) {}

    public SafetyResult validateContent(String text) {
        if (text == null || text.isBlank()) {
            return new SafetyResult(true, null, null);
        }

        for (Pattern pattern : OFF_PLATFORM_PATTERNS) {
            var matcher = pattern.matcher(text);
            if (matcher.find()) {
                return new SafetyResult(
                        false,
                        "Sharing off-platform contact details (phone numbers, WhatsApp, emails, external payment handles) is prohibited on Hyperniche for user safety.",
                        matcher.group()
                );
            }
        }

        return new SafetyResult(true, null, null);
    }
}
