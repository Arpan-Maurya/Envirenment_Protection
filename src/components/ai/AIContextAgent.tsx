import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Train, Leaf, MoreVertical, Maximize2 } from "lucide-react";
import { useAppStore } from "../../store";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export function AIContextAgent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "I'm your AI sustainability coach.\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const user = useAppStore(state => state.user);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    setInput("");
    const newMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const { carbonData } = useAppStore.getState();
      const response = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: text, 
          userProfile: user,
          footprint: carbonData.breakdown,
          totalFootprint: carbonData.total,
          budget: carbonData.budget
        })
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        content: data.text
      }]);
    } catch (_err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        content: "I'm having trouble connecting right now. Please try again later."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50/50">
      
      {/* Header */}
      <div className="p-4 bg-white border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center relative shadow-sm border border-teal-100">
            <span className="text-xl">🤖</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div>
             <h3 className="font-bold text-neutral-900 text-sm">EcoAgent AI</h3>
             <div className="flex items-center space-x-1.5">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
               <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online</span>
             </div>
          </div>
        </div>
        <div className="flex space-x-1 text-neutral-400">
          <button aria-label="More options" className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"><MoreVertical size={16} /></button>
          <button aria-label="Maximize chat" className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"><Maximize2 size={16} /></button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
         <div className="text-center my-2 mb-6">
           <div className="inline-block px-3 py-1 bg-white rounded-full border border-neutral-200 text-xs font-semibold text-neutral-500 shadow-sm">
             Today
           </div>
         </div>
        
        {messages.map((msg, i) => (
          <div key={msg.id} className={"flex " + (msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === 'ai' && i === 0 && (
               <div className="bg-white border text-sm border-neutral-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm text-neutral-800 leading-relaxed">
                  <p className="font-semibold text-neutral-900 mb-1">Hi {user.name.split(' ')[0]}! \uD83D\uDC4B</p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
               </div>
            )}
            {msg.role === 'ai' && i !== 0 && (
               <div className="bg-white border text-sm border-neutral-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
               </div>
            )}
            {msg.role === 'user' && (
               <div className="bg-primary text-white text-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
               </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center space-x-1">
               <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
               <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
             </div>
          </div>
        )}

        {messages.length === 1 && (
          <div className="pt-4 space-y-2">
            <button 
              onClick={() => handleSend("How can I reduce my carbon footprint?")}
              className="w-full text-left bg-white border border-neutral-200 p-3 rounded-xl shadow-sm hover:shadow hover:border-green-200 transition-all flex items-start space-x-3 group"
            >
              <div className="text-green-500 bg-green-50 p-1.5 rounded-lg group-hover:bg-green-100 transition-colors"><Leaf size={16} /></div>
              <span className="text-sm font-medium text-neutral-700 mt-0.5">How can I reduce my carbon footprint?</span>
            </button>
            <button 
              onClick={() => handleSend("What if I switch to metro 3 days a week?")}
              className="w-full text-left bg-white border border-neutral-200 p-3 rounded-xl shadow-sm hover:shadow hover:border-blue-200 transition-all flex items-start space-x-3 group"
            >
              <div className="text-blue-500 bg-blue-50 p-1.5 rounded-lg group-hover:bg-blue-100 transition-colors"><Train size={16} /></div>
              <span className="text-sm font-medium text-neutral-700 mt-0.5">What if I switch to metro 3 days a week?</span>
            </button>
            <button 
              onClick={() => handleSend("Show me low-cost high-impact actions")}
              className="w-full text-left bg-white border border-neutral-200 p-3 rounded-xl shadow-sm hover:shadow hover:border-yellow-200 transition-all flex items-start space-x-3 group"
            >
              <div className="text-yellow-500 bg-yellow-50 p-1.5 rounded-lg group-hover:bg-yellow-100 transition-colors"><Sparkles size={16} /></div>
              <span className="text-sm font-medium text-neutral-700 mt-0.5">Show me low-cost high-impact actions</span>
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-neutral-100">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..." 
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-neutral-400"
          />
          <button 
             aria-label="Send message"
             onClick={() => handleSend()}
             disabled={!input.trim() || isTyping}
             className="absolute right-2 p-2 rounded-full text-neutral-400 hover:text-primary hover:bg-primary/5 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Simulator Ad */}
      <div className="p-4 pt-0 bg-white">
        <div className="bg-[#0f2e20] rounded-2xl p-5 text-white relative overflow-hidden shadow-lg border-b-4 border-green-700/50">
          <svg className="absolute -right-4 -top-4 w-24 h-24 text-green-800 opacity-50" viewBox="0 0 100 100" fill="currentColor">
             <circle cx="50" cy="50" r="50" />
          </svg>
          <div className="relative z-10">
            <h4 className="font-bold mb-1">What-If Simulator</h4>
            <p className="text-xs text-green-100/80 max-w-[180px] mb-4 leading-relaxed">See the impact of your choices before you make them.</p>
            <Link to="/simulator" className="inline-flex items-center space-x-2 bg-white text-[#0f2e20] px-4 py-2 rounded-full text-xs font-bold hover:bg-green-50 transition-colors">
              <span>Try Simulator</span>
              <span>→</span>
            </Link>
          </div>
          
          <div className="absolute right-2 bottom-0 text-5xl translate-y-2 translate-x-2">
            🌍
          </div>
          <div className="absolute right-10 top-6 text-xl">
             ☁️
          </div>
        </div>
      </div>

    </div>
  );
}
