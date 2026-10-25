/**
 * Hyperniche Platform Configuration Constants
 */

// Monthly free applications quota for unverified creators (1 free per month, verified creators get unlimited)
export const FREE_APPLICATIONS_PER_MONTH = 1;

// Monthly free approval/rejection decisions for unverified business owners (verified businesses get unlimited)
export const FREE_BUSINESS_DECISIONS_PER_MONTH = 1;

// Cost in INR for extra application beyond free quota
export const EXTRA_APPLICATION_FEE_INR = 9;

// Verification badge fee in INR
export const VERIFICATION_FEE_INR = 499;

// Future Add-on: Placeholder for paid "Boost my application" option
export const FUTURE_ADDONS = {
  BOOST_APPLICATION: {
    enabled: false,
    feeINR: 49,
    description: 'Pin your pitch to the top of brand applicants list with a Highlight badge',
  },
};
