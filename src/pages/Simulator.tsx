import { useState } from "react";
import { useAppStore } from "../store";
import { Card, CardContent, CardHeader, CardTitle, } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Leaf, Calculator, Car, Zap, Utensils, Info } from "lucide-react";
import { calculateAnnualFootprint, LifestyleData } from "../lib/simulator-engine";
import { AnimatePresence } from "motion/react";

export function Simulator() {
  const carbonData = useAppStore(s => s.carbonData);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<LifestyleData>({
    transport: {
      carKmPerWeek: 0,
      carType: 'car_petrol',
      publicTransportKmPerWeek: 0,
      flightsPerHourPerYear: 0,
    },
    energy: {
      electricityKwhPerMonth: 0,
      acHoursPerDay: 0,
    },
    diet: {
      type: 'omnivore_daily',
    }
  });

  const [results, setResults] = useState<ReturnType<typeof calculateAnnualFootprint> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = () => {
    setIsLoading(true);
    setTimeout(() => {
      const calculation = calculateAnnualFootprint(formData);
      setResults(calculation);
      setIsLoading(false);
      setStep(1); // Results view
    }, 800);
  };

  const updateTransport = (field: keyof LifestyleData['transport'], value: unknown) => {
    setFormData(prev => ({
      ...prev,
      transport: { ...prev.transport, [field]: value }
    }));
  };

  const updateEnergy = (field: keyof LifestyleData['energy'], value: unknown) => {
    setFormData(prev => ({
      ...prev,
      energy: { ...prev.energy, [field]: value }
    }));
  };

  if (step === 1 && results) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 tracking-tight">Your Estimation Results</h1>
          <Button variant="ghost" onClick={() => setStep(0)} className="text-neutral-500 font-bold">
            Back to Form
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-0 shadow-sm rounded-3xl overflow-hidden bg-neutral-900 text-white">
            <CardContent className="p-8">
              <p className="text-neutral-400 font-bold uppercase tracking-wider text-xs mb-2">Total Annual Footprint</p>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-5xl font-black text-white">{results.total.toLocaleString()}</h2>
                <span className="text-lg font-medium text-neutral-500">kg CO₂e / year</span>
              </div>
              
              <div className="mt-8 flex items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mr-4">
                  <Leaf size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Monthly Comparison</p>
                  <p className="text-xs text-neutral-400">Equivalent to <span className="text-green-400 font-bold">{results.monthlyAverage} kg/month</span> vs your current {carbonData.total} kg/month.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-3xl p-6 bg-green-50 flex flex-col justify-center items-center text-center">
             <div className="text-4xl mb-4">🌳</div>
             <h4 className="font-bold text-green-900 mb-2">Tree Equivalent</h4>
             <p className="text-sm text-green-800/70">It would take approximately <span className="font-bold text-green-900">{Math.ceil(Number(results.total) / 22)} mature trees</span> a whole year to absorb this much carbon.</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {Object.entries(results.breakdown).map(([category, value]: [string, unknown]) => (
             <Card key={category} className="border-neutral-100 shadow-sm rounded-2xl">
               <CardContent className="p-5">
                 <div className="flex justify-between items-start mb-3">
                   <div className="p-2 rounded-xl bg-neutral-50 text-neutral-600">
                     {category === 'Transport' ? <Car size={18}/> : category === 'Energy' ? <Zap size={18}/> : <Utensils size={18}/>}
                   </div>
                   <span className="text-xs font-bold text-neutral-400">{(Number(value) / Number(results.total) * 100).toFixed(0)}%</span>
                 </div>
                 <h4 className="font-bold text-neutral-900">{category}</h4>
                 <p className="text-lg font-bold text-neutral-600 mt-1">{value.toLocaleString()} kg</p>
               </CardContent>
             </Card>
           ))}
        </div>

        <div className="flex justify-center pt-8">
           <Button onClick={() => setStep(0)} className="rounded-full px-8 h-12 bg-neutral-900 hover:bg-black font-bold">
             Refine Simulation
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">Lifestyle Estimator</h1>
        <p className="text-neutral-500 font-medium max-w-xl">
          Complete the form below to get an interactive estimate of your annual carbon footprint based on your daily habits and lifestyle choices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="transport" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-neutral-100 p-1 rounded-2xl mb-6 h-12">
              <TabsTrigger value="transport" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Car size={16} className="mr-2" />
                Transport
              </TabsTrigger>
              <TabsTrigger value="energy" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Zap size={16} className="mr-2" />
                Energy
              </TabsTrigger>
              <TabsTrigger value="food" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Utensils size={16} className="mr-2" />
                Diet
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="transport" className="space-y-6 focus-visible:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-neutral-700">Car Travel (km/week)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 150" 
                      className="rounded-xl border-neutral-200 h-10"
                      value={formData.transport.carKmPerWeek || ''}
                      onChange={(e) => updateTransport('carKmPerWeek', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-neutral-700">Engine Type</Label>
                    <Select 
                      value={formData.transport.carType} 
                      onValueChange={(v) => updateTransport('carType', v)}
                    >
                      <SelectTrigger className="rounded-xl border-neutral-200 h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car_petrol">Petrol / Gas</SelectItem>
                        <SelectItem value="car_diesel">Diesel</SelectItem>
                        <SelectItem value="car_ev">Electric (EV)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-neutral-700">Public Transport (km/week)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 50" 
                      className="rounded-xl border-neutral-200 h-10"
                      value={formData.transport.publicTransportKmPerWeek || ''}
                      onChange={(e) => updateTransport('publicTransportKmPerWeek', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-neutral-700">Flight Hours (per year)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 10" 
                      className="rounded-xl border-neutral-200 h-10"
                      value={formData.transport.flightsPerHourPerYear || ''}
                      onChange={(e) => updateTransport('flightsPerHourPerYear', Number(e.target.value))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="energy" className="space-y-6 focus-visible:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-neutral-700">Monthly Electricity (kWh)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 250" 
                      className="rounded-xl border-neutral-200 h-10"
                      value={formData.energy.electricityKwhPerMonth || ''}
                      onChange={(e) => updateEnergy('electricityKwhPerMonth', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-neutral-700">A/C or Heating (hours/day)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 4" 
                      className="rounded-xl border-neutral-200 h-10"
                      value={formData.energy.acHoursPerDay || ''}
                      onChange={(e) => updateEnergy('acHoursPerDay', Number(e.target.value))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="food" className="space-y-6 focus-visible:outline-none">
                <div className="space-y-4">
                  <Label className="font-bold text-neutral-700">Your Primary Diet</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'omnivore_daily', label: 'Omnivore', desc: 'Frequent meat/dairy', icon: '🥩' },
                      { id: 'pescatarian_daily', label: 'Pescatarian', desc: 'Fish and vegetables', icon: '🐟' },
                      { id: 'vegetarian_daily', label: 'Vegetarian', desc: 'Plant-based with dairy', icon: '🥚' },
                      { id: 'vegan_daily', label: 'Vegan', desc: 'Strictly plant-based', icon: '🥦' },
                    ].map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => setFormData(p => ({ ...p, diet: { type: item.id as "omnivore_daily" | "pescatarian_daily" | "vegetarian_daily" | "vegan_daily" } }))}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          formData.diet.type === item.id 
                          ? 'border-primary bg-green-50 ring-2 ring-primary/20' 
                          : 'border-neutral-100 bg-white hover:border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <h4 className="font-bold text-sm text-neutral-900">{item.label}</h4>
                            <p className="text-xs text-neutral-500">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          <div className="mt-10">
            <Button 
              onClick={handleCalculate}
              disabled={isLoading}
              className="w-full h-12 rounded-full bg-neutral-900 hover:bg-black font-bold text-md shadow-lg flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Calculator size={18} />
                  <span>Calculate Estimation</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm rounded-3xl bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-blue-900">
                <Info size={18} className="mr-2" />
                Why Estimate?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800/80 leading-relaxed">
                Estimation helps you identify which parts of your lifestyle contribute most to your carbon footprint. 
                Average humans contribute about 4,000kg CO2 per year, but target goals are closer to 2,000kg to stop global warming.
              </p>
            </CardContent>
          </Card>

          <div className="p-6 rounded-3xl border border-neutral-100 bg-neutral-50/50">
            <h4 className="font-bold text-neutral-900 mb-2">Pro Tip</h4>
            <p className="text-sm text-neutral-500">
              Check your utility bills for kWh values and use your phone's mobility tracker to see accurate weekly km values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
