import React from 'react';
import { Timer, Zap, Gauge, Map } from 'lucide-react';
import { EventMetrics as MetricsType } from '../types';

interface EventMetricsProps {
  metrics: MetricsType;
}

export const EventMetrics: React.FC<EventMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
      <div className="flex flex-col items-center p-2">
        <div className="flex items-center text-slate-400 text-[10px] uppercase mb-1">
            <Map size={12} className="mr-1" /> Distance
        </div>
        <span className="text-lg font-bold text-white">{metrics.distanceKm} <span className="text-xs font-normal text-slate-500">km</span></span>
      </div>
      
      <div className="flex flex-col items-center p-2 border-l border-slate-700">
        <div className="flex items-center text-slate-400 text-[10px] uppercase mb-1">
            <Timer size={12} className="mr-1" /> Time
        </div>
        <span className="text-lg font-bold text-white">{metrics.duration}</span>
      </div>

      <div className="flex flex-col items-center p-2 border-t border-slate-700">
         <div className="flex items-center text-slate-400 text-[10px] uppercase mb-1">
            <Gauge size={12} className="mr-1" /> Pace
        </div>
        <span className="text-lg font-bold text-white">{metrics.pace} <span className="text-xs font-normal text-slate-500">/km</span></span>
      </div>

      <div className="flex flex-col items-center p-2 border-t border-l border-slate-700">
         <div className="flex items-center text-slate-400 text-[10px] uppercase mb-1">
            <Zap size={12} className="mr-1" /> Calories
        </div>
        <span className="text-lg font-bold text-white">{metrics.calories} <span className="text-xs font-normal text-slate-500">kcal</span></span>
      </div>
    </div>
  );
};