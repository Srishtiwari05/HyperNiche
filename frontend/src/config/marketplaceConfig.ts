/**
 * Hyperniche Platform Configuration Constants
 */

// Applications and decisions are 100% free and unlimited for all creators and brands
export const FREE_APPLICATIONS_PER_MONTH = 999999;
export const FREE_BUSINESS_DECISIONS_PER_MONTH = 999999;

// Cost in INR for extra application beyond free quota (0 - free)
export const EXTRA_APPLICATION_FEE_INR = 0;

// Verification badge fee in INR (0 - free)
export const VERIFICATION_FEE_INR = 0;

// Future Add-on: Placeholder for paid "Boost my application" option
export const FUTURE_ADDONS = {
  BOOST_APPLICATION: {
    enabled: false,
    feeINR: 49,
    description: 'Pin your pitch to the top of brand applicants list with a Highlight badge',
  },
};
