/**
 * @license
 * Hyperniche Platform Moderation & Safety Configuration
 * Comprehensive filter for contact details, off-platform attempts, and abusive language.
 * Word list is centrally maintained here so it can be updated/extended without altering core application logic.
 */

// 1. EDITABLE ABUSE WORD LIST (English, Hindi, Hinglish, Slang, Harassment, Threats)
export const PROHIBITED_WORDS: string[] = [
  // --- Common English Profanities & Harassment ---
  'fuck', 'fuk', 'fck', 'fucker', 'fucking', 'motherfucker',
  'bitch', 'btch', 'b!tch', 'b1tch', 'bitches',
  'asshole', 'ass', 'a$$', 'bastard', 'bstrd',
  'dick', 'd!ck', 'cock', 'pussy', 'slut', 'whore',
  'cunt', 'retard', 'moron', 'idiot', 'stupid',
  'kill yourself', 'die', 'murder', 'rape', 'threat',

  // --- Hindi / Hinglish Profanities & Abuse ---
  'mc', 'bc', 'bsdk', 'bhosdike', 'bhosadike', 'bhosdi',
  'madarchod', 'maderchod', 'madarchodh', 'madarchodk',
  'behenchod', 'bhenchod', 'bhenchodd', 'benchod', 'bhanchod',
  'chutiya', 'chutiye', 'chootiya', 'chutya', 'choot',
  'gand', 'gaand', 'gandu', 'gaandu', 'gandfat',
  'harami', 'haramkhor', 'haramzada', 'kameena', 'kutta',
  'lauda', 'loda', 'lavda', 'lund', 'laundia',
  'randi', 'raand', 'r@ndi', 'tatte', 'jhant', 'jhaant',
  'saala', 'sale', 'kamina', 'kutte', 'suar',

  // --- Devanagari Hindi Abuse ---
  'चूतिया', 'मादरचोद', 'बहनचोद', 'भोसड़ीके', 'गांडू', 'हरामी', 'कमीना', 'कुत्ता', 'लौड़ा', 'रंडी'
];

// 2. OFF-PLATFORM & CONTACT INTENT PHRASES
export const OFF_PLATFORM_TERMS: string[] = [
  'whatsapp', 'whatsup', 'watsapp', 'wa.me',
  'telegram', 't.me', 'tele',
  'call me', 'phone me', 'ping me', 'dm me', 'contact me on',
  'message me on', 'reach me at', 'talk on', 'chat on',
  'insta dm', 'instagram dm', 'share your number', 'give your number',
  'send number', 'my number is', 'ping on', 'text on'
];

// 3. NUMBER WORDS MAPPING (English & Hindi/Hinglish)
export const NUMBER_WORDS_MAP: Record<string, string> = {
  // English
  'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
  'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
  // Hindi / Hinglish
  'shunya': '0', 'sunya': '0', 'ek': '1', 'do': '2', 'teen': '3', 'tin': '3',
  'char': '4', 'chaar': '4', 'paanch': '5', 'panch': '5', 'chhe': '6', 'che': '6',
  'chhah': '6', 'saat': '7', 'sat': '7', 'aath': '8', 'ath': '8', 'nau': '9', 'no': '9'
};

// 4. DEVANAGARI DIGITS MAPPING
export const DEVANAGARI_DIGITS_MAP: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};

// 5. NUMBER EMOJIS MAPPING
export const NUMBER_EMOJIS_MAP: Record<string, string> = {
  '0️⃣': '0', '1️⃣': '1', '2️⃣': '2', '3️⃣': '3', '4️⃣': '4',
  '5️⃣': '5', '6️⃣': '6', '7️⃣': '7', '8️⃣': '8', '9️⃣': '9',
  '🔟': '10'
};

