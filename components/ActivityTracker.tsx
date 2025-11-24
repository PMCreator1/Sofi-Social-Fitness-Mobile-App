import React, { useState, useEffect } from 'react';
import { Pause, StopCircle, Play, Timer, MapPin } from 'lucide-react';
import { Event } from '../types';

interface ActivityTrackerProps {
  event: Event;
  onComplete: (metrics: { distance: number; time: string; calories: number }) => void;
}

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({ event, onComplete }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [distance, setDistance] = useState(0); // km

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
        // Simulate distance increment based on activity type (roughly)
        setDistance(d => d + (event.type === 'Cycling' ? 0.008 : 0.003)); 
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if(interval) clearInterval(interval);
    };
  }, [isActive, event.type]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    // Generate calories based on time and type
    const calories = Math.floor(seconds * (event.type === 'Cycling' ? 0.15 : 0.2));
    onComplete({
        distance: Number(distance.toFixed(2)),
        time: formatTime(seconds),
        calories
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-black rounded-2xl p-6 border border-primary/50 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-5">
      {/* Pulsing background effect */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>

      <div className="flex justify-between items-start mb-6">
        <div>
           <span className="inline-block px-2 py-1 bg-red-600 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse mb-2">Live Tracking</span>
           <h2 className="text-xl font-bold text-white leading-tight">{event.title}</h2>
           <div className="flex items-center text-slate-400 text-sm mt-1">
             <MapPin size={12} className="mr-1" />
             {event.location}
           </div>
        </div>
        <div className="text-right">
           <div className="text-4xl font-mono font-bold text-white tracking-widest">{formatTime(seconds)}</div>
           <div className="text-xs text-slate-400 uppercase tracking-wide">Duration</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card/50 p-3 rounded-xl border border-slate-700 text-center">
            <div className="text-2xl font-bold text-primary">{distance.toFixed(2)}</div>
            <div className="text-xs text-slate-400 uppercase">Kilometers</div>
        </div>
        <div className="bg-card/50 p-3 rounded-xl border border-slate-700 text-center">
             {/* Approximate calories burn rate */}
            <div className="text-2xl font-bold text-orange-400">{Math.floor(seconds * 0.2)}</div>
            <div className="text-xs text-slate-400 uppercase">Calories</div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-xl font-bold flex items-center justify-center transition-all"
        >
          {isActive ? <Pause size={20} /> : <Play size={20} />}
          <span className="ml-2">{isActive ? "Pause" : "Resume"}</span>
        </button>
        <button 
          onClick={handleFinish}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-red-900/30"
        >
          <StopCircle size={20} />
          <span className="ml-2">Finish</span>
        </button>
      </div>
    </div>
  );
};