import { ActionItem, UserProfile, CarbonCategory } from "../types";

/** High-impact fallback actions used to top up the recommendation list
 *  when fewer than six personalized actions are generated. Ordered by
 *  descending carbon impact. */
const FALLBACK_POOL: Omit<ActionItem, 'completed'>[] = [
  { id: 'fill-1', title: 'Use Public Transit', description: 'Replace private car trips with bus or metro', carbonReduction: 35, impact: 'High', difficulty: 'Medium', category: 'Transport', cost: 0, timeRequired: 0, xpReward: 20 },
  { id: 'fill-2', title: 'Eat More Plant-Based Meals', description: 'Choose plant-based options to cut food emissions', carbonReduction: 30, impact: 'High', difficulty: 'Medium', category: 'Food', cost: 0, timeRequired: 0, xpReward: 25 },
  { id: 'fill-3', title: 'Unplug Idle Devices', description: 'Disconnect electronics when they are not in use', carbonReduction: 12, impact: 'Medium', difficulty: 'Easy', category: 'Home Energy', cost: 0, timeRequired: 0, xpReward: 10 },
  { id: 'fill-4', title: 'Save Water at Home', description: 'Shorter showers and lower-flow fixtures', carbonReduction: 10, impact: 'Medium', difficulty: 'Easy', category: 'Home Energy', cost: 0, timeRequired: 0, xpReward: 10 },
  { id: 'fill-5', title: 'Buy Second-Hand Goods', description: 'Prefer used or refurbished items', carbonReduction: 25, impact: 'High', difficulty: 'Easy', category: 'Shopping', cost: 0, timeRequired: 0, xpReward: 18 },
  { id: 'fill-6', title: 'Start Recycling', description: 'Sort and recycle paper, plastic and metals', carbonReduction: 8, impact: 'Medium', difficulty: 'Easy', category: 'Waste', cost: 0, timeRequired: 1, xpReward: 8 },
  { id: 'fill-7', title: 'Carry a Reusable Bottle', description: 'Skip single-use plastic bottles every day', carbonReduction: 5, impact: 'Low', difficulty: 'Easy', category: 'Food', cost: 0, timeRequired: 0, xpReward: 5 },
  { id: 'fill-8', title: 'Walk Short Distances', description: 'Swap short car trips for walking', carbonReduction: 12, impact: 'Medium', difficulty: 'Easy', category: 'Transport', cost: 0, timeRequired: 0, xpReward: 12 },
  { id: 'fill-9', title: 'Shop Less & Buy Mindfully', description: 'Buy only what you really need', carbonReduction: 15, impact: 'Medium', difficulty: 'Medium', category: 'Shopping', cost: 0, timeRequired: 0, xpReward: 12 },
];

