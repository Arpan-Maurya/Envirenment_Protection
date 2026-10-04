import { UserProfile, CarbonCategory } from "../types";
import { EMISSION_FACTORS, GRID_FACTORS } from "./emission-factors";

/** Monthly CO2 saving attributed to each completed daily habit (kg CO2e). */
export const HABIT_MONTHLY_SAVINGS_KG = 10;

/**
 * Applies real, deterministic savings to a monthly footprint.
 * - Completed habits reduce today's emissions by HABIT_MONTHLY_SAVINGS_KG each.
 * - Completed recurring actions permanently reduce monthly emissions by their carbonReduction value.
 * Never returns a negative footprint.
 */
export function applyMonthlySavings(
  baseMonthlyCarbon: number,
  completedHabits: number,
  actionSavingsMonthly: number
): number {
  const habitReduction = Math.max(0, completedHabits) * HABIT_MONTHLY_SAVINGS_KG;
  const totalReduction = habitReduction + Math.max(0, actionSavingsMonthly);
  return Math.max(0, Math.round(baseMonthlyCarbon - totalReduction));
}

export function calculateFootprint(profile: UserProfile): Record<CarbonCategory, number> {
  const { transport, energy, food: foodFactors, shopping: shoppingFactors } = EMISSION_FACTORS;

  // Transport Calculation
  let transportEmissions = 0;
  // Prefer an explicit weekly distance; otherwise fall back to the daily commute distance.
  const hasDailyCommute = Number(profile.commuteDistance) > 0;
  const monthlyDistance = hasDailyCommute
    ? (profile.commuteDistance || 0) * 22 // 22 working days average
    : (profile.weeklyDistanceKm || 0) * 4.33;
  const mode = (profile.transportMode || "").trim().toLowerCase();

  if (mode === "car" || mode === "motorcycle") {
    let factor = mode === "motorcycle" ? transport.bus : transport.car_petrol;
    if (mode === "car") {
      const fuel = (profile.fuelType || "").trim().toLowerCase();
      if (fuel === "diesel") factor = transport.car_diesel;
      else if (fuel === "electric" || fuel === "ev") factor = transport.car_ev;
      else if (fuel === "hybrid") factor = (transport.car_petrol + transport.car_ev) / 2;
      else if (fuel === "cng" || fuel === "lpg") factor = transport.car_petrol * 0.85;
      if (profile.vehicleType && profile.vehicleType.toLowerCase() === 'suv') {
        factor = factor * 1.2;
      }
    }
    transportEmissions = monthlyDistance * factor;
  } else if (mode === "bus") {
    transportEmissions = monthlyDistance * transport.bus;
  } else if (mode === "metro") {
    transportEmissions = monthlyDistance * transport.metro;
  } else if (mode === "public transport" || mode === "public") {
    transportEmissions = monthlyDistance * ((transport.bus + transport.metro) / 2);
  } else if (mode === "bike" || mode === "cycle" || mode === "bicycle") {
    transportEmissions = monthlyDistance * transport.cycling;
  } else if (mode === "walk" || mode === "walking") {
    transportEmissions = monthlyDistance * transport.walking;
  }

  // Public transport usage reduces the transport footprint for drivers.
  const transitUsage = (profile.publicTransportUsage || "").trim().toLowerCase();
  if (transitUsage === "daily") transportEmissions *= 0.8;
  else if (transitUsage === "weekly") transportEmissions *= 0.9;
  else if (transitUsage === "sometimes" || transitUsage === "occasionally") transportEmissions *= 0.95;

  // Flights add a one-off transport emission spread across the year.
  const flightsPerYear = Number(profile.flightsPerYear) || 0;
  if (flightsPerYear > 0) {
    // ~92 kg CO2e per short-haul flight (~450km), folded into the monthly total.
    transportEmissions += (flightsPerYear * 92) / 12;
  }

  // Energy Calculation with Regional Electricity Grid Factor
  const gridFactor = GRID_FACTORS[profile.country || ""] || GRID_FACTORS.default;
  let electricityEmissions = (profile.electricityUsage || 0) * gridFactor;

  // Renewable energy reduces the grid electricity footprint.
  const renewable = (profile.renewableEnergy || "").trim().toLowerCase();
  if (renewable === "full") electricityEmissions *= 0.35;
  else if (renewable === "partial") electricityEmissions *= 0.8;

  const acEmissions = (profile.acUsage || 0) * 30 * energy.ac_hourly;
  let homeEnergyEmissions = electricityEmissions + acEmissions;

  // Cooking fuel adds a small energy footprint.
  const cookingFuel = (profile.cookingFuel || "").trim().toLowerCase();
  if (cookingFuel === "gas" || cookingFuel === "lpg") homeEnergyEmissions += 18;
  else if (cookingFuel === "electric") homeEnergyEmissions += 12;
  else if (cookingFuel === "wood" || cookingFuel === "biomass") homeEnergyEmissions += 24;

  // Water usage implies additional pumping/heating energy.
  const waterUsage = (profile.waterUsage || "").trim().toLowerCase();
  if (waterUsage === "high") homeEnergyEmissions *= 1.12;
  else if (waterUsage === "low") homeEnergyEmissions *= 0.92;

  // Food Calculation
  const foodPref = (profile.foodPreference || "").trim().toLowerCase();
  let foodEmissions = 30 * foodFactors.omnivore_daily;
  if (foodPref === "vegan") foodEmissions = 30 * foodFactors.vegan_daily;
  else if (foodPref === "vegetarian") foodEmissions = 30 * foodFactors.vegetarian_daily;
  else if (foodPref === "pescatarian") foodEmissions = 30 * foodFactors.pescatarian_daily;
  else if (foodPref === "carnivore") foodEmissions = 30 * (foodFactors.omnivore_daily * 1.5);

  // Meals eaten outside add packaging + preparation emissions.
  const mealsOutside = Number(profile.mealsOutside) || 0;
  if (mealsOutside > 0) foodEmissions += mealsOutside * 4 * 0.8;

  // Food waste multiplies the food footprint.
  const foodWaste = (profile.foodWaste || "").trim().toLowerCase();
  if (foodWaste === "high") foodEmissions *= 1.15;
  else if (foodWaste === "low") foodEmissions *= 0.85;

  // Shopping Calculation
  const shopHabit = (profile.shoppingFrequency || profile.shoppingHabits || "").trim().toLowerCase();
  let shoppingEmissions = shoppingFactors.average;
  if (shopHabit === "weekly" || shopHabit === "daily") shoppingEmissions = shoppingFactors.high;
  else if (shopHabit === "monthly") shoppingEmissions = shoppingFactors.average;
  else if (shopHabit === "rarely" || shopHabit === "never") shoppingEmissions = shoppingFactors.low;

  // Clothing & electronics purchases spread across the year.
  const clothingPurchases = Number(profile.clothingPurchases) || 0;
  shoppingEmissions += (clothingPurchases * 15) / 12;
  const electronicsPurchases = Number(profile.electronicsPurchases) || 0;
  shoppingEmissions += (electronicsPurchases * 70) / 12;

  // Waste Calculation
  const wasteHabit = (profile.wasteHabits || "").trim().toLowerCase();
  let wasteEmissions = 15; // Average kg CO2e per month from waste
  if (wasteHabit === "none") wasteEmissions = 20; // No recycling/compost
  else if (wasteHabit === "recycling") wasteEmissions = 10;
  else if (wasteHabit === "composting") wasteEmissions = 5;
  else if (wasteHabit === "both") wasteEmissions = 2;

  // Fine-grained waste controls.
  const recycling = (profile.recycling || "").trim().toLowerCase();
  const composting = (profile.composting || "").trim().toLowerCase();
  const wasteGeneration = (profile.wasteGeneration || "").trim().toLowerCase();
  if (recycling === "no" || recycling === "never") wasteEmissions *= 1.2;
  else if (recycling === "yes" || recycling === "always") wasteEmissions *= 0.8;
  if (composting === "yes" || composting === "always") wasteEmissions *= 0.8;
  if (wasteGeneration === "high") wasteEmissions *= 1.3;
  else if (wasteGeneration === "low") wasteEmissions *= 0.7;

  return {
    "Transport": transportEmissions,
    "Home Energy": homeEnergyEmissions,
    "Food": foodEmissions,
    "Shopping": shoppingEmissions,
    "Waste": wasteEmissions
  };
}
