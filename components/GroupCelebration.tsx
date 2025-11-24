import React, { useState, useEffect } from 'react';
import { X, Trophy, PartyPopper, MapPin, Flag, Zap, Sunrise, Mountain, Crown, Medal } from 'lucide-react';
import { VirtualGroup, GroupMilestone } from '../types';

interface GroupCelebrationProps {
  group: VirtualGroup;
  sessionTotalDistance: number;
  newMilestones: GroupMilestone[];
  onClose: () => void;
}

export const GroupCelebration: React.FC<GroupCelebrationProps> = ({ group, sessionTotalDistance, newMilestones, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasMilestones = newMilestones.length > 0;
  const totalSlides = hasMilestones ? 3 : 2;

  // Auto-advance
  useEffect(() => {
    const timer = setTimeout(() => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(c => c + 1);
        }
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentSlide, totalSlides]);

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide(c => c + 1);
    else onClose();
  };

  const getIcon = (name: string) => {
      switch(name) {
          case 'Sunrise': return Sunrise;
          case 'Mountain': return Mountain;
          case 'Crown': return Crown;
          default: return Medal;
      }
  };

  const renderSummary = () => (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <PartyPopper size={48} className="text-yellow-400" />
          </div>
          <h2 className="text-4xl font-black text-white mb-2">Session<br/>Crushed!</h2>
          <p className="text-xl text-white/80 mb-8">{group.title} complete.</p>
          
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 w-full max-w-xs backdrop-blur-sm">
               <div className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-2">Group Distance</div>
               <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                   {sessionTotalDistance.toFixed(1)} <span className="text-2xl text-slate-500">km</span>
               </div>
               <div className="text-xs text-slate-500 mt-2">Combined effort of {group.members.length} members</div>
          </div>
      </div>
  );

  const renderStats = () => (
      <div className="flex flex-col justify-center h-full p-6 animate-in slide-in-from-right duration-500">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Team Impact</h3>
          
          <div className="space-y-4">
               <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center">
                   <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
                        <MapPin size={24} className="text-blue-500" />
                   </div>
                   <div className="flex-1">
                       <div className="text-sm text-slate-400 font-bold uppercase">All-Time Distance</div>
                       <div className="text-3xl font-black text-white">{group.stats.totalDistance.toFixed(1)} km</div>
                   </div>
               </div>

               <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center">
                   <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mr-4">
                       <Flag size={24} className="text-orange-500" />
                   </div>
                   <div className="flex-1">
                       <div className="text-sm text-slate-400 font-bold uppercase">Sessions</div>
                       <div className="text-3xl font-black text-white">{group.stats.totalSessions}</div>
                   </div>
               </div>

               <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center">
                   <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mr-4">
                       <Zap size={24} className="text-yellow-500" />
                   </div>
                   <div className="flex-1">
                       <div className="text-sm text-slate-400 font-bold uppercase">Total Calories</div>
                       <div className="text-3xl font-black text-white">{group.stats.totalCalories.toLocaleString()}</div>
                   </div>
               </div>
          </div>
      </div>
  );

  const renderMilestones = () => {
      if (!hasMilestones) return null;
      const milestone = newMilestones[0]; 
      const Icon = getIcon(milestone.icon);
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in zoom-in duration-700">
            <div className="mb-4 text-yellow-500 font-bold uppercase tracking-widest animate-pulse border border-yellow-500/30 px-3 py-1 rounded-full bg-yellow-500/10">New Milestone Unlocked!</div>
            
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-2xl animate-spin-slow"></div>
                <div className="w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10 relative z-10">
                    <Icon size={64} className="text-white drop-shadow-md" />
                </div>
            </div>

            <h2 className="text-3xl font-black text-white mb-2">{milestone.name}</h2>
            <p className="text-lg text-slate-300 max-w-xs">{milestone.description}</p>
        </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
        {/* Confetti & FX */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
             {[...Array(20)].map((_, i) => (
                 <div key={i} className="absolute w-2 h-2 bg-primary rounded-full animate-ping" style={{ 
                     top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                     animationDuration: `${Math.random() * 2 + 1}s`, opacity: 0.3 
                 }}></div>
             ))}
        </div>

        {/* Progress Bar */}
        <div className="relative z-20 flex p-2 gap-1 pb-safe pt-safe">
            {Array.from({length: totalSlides}).map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div className={`h-full bg-white transition-all duration-300 ${i <= currentSlide ? 'w-full' : 'w-0'}`}></div>
                </div>
            ))}
        </div>

        <button onClick={onClose} className="absolute top-6 right-4 z-20 text-white/50 hover:text-white">
            <X size={24} />
        </button>

        {/* Content */}
        <div className="flex-1 relative z-10" onClick={handleNext}>
            {currentSlide === 0 && renderSummary()}
            {currentSlide === 1 && renderStats()}
            {currentSlide === 2 && renderMilestones()}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950 border-t border-slate-900 relative z-20">
            <button 
                onClick={onClose}
                className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
            >
                {currentSlide === totalSlides - 1 ? 'Close & Save' : 'Next'}
            </button>
        </div>
    </div>
  );
};