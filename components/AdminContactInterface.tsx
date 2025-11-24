import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, X, Mic, MicOff, Video, PhoneOff, Send, CheckCircle, Volume2 } from 'lucide-react';
import { User } from '../types';

interface AdminContactInterfaceProps {
  admin: User;
  onClose: () => void;
}

type ViewState = 'selection' | 'messaging' | 'calling' | 'incall';

export const AdminContactInterface: React.FC<AdminContactInterfaceProps> = ({ admin, onClose }) => {
  const [view, setView] = useState<ViewState>('selection');
  const [message, setMessage] = useState('');
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Simulate call duration
  useEffect(() => {
    let interval: any;
    if (view === 'incall') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  // Simulate picking up the call
  useEffect(() => {
    if (view === 'calling') {
      const timeout = setTimeout(() => {
        setView('incall');
      }, 3500); // Admin "picks up" after 3.5 seconds
      return () => clearTimeout(timeout);
    }
  }, [view]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // Simulate sending
    setTimeout(() => {
      setIsMessageSent(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 500);
  };

  const renderSelection = () => (
    <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
        <X size={24} />
      </button>

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-orange-600 mb-4 shadow-lg shadow-orange-500/20">
          <img src={admin.avatar} alt={admin.name} className="w-full h-full rounded-full object-cover border-4 border-slate-900" />
        </div>
        <h2 className="text-xl font-bold text-white">{admin.name}</h2>
        <p className="text-sm text-primary font-medium bg-orange-500/10 px-3 py-1 rounded-full mt-1 border border-orange-500/20">Club Admin</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setView('calling')}
          className="flex flex-col items-center justify-center p-6 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-all hover:scale-105 group shadow-sm"
        >
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors border border-green-500/20">
            <Phone size={24} className="fill-current" />
          </div>
          <span className="text-white font-bold">Voice Call</span>
        </button>

        <button 
          onClick={() => setView('messaging')}
          className="flex flex-col items-center justify-center p-6 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-all hover:scale-105 group shadow-sm"
        >
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-500/20">
            <MessageSquare size={24} className="fill-current" />
          </div>
          <span className="text-white font-bold">Message</span>
        </button>
      </div>
    </div>
  );

  const renderCalling = () => (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-between py-20 px-6 animate-in slide-in-from-bottom duration-300">
      <div className="flex flex-col items-center mt-10">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping delay-75"></div>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 relative z-10 shadow-xl">
                <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
            </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">{admin.name}</h2>
        <p className="text-slate-500 animate-pulse">Calling...</p>
      </div>

      <div className="flex items-center gap-8 mb-10">
        <button onClick={onClose} className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-900/40 transition-transform hover:scale-110">
            <PhoneOff size={32} className="text-white fill-current" />
        </button>
      </div>
    </div>
  );

  const renderInCall = () => (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-between py-12 px-6">
      <div className="flex flex-col items-center mt-10 w-full">
         <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 mb-6 shadow-xl">
            <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
         </div>
         <h2 className="text-2xl font-bold text-white">{admin.name}</h2>
         <p className="text-primary font-mono mt-2">{formatTime(callDuration)}</p>
      </div>

      {/* Waveform Visualization Simulation */}
      <div className="flex items-center justify-center space-x-1 h-12 w-full">
         {[1,2,3,4,5,6,7,8,9,10].map(i => (
             <div 
                key={i} 
                className="w-1.5 bg-primary/50 rounded-full animate-pulse"
                style={{ 
                    height: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 0.5 + 0.5}s` 
                }}
             ></div>
         ))}
      </div>

      <div className="w-full max-w-xs">
          <div className="grid grid-cols-3 gap-6 mb-8">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`flex flex-col items-center justify-center space-y-2 group ${isMuted ? 'text-white' : 'text-slate-500'}`}
              >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-slate-700 shadow-md' : 'bg-slate-900 border border-slate-800'}`}>
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </div>
                  <span className="text-xs font-medium">Mute</span>
              </button>
              
              <button className="flex flex-col items-center justify-center space-y-2 text-slate-500 group">
                  <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center group-active:bg-slate-800 transition-colors">
                    <Video size={24} />
                  </div>
                   <span className="text-xs font-medium">Video</span>
              </button>

              <button className="flex flex-col items-center justify-center space-y-2 text-slate-500 group">
                  <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center group-active:bg-slate-800 transition-colors">
                    <Volume2 size={24} />
                  </div>
                   <span className="text-xs font-medium">Speaker</span>
              </button>
          </div>

          <div className="flex justify-center">
            <button onClick={onClose} className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-900/40 transition-transform hover:scale-110">
                <PhoneOff size={32} className="text-white fill-current" />
            </button>
          </div>
      </div>
    </div>
  );

  const renderMessaging = () => (
    <div className="bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative animate-in slide-in-from-bottom duration-300 h-[500px] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
             <div className="flex items-center">
                <img src={admin.avatar} className="w-10 h-10 rounded-full mr-3 border border-slate-700" />
                <div>
                    <h3 className="font-bold text-white text-sm">{admin.name}</h3>
                    <p className="text-xs text-slate-500">Usually replies in 5m</p>
                </div>
             </div>
             <button onClick={onClose} className="text-slate-500 hover:text-white">
                <X size={20} />
             </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950 flex flex-col items-center justify-center">
            {isMessageSent ? (
                <div className="text-center animate-in zoom-in">
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-sm text-slate-500">The admin will get back to you shortly.</p>
                </div>
            ) : (
                <div className="text-center w-full h-full flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                        <MessageSquare size={48} className="text-slate-700 mb-4" />
                        <p className="text-slate-600 text-sm">Start the conversation</p>
                    </div>
                </div>
            )}
        </div>

        {/* Input */}
        {!isMessageSent && (
            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <input 
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-2 py-1 outline-none text-white bg-transparent placeholder-slate-500"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="bg-primary hover:bg-orange-600 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {view === 'selection' && renderSelection()}
      {view === 'calling' && renderCalling()}
      {view === 'incall' && renderInCall()}
      {view === 'messaging' && renderMessaging()}
    </div>
  );
};