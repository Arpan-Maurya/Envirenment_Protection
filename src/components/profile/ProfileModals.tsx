import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { ChevronRight, TreePine, AlertCircle } from 'lucide-react';
import { CO2_PER_TREE } from '../../lib/utils';

const FIELD_SIZE = "w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-white";
const labelCls = "text-sm font-bold text-neutral-700 block mb-1.5";
const sectionCls = "border-b border-neutral-100 pb-5";

const ECO_PREFERENCES = [
  'Eat local & seasonal',
  'Prefer public transport',
  'Zero-waste lifestyle',
  'Renewable energy',
  'Plastic-free shopping',
  'Minimalist living',
  'Vegetarian-friendly',
  'Carpooling'
];

export function ProfileEditModal({ trigger }: { trigger: React.ReactElement }) {
  const user = useAppStore(s => s.user);
  const setUser = useAppStore(s => s.setUser);
  const updateCarbonData = useAppStore(s => s.updateCarbonData);
  const fetchRecommendations = useAppStore(s => s.fetchRecommendations);
  const fetchMissions = useAppStore(s => s.fetchMissions);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [ecoPreferences, setEcoPreferences] = useState<string[]>(user.ecoPreferences || []);

  const openModal = () => {
    const wasteHabits = (user.wasteHabits || '').toLowerCase();
    const defaultRecycling = wasteHabits === 'recycling' || wasteHabits === 'both' ? 'Yes' : (user.recycling || 'Yes');
    const defaultComposting = wasteHabits === 'composting' || wasteHabits === 'both' ? 'Yes' : (user.composting || 'No');
    setForm({
      name: user.name || '',
      city: user.city || '',
      country: user.country || 'US',
      occupation: user.occupation || '',
      age: user.age != null ? String(user.age) : '',
      householdSize: user.householdSize != null ? String(user.householdSize) : '',
      transportMode: user.transportMode || 'Car',
      weeklyDistanceKm: user.weeklyDistanceKm != null ? String(user.weeklyDistanceKm) : '',
      vehicleType: user.vehicleType || 'Sedan',
      fuelType: user.fuelType || 'Petrol',
      publicTransportUsage: user.publicTransportUsage || 'Occasionally',
      electricityUsage: user.electricityUsage != null ? String(user.electricityUsage) : '',
      acUsage: user.acUsage != null ? String(user.acUsage) : '',
      renewableEnergy: user.renewableEnergy || 'None',
      cookingFuel: user.cookingFuel || 'Gas',
      foodPreference: user.foodPreference || 'Omnivore',
      mealsOutside: user.mealsOutside != null ? String(user.mealsOutside) : '',
      foodWaste: user.foodWaste || 'Medium',
      shoppingFrequency: user.shoppingFrequency || user.shoppingHabits || 'Monthly',
      clothingPurchases: user.clothingPurchases != null ? String(user.clothingPurchases) : '',
      electronicsPurchases: user.electronicsPurchases != null ? String(user.electronicsPurchases) : '',
      recycling: defaultRecycling,
      composting: defaultComposting,
      wasteGeneration: user.wasteGeneration || 'Medium',
      flightsPerYear: user.flightsPerYear != null ? String(user.flightsPerYear) : '',
      waterUsage: user.waterUsage || 'Average',
    });
    setEcoPreferences(user.ecoPreferences || []);
    setError(null);
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toNumber = (v: string): number => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const toggleEcoPreference = (pref: string) => {
    setEcoPreferences(prev => prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const recyclingYes = form.recycling === 'Yes' || form.recycling === 'Always';
    const compostingYes = form.composting === 'Yes' || form.composting === 'Always';

    const update: Partial<typeof user> = {
      name: form.name?.trim() || user.name,
      city: form.city?.trim() || user.city,
      country: form.country || user.country,
      occupation: form.occupation?.trim() || user.occupation,
      age: toNumber(form.age),
      householdSize: toNumber(form.householdSize),
      transportMode: form.transportMode || user.transportMode,
      weeklyDistanceKm: toNumber(form.weeklyDistanceKm),
      vehicleType: form.vehicleType,
      fuelType: form.fuelType,
      publicTransportUsage: form.publicTransportUsage,
      electricityUsage: toNumber(form.electricityUsage),
      acUsage: toNumber(form.acUsage),
      renewableEnergy: form.renewableEnergy,
      cookingFuel: form.cookingFuel,
      foodPreference: form.foodPreference,
      mealsOutside: toNumber(form.mealsOutside),
      foodWaste: form.foodWaste,
      shoppingFrequency: form.shoppingFrequency,
      shoppingHabits: form.shoppingFrequency, // keep legacy field in sync
      clothingPurchases: toNumber(form.clothingPurchases),
      electronicsPurchases: toNumber(form.electronicsPurchases),
      recycling: recyclingYes ? 'Yes' : 'No',
      composting: compostingYes ? 'Yes' : 'No',
      wasteGeneration: form.wasteGeneration,
      wasteHabits: recyclingYes && compostingYes
        ? 'Both'
        : recyclingYes ? 'Recycling'
        : compostingYes ? 'Composting'
        : 'None',
      flightsPerYear: toNumber(form.flightsPerYear),
      waterUsage: form.waterUsage,
      ecoPreferences,
    };

    try {
      await setUser(update);
      // Immediately recalculate everything that depends on the profile.
      await updateCarbonData();
      await fetchRecommendations();
      await fetchMissions();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (next) openModal(); else setOpen(false); }}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-[640px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Edit Your Carbon Profile</DialogTitle>
          <p className="text-sm text-neutral-500">Changes recalculate your footprint and recommendations instantly.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className={sectionCls}>
            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3">Basic Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Full Name</label>
                <input name="name" required value={form.name || ''} onChange={handleChange} className={FIELD_SIZE} placeholder="e.g. Abhishek R." />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input name="city" required value={form.city || ''} onChange={handleChange} className={FIELD_SIZE} placeholder="e.g. San Francisco" />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <select name="country" value={form.country} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IN">India</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Occupation</label>
                <input name="occupation" value={form.occupation || ''} onChange={handleChange} className={FIELD_SIZE} placeholder="e.g. Engineer" />
              </div>
              <div>
                <label className={labelCls}>Age</label>
                <input name="age" type="number" min={0} max={120} value={form.age || ''} onChange={handleChange} className={FIELD_SIZE} placeholder="e.g. 28" />
              </div>
              <div>
                <label className={labelCls}>Household Size</label>
                <input name="householdSize" type="number" min={1} max={20} value={form.householdSize || ''} onChange={handleChange} className={FIELD_SIZE} placeholder="e.g. 4" />
              </div>
            </div>
          </div>

          {/* Transportation */}
          <div className={sectionCls}>
            <h4 className="text-sm font-black uppercase tracking-widest mb-3 text-neutral-800">Transportation</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Primary Transport</label>
                <select name="transportMode" value={form.transportMode} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="Car">Car</option>
                  <option value="Public">Public Transport</option>
                  <option value="Bus">Bus</option>
                  <option value="Metro">Metro / Train</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Walking">Walking</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Weekly Distance (km)</label>
                <input name="weeklyDistanceKm" type="number" min={0} max={500} value={form.weeklyDistanceKm || ''} onChange={handleChange} className={FIELD_SIZE} placeholder="e.g. 120" />
              </div>
              <div>
                <label className={labelCls}>Vehicle Type</label>
                <select name="vehicleType" value={form.vehicleType} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="SUV">SUV / Large Car</option>
                  <option value="Van">Van</option>
                  <option value="None">N/A</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Fuel Type</label>
                <select name="fuelType" value={form.fuelType} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                  <option value="CNG">CNG / LPG</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Public Transport Usage</label>
                <select name="publicTransportUsage" value={form.publicTransportUsage} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Occasionally">Occasionally</option>
                  <option value="Rarely">Rarely</option>
                  <option value="Never">Never</option>
                </select>
              </div>
            </div>
          </div>

          {/* Home Energy */}
          <div className={sectionCls}>
            <h4 className="text-sm font-black uppercase tracking-widest mb-2 text-neutral-800">Home Energy</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Electricity / month (kWh)</label>
                <input name="electricityUsage" type="number" min={0} max={5000} value={form.electricityUsage || ''} onChange={handleChange} className={FIELD_SIZE} placeholder="e.g. 350" />
              </div>
              <div>
                <label className={labelCls}>AC Usage (hours/day)</label>
                <input name="acUsage" type="number" min={0} max={24} value={form.acUsage || ''} onChange={handleChange} className={FIELD_SIZE} placeholder="e.g. 4" />
              </div>
              <div>
                <label className={labelCls}>Renewable Energy</label>
                <select name="renewableEnergy" value={form.renewableEnergy} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="None">None</option>
                  <option value="Partial">Partial</option>
                  <option value="Full">Fully Renewable</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Cooking Fuel</label>
                <select name="cookingFuel" value={form.cookingFuel} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="Electric">Electric</option>
                  <option value="Gas">Gas</option>
                  <option value="LPG">LPG</option>
                  <option value="Wood">Wood / Biomass</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
          </div>

          {/* Diet */}
          <div className={sectionCls}>
            <h4 className="text-sm font-black uppercase tracking-widest mb-2 text-neutral-800">Diet</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Diet Type</label>
                <select name="foodPreference" value={form.foodPreference} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="Omnivore">Omnivore</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Pescatarian">Pescatarian</option>
                  <option value="Carnivore">Carnivore</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Meals Outside (per week)</label>
                <input name="mealsOutside" type="number" min={0} max={21} value={form.mealsOutside || ''} onChange={handleChange} className={FIELD_SIZE} placeholder="e.g. 3" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Food Waste</label>
                <select name="foodWaste" value={form.foodWaste} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="Low">Low — I rarely waste food</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High — I throw away a lot</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shopping */}
          <div className={sectionCls}>
            <h4 className="text-sm font-black uppercase tracking-widest mb-2 text-neutral-800">Shopping</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Shopping Frequency</label>
                <select name="shoppingFrequency" value={form.shoppingFrequency} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="Rarely">Rarely</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Clothing Purchases (per year)</label>
                <input name="clothingPurchases" type="number" min={0} max={200} value={form.clothingPurchases || ''} onChange={handleChange} className={FIELD_SIZE} placeholder="e.g. 12" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Electronics Purchases (per year)</label>
                <input name="electronicsPurchases" type="number" min={0} max={50} value={form.electronicsPurchases || ''} onChange={handleChange} className={FIELD_SIZE} placeholder="e.g. 2" />
              </div>
            </div>
          </div>

          {/* Waste */}
          <div className={sectionCls}>
            <h4 className="text-sm font-black uppercase tracking-widest mb-2 text-neutral-800">Waste</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Recycling</label>
                <select name="recycling" value={form.recycling} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="Yes">I recycle regularly</option>
                  <option value="No">I don't recycle</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Composting</label>
                <select name="composting" value={form.composting} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="Yes">I compost</option>
                  <option value="No">I don't compost</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Waste Generation</label>
                <select name="wasteGeneration" value={form.wasteGeneration} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lifestyle */}
          <div className={sectionCls}>
            <h4 className="text-sm font-black uppercase tracking-widest mb-2 text-neutral-800">Lifestyle</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Flights (per year)</label>
                <input name="flightsPerYear" type="number" min={0} max={200} value={form.flightsPerYear || ''} onChange={handleChange} className={FIELD_SIZE} placeholder="e.g. 4" />
              </div>
              <div>
                <label className={labelCls}>Water Usage</label>
                <select name="waterUsage" value={form.waterUsage} onChange={handleChange} className={FIELD_SIZE}>
                  <option value="Low">Low</option>
                  <option value="Average">Average</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Eco Preferences */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-2 text-neutral-800">Eco Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {ECO_PREFERENCES.map(pref => {
                const active = ecoPreferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => toggleEcoPreference(pref)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      active ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary/40'
                    }`}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="font-bold">
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TreePlantModal({ trigger }: { trigger: React.ReactElement }) {
  const addTree = useAppStore(s => s.addTree);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<string>('1');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const numCount = Math.max(0, Number(count) || 0);
  const estimatedOffset = Math.round(numCount * CO2_PER_TREE * 10) / 10;

  const handleSave = async () => {
    const treeCount = Math.floor(Number(count) || 0);
    if (!treeCount || treeCount <= 0) {
      setError('Please enter a valid number of trees.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addTree(treeCount, date, notes);
      setCount('1');
      setNotes('');
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your trees. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2"><TreePine className="text-primary" /> Plant Trees</DialogTitle>
          <p className="text-sm text-neutral-500">Log how many trees you planted to grow your offset.</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Number of Trees</label>
            <input type="number" min={1} value={count} onChange={e => setCount(e.target.value)} className={FIELD_SIZE} placeholder="e.g. 3" />
          </div>
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={FIELD_SIZE} />
          </div>
          <div>
            <label className={labelCls}>Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={FIELD_SIZE} placeholder="Where did you plant them?" />
          </div>

          {estimatedOffset > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm">
              <span className="font-bold text-green-800">🌲 Estimated offset: {estimatedOffset} kg CO₂e / year</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" disabled={saving} onClick={handleSave} className="font-bold">
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function HelpSupportModal({ trigger }: { trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Help & Support</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">Need help with CarbonIQ? Reach out to us or check our resources below.</p>
          
          <div className="space-y-2">
            <div className="p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 flex justify-between items-center">
               <span className="font-medium text-sm">Frequently Asked Questions</span>
               <ChevronRight size={16} className="text-neutral-400" />
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 flex justify-between items-center">
               <span className="font-medium text-sm">Report a Bug</span>
               <ChevronRight size={16} className="text-neutral-400" />
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 flex justify-between items-center">
               <span className="font-medium text-sm">Submit Feedback</span>
               <ChevronRight size={16} className="text-neutral-400" />
            </div>
          </div>

          <div className="pt-4 border-t">
             <h4 className="font-semibold text-sm mb-1">Contact Us</h4>
             <p className="text-sm text-neutral-500">Email: support@carboniq.app</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}