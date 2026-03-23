export const BUDGET_TIERS = [
  { label: 'Under $50', midpoint: 35 },
  { label: '$50–$150', midpoint: 100 },
  { label: '$150–$300', midpoint: 225 },
  { label: '$300+', midpoint: 400 },
];

export const AGE_RANGES = ['18–24', '25–34', '35–44', '45–54', '55+'];

export const TRAVEL_STYLES = [
  'Backpacker / Budget',
  'Mid-range explorer',
  'Luxury traveller',
];

export const PACE_OPTIONS = [
  'Packed schedule',
  'Balanced mix',
  'Slow and relaxed',
];

export const INTERESTS = [
  'Food & Drink',
  'History & Culture',
  'Nature & Outdoors',
  'Nightlife',
  'Art & Museums',
  'Adventure Sports',
  'Shopping',
  'Wellness',
];

export const DIETARY_REQUIREMENTS = [
  'None',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-free',
  'Nut allergy',
];

export const CATEGORY_COLORS = {
  culture: 'var(--color-category-culture)',
  food: 'var(--color-category-food)',
  nature: 'var(--color-category-nature)',
  nightlife: 'var(--color-category-nightlife)',
  adventure: 'var(--color-category-adventure)',
  wellness: 'var(--color-category-wellness)',
  shopping: 'var(--color-category-shopping)',
  transport: 'var(--color-category-transport)',
};

export const CATEGORY_BG_CLASSES = {
  culture: 'bg-[var(--color-category-culture)]',
  food: 'bg-[var(--color-category-food)]',
  nature: 'bg-[var(--color-category-nature)]',
  nightlife: 'bg-[var(--color-category-nightlife)]',
  adventure: 'bg-[var(--color-category-adventure)]',
  wellness: 'bg-[var(--color-category-wellness)]',
  shopping: 'bg-[var(--color-category-shopping)]',
  transport: 'bg-[var(--color-category-transport)]',
};

export const CATEGORY_BORDER_CLASSES = {
  culture: 'border-l-[var(--color-category-culture)]',
  food: 'border-l-[var(--color-category-food)]',
  nature: 'border-l-[var(--color-category-nature)]',
  nightlife: 'border-l-[var(--color-category-nightlife)]',
  adventure: 'border-l-[var(--color-category-adventure)]',
  wellness: 'border-l-[var(--color-category-wellness)]',
  shopping: 'border-l-[var(--color-category-shopping)]',
  transport: 'border-l-[var(--color-category-transport)]',
};

export const AGENT_KEYS = [
  'localTips',
  'foodDining',
  'budget',
  'itinerary',
  'orchestrator',
];

export const AGENT_LABELS = {
  localTips: 'Local Tips',
  foodDining: 'Food & Dining',
  budget: 'Budget Planner',
  itinerary: 'Itinerary',
  orchestrator: 'Trip Brief',
};

export const MAX_TRIP_DAYS = 28;
export const MIN_TRIP_DAYS = 1;
