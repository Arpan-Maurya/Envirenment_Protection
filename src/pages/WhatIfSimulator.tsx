import { useState, useMemo } from "react";
import { useAppStore } from "../store";
import { Card, CardContent } from "../components/ui/card";
import { ChevronLeft, Edit2, Train, Sparkles, TrendingDown, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { safeDivide } from '../lib/utils';
import { MIN_DAYS_PER_WEEK, MAX_DAYS_PER_WEEK, WEEKS_PER_MONTH } from '../lib/constants';

interface Scenario {
  id: string;
  title: string;
  daysAWeek: number;
  type: 'Transport' | 'Diet' | 'Energy' | 'Shopping';
  baseReductionPerDay: number;
}

const SCENARIO_TEMPLATES = [
  { type: 'Transport', title: 'Public Transport', baseReductionPerDay: 4.5 },
  { type: 'Transport', title: 'Bicycle commute', baseReductionPerDay: 6.0 },
  { type: 'Diet', title: 'Vegetarian Diet', baseReductionPerDay: 3.2 },
  { type: 'Diet', title: 'Vegan Diet', baseReductionPerDay: 4.5 },
  { type: 'Energy', title: 'Reduce Electricity', baseReductionPerDay: 2.0 },
  { type: 'Shopping', title: 'Reduce Shopping', baseReductionPerDay: 5.0 },
];

export function WhatIfSimulator() {
  const carbonData = useAppStore(s => s.carbonData);
  const navigate = useNavigate();
  const [simulationActive, setSimulationActive] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: '1', title: 'Switch to Metro', daysAWeek: 3, type: 'Transport', baseReductionPerDay: 4.5 }
  ]);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);

  const currentFootprint = carbonData.total || 210;
  
  const reductionValue = useMemo(
    () =>
      Math.round(
        scenarios.reduce((sum, s) => {
          const days = Math.max(MIN_DAYS_PER_WEEK, Math.min(MAX_DAYS_PER_WEEK, s.daysAWeek || 1));
          const reduction = Math.max(0, s.baseReductionPerDay || 0);
          return sum + reduction * days * WEEKS_PER_MONTH;
        }, 0)
      ),
    [scenarios]
  );

  const newFootprint = useMemo(
    () => Math.max(0, currentFootprint - reductionValue),
    [currentFootprint, reductionValue]
  );

  const reductionPercent = useMemo(
    () => Math.round(safeDivide(reductionValue, currentFootprint) * 100),
    [reductionValue, currentFootprint]
  );

  const handleRunSimulation = async () => {
    setIsCalculating(true);
    
    // Attempt to save to firebase
    if (auth.currentUser) {
      try {
        const simsRef = collection(db, `users/${auth.currentUser.uid}/simulations`);
        await addDoc(simsRef, {
          scenarios,
          currentFootprint,
          newFootprint,
          reductionValue,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${auth.currentUser.uid}/simulations`);
      }
    }

    setTimeout(() => {
      setSimulationActive(true);
      setIsCalculating(false);
    }, 1200);
  };

  const handleAddScenario = () => {
    const newScen: Scenario = {
      id: Date.now().toString(),
      title: 'New Scenario',
      daysAWeek: 1,
      type: 'Diet',
      baseReductionPerDay: 3.2
    };
    setEditingScenario(newScen);
    setEditModalOpen(true);
    setSimulationActive(false);
  };

  const handleSaveScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingScenario) {
      const clampedDays = Math.max(1, Math.min(7, editingScenario.daysAWeek || 1));
      const scenarioToSave = { ...editingScenario, daysAWeek: clampedDays };
      const idx = scenarios.findIndex(s => s.id === scenarioToSave.id);
      if (idx !== -1) {
        const newScenarios = [...scenarios];
        newScenarios[idx] = scenarioToSave;
        setScenarios(newScenarios);
      } else {
        setScenarios([...scenarios, scenarioToSave]);
      }
    }
    setEditModalOpen(false);
    setSimulationActive(false);
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
    setSimulationActive(false);
  };

  return (
    <div className="max-w-md mx-auto h-full bg-neutral-50/30 lg:max-w-3xl min-h-screen pb-10">
      {/* Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-transparent z-10">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="p-2 -ml-2 hover:bg-white rounded-full transition-colors shadow-sm">
          <ChevronLeft size={24} className="text-neutral-900" />
        </button>
        <h1 className="font-bold text-neutral-900 text-lg">What-If Simulator</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Current Footprint Display */}
        <section>
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 px-1">Current Footprint</div>
          <div className="flex items-baseline space-x-2 px-1">
             <h2 className="text-3xl font-black text-neutral-900">{currentFootprint}</h2>
             <span className="text-sm font-bold text-neutral-500">kg CO₂e / month</span>
          </div>
        </section>

        {/* Simulation Scenario */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Simulations</div>
            <button onClick={handleAddScenario} className="text-xs font-bold text-primary flex items-center bg-green-50 px-2 py-1 rounded-full"><Plus size={14} className="mr-1"/> Add</button>
          </div>
          
          <div className="space-y-3">
            {scenarios.map(scenario => (
              <Card key={scenario.id} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                      <Train size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">{scenario.title}</h4>
                      <p className="text-xs text-neutral-500 font-medium">{scenario.daysAWeek} days a week</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingScenario(scenario); setEditModalOpen(true); }} className="text-neutral-400 hover:text-primary" aria-label={`Edit scenario: ${scenario.title}`}>
                      <Edit2 size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeScenario(scenario.id)} className="text-neutral-400 hover:text-red-500" aria-label={`Remove scenario: ${scenario.title}`}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {scenarios.length === 0 && (
              <div className="text-center p-6 bg-white rounded-3xl text-neutral-400 text-sm border-2 border-dashed">
                No scenarios added. Click "+ Add" to create one.
              </div>
            )}
          </div>
        </section>

        {/* Impact Analysis */}
        <AnimatePresence>
          {simulationActive && scenarios.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">Impact</div>
              
              <Card className="border-none shadow-md rounded-3xl p-6 space-y-6 bg-white relative overflow-hidden">
                {/* Decorative Earth Background Icon */}
                <div className="absolute right-0 bottom-0 text-7xl translate-y-4 translate-x-4 opacity-5 pointer-events-none">🌍</div>
                
                <div>
                   <p className="text-xs font-bold text-neutral-500 uppercase mb-2">New Footprint</p>
                   <div className="flex items-baseline space-x-2">
                     <h2 className="text-4xl font-black text-neutral-900">{newFootprint}</h2>
                     <span className="text-sm font-bold text-neutral-500">kg CO₂e / month</span>
                   </div>
                </div>

                <div className="flex justify-between items-end border-t border-neutral-100 pt-6">
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Reduction</p>
                    <div className="flex items-center text-green-600 space-x-1 font-black">
                       <TrendingDown size={18} />
                       <span className="text-xl">{reductionValue} kg CO₂e ({reductionPercent}%)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-2xl p-4 flex items-center space-x-3 text-green-900 border border-green-100/50">
                   <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl shrink-0">🍀</div>
                   <div>
                     <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">You will save</p>
                     <p className="text-sm font-black">{reductionValue * 12} kg CO₂e / year</p>
                   </div>
                </div>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="pt-6">
           <Button 
            onClick={handleRunSimulation}
            disabled={isCalculating || scenarios.length === 0}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-xl shadow-primary/20 flex items-center justify-center space-x-2"
           >
             {isCalculating ? (
               <div className="flex items-center space-x-2">
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 <span>Running Simulation...</span>
               </div>
             ) : (
               <>
                 <Sparkles size={18} />
                 <span>{simulationActive ? "Recalculate Simulation" : "Run Simulation"}</span>
               </>
             )}
           </Button>
        </div>

      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md bg-white p-6">
          <DialogHeader>
            <DialogTitle>Edit Scenario</DialogTitle>
          </DialogHeader>
          {editingScenario && (
            <form onSubmit={handleSaveScenario} className="space-y-4">
               <div>
                  <label htmlFor="scenario-template" className="text-sm font-bold text-neutral-700 mb-1 block">Scenario Template</label>
                  <select 
                    id="scenario-template"
                    aria-label="Select scenario template"
                    className="w-full p-2 border rounded-xl"
                    value={editingScenario.title}
                    onChange={(e) => {
                       const tmpl = SCENARIO_TEMPLATES.find(t => t.title === e.target.value);
                       if (tmpl) {
                          setEditingScenario({ ...editingScenario, title: tmpl.title, type: tmpl.type as "Transport" | "Diet" | "Energy" | "Shopping", baseReductionPerDay: tmpl.baseReductionPerDay });
                       }
                    }}
                  >
                    {SCENARIO_TEMPLATES.map(t => <option key={t.title} value={t.title}>{t.title}</option>)}
                  </select>
               </div>
               <div>
                 <label htmlFor="days-per-week" className="text-sm font-bold text-neutral-700 mb-1 block">Days a Week (1 - 7)</label>
                 <input 
                   id="days-per-week"
                   type="number" min="1" max="7" 
                   aria-describedby={editingScenario.daysAWeek < 1 || editingScenario.daysAWeek > 7 ? "days-error" : undefined}
                   value={editingScenario.daysAWeek} 
                   onChange={(e) => {
                     const val = parseInt(e.target.value);
                     setEditingScenario({ ...editingScenario, daysAWeek: isNaN(val) ? 1 : val });
                   }}
                   className="w-full p-2 border rounded-xl"
                 />
                 {(editingScenario.daysAWeek < 1 || editingScenario.daysAWeek > 7) && (
                   <p id="days-error" className="text-xs text-red-500 mt-1 font-semibold" role="alert">Value must be between 1 and 7 (will clamp on save).</p>
                 )}
               </div>
               <Button type="submit" className="w-full h-12 font-bold rounded-xl">Save Scenario</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
