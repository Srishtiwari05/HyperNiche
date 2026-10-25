/**
 * Hyperniche Platform Site Images Configuration
 * 
 * Put all site image paths in this config with empty values by default.
 * When a value is empty (""), the UI renders the clean typographic / icon design.
 * When a value is filled with an image URL or path, the image displays automatically
 * with object-fit: cover, rounded corners, lazy loading, and appropriate alt text.
 */

export interface SiteImagesConfig {
  hero: {
    business: string;
    creator: string;
    general: string;
  };
  categories: Record<string, string>;
  howItWorks: {
    step1: string;
    step2: string;
    step3: string;
  };
  setupBackgrounds: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
}

export const SITE_IMAGES: SiteImagesConfig = {
  hero: {
    business: '',
    creator: '',
    general: '',
  },
  categories: {
    'Fashion': '',
    'Beauty': '',
    'Tech': '',
    'Food': '',
    'Fitness': '',
    'Gaming': '',
    'Travel': '',
    'Lifestyle': '',
    'Anime': '',
    'Music': '',
    'Education': '',
    'Pets': '',
    'Home & Decor': '',
    'Cars & Bikes': '',
    'Parenting': '',
    'Finance': '',
  },
  howItWorks: {
    step1: '',
    step2: '',
    step3: '',
  },
  setupBackgrounds: {
    step1: '',
    step2: '',
    step3: '',
    step4: '',
  },
};

export default SITE_IMAGES;
