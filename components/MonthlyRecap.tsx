
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Share2, Trophy, Flame, Map, Zap, Calendar, Crown, Medal, Award } from 'lucide-react';
import { Event, User } from '../types';

interface MonthlyRecapProps {
  user: User;
  events: Event[];
  onClose: () => void;
}

type PersonaType = 'Conqueror' | 'Socialite' | 'Speedster' | 'Zen Master' | 'Weekend Warrior' | 'Achiever';

interface Persona {
  type: PersonaType;
  title: string;
  description: string;
  color: string;
  icon: React.ElementType;
}

export const MonthlyRecap: React.FC<MonthlyRecapProps> = ({ user, events, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  // Calculate Stats
  const totalDistance = events.reduce((acc, curr) => acc + (curr.metrics?.distanceKm || 0), 0);
  const totalCalories = events.reduce((acc, curr) => acc + (curr.metrics?.calories || 0), 0);
  const totalDurationSeconds = events.reduce((acc, curr) => {
    // Rough estimate from string "HH:MM:SS"
    if (!curr.metrics?.duration) return acc;
    const parts = curr.metrics.duration.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    return acc + seconds;
  }, 0);
  
  const hours = Math.floor(totalDurationSeconds / 3600);

  // Determine Persona
  let persona: Persona = {
    type: 'Achiever',
    title: 'The Achiever',
    description: 'You showed up and got it done. Consistency is your superpower.',
    color: 'from-blue-500 to-cyan-500',
    icon: Award
  };

  if (totalDistance > 50) {
    persona = {
      type: 'Conqueror',
      title: 'The Conqueror',
      description: 'Miles mean nothing to you. You crushed serious distance this month!',
      color: 'from-orange-500 to-red-600',
      icon: Crown
    };
  } else if (events.length > 5) {
    persona = {
      type: 'Socialite',
      title: 'The Socialite',
      description: 'You love the community energy. Always there, always active.',
      color: 'from-purple-500 to-pink-500',
      icon: Trophy
    };
  } else if (events.some(e => e.type === 'Yoga' || e.type === 'Walking') && events.length > 3) {
    persona = {
      type: 'Zen Master',
      title: 'The Zen Master',
      description: 'Mind, body, and soul. You found balance in your movement.',
      color: 'from-emerald-500 to-teal-500',
      icon: Medal
    };
  }

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide(c => c + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  const handleShare = async () => {
      const text = `I'm a "${persona.title}" on Routine this month! 🏆\n${totalDistance.toFixed(1)}km • ${events.length} Events.`;
      if (navigator.share) {
          try {
              await navigator.share({ title: 'My Monthly Recap', text, url: window.location.href });
          } catch (e) { console.log(e); }
      } else {
          alert("Screenshot to share!");
      }
  };

  // Auto-advance
  useEffect(() => {
      const timer = setTimeout(() => {
          handleNext();
      }, 5000); // 5 seconds per slide
      return () => clearTimeout(timer);
  }, [currentSlide]);

  const renderSlideContent = () => {
      switch(currentSlide) {
          case 0: // Intro
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <Calendar size={48} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-2">October<br/>Recap</h2>
                    <p className="text-xl text-white/80">Your month in motion.</p>
                </div>
            );
          case 1: // The Numbers
            return (
                <div className="flex flex-col justify-center h-full p-6 animate-in slide-in-from-right duration-500">
                    <h3 className="text-2xl font-bold text-white mb-8">You were unstoppable.</h3>
                    
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                            <div className="flex items-center mb-2">
                                <Map size={24} className="text-blue-400 mr-3" />
                                <span className="text-white/60 uppercase text-xs font-bold tracking-wider">Distance</span>
                            </div>
                            <div className="text-5xl font-black text-white">{totalDistance.toFixed(1)}<span className="text-2xl ml-1 text-white/60">km</span></div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                            <div className="flex items-center mb-2">
                                <Flame size={24} className="text-orange-400 mr-3" />
                                <span className="text-white/60 uppercase text-xs font-bold tracking-wider">Burn</span>
                            </div>
                            <div className="text-5xl font-black text-white">{totalCalories}<span className="text-2xl ml-1 text-white/60">kcal</span></div>
                        </div>
                    </div>
                </div>
            );
          case 2: // Top Event
             const topEvent = events.reduce((prev, current) => ((prev.metrics?.distanceKm || 0) > (current.metrics?.distanceKm || 0)) ? prev : current, events[0]);
             if (!topEvent) return null;
             
             return (
                <div className="flex flex-col h-full p-6 pt-20 animate-in slide-in-from-right duration-500">
                     <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-center">Highlight</h3>
                     
                     <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl transform rotate-2">
                         <div className="h-64 relative">
                             <img src={topEvent.image} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                             <div className="absolute bottom-4 left-4">
                                 <div className="text-white font-bold text-xl">{topEvent.title}</div>
                                 <div className="text-white/80 text-sm">{topEvent.date}</div>
                             </div>
                         </div>
                         <div className="p-6 bg-slate-900">
                             <div className="flex justify-between text-center">
                                 <div>
                                     <div className="text-2xl font-bold text-white">{topEvent.metrics?.distanceKm}</div>
                                     <div className="text-[10px] text-slate-400 uppercase">Km</div>
                                 </div>
                                 <div>
                                     <div className="text-2xl font-bold text-white">{topEvent.metrics?.pace}</div>
                                     <div className="text-[10px] text-slate-400 uppercase">Pace</div>
                                 </div>
                                 <div>
                                     <div className="text-2xl font-bold text-white">{topEvent.metrics?.calories}</div>
                                     <div className="text-[10px] text-slate-400 uppercase">Cals</div>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
             );
          case 3: // Persona Reveal
             const Icon = persona.icon;
             return (
                 <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in zoom-in duration-700">
                     <div className="mb-2 text-white/60 font-bold uppercase tracking-widest">Your Persona</div>
                     <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${persona.color} flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-pulse`}>
                         <Icon size={64} className="text-white" />
                     </div>
                     <h2 className="text-4xl font-black text-white mb-4">{persona.title}</h2>
                     <p className="text-xl text-white/90 leading-relaxed font-medium">{persona.description}</p>
                 </div>
             );
          case 4: // Share Summary
             return (
                 <div className="flex flex-col items-center justify-center h-full p-6 animate-in slide-in-from-right duration-500">
                     <div className="bg-slate-900 rounded-[32px] p-8 w-full border border-white/10 shadow-2xl text-center mb-8 relative overflow-hidden">
                         <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${persona.color}`}></div>
                         <div className="flex items-center justify-center mb-4">
                             <img src={user.avatar} className="w-16 h-16 rounded-full border-4 border-slate-800" />
                         </div>
                         <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                         <p className={`text-sm font-bold bg-gradient-to-r ${persona.color} bg-clip-text text-transparent mb-6`}>{persona.title}</p>
                         
                         <div className="grid grid-cols-3 gap-2 mb-6">
                             <div className="bg-slate-800 p-2 rounded-xl">
                                 <div className="text-lg font-bold text-white">{totalDistance.toFixed(0)}</div>
                                 <div className="text-[10px] text-slate-500">KM</div>
                             </div>
                             <div className="bg-slate-800 p-2 rounded-xl">
                                 <div className="text-lg font-bold text-white">{events.length}</div>
                                 <div className="text-[10px] text-slate-500">Events</div>
                             </div>
                             <div className="bg-slate-800 p-2 rounded-xl">
                                 <div className="text-lg font-bold text-white">{hours}h</div>
                                 <div className="text-[10px] text-slate-500">Time</div>
                             </div>
                         </div>
                         
                         <div className="flex justify-center">
                            <img src="/api/placeholder/150/50" className="h-6 opacity-30 invert" alt="Routine App" />
                         </div>
                     </div>

                     <button 
                        onClick={handleShare}
                        className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                     >
                         <Share2 size={20} className="mr-2" /> Share Summary
                     </button>
                 </div>
             );
          default:
              return null;
      }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black">
        {/* Background Gradients */}
        <div className={`absolute inset-0 bg-gradient-to-br ${persona.color} opacity-20`}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex p-2 gap-1 pb-safe">
            {Array.from({length: totalSlides}).map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                        className={`h-full bg-white transition-all duration-300 ${i < currentSlide ? 'w-full' : i === currentSlide ? 'animate-progress origin-left w-full' : 'w-0'}`}
                        style={{ animationDuration: '5000ms', animationPlayState: i === currentSlide ? 'running' : 'paused' }}
                    ></div>
                </div>
            ))}
        </div>

        {/* Controls */}
        <button onClick={onClose} className="absolute top-6 right-4 z-20 text-white/60 hover:text-white">
            <X size={24} />
        </button>
        
        <div className="absolute inset-0 flex z-10">
            <div className="w-1/3 h-full" onClick={handlePrev}></div>
            <div className="w-2/3 h-full" onClick={handleNext}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full pt-8 pb-10">
            {renderSlideContent()}
        </div>

        <style>{`
            @keyframes progress {
                from { width: 0%; }
                to { width: 100%; }
            }
            .animate-progress {
                animation-name: progress;
                animation-timing-function: linear;
            }
        `}</style>
    </div>
  );
};