function titleKey(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Generates personalized recommendations for the signed-in user.
 *
 * Guarantees:
 * - Returns between 6 and 8 recommendations.
 * - Recommendations are derived from the user's carbon profile.
 * - Duplicate titles/IDs are never emitted.
 * - Actions the user has already completed are never proposed again.
 * - When fewer than six personalized actions match the profile, the list
 *   is topped up with the next highest-impact fallback actions.
 */
export function generateRecommendations(
  profile: UserProfile,
  _currentFootprint: Record<CarbonCategory, number>,
  completedIds: string[] = []
): ActionItem[] {
  const completed = new Set(completedIds || []);
  const usedIds = new Set<string>();
  const usedTitles = new Set<string>();
  const candidates: ActionItem[] = [];

  const tryAdd = (action: ActionItem) => {
    const key = titleKey(action.title);
    if (usedIds.has(action.id)) return;
    if (completed.has(action.id)) return;
    if (usedTitles.has(key)) return;
    usedIds.add(action.id);
    usedTitles.add(key);
    candidates.push(action);
  };

  const transportMode = (profile.transportMode || '').toLowerCase();
  const commuteKm = Number(profile.commuteDistance) || 0;

  // --- Transport ---
  if (transportMode === 'car' || transportMode === 'motorcycle') {
    tryAdd({
      id: '1', title: 'Switch to Public Transit', description: 'Replace your car commute with metro or bus',
      carbonReduction: 35, impact: 'High', difficulty: 'Medium', category: 'Transport',
      cost: 0, timeRequired: 0, xpReward: 20,
    });
    if ((profile.fuelType || '').toLowerCase() !== 'electric') {
      tryAdd({
        id: 'ev1', title: 'Switch to an EV', description: 'Switch to an electric vehicle to cut commute emissions',
        carbonReduction: 120, impact: 'High', difficulty: 'Hard', category: 'Transport',
        cost: 30000, timeRequired: 0, xpReward: 40,
      });
    }
    if (commuteKm > 0 && commuteKm < 8) {
      tryAdd({
        id: 'walk1', title: 'Walk Instead of Drive', description: 'Short trips under 8km are easy to walk or cycle',
        carbonReduction: 12, impact: 'Medium', difficulty: 'Easy', category: 'Transport',
        cost: 0, timeRequired: 0, xpReward: 15,
      });
    }
  } else if (transportMode === 'public transport' || transportMode === 'public' || transportMode === 'bus' || transportMode === 'metro') {
    tryAdd({
      id: 'pt1', title: 'Use Public Transport', description: 'Keep riding public transit to maximise savings',
      carbonReduction: 10, impact: 'Medium', difficulty: 'Easy', category: 'Transport',
      cost: 0, timeRequired: 0, xpReward: 12,
    });
  }

  // --- Home energy ---
  if ((profile.electricityUsage || 0) > 200) {
    tryAdd({
      id: '2', title: 'Switch to LED Bulbs', description: 'Replace all bulbs with LEDs',
      carbonReduction: 30, impact: 'Medium', difficulty: 'Easy', category: 'Home Energy',
      cost: 50, timeRequired: 2, xpReward: 15,
    });
    tryAdd({
      id: '5', title: 'Install a Smart Thermostat', description: 'Optimise heating and cooling automatically',
      carbonReduction: 25, impact: 'Medium', difficulty: 'Medium', category: 'Home Energy',
      cost: 150, timeRequired: 1, xpReward: 20,
    });
    tryAdd({
      id: 'lights1', title: 'Turn Off Lights', description: 'Switch off lights when leaving a room',
      carbonReduction: 8, impact: 'Low', difficulty: 'Easy', category: 'Home Energy',
      cost: 0, timeRequired: 0, xpReward: 10,
    });
  }

  if ((profile.acUsage || 0) > 6) {
    tryAdd({
      id: 'ac1', title: 'Reduce AC Usage', description: 'Set AC a few degrees higher and rely on fans first',
      carbonReduction: 12, impact: 'Medium', difficulty: 'Medium', category: 'Home Energy',
      cost: 0, timeRequired: 0, xpReward: 15,
    });
  }

  if ((profile.renewableEnergy || '').toLowerCase() !== 'full') {
    tryAdd({
      id: 'solar1', title: 'Shift to Renewable Energy', description: 'Enroll in a green energy or solar tariff',
      carbonReduction: 30, impact: 'High', difficulty: 'Hard', category: 'Home Energy',
      cost: 1000, timeRequired: 2, xpReward: 25,
    });
  }

  // --- Diet ---
  const foodPref = (profile.foodPreference || '').toLowerCase();
  if (foodPref === 'omnivore' || foodPref === 'carnivore') {
    tryAdd({
      id: '3', title: 'Switch to a Plant-Based Diet', description: 'Reduce meat and dairy 5 days a week',
      carbonReduction: 40, impact: 'High', difficulty: 'Medium', category: 'Food',
      cost: 0, timeRequired: 0, xpReward: 30,
    });
    tryAdd({
      id: 'meat1', title: 'Reduce Meat Consumption', description: 'Swap one meat meal for a plant-based one daily',
      carbonReduction: 12, impact: 'Medium', difficulty: 'Easy', category: 'Food',
      cost: 0, timeRequired: 0, xpReward: 15,
    });
  } else if (foodPref === 'vegetarian') {
    tryAdd({
      id: '3', title: 'Go Fully Vegan', description: 'Eliminate all animal products from your diet',
      carbonReduction: 20, impact: 'Medium', difficulty: 'Hard', category: 'Food',
      cost: 0, timeRequired: 0, xpReward: 20,
    });
  }

  if ((profile.mealsOutside || 0) > 2 || (profile.foodWaste || '').toLowerCase() === 'high') {
    tryAdd({
      id: 'delivery1', title: 'Avoid Food Delivery', description: 'Cook at home to reduce packaging and delivery emissions',
      carbonReduction: 16, impact: 'Medium', difficulty: 'Medium', category: 'Food',
      cost: 0, timeRequired: 0, xpReward: 15,
    });
  }

  // --- Water ---
  if ((profile.waterUsage || '').toLowerCase() === 'high') {
    tryAdd({
      id: 'water1', title: 'Save Water', description: 'Shorter showers and low-flow fixtures cut water heating energy',
      carbonReduction: 10, impact: 'Low', difficulty: 'Easy', category: 'Home Energy',
      cost: 0, timeRequired: 0, xpReward: 10,
    });
  }

  // --- Shopping ---
  const shopHabit = (profile.shoppingFrequency || profile.shoppingHabits || '').toLowerCase();
  if (shopHabit === 'weekly' || shopHabit === 'daily' || (profile.electronicsPurchases || 0) > 4) {
    tryAdd({
      id: '6', title: 'Shop Second-Hand', description: 'Buy used or refurbished items instead of new',
      carbonReduction: 25, impact: 'Medium', difficulty: 'Easy', category: 'Shopping',
      cost: 0, timeRequired: 0, xpReward: 20,
    });
    tryAdd({
      id: 'shop2', title: 'Reduce Shopping', description: 'Commit to a buy-less month for non-essentials',
      carbonReduction: 18, impact: 'Medium', difficulty: 'Medium', category: 'Shopping',
      cost: 0, timeRequired: 0, xpReward: 15,
    });
  }

  // --- Waste & recycling ---
  const wasteHabit = (profile.wasteHabits || '').toLowerCase();
  if (wasteHabit === 'none' || wasteHabit === 'recycling') {
    tryAdd({
      id: '7', title: 'Start Composting', description: 'Compost organic food waste at home',
      carbonReduction: 10, impact: 'Low', difficulty: 'Medium', category: 'Waste',
      cost: 20, timeRequired: 2, xpReward: 12,
    });
  }
  if ((profile.recycling || '').toLowerCase() !== 'always' && profile.recycling !== undefined) {
    tryAdd({
      id: 'recycle1', title: 'Recycle Plastic', description: 'Rinse and sort recyclable plastics',
      carbonReduction: 6, impact: 'Low', difficulty: 'Easy', category: 'Waste',
      cost: 0, timeRequired: 1, xpReward: 8,
    });
  }

  // --- Top up with highest-impact actions when short of 6 ---
  if (candidates.length < 6) {
    for (const fallback of FALLBACK_POOL) {
      if (candidates.length >= 8) break;
      tryAdd({ ...fallback, completed: false });
    }
  }

  // --- Select 6-8 recommendations with category diversity ---
  const ordered = [...candidates].sort((a, b) => b.carbonReduction - a.carbonReduction);
  const seenCategories = new Set<string>();
  const result: ActionItem[] = [];
  // One recommendation per category first (keeps every section represented).
  for (const action of ordered) {
    if (result.length >= 8) break;
    if (!seenCategories.has(action.category)) {
      seenCategories.add(action.category);
      result.push(action);
    }
  }
  // Then fill remaining slots with the next highest-impact actions.
  for (const action of ordered) {
    if (result.length >= 8) break;
    if (result.some(r => r.id === action.id)) continue;
    result.push(action);
  }

  return result;
}