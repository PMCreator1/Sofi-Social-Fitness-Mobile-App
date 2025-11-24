
import React, { useState, useRef, useEffect } from 'react';
import { Send, Dumbbell, User, Sparkles, Phone, PhoneOff, Mic, MicOff, MoreVertical, ThumbsUp, ThumbsDown } from 'lucide-react';
import { chatWithCoach, CoachLiveSession } from '../services/geminiService';
import { ChatMessage } from '../types';

interface CoachProps {
  userName: string;
}

export const Coach: React.FC<CoachProps> = ({ userName }) => {
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  
  // Text Mode State
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hey ${userName}! Coach Bolt here. ⚡️ Ready to smash some goals? Tell me what you want to work on today!`,
    }
  ]);
  const [isTextLoading, setIsTextLoading] = useState(false);
  // Track rated messages to disable buttons after use
  const [ratedMessages, setRatedMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Mode State
  const [callStatus, setCallStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [volume, setVolume] = useState(0);
  const liveSession = useRef<CoachLiveSession | null>(null);

  // --- Text Logic ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, mode]);

  const handleSendText = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTextLoading(true);

    const responseText = await chatWithCoach(messages, input);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTextLoading(false);
  };
  
  const handleRateResponse = (msgId: string, isPositive: boolean) => {
      setRatedMessages(prev => new Set(prev).add(msgId));
      // In a real app, send this data to analytics
      console.log(`Validation: Message ${msgId} rated ${isPositive ? 'positive' : 'negative'}`);
  };

  // --- Voice Logic ---
  const startCall = async () => {
      if (liveSession.current) return;
      
      const session = new CoachLiveSession();
      liveSession.current = session;
      
      session.onStatusChange = (status) => {
          setCallStatus(status);
          if (status === 'disconnected' || status === 'error') {
              liveSession.current = null;
              if (status === 'error') alert("Could not connect to Coach Bolt. Please check your connection or API key.");
          }
      };

      session.onVolume = (level) => {
          // Smooth the volume for visualization
          setVolume(prev => prev * 0.8 + level * 5 * 0.2); 
      };

      await session.connect();
  };

  const endCall = () => {
      if (liveSession.current) {
          liveSession.current.disconnect();
          liveSession.current = null;
      }
      setCallStatus('disconnected');
  };

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          if (liveSession.current) {
              liveSession.current.disconnect();
          }
      };
  }, []);

  // --- Renders ---

  const renderTextMode = () => (
      <>
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4 no-scrollbar">
            {messages.map((msg) => {
                const isAi = msg.role === 'model';
                const isRated = ratedMessages.has(msg.id);

                return (
                    <div key={msg.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
                        {isAi && (
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-2 mt-1 border border-slate-700 flex-shrink-0">
                                <Sparkles size={14} className="text-primary" />
                            </div>
                        )}
                        <div className="max-w-[85%]">
                            <div 
                                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                    isAi 
                                    ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700' 
                                    : 'bg-primary text-white rounded-tr-none shadow-orange-500/10'
                                }`}
                            >
                                {msg.text.split('\n').map((line, i) => (
                                    <p key={i} className="mb-1 last:mb-0 min-h-[1rem]">{line}</p>
                                ))}
                            </div>
                            
                            {/* Micro-Validation Controls */}
                            {isAi && (
                                <div className="flex items-center mt-1 ml-1 space-x-2">
                                    <span className="text-[10px] text-slate-600 uppercase font-bold">Was this helpful?</span>
                                    <button 
                                        onClick={() => handleRateResponse(msg.id, true)}
                                        disabled={isRated}
                                        className={`p-1 rounded hover:bg-slate-800 transition-colors ${isRated ? 'opacity-30' : 'text-slate-500 hover:text-green-500'}`}
                                    >
                                        <ThumbsUp size={12} />
                                    </button>
                                    <button 
                                        onClick={() => handleRateResponse(msg.id, false)}
                                        disabled={isRated}
                                        className={`p-1 rounded hover:bg-slate-800 transition-colors ${isRated ? 'opacity-30' : 'text-slate-500 hover:text-red-500'}`}
                                    >
                                        <ThumbsDown size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {!isAi && (
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center ml-2 mt-1 border border-slate-700 flex-shrink-0">
                                <User size={14} className="text-slate-400" />
                            </div>
                        )}
                    </div>
                );
            })}
            {isTextLoading && (
                <div className="flex justify-start items-center ml-10">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce delay-150"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 z-10">
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-2xl px-2 py-2 focus-within:ring-2 focus-within:ring-primary/30 transition-all shadow-inner">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                    placeholder="Ask for a 5k plan, diet tips..."
                    className="flex-1 bg-transparent text-white px-3 py-2 focus:outline-none placeholder-slate-500"
                />
                <button 
                    onClick={handleSendText}
                    disabled={!input.trim() || isTextLoading}
                    className="bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-orange-900/20"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
      </>
  );

  const renderVoiceMode = () => (
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden animate-in fade-in duration-500">
           {/* Dynamic Background */}
           <div className={`absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 transition-colors duration-1000 ${callStatus === 'connected' ? 'from-slate-800' : ''}`}></div>
           
           {/* Visualizer Circles */}
           <div className="relative z-10 mb-12">
               {/* Outer Rings - Pulse based on call status or volume */}
               {callStatus === 'connected' && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-ping" style={{ transform: `scale(${1 + volume})` }}></div>
                    <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-2xl animate-pulse delay-75" style={{ transform: `scale(${1.5 + volume})` }}></div>
                  </>
               )}
               
               {/* Main Avatar Orb */}
               <div className={`w-40 h-40 rounded-full flex items-center justify-center relative shadow-2xl transition-all duration-500 ${callStatus === 'connected' ? 'bg-gradient-to-tr from-primary to-red-600 shadow-orange-500/50' : 'bg-slate-800 border-4 border-slate-700'}`}>
                   {callStatus === 'connecting' && (
                       <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                   )}
                   <img 
                       src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80" 
                       className={`w-36 h-36 rounded-full object-cover transition-opacity duration-500 ${callStatus === 'connected' ? 'opacity-90' : 'opacity-40 grayscale'}`}
                   />
                   {callStatus === 'disconnected' && (
                       <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                           <Phone size={32} className="text-white opacity-50" />
                       </div>
                   )}
               </div>
           </div>

           {/* Status Text */}
           <div className="relative z-10 text-center mb-16 h-16">
               <h2 className="text-2xl font-bold text-white mb-2">Coach Bolt</h2>
               <p className={`text-sm font-medium transition-colors ${
                   callStatus === 'connected' ? 'text-green-400' :
                   callStatus === 'connecting' ? 'text-yellow-400' : 'text-slate-500'
               }`}>
                   {callStatus === 'connected' ? (volume > 0.1 ? 'Listening...' : 'Live') : 
                    callStatus === 'connecting' ? 'Connecting...' : 'Tap below to start'}
               </p>
           </div>

           {/* Controls */}
           <div className="relative z-10 flex items-center gap-8">
               {callStatus === 'disconnected' ? (
                   <button 
                       onClick={startCall}
                       className="w-20 h-20 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-lg shadow-green-900/30 transition-all hover:scale-110 active:scale-95"
                   >
                       <Phone size={32} className="text-white fill-current" />
                   </button>
               ) : (
                   <>
                       <button className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-slate-700">
                           <MicOff size={24} />
                       </button>
                       <button 
                           onClick={endCall}
                           className="w-20 h-20 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-900/30 transition-all hover:scale-110 active:scale-95"
                       >
                           <PhoneOff size={32} className="text-white fill-current" />
                       </button>
                       <button className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-slate-700">
                           <MoreVertical size={24} />
                       </button>
                   </>
               )}
           </div>
      </div>
  );

  return (
    <div className="pb-24 pt-4 px-0 max-w-md mx-auto h-screen flex flex-col bg-slate-950 relative">
      {/* Header */}
      <div className="px-4 mb-4 flex items-center justify-between">
         <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center mr-3 shadow-lg shadow-orange-500/20">
                <Dumbbell size={20} className="text-white fill-current" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-white">Coach Bolt</h1>
                <div className="flex items-center text-xs">
                    {mode === 'voice' && callStatus === 'connected' ? (
                         <span className="text-green-500 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>Live Call</span>
                    ) : (
                         <span className="text-slate-500">AI Personal Trainer</span>
                    )}
                </div>
            </div>
         </div>
         
         {/* Mode Toggle */}
         <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex">
             <button 
                onClick={() => setMode('text')}
                className={`p-2 rounded-lg transition-all ${mode === 'text' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
             >
                 <Sparkles size={18} />
             </button>
             <button 
                onClick={() => setMode('voice')}
                className={`p-2 rounded-lg transition-all ${mode === 'voice' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
             >
                 <Phone size={18} className={mode === 'voice' ? 'fill-current' : ''} />
             </button>
         </div>
      </div>

      {mode === 'text' ? renderTextMode() : renderVoiceMode()}
    </div>
  );
};
