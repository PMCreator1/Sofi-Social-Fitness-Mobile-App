
import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { TrendingUp, Plus, Target, CalendarDays, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Event, UserGoal, User } from '../types';
import { EventCard } from '../components/EventCard';
import { AdminContactInterface } from '../components/AdminContactInterface';
import { EventDetailModal } from '../components/EventDetailModal';

interface DashboardProps {
  goal: UserGoal;
  upcomingEvents: Event[];
  onToggleJoin: (id: string) => void;
  onNavigate: (view: string) => void;
}

const activityData = [
  { day: 'M', km: 4 },
  { day: 'T', km: 6 },
  { day: 'W', km: 0 },
  { day: 'T', km: 8 },
  { day: 'F', km: 5 },
  { day: 'S', km: 12 },
  { day: 'S', km: 3 },
];

export const Dashboard: React.FC<DashboardProps> = ({ 
    goal, 
    upcomingEvents, 
    onToggleJoin,
    onNavigate
}) => {
  const [showChart, setShowChart] = useState(false);
  const [contactingOrganizer, setContactingOrganizer] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const percentComplete = Math.min(100, Math.round((goal.currentDistanceKm / goal.targetDistanceKm) * 100));
  const remainingKm = Math.max(0, goal.targetDistanceKm - goal.currentDistanceKm);

  const handleContactOrganizer = (eventId: string) => {
    const event = upcomingEvents.find(e => e.id === eventId);
    if (event) {
        setContactingOrganizer({
            id: `org-${event.id}`,
            name: event.organizer?.name || `${event.club} Rep`,
            avatar: event.organizer?.avatar || `https://picsum.photos/seed/${event.club}/100/100`,
            points: 0,
            rank: 0,
            badges: []
        });
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Hello, Tunde! 👋</h1>
          <p className="text-slate-400 text-sm">Let's plan your active week.</p>
        </div>
        <div className="bg-slate-800 p-1 rounded-full border border-slate-700 shadow-sm">
          <img src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=100&q=80" className="w-10 h-10 rounded-full object-cover" alt="Profile" />
        </div>
      </div>

      {/* Set Weekly Activity / Goal Card */}
      <div 
        onClick={() => onNavigate('explore')}
        className="group relative bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-2xl p-6 shadow-xl shadow-blue-900/20 mb-8 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-blue-500/30 border border-blue-500/20"
      >
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all"></div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <div className="flex items-center space-x-2 text-blue-100 mb-1">
                    <Target size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Weekly Target</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                    {remainingKm > 0 ? `${remainingKm}km to go` : "Goal Reached! 🎉"}
                </h2>
                <p className="text-blue-100 text-xs mt-1">
                    {goal.currentDistanceKm}km of {goal.targetDistanceKm}km completed
                </p>
            </div>
            <div className="bg-white/20 text-white p-2 rounded-xl backdrop-blur-md shadow-lg group-hover:bg-white/30 transition-colors">
                <Plus size={24} />
            </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/20 h-2.5 rounded-full mb-4 overflow-hidden">
            <div 
                className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ width: `${percentComplete}%` }}
            ></div>
        </div>

        <div className="flex items-center justify-between text-sm">
             <div className="flex -space-x-2">
                 {/* Visual indicator of "events" added */}
                 {upcomingEvents.slice(0, 3).map((e, i) => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-600 bg-slate-800 overflow-hidden">
                         <img src={e.image} alt="" className="w-full h-full object-cover" />
                     </div>
                 ))}
                 <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-800 flex items-center justify-center text-[10px] text-white">
                     +
                 </div>
             </div>
             <div className="flex items-center text-blue-100 font-medium group-hover:text-white transition-colors">
                 Set Activity <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
             </div>
        </div>
      </div>

      {/* Collapsible Chart Section */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 mb-8 shadow-sm overflow-hidden transition-all duration-300">
        <button 
          onClick={() => setShowChart(!showChart)}
          className="w-full flex justify-between items-center p-5 focus:outline-none hover:bg-slate-800 transition-colors"
        >
            <h2 className="text-lg font-bold text-white flex items-center">
              <TrendingUp size={18} className="mr-2 text-primary" />
              Activity Trend
            </h2>
            <div className="text-slate-400">
              {showChart ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
        </button>
        
        {showChart && (
          <div className="px-5 pb-5 h-40 w-full animate-in slide-in-from-top-2 duration-200">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}
                />
                <Bar dataKey="km" radius={[4, 4, 4, 4]}>
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.km >= 8 ? '#f97316' : '#475569'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Upcoming / Ongoing Events (Prioritized on Homepage) */}
      <div className="mb-4">
        <div className="flex justify-between items-end mb-3">
             <h2 className="text-lg font-bold text-white flex items-center">
                <CalendarDays size={18} className="mr-2 text-primary" />
                Upcoming & Ongoing
             </h2>
             <button 
                onClick={() => onNavigate('explore')}
                className="text-xs text-primary font-medium hover:text-orange-400 transition-colors"
             >
                Add More
             </button>
        </div>
        
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(event => (
            <EventCard 
                key={event.id} 
                event={event} 
                onToggleJoin={onToggleJoin}
                onContact={handleContactOrganizer}
                onClick={setSelectedEvent}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 border-dashed">
            <p className="text-slate-400 mb-2">No activities planned yet.</p>
            <button 
                onClick={() => onNavigate('explore')}
                className="text-primary text-sm font-bold"
            >
                Start Planning
            </button>
          </div>
        )}
      </div>

       {/* Admin Contact Overlay */}
       {contactingOrganizer && (
          <AdminContactInterface 
              admin={contactingOrganizer} 
              onClose={() => setContactingOrganizer(null)} 
          />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
          <EventDetailModal 
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onToggleJoin={onToggleJoin}
            onContact={handleContactOrganizer}
          />
      )}
    </div>
  );
};
