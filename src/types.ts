export type CarbonCategory = "Transport" | "Home Energy" | "Food" | "Shopping" | "Waste";

export interface UserProfile {
  name: string;
  city: string;
  country: string;
  occupation: string;
  commuteDistance: number;
  transportMode: string;
  fuelType: string;
  electricityUsage: number;
  acUsage: number;
  foodPreference: string;
  shoppingHabits: string;
  wasteHabits: string;
  level: number;
  xp: number;
  ecoPoints: number;
  completedOnboarding: boolean;
  lifetimeXp: number;
  streak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActivityDate?: string;

  // --- Extended profile fields used for carbon calculation ---
  age?: number;
  householdSize?: number;
  weeklyDistanceKm?: number;
  vehicleType?: string;
  publicTransportUsage?: string;
  renewableEnergy?: string;
  cookingFuel?: string;
  mealsOutside?: number;
  foodWaste?: string;
  shoppingFrequency?: string;
  clothingPurchases?: number;
  electronicsPurchases?: number;
  recycling?: string;
  composting?: string;
  wasteGeneration?: string;
  flightsPerYear?: number;
  waterUsage?: string;
  ecoPreferences?: string[];
}

export interface DailyRecord {
  id?: string;
  date: string; // "YYYY-MM-DD"
  carbon: number;
  savings: number;
  xp: number;
  level: number;
  streak: number;
  remainingBudget: number;
  completedHabits: string[];
  completedMissions: string[];
  timestamp: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  carbonReduction: number;
  annualSavings?: number;
  impact: "High" | "Medium" | "Low";
  difficulty: "Easy" | "Medium" | "Hard";
  category: CarbonCategory;
  cost: number;
  timeRequired: number; // in hours or abstract units
  completed?: boolean;
  xpReward?: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  xpReward: number;
  ecoPointsReward: number;
  category: CarbonCategory;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  milestoneKg?: number;
  milestoneXp?: number;
  milestoneStreak?: number;
  milestoneMissions?: number;
  type: "carbon" | "xp" | "streak" | "mission";
  unlockedAt?: string;
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  completed: boolean;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TreeEntry {
  id?: string;
  count: number;
  date: string; // "YYYY-MM-DD"
  notes?: string;
  offsetKg: number; // estimated annual CO2 offset (kg)
  createdAt?: string;
}


export interface CarbonData {
  total: number;
  budget: number;
  spent: number;
  reductionGoal: number;
  breakdown: Record<CarbonCategory, number>;
  history: { month: string; value: number }[];
}

export const INITIAL_USER: UserProfile = {
  name: "Abhishek R.",
  city: "San Francisco",
  country: "US",
  occupation: "Software Engineer",
  commuteDistance: 25,
  transportMode: "Car",
  fuelType: "Petrol",
  electricityUsage: 350,
  acUsage: 4,
  foodPreference: "Omnivore",
  shoppingHabits: "Average",
  wasteHabits: "Medium",
  level: 7,
  xp: 350,
  ecoPoints: 1250,
  completedOnboarding: false,
  lifetimeXp: 350, // initial cumulative XP
  streak: 0,
  longestStreak: 0,
  totalActiveDays: 0,
};

export const INITIAL_CARBON_DATA: CarbonData = {
  total: 210, // kg CO2e
  budget: 300,
  spent: 210,
  reductionGoal: 50,
  breakdown: {
    "Transport": 110,
    "Home Energy": 46,
    "Food": 38,
    "Shopping": 16,
    "Waste": 0,
  },
  history: [
    { month: 'Jan', value: 300 },
    { month: 'Feb', value: 280 },
    { month: 'Mar', value: 250 },
    { month: 'Apr', value: 215 },
    { month: 'May', value: 185 },
    { month: 'Jun', value: 210 },
  ],
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'ac1', title: 'Carbon Saver I', description: 'Save 50kg of CO2', badgeIcon: '🌱', milestoneKg: 50, type: 'carbon' },
  { id: 'ac2', title: 'Eco Warrior', description: 'Save 100kg of CO2', badgeIcon: '🛡️', milestoneKg: 100, type: 'carbon' },
  { id: 'ac3', title: 'Earth Protector', description: 'Save 250kg of CO2', badgeIcon: '🌍', milestoneKg: 250, type: 'carbon' },
  { id: 'xp1', title: 'Green Apprentice', description: 'Earn 1,000 Lifetime XP', badgeIcon: '🎓', milestoneXp: 1000, type: 'xp' },
  { id: 'xp2', title: 'Eco Master', description: 'Earn 5,000 Lifetime XP', badgeIcon: '👑', milestoneXp: 5000, type: 'xp' },
  { id: 'st1', title: 'Consistent Saver', description: 'Reach a 7-day streak', badgeIcon: '⚡', milestoneStreak: 7, type: 'streak' },
  { id: 'st2', title: 'Green Devotee', description: 'Reach a 30-day streak', badgeIcon: '🔥', milestoneStreak: 30, type: 'streak' },
  { id: 'ms1', title: 'Mission Accomplished', description: 'Complete 5 missions', badgeIcon: '🎯', milestoneMissions: 5, type: 'mission' },
];

export const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', title: 'Used Reusable Bag', icon: '🛍️', completed: false },
  { id: 'h2', title: 'No Food Waste', icon: '🍲', completed: false },
  { id: 'h3', title: 'Unplugged Idle Devices', icon: '🔌', completed: false },
  { id: 'h4', title: 'Used Public Transport', icon: '🚌', completed: false },
  { id: 'h5', title: 'Ate Plant-Based', icon: '🥗', completed: false },
];

// Simulator types — replaces `any` in simulator-engine.ts
export type TransportCarType = 'car_petrol' | 'car_diesel' | 'car_ev' | 'bus' | 'metro' | 'cycling' | 'walking';
export type FoodDietType = 'omnivore_daily' | 'vegetarian_daily' | 'vegan_daily' | 'pescatarian_daily';

export interface SimulationScenario {
  id: string;
  title: string;
  daysAWeek: number;
  type: 'Transport' | 'Diet' | 'Energy' | 'Shopping';
  baseReductionPerDay: number;
}

export interface ScenarioReductionResult {
  original: {
    total: number;
    breakdown: { Transport: number; Energy: number; Food: number };
    monthlyAverage: number;
  };
  simulated: {
    total: number;
    breakdown: { Transport: number; Energy: number; Food: number };
    monthlyAverage: number;
  };
}
