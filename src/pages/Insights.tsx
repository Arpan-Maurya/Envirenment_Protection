import { useState } from "react";
import { useAppStore } from "../store";
import { Card, CardContent } from "../components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowDown, Bus, ChevronDown, Search, Loader2, Globe, Sparkles } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import axios from "axios";

export function Insights() {
  const carbonData = useAppStore(s => s.carbonData);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);

    try {
      const response = await axios.post("/api/gemini/search", { prompt: searchQuery });
      setSearchResult(response.data.text);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResult("Sorry, I couldn't find information on that right now. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-md mx-auto h-full bg-neutral-50/30 lg:max-w-3xl lg:p-8 p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-neutral-900">Insights</h1>
      </div>

      {/* Grounded Search Bar */}
      <div className="mb-8">
        <Card className="border-none shadow-sm rounded-3xl bg-neutral-900 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles size={18} className="text-primary" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Eco-Knowledge Hub</h3>
            </div>
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                <Input 
                  placeholder="Ask about carbon footprints or sustainability..." 
                  className="pl-10 h-11 bg-white/10 border-white/10 text-white placeholder:text-neutral-500 rounded-xl focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSearching}
                className="h-11 rounded-xl bg-primary hover:bg-primary/90 font-bold px-5"
              >
                {isSearching ? <Loader2 className="animate-spin" size={18} /> : "Search"}
              </Button>
            </form>
            <p className="text-[10px] text-neutral-400 mt-3 flex items-center">
              <Globe size={10} className="mr-1" />
              Powered by Google Search grounding for real-time sustainability data
            </p>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Card className="border-neutral-100 shadow-md rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles size={14} />
                  </div>
                  <span className="text-xs font-bold text-neutral-900">AI Result</span>
                </div>
                <div className="prose prose-sm prose-neutral max-w-none text-neutral-600">
                  <Markdown>{searchResult}</Markdown>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <div className="mb-6 flex justify-between items-end">
         <h3 className="font-bold text-neutral-900">Footprint Trend <br/><span className="text-xs text-neutral-500 font-normal">(kg CO₂e)</span></h3>
         <button className="flex items-center space-x-1 px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs font-semibold text-neutral-600 shadow-sm">
           <span>This Month</span>
           <ChevronDown size={14} />
         </button>
      </div>

      <div className="h-[200px] w-full mb-8 relative left-[-10px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={carbonData.history} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} domain={[100, 300]} ticks={[100, 150, 200, 250, 300]}/>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            />
            <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#22c55e' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Best Category</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Bus size={18} />
                  </div>
                  <h4 className="font-bold text-neutral-900">Transport</h4>
                </div>
              </div>
              <div className="flex items-center text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg text-sm">
                <ArrowDown size={14} className="mr-1" />
                20%
              </div>
            </div>
            <p className="text-sm text-neutral-500 font-medium leading-relaxed mt-2">
               You are doing great! Your transport emissions reduced by <span className="text-green-600 font-bold">20%</span>.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Total Savings</p>
              <div className="flex items-baseline space-x-1 mb-2">
                 <h2 className="text-3xl font-bold text-green-600">45<span className="text-lg font-medium text-neutral-500 ml-1 mt-1">kg CO₂e</span></h2>
              </div>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed max-w-[200px]">
                 Great job! You saved 45 kg CO₂e this month. 
              </p>
            </div>
            <div className="text-5xl pr-2">🌱</div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
