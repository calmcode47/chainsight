import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  Loader2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { chatQuery, getMetrics, getShipments } from '../api/client';
import { ChatMessage, SupplyChainMetrics } from '../types';

const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<SupplyChainMetrics | null>(null);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "How many shipments are delayed right now?",
    "What is the highest risk disruption?",
    "How much cost have we saved today?",
    "Which carrier has the most delays?",
    "Summarize today's supply chain health"
  ];

  useEffect(() => {
    getMetrics().then(setMetrics).catch(console.error);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(false);

    try {
      const shipments = await getShipments();
      const response = await chatQuery(text, { metrics, shipments });
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat failed:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-1 px-2">
        <h2 className="text-2xl font-bold tracking-tight">ChainSight AI Assistant</h2>
        <p className="text-xs text-gray-500 font-medium">Operational support powered by Gemini 1.5 Flash</p>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-[#111827] border border-white/10 rounded-xl overflow-hidden glass-card flex flex-col">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/40 relative">
                <Sparkles className="text-blue-500" size={32} />
                <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">How can I help with your fleet today?</h3>
                <p className="text-xs text-gray-500 max-w-sm">I have live access to all shipment metrics, active disruptions, and optimization data.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                {suggestedPrompts.map(prompt => (
                  <button 
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="p-3 text-left text-[10px] font-bold text-gray-400 border border-white/5 bg-white/5 rounded-lg hover:border-blue-500/50 hover:text-white hover:bg-blue-500/5 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                  msg.role === 'user' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-[#1F2937] border-white/10 text-blue-400'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#1F2937] border border-white/10 text-gray-200'
                }`}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>
                      {line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-black">{part}</strong> : part)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1F2937] border border-white/10 text-blue-400 flex items-center justify-center">
                  <Sparkles size={16} className="animate-pulse" />
                </div>
                <div className="bg-[#1F2937] border border-white/10 p-4 rounded-xl flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg flex items-center gap-3 text-xs font-bold text-rose-500">
                <AlertCircle size={16} /> Connection to Gemini failed.
                <button onClick={() => handleSend(messages[messages.length-1].content)} className="flex items-center gap-1 hover:underline">
                  <RefreshCw size={12} /> RETRY
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 border-t border-white/10 bg-[#0A0F1E]/50">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex gap-4"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ChainSight anything about your fleet..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-lg transition-all shadow-lg shadow-blue-600/20"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
