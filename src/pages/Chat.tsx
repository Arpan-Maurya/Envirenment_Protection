import { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

import { Send, Bot, User, RefreshCw, ChevronLeft, Sparkles, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import Markdown from "react-markdown";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Chat() {
  const user = useAppStore(s => s.user);
  const carbonData = useAppStore(s => s.carbonData);
  const activities = useAppStore(s => s.activities);
  const missions = useAppStore(s => s.missions);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `Hi ${user.name.split(' ')[0]}! 👋\nI'm your AI sustainability coach. How can I help you today?` 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userProfile: user,
          carbonData: carbonData,
          recentActivities: activities,
          activeMissions: missions
        }),
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Chat] Server error body:", errorText);
        throw new Error(`Server returned ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();

      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        throw new Error("No response from AI: missing 'text' field");
      }
    } catch (error) {
      console.error("[Chat] handleSend error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi ${user.name.split(' ')[0]}! 👋\nI'm your AI sustainability coach. How can I help you today?`
      }
    ]);
    setInput("");
    setIsLoading(false);
  };

  const suggestions = [
    { text: "How can I reduce my carbon footprint?", icon: <Sparkles size={14} className="text-green-500" /> },
    { text: "What if I switch to metro 3 days a week?", icon: <MessageCircle size={14} className="text-blue-500" /> },
    { text: "Show me low-cost high-impact actions", icon: <Sparkles size={14} className="text-yellow-500" /> }
  ];

  return (
    <div className="max-w-md mx-auto h-full flex flex-col bg-white lg:max-w-3xl min-h-screen">
      {/* Header */}
      <header className="p-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="p-1 hover:bg-neutral-50 rounded-full">
            <ChevronLeft size={24} className="text-neutral-900" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group border-2 border-primary/20">
               <Bot size={22} className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="font-black text-neutral-900 text-sm leading-tight">EcoAgent AI</h1>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Online</span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleReset} className="p-2 hover:bg-neutral-50 rounded-full transition-colors" aria-label="Reset chat">
          <RefreshCw size={20} className="text-neutral-400" />
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 font-sans">
        <div className="space-y-6 max-w-2xl mx-auto">
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${msg.role === 'user' ? 'bg-white border-neutral-200' : 'bg-primary border-primary'}`}>
                  {msg.role === 'user' ? <User size={14} className="text-neutral-600" /> : <Bot size={14} className="text-white" />}
                </div>
                <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-[#0f2e20] text-white rounded-br-none font-medium' 
                  : 'bg-neutral-50 text-neutral-800 rounded-bl-none border border-neutral-100 font-medium'
                }`}>
                  <div className="markdown-body">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-end space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border border-primary shadow-sm">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="p-4 rounded-3xl rounded-bl-none bg-neutral-50 border border-neutral-100 space-x-1 flex">
                   <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                   <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="grid grid-cols-1 gap-3 pt-4">
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(s.text)}
                  className="p-4 rounded-2xl border border-neutral-100 bg-white hover:bg-green-50 hover:border-green-100 transition-all text-left flex items-center space-x-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-white border border-neutral-100">
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-neutral-600 group-hover:text-neutral-900">{s.text}</span>
                </button>
              ))}
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-neutral-100 bg-white sticky bottom-0">
        <div className="relative max-w-2xl mx-auto">
          <Input 
            id="chat-input"
            aria-label="Ask EcoAgent a sustainability question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything sustainability related..."
            className="h-14 pl-6 pr-14 rounded-full border-2 border-neutral-100 focus-visible:ring-primary/20 focus-visible:border-primary bg-neutral-50/50 font-medium placeholder:font-bold placeholder:text-neutral-300 transition-all"
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="absolute right-2 top-2 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 p-0"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
