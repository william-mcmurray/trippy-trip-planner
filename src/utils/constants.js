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

export const CATEGORY_STYLES = {
  culture:       { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-l-blue-500' },
  food:          { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-l-orange-500' },
  nature:        { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-l-green-500' },
  nightlife:     { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-l-purple-500' },
  adventure:     { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-l-red-500' },
  wellness:      { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-l-teal-500' },
  relaxation:    { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-l-teal-500' },
  shopping:      { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-l-yellow-500' },
  transport:     { bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-l-gray-400' },
  accommodation: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-l-indigo-500' },
  other:         { bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-l-gray-400' },
};

// CSS variable references for category colors (used outside Tailwind contexts)
export const CATEGORY_COLORS = Object.fromEntries(
  Object.keys(CATEGORY_STYLES).map((key) => [key, `var(--color-category-${key})`]),
);

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
