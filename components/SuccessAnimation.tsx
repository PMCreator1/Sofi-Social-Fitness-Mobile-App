
import React, { useEffect, useState } from 'react';
import { Trophy, Share2, X, MapPin, Timer, Zap, Activity } from 'lucide-react';
import { Event } from '../types';

interface SuccessAnimationProps {
  event: Event;
  onClose: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ event, onClose }) => {
  const [particles, setParticles] = useState<{id: number, left: number, delay: number, color: string}[]>([]);

  useEffect(() => {
    // Generate confetti particles
    const colors = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#ffffff'];
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setParticles(newParticles);
  }, []);

  if (!event.metrics) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      
      {/* Confetti Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute top-[-10px] w-2 h-2 rounded-full animate-fall"
            style={{
              left: `${p.left}%`,
              backgroundColor: p.color,
              animationDuration: `${Math.random() * 2 + 2}s`,
              animationDelay: `${p.delay}s`,
              opacity: 0.8
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>

      <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-1 border border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-500">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-blue-600 rounded-3xl opacity-20 blur-xl"></div>
        
        <div className="bg-slate-900 rounded-[22px] p-6 relative z-10 overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>

          <div className="flex flex-col items-center mb-8 pt-4">
             <div className="relative mb-6">
                 <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping duration-[3s]"></div>
                 <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Trophy size={48} className="text-white drop-shadow-md" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 bg-slate-800 rounded-full p-2 border border-slate-700">
                    <Activity size={16} className="text-green-500" />
                 </div>
             </div>
             
             <h2 className="text-3xl font-black text-white mb-1 tracking-tight">Crushed It!</h2>
             <p className="text-slate-400 text-sm font-medium">{event.title} Completed</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center relative group hover:border-blue-500/50 transition-colors">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                  <MapPin size={20} className="mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl font-black text-white tracking-tight">{event.metrics.distanceKm}</div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Kilometers</div>
              </div>
              
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center relative group hover:border-green-500/50 transition-colors">
                  <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                  <Timer size={20} className="mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-black text-white tracking-tight">{event.metrics.duration}</div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Duration</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center relative group hover:border-orange-500/50 transition-colors">
                  <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                  <Zap size={20} className="mx-auto text-orange-500 mb-2" />
                  <div className="text-2xl font-black text-white tracking-tight">{event.metrics.calories}</div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Calories</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center relative group hover:border-purple-500/50 transition-colors">
                  <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                  <Activity size={20} className="mx-auto text-purple-500 mb-2" />
                  <div className="text-2xl font-black text-white tracking-tight">{event.metrics.pace}</div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Avg Pace</div>
              </div>
          </div>

          <div className="flex gap-3">
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-colors border border-slate-700">
                  <Share2 size={18} className="mr-2" /> Share
              </button>
              <button 
                onClick={onClose}
                className="flex-[2] bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                  Continue
              </button>
          </div>

        </div>
      </div>
    </div>
  );
};
