import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppStore } from "../../store";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { ChevronLeft } from "lucide-react";

const onboardingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(1, "Country is required"),
  occupation: z.string().min(2, "Occupation is required"),
  commuteDistance: z.number().min(0).max(200),
  transportMode: z.string(),
  fuelType: z.string().optional(),
  electricityUsage: z.number().min(0).max(2000),
  acUsage: z.number().min(0).max(24),
  foodPreference: z.string(),
  shoppingHabits: z.string(),
  wasteHabits: z.string(),
});

export function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const setUser = useAppStore(s => s.setUser);
  const setOnboardingComplete = useAppStore(s => s.setOnboardingComplete);
  const isLoading = useAppStore(s => s.isLoading);

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      city: "",
      country: "US",
      occupation: "",
      commuteDistance: 25,
      transportMode: "Car",
      fuelType: "Petrol",
      electricityUsage: 350,
      acUsage: 4,
      foodPreference: "Omnivore",
      shoppingHabits: "Monthly",
      wasteHabits: "Recycling",
    },
  });

  const onSubmit = async (data: z.infer<typeof onboardingSchema>) => {
    if (step < 6) {
      setStep(step + 1);
      return;
    }
    // Complete onboarding
    await setUser({
      ...data,
      completedOnboarding: true
    });
    
    await setOnboardingComplete(true);
    navigate("/");
  };

  const steps = [
    {
      title: "Basics",
      description: "Let's personalize your experience.",
      fields: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nameInput">What's your name?</Label>
            <input 
              id="nameInput"
              {...form.register("name")} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
              placeholder="e.g. Abhishek" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cityInput">Where do you live? (City)</Label>
            <input 
              id="cityInput"
              {...form.register("city")} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
              placeholder="e.g. San Francisco, CA" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countrySelect">Country (for regional grid factors)</Label>
            <select 
              id="countrySelect"
              {...form.register("country")} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
            >
              <option value="US">United States (US - 0.38 kg/kWh)</option>
              <option value="UK">United Kingdom (UK - 0.21 kg/kWh)</option>
              <option value="DE">Germany (DE - 0.35 kg/kWh)</option>
              <option value="FR">France (FR - 0.05 kg/kWh)</option>
              <option value="IN">India (IN - 0.71 kg/kWh)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupationInput">What's your occupation?</Label>
            <input 
              id="occupationInput"
              {...form.register("occupation")} 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
              placeholder="e.g. Designer, Engineer" 
            />
          </div>
        </div>
      ),
    },
    {
      title: "Transportation",
      description: "Tell us about your daily commute.",
      fields: (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Primary Mode</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Bike', icon: '🚲' }, 
                { label: 'Car', icon: '🚗' }, 
                { label: 'Bus', icon: '🚌' }, 
                { label: 'Metro', icon: '🚇' },
                { label: 'Cycle', icon: '🚴' },
                { label: 'Walk', icon: '🚶' }
              ].map(mode => (
                <div 
                  key={mode.label}
                  onClick={() => form.setValue('transportMode', mode.label)}
                  className={"cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 transition-all shadow-sm " + (form.watch('transportMode') === mode.label ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-neutral-50 border-neutral-100')}
                >
                  <div className="text-2xl">
                    {mode.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tight">{mode.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Daily Distance</Label>
              <div className="flex items-center space-x-1">
                 <span className="text-lg font-black text-neutral-900">{form.watch("commuteDistance")}</span>
                 <span className="text-xs font-bold text-neutral-400">km</span>
              </div>
            </div>
            <Slider 
              value={[form.watch("commuteDistance")]} 
              onValueChange={(val) => {
                const v = Array.isArray(val) ? val[0] : val;
                form.setValue("commuteDistance", v);
              }}
              max={100} step={1} 
              className="py-4"
            />
          </div>
        </div>
      )
    },
    {
      title: "Home Energy",
      description: "Tell us about your home energy usage.",
      fields: (
        <div className="space-y-6">
           <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Monthly Electricity</Label>
                <div className="flex items-center space-x-1">
                   <span className="text-lg font-black text-neutral-900">{form.watch("electricityUsage")}</span>
                   <span className="text-xs font-bold text-neutral-400">kWh</span>
                </div>
              </div>
              <Slider 
                value={[form.watch("electricityUsage")]} 
                onValueChange={(val) => {
                  const v = Array.isArray(val) ? val[0] : val;
                  form.setValue("electricityUsage", v as number);
                }}
                max={1500} step={10} 
                className="py-4"
              />
           </div>
           <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Daily AC Usage</Label>
                <div className="flex items-center space-x-1">
                   <span className="text-lg font-black text-neutral-900">{form.watch("acUsage")}</span>
                   <span className="text-xs font-bold text-neutral-400">Hours</span>
                </div>
              </div>
              <Slider 
                value={[form.watch("acUsage")]} 
                onValueChange={(val) => {
                  const v = Array.isArray(val) ? val[0] : val;
                  form.setValue("acUsage", v as number);
                }}
                max={24} step={1} 
                className="py-4"
              />
           </div>
        </div>
      )
    },
    {
      title: "Diet",
      description: "Food choice is a major carbon factor.",
      fields: (
        <div className="space-y-3">
          <Label>Primary Diet</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'Vegan', icon: '🥦' },
              { id: 'Vegetarian', icon: '🥚' },
              { id: 'Omnivore', icon: '🥩' },
              { id: 'Carnivore', icon: '🍗' }
            ].map(diet => (
              <div 
                key={diet.id}
                onClick={() => form.setValue('foodPreference', diet.id)}
                className={"cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 transition-all shadow-sm " + (form.watch('foodPreference') === diet.id ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-neutral-50 border-neutral-100')}
              >
                <span className="text-xl">{diet.icon}</span>
                <span className="text-sm font-bold">{diet.id}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Shopping",
      description: "How often do you buy new goods?",
      fields: (
        <div className="space-y-4">
           {['Rarely', 'Monthly', 'Weekly'].map(opt => (
              <div 
                key={opt}
                onClick={() => form.setValue('shoppingHabits', opt)}
                className={"p-4 border rounded-2xl flex items-center justify-between cursor-pointer shadow-sm transition-all " + (form.watch('shoppingHabits') === opt ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-100 hover:bg-neutral-50')}
              >
                <span className="font-semibold text-sm">{opt} Shopping</span>
                <div className={"w-5 h-5 rounded-full border-2 " + (form.watch('shoppingHabits') === opt ? 'border-primary bg-primary' : 'border-neutral-200')}></div>
              </div>
           ))}
        </div>
      )
    },
    {
      title: "Waste",
      description: "How do you handle your waste?",
      fields: (
        <div className="space-y-4">
           {[
             { id: 'Recycling', label: 'I recycle glass, plastic & paper' },
             { id: 'Composting', label: 'I compost organic waste' },
             { id: 'Both', label: 'I do both regularly' },
             { id: 'None', label: 'Neither of these' }
           ].map(opt => (
              <div 
                key={opt.id}
                onClick={() => form.setValue('wasteHabits', opt.id)}
                className={"p-4 border rounded-2xl flex items-center justify-between cursor-pointer shadow-sm transition-all " + (form.watch('wasteHabits') === opt.id ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-100 hover:bg-neutral-50')}
              >
                <span className="font-semibold text-sm">{opt.label}</span>
                <div className={"w-5 h-5 rounded-full border-2 " + (form.watch('wasteHabits') === opt.id ? 'border-primary bg-primary' : 'border-neutral-200')}></div>
              </div>
           ))}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#f3f9f4] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        
        <div className="mb-6">
          <h1 className="text-2xl font-black text-neutral-900 leading-tight mb-1 italic">Let's build your <br/><span className="text-primary not-italic uppercase tracking-tighter">carbon profile</span></h1>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest leading-none">Step {step} of 6</p>
        </div>

        <div className="flex space-x-1.5 mb-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className={"h-1 rounded-full flex-1 transition-all " + (i <= step ? 'bg-primary shadow-sm shadow-primary/20' : 'bg-neutral-200')} />
          ))}
        </div>

        <Card className="border-0 shadow-2xl shadow-green-900/10 rounded-[2rem] overflow-hidden bg-white">
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              
              <div className="mb-8">
                <h2 className="text-xl font-black text-neutral-900">{steps[step-1].title}</h2>
                <p className="text-sm font-medium text-neutral-500 mt-1">{steps[step-1].description}</p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[260px]"
                >
                  {steps[step-1].fields}
                  
                  {/* Show validation errors if any */}
                  {Object.keys(form.formState.errors).length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Please check the following:</p>
                      <ul className="text-xs text-red-600 mt-1 list-disc list-inside font-medium">
                        {Object.values(form.formState.errors).map((err: { message?: string }, i) => (
                          <li key={i}>{err.message || "Invalid input"}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-between">
                {step > 1 ? (
                  <Button type="button" variant="ghost" className="text-neutral-400 font-bold" onClick={() => setStep(step-1)}>Back</Button>
                ) : <div/>}
                
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading}
                  className={"rounded-full px-10 bg-primary hover:shadow-lg hover:shadow-primary/30 text-white font-black transition-all " + (step === 6 ? 'bg-green-700' : 'bg-[#0f2e20]')}
                >
                   <span>{isLoading ? "Saving..." : step === 6 ? "Finish" : "Next"}</span>
                   <ChevronLeft className="rotate-180 ml-2" size={18} />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