// 6. LEETSPEAK LOOKALIKE CHARACTER REPLACEMENTS
export function replaceLookalikes(text: string): string {
  return text
    .replace(/[@]/g, 'a')
    .replace(/[$]/g, 's')
    .replace(/[!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[0]/g, 'o')
    .replace(/[1]/g, 'i')
    .replace(/[5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[8]/g, 'b');
}

/**
 * Normalizes text to detect phone numbers concealed as words, symbols, or separated digits
 */
export function extractDigitString(input: string): string {
  let text = input.toLowerCase();

  // Convert Devanagari digits
  for (const [dev, dig] of Object.entries(DEVANAGARI_DIGITS_MAP)) {
    text = text.split(dev).join(dig);
  }

  // Convert Number Emojis
  for (const [em, dig] of Object.entries(NUMBER_EMOJIS_MAP)) {
    text = text.split(em).join(dig);
  }

  // Convert Number words to digits
  const tokens = text.split(/[\s,\-_.]+/);
  const convertedTokens = tokens.map((token) => NUMBER_WORDS_MAP[token] || token);
  text = convertedTokens.join(' ');

  // Return continuous sequence of digits found
  return text.replace(/\D/g, '');
}

/**
 * Normalizes text for profanity matching (lowercase, collapses repeats, strips spaces)
 */
export function normalizeForProfanity(input: string): string {
  let lower = input.toLowerCase();
  
  // Replace lookalike characters
  lower = replaceLookalikes(lower);
  
  // Collapse repeated characters: e.g. "fuuuuck" -> "fuck", "biiiitch" -> "bitch"
  lower = lower.replace(/(.)\1{2,}/g, '$1$1');

  return lower;
}

/**
 * Detects phone numbers in any format:
 * - standard 10-digit Indian numbers (+91, 091, 0091)
 * - spaced, dotted, dashed, bracketed numbers
 * - numbers split across words or written in words/emojis
 */
export function containsPhoneNumber(input: string): boolean {
  // 1. Check extracted raw digit string
  const digits = extractDigitString(input);

  // If 10 contiguous digits starting with 6, 7, 8, or 9
  if (/(?:(?:\+|0{0,2})91)?[6789]\d{9}/.test(digits)) {
    return true;
  }

  // Generic 10 to 13 digits continuous run
  if (/\b\d{10,13}\b/.test(digits) || (digits.length >= 10 && digits.length <= 14)) {
    return true;
  }

  // Formatted check directly on raw text: e.g. +91 98201-12345, (022) 2345 6789, etc.
  const phonePattern = /(?:(?:\+|0{0,2})91[\s.-]?)?[6-9]\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}/;
  if (phonePattern.test(input)) {
    return true;
  }

  return false;
}

/**
 * Detects emails, URLs, UPI IDs, bank details, and off-platform solicitation
 */
export function containsContactOrOffPlatform(input: string): boolean {
  const lower = input.toLowerCase();

  // 1. Email check
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  if (emailRegex.test(input)) return true;

  // 2. URLs & Links (http, https, .com, .in, .co, .org, .net, .io, wa.me, t.me)
  const urlRegex = /(?:https?:\/\/|www\.)[^\s]+|\b[a-zA-Z0-9-]+\.(?:com|in|co|net|org|io|app|me|link)\b/i;
  if (urlRegex.test(input)) return true;

  // 3. UPI ID handles (e.g. user@okhdfcbank, name@paytm, 9820112345@upi, etc.)
  const upiRegex = /[a-zA-Z0-9.\-_]{2,64}@(okhdfcbank|oksbi|okaxis|okicici|paytm|ybl|ibl|apl|axl|upi|sbi|hdfc|icici|kotak|barodampay|postbank|fbl|idfcbank|waaxis|wahdfcbank|wasbi|waicici)/i;
  if (upiRegex.test(input)) return true;

  // 4. IFSC code (4 letters, 0, 6 alpha-numeric)
  const ifscRegex = /\b[A-Z]{4}0[A-Z0-9]{6}\b/i;
  if (ifscRegex.test(input)) return true;

  // 5. Off-platform migration phrases
  for (const phrase of OFF_PLATFORM_TERMS) {
    if (lower.includes(phrase)) {
      return true;
    }
  }

  return false;
}

/**
 * Detects abusive language, harassment, hate speech, threats, and Indian slang insults
 */
export function containsAbusiveLanguage(input: string): boolean {
  const normalized = normalizeForProfanity(input);
  const strippedOfSeparators = normalized.replace(/[\s\-_.,/\\#@!$%^&*()+=~`]+/g, '');

  for (const word of PROHIBITED_WORDS) {
    const cleanWord = word.toLowerCase().trim();
    if (!cleanWord) continue;

    // Check with word boundaries
    const regex = new RegExp(`\\b${cleanWord}\\b`, 'i');
    if (regex.test(normalized)) {
      return true;
    }

    // Check without spaces/separators (e.g. "b.h.o.s.d.i" or "m a d a r c h o d")
    if (cleanWord.length >= 3 && strippedOfSeparators.includes(cleanWord)) {
      return true;
    }
  }

  return false;
}

/**
 * Master safety validation function:
 * Validates text for both contact info and abusive language.
 * Standardized warning message per requirement.
 */
export function validateMessageSafety(input: string): { 
  allowed: boolean; 
  reason?: 'contact' | 'abuse';
  warningMessage?: string;
} {
  if (!input || !input.trim()) {
    return { allowed: true };
  }

  // 1. Check Phone Numbers
  if (containsPhoneNumber(input)) {
    return {
      allowed: false,
      reason: 'contact',
      warningMessage: "This message can't be sent. Don't share personal contact details or use abusive language.",
    };
  }

  // 2. Check Contact / Links / UPI / Off-platform attempts
  if (containsContactOrOffPlatform(input)) {
    return {
      allowed: false,
      reason: 'contact',
      warningMessage: "This message can't be sent. Don't share personal contact details or use abusive language.",
    };
  }

  // 3. Check Abusive Language
  if (containsAbusiveLanguage(input)) {
    return {
      allowed: false,
      reason: 'abuse',
      warningMessage: "This message can't be sent. Don't share personal contact details or use abusive language.",
    };
  }

  return { allowed: true };
}
