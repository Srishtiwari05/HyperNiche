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
    'Fashion': '/images/categories/fashion.jpg',
    'Beauty': '/images/categories/beauty.jpg',
    'Tech': '/images/categories/tech.jpg',
    'Food': '/images/categories/food.jpg',
    'Fitness': '/images/categories/fitness.jpg',
    'Gaming': '/images/categories/gaming.jpg',
    'Travel': '/images/categories/travel.jpg',
    'Lifestyle': '/images/categories/lifestyle.jpg',
    'Music': '/images/categories/music.jpg',
    'Education': '/images/categories/education.jpg',
    'Pets': '/images/categories/pets.jpg',
    'Home & Decor': '/images/categories/home-decor.jpg',
    'Cars & Bikes': '/images/categories/cars-bikes.jpg',
    'Parenting': '/images/categories/parenting.jpg',
    'Finance': '/images/categories/finance.jpg',
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
