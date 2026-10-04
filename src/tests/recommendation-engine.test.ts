import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '../lib/recommendation-engine';
import { UserProfile } from '../types';

const baseProfile: UserProfile = {
  name: 'Test User',
  city: 'Mumbai',
  country: 'India',
  occupation: 'Student',
  transportMode: 'Car',
  fuelType: 'Petrol',
  commuteDistance: 15,
  electricityUsage: 300,
  acUsage: 5,
  foodPreference: 'Omnivore',
  shoppingHabits: 'Weekly',
  wasteHabits: 'None',
  level: 1,
  xp: 0,
  ecoPoints: 0,
  streak: 0,
  completedOnboarding: false,
};

const baseFootprint = {
  'Transport': 110,
  'Home Energy': 200,
  'Food': 210,
  'Shopping': 500,
  'Waste': 20,
};

describe('generateRecommendations — Output Shape', () => {
  it('returns an array', () => {
    const result = generateRecommendations(baseProfile, baseFootprint);
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns at least one recommendation', () => {
    const result = generateRecommendations(baseProfile, baseFootprint);
    expect(result.length).toBeGreaterThan(0);
  });

  it('every recommendation has required fields', () => {
    const result = generateRecommendations(baseProfile, baseFootprint);
    result.forEach(rec => {
      expect(rec).toHaveProperty('id');
      expect(rec).toHaveProperty('title');
      expect(rec).toHaveProperty('description');
      expect(rec).toHaveProperty('carbonReduction');
      expect(rec).toHaveProperty('impact');
      expect(rec).toHaveProperty('difficulty');
      expect(rec).toHaveProperty('category');
    });
  });

  it('carbonReduction is always a positive number', () => {
    const result = generateRecommendations(baseProfile, baseFootprint);
    result.forEach(rec => {
      expect(typeof rec.carbonReduction).toBe('number');
      expect(rec.carbonReduction).toBeGreaterThan(0);
    });
  });
});

describe('generateRecommendations — Transport Recommendations', () => {
  it('recommends public transit for car users', () => {
    const result = generateRecommendations({ ...baseProfile, transportMode: 'Car' }, baseFootprint);
    const hasTransitRec = result.some(r => r.category === 'Transport');
    expect(hasTransitRec).toBe(true);
  });

  it('recommends EV for non-electric car users', () => {
    const result = generateRecommendations({ ...baseProfile, transportMode: 'Car', fuelType: 'Petrol' }, baseFootprint);
    const hasEVRec = result.some(r => r.title.toLowerCase().includes('ev') || r.title.toLowerCase().includes('electric'));
    expect(hasEVRec).toBe(true);
  });

  it('does not recommend EV for EV users', () => {
    const result = generateRecommendations({ ...baseProfile, fuelType: 'Electric' }, baseFootprint);
    const hasEVRec = result.some(r => r.title.toLowerCase().includes('consider an ev'));
    expect(hasEVRec).toBe(false);
  });
});

describe('generateRecommendations — Energy Recommendations', () => {
  it('recommends LED bulbs for high electricity users', () => {
    const result = generateRecommendations({ ...baseProfile, electricityUsage: 300 }, baseFootprint);
    const hasLEDRec = result.some(r => r.title.toLowerCase().includes('led') || r.title.toLowerCase().includes('bulb'));
    expect(hasLEDRec).toBe(true);
  });

  it('recommends smart thermostat for high electricity users', () => {
    const result = generateRecommendations({ ...baseProfile, electricityUsage: 300 }, baseFootprint);
    const hasThermostatRec = result.some(r => r.title.toLowerCase().includes('thermostat'));
    expect(hasThermostatRec).toBe(true);
  });
});

describe('generateRecommendations — Food Recommendations', () => {
  it('recommends diet change for omnivore users', () => {
    const result = generateRecommendations({ ...baseProfile, foodPreference: 'Omnivore' }, baseFootprint);
    const hasFoodRec = result.some(r => r.category === 'Food');
    expect(hasFoodRec).toBe(true);
  });

  it('recommends vegan for vegetarian users', () => {
    const result = generateRecommendations({ ...baseProfile, foodPreference: 'Vegetarian' }, baseFootprint);
    const hasVeganRec = result.some(r => r.title.toLowerCase().includes('vegan'));
    expect(hasVeganRec).toBe(true);
  });
});

describe('generateRecommendations — Waste Recommendations', () => {
  it('recommends composting for users with no waste habits', () => {
    const result = generateRecommendations({ ...baseProfile, wasteHabits: 'None' }, baseFootprint);
    const hasWasteRec = result.some(r => r.category === 'Waste');
    expect(hasWasteRec).toBe(true);
  });
});

describe('generateRecommendations — Edge Cases', () => {
  it('always returns at least one recommendation even for ideal profile', () => {
    const idealProfile = {
      ...baseProfile,
      transportMode: 'Cycle',
      foodPreference: 'Vegan',
      shoppingHabits: 'Rarely',
      wasteHabits: 'Both',
      electricityUsage: 50,
    };
    const result = generateRecommendations(idealProfile, baseFootprint);
    expect(result.length).toBeGreaterThan(0);
  });

  it('all recommendation IDs are unique', () => {
    const result = generateRecommendations(baseProfile, baseFootprint);
    const ids = result.map(r => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('generateRecommendations — Guaranteed 6-8', () => {
  it('returns between 6 and 8 recommendations for a sparse profile', () => {
    const result = generateRecommendations(baseProfile, baseFootprint);
    expect(result.length).toBeGreaterThanOrEqual(6);
    expect(result.length).toBeLessThanOrEqual(8);
  });

  it('returns between 6 and 8 recommendations for an ideal profile', () => {
    const idealProfile = {
      ...baseProfile,
      transportMode: 'Cycle',
      foodPreference: 'Vegan',
      shoppingHabits: 'Rarely',
      wasteHabits: 'Both',
      electricityUsage: 50,
    };
    const result = generateRecommendations(idealProfile, baseFootprint);
    expect(result.length).toBeGreaterThanOrEqual(6);
    expect(result.length).toBeLessThanOrEqual(8);
  });

  it('every recommendation has a unique title', () => {
    const result = generateRecommendations(baseProfile, baseFootprint);
    const titles = result.map(r => r.title.toLowerCase());
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });
});

describe('generateRecommendations — Completed Filtering', () => {
  it('never returns an action already completed', () => {
    const result = generateRecommendations(baseProfile, baseFootprint, ['1', '2']);
    expect(result.some(r => r.id === '1' || r.id === '2')).toBe(false);
  });

  it('tops up to 6 minimum when completed actions shrink the pool', () => {
    const result = generateRecommendations(baseProfile, baseFootprint, ['1', '2', '3', '5', '6', '7', 'ev1', 'walk1', 'meat1', 'shop2', 'recycle1']);
    expect(result.length).toBeGreaterThanOrEqual(6);
    expect(result.length).toBeLessThanOrEqual(8);
  });
});