
import React, { useState, useEffect } from 'react';
import { User, UserGoal, Event } from '../types';
import { CheckCircle, Calendar, Clock, Activity, CalendarCheck, X, Trophy, Timer, MapPin, Zap, PlayCircle, Sparkles, MessageSquare, AlertTriangle, BarChart3 } from 'lucide-react';
import { ShareableStatsCard } from '../components/ShareableStatsCard';
import { MonthlyRecap } from '../components/MonthlyRecap';
import { FeedbackModal } from '../components/FeedbackModal';

interface ProfileProps {
  user: User;
  goal: UserGoal;
  joinedEvents: Event[];
}

export const Profile: React.FC<ProfileProps> = ({ user, goal, joinedEvents }) => {
  // Sync States
  const [isHealthConnected, setIsHealthConnected] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Recap State
  const [showRecap, setShowRecap] = useState(false);

  useEffect(() => {
    // Check localStorage for simulated persistence
    const health = localStorage.getItem('appleHealthConnected') === 'true';
    const cal = localStorage.getItem('appleCalendarConnected') === 'true';
    setIsHealthConnected(health);
    setIsCalendarConnected(cal);
  }, []);

  const handleConnect = (type: 'health' | 'calendar') => {
      if (type === 'health') {
          const newState = !isHealthConnected;
          setIsHealthConnected(newState);
          localStorage.setItem('appleHealthConnected', String(newState));
          if (newState) triggerToast();
      } else {
          const newState = !isCalendarConnected;
          setIsCalendarConnected(newState);
          localStorage.setItem('appleCalendarConnected', String(newState));
          if (newState) triggerToast();
      }
  };

  const triggerToast = () => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
  };

  // Helper to get date string YYYY-MM-DD
  const toDateString = (date: Date) => date.toISOString().split('T')[0];

  // Generate last 14 days + next 3 days
  const today = new Date();
  const days = [];
  for (let i = -13; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  const getEventForDate = (dateStr: string) => {
    return joinedEvents.find(e => e.date === dateStr);
  };

  const isPast = (date: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date < now;
  };

  const isToday = (date: Date) => {
    const now = new Date();
    return date.toDateString() === now.toDateString();
  };

  const completedEvents = joinedEvents.filter(e => e.status === 'completed');
  const upcomingEvents = joinedEvents.filter(e => e.status !== 'completed');

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto relative">
      {/* Toast Notification */}
      {showToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-6 py-3 rounded-full shadow-xl z-50 animate-in fade-in slide-in-from-top-2 flex items-center">
              <CheckCircle size={16} className="text-green-500 mr-2" />
              <span className="text-sm font-bold">Successfully Connected</span>
          </div>
      )}

      {/* Modals */}
      {showRecap && (
          <MonthlyRecap 
              user={user} 
              events={completedEvents} 
              onClose={() => setShowRecap(false)} 
          />
      )}
      
      {showFeedback && (
          <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}

      {/* Profile Header */}
      <div className="flex flex-col items-center mb-6">
        {/* Render the new Activity Card */}
        <div className="w-full transform transition-all duration-500 hover:scale-[1.01]">
            <ShareableStatsCard user={user} goal={goal} />
        </div>
      </div>

      {/* Beta Feedback & Usability Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 mb-6 border border-slate-700 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
             <AlertTriangle size={64} className="text-yellow-500" />
         </div>
         <h2 className="text-lg font-bold text-white mb-2 flex items-center">
             <MessageSquare size={18} className="mr-2 text-yellow-500" />
             Beta Program
         </h2>
         <p className="text-xs text-slate-400 mb-4 relative z-10">
             Help us validate the app! Report usability issues or suggest new features.
         </p>
         
         <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Sys Usability Scale</div>
                <div className="text-xl font-bold text-green-400">84/100</div>
            </div>
            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Bug Free Rate</div>
                <div className="text-xl font-bold text-blue-400">98.2%</div>
            </div>
         </div>

         <button 
            onClick={() => setShowFeedback(true)}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors border border-slate-600 flex items-center justify-center"
         >
             <BarChart3 size={16} className="mr-2" /> Give Feedback
         </button>
      </div>

      {/* Recap Banner Trigger - Simulated "End of Month" */}
      {completedEvents.length > 0 && (
          <div 
            onClick={() => setShowRecap(true)}
            className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl p-1 mb-6 cursor-pointer shadow-lg shadow-purple-900/40 hover:scale-[1.02] transition-transform"
          >
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 animate-pulse">
                          <Sparkles size={24} className="text-white" />
                      </div>
                      <div>
                          <h3 className="text-white font-black text-lg">Your Monthly Recap</h3>
                          <p className="text-white/80 text-xs font-medium">Ready to view your highlights?</p>
                      </div>
                  </div>
                  <div className="w-10 h-10 bg-white text-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <PlayCircle size={24} className="fill-current" />
                  </div>
              </div>
          </div>
      )}

      {/* App Integrations Section */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
              <Activity size={18} className="mr-2 text-primary" />
              Integrations
          </h2>
          <div className="space-y-4">
              {/* Apple Health */}
              <div className="flex items-center justify-between">
                  <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center mr-3 border border-red-500/20">
                          <Activity size={20} className="fill-current" />
                      </div>
                      <div>
                          <p className="text-white font-bold text-sm">Apple Health</p>
                          <p className="text-slate-500 text-xs">Sync steps & calories</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => handleConnect('health')}
                    className={`w-12 h-7 rounded-full transition-colors relative ${isHealthConnected ? 'bg-green-500' : 'bg-slate-700'}`}
                  >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all ${isHealthConnected ? 'left-6' : 'left-1'}`}></div>
                  </button>
              </div>
              
              <div className="h-px bg-slate-800"></div>

              {/* Apple Calendar */}
              <div className="flex items-center justify-between">
                  <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mr-3 border border-blue-500/20">
                          <CalendarCheck size={20} />
                      </div>
                      <div>
                          <p className="text-white font-bold text-sm">Apple Calendar</p>
                          <p className="text-slate-500 text-xs">Add events to schedule</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => handleConnect('calendar')}
                    className={`w-12 h-7 rounded-full transition-colors relative ${isCalendarConnected ? 'bg-green-500' : 'bg-slate-700'}`}
                  >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all ${isCalendarConnected ? 'left-6' : 'left-1'}`}></div>
                  </button>
              </div>
          </div>
      </div>

      {/* Streak Visualization */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white flex items-center">
            <Calendar size={18} className="mr-2 text-primary" />
            Activity Streak
          </h2>
          <span className="text-xs text-slate-500">Last 14 Days</span>
        </div>
        
        {/* Horizontal Calendar Scroll */}
        <div className="flex justify-between relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
          
          <div className="flex space-x-2 overflow-x-auto no-scrollbar py-2 w-full z-10 px-1">
            {days.slice(0, 7).map((date, i) => { 
                const dateStr = toDateString(date);
                const event = getEventForDate(dateStr);
                const past = isPast(date);
                const today = isToday(date);
                
                let statusColor = "bg-slate-950 border-slate-800 text-slate-600"; 
                let icon = <span className="text-[10px] font-bold">{date.getDate()}</span>;
                
                if (today) {
                  statusColor = "bg-slate-900 border-primary text-primary ring-2 ring-primary/30";
                } else if (past) {
                  if (event) {
                    statusColor = "bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/20";
                    icon = <CheckCircle size={14} />;
                  }
                } else {
                   // Future
                   if (event) {
                     statusColor = "bg-slate-900 border-primary text-primary border-dashed";
                     icon = <Clock size={14} />;
                   }
                }

                return (
                   <div key={dateStr} className="flex flex-col items-center flex-shrink-0 space-y-2">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${statusColor}`}>
                        {icon}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </span>
                   </div>
                );
            })}
             <div className="flex flex-col items-center justify-center px-1">
                 <div className="w-1 h-1 bg-slate-700 rounded-full mb-1"></div>
                 <div className="w-1 h-1 bg-slate-700 rounded-full mb-1"></div>
                 <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
            </div>
             {days.slice(14, 17).map((date, i) => {
                 const dateStr = toDateString(date);
                 const event = getEventForDate(dateStr);
                 let statusColor = "bg-slate-950 border-slate-800 text-slate-600";
                 let icon = <span className="text-[10px] font-bold">{date.getDate()}</span>;
                 
                 if (event) {
                      statusColor = "bg-slate-900 border-primary text-primary border-dashed";
                      icon = <Clock size={14} />;
                 }
                 
                 return (
                    <div key={dateStr} className="flex flex-col items-center flex-shrink-0 space-y-2">
                       <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${statusColor}`}>
                         {icon}
                       </div>
                       <span className="text-[10px] text-slate-500 font-medium">
                         {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                       </span>
                    </div>
                 );
             })}
          </div>
        </div>
      </div>

      {/* Upcoming & Ongoing Section Restored */}
      <div className="mb-6">
        <h3 className="text-white font-bold mb-3 flex items-center">
            <Calendar size={18} className="mr-2 text-primary" />
            Upcoming & Ongoing
        </h3>
        {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
                {upcomingEvents.map(event => (
                    <div key={event.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center">
                         <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 mr-4">
                             <img src={event.image} className="w-full h-full object-cover" alt={event.type} />
                         </div>
                         <div className="flex-1">
                             <h4 className="text-white font-bold text-sm">{event.title}</h4>
                             <p className="text-xs text-primary">{event.date} • {event.time}</p>
                         </div>
                         {event.status === 'active' && (
                            <div className="flex items-center text-red-500 text-xs font-bold animate-pulse">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                                LIVE
                            </div>
                         )}
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-6 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                <p className="text-slate-500 text-sm">No upcoming activities.</p>
            </div>
        )}
      </div>

      {/* History */}
      <div>
        <h3 className="text-white font-bold mb-3 flex items-center">
            <CheckCircle size={18} className="mr-2 text-green-500" />
            History
        </h3>
        {completedEvents.length > 0 ? (
            <div className="space-y-3">
                {completedEvents.map(event => (
                    <button 
                        key={event.id} 
                        onClick={() => setSelectedEvent(event)}
                        className="w-full bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex items-center opacity-75 hover:opacity-100 transition-all hover:scale-[1.02] text-left group"
                    >
                         <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 mr-4 grayscale group-hover:grayscale-0 transition-all">
                             <img src={event.image} className="w-full h-full object-cover" alt={event.type} />
                         </div>
                         <div className="flex-1">
                             <h4 className="text-slate-300 group-hover:text-white font-bold text-sm line-through decoration-slate-500 group-hover:no-underline">{event.title}</h4>
                             <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-slate-500">{event.date} • Completed</p>
                                {event.metrics && <p className="text-xs text-primary font-bold">{event.metrics.distanceKm}km</p>}
                             </div>
                         </div>
                    </button>
                ))}
            </div>
        ) : (
            <p className="text-slate-500 text-sm italic">No history yet. Start your journey!</p>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-800 animate-in slide-in-from-bottom duration-300 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{selectedEvent.type}</p>
                          <h2 className="text-xl font-bold text-white leading-tight">{selectedEvent.title}</h2>
                          <p className="text-slate-400 text-sm">{selectedEvent.date} • {selectedEvent.time}</p>
                      </div>
                      <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Stats Grid */}
                  {selectedEvent.metrics && (
                      <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                              <MapPin size={20} className="mx-auto text-blue-500 mb-2" />
                              <div className="text-2xl font-bold text-white">{selectedEvent.metrics.distanceKm}</div>
                              <div className="text-[10px] uppercase text-slate-500 font-bold">Kilometers</div>
                          </div>
                          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                              <Timer size={20} className="mx-auto text-green-500 mb-2" />
                              <div className="text-2xl font-bold text-white">{selectedEvent.metrics.duration}</div>
                              <div className="text-[10px] uppercase text-slate-500 font-bold">Duration</div>
                          </div>
                          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                              <Zap size={20} className="mx-auto text-yellow-500 mb-2" />
                              <div className="text-2xl font-bold text-white">{selectedEvent.metrics.calories}</div>
                              <div className="text-[10px] uppercase text-slate-500 font-bold">Calories</div>
                          </div>
                           <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                              <Activity size={20} className="mx-auto text-orange-500 mb-2" />
                              <div className="text-2xl font-bold text-white">{selectedEvent.metrics.pace}</div>
                              <div className="text-[10px] uppercase text-slate-500 font-bold">Avg Pace</div>
                          </div>
                      </div>
                  )}

                  {/* Leaderboard Section */}
                  {selectedEvent.leaderboard && selectedEvent.leaderboard.length > 0 && (
                      <div>
                          <h3 className="font-bold text-white mb-3 flex items-center">
                              <Trophy size={16} className="text-yellow-500 mr-2" />
                              Session Leaderboard
                          </h3>
                          <div className="space-y-2">
                              {selectedEvent.leaderboard.map((member, index) => {
                                  const isMe = member.id === user.id;
                                  return (
                                      <div key={member.id} className={`flex items-center p-3 rounded-xl border ${isMe ? 'bg-primary/10 border-primary/50' : 'bg-slate-950 border-slate-800'}`}>
                                          <div className={`w-6 text-center font-bold text-sm mr-3 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-700' : 'text-slate-600'}`}>
                                              {index + 1}
                                          </div>
                                          <img src={member.avatar} className="w-8 h-8 rounded-full mr-3 bg-slate-800" />
                                          <div className="flex-1">
                                              <p className={`text-sm font-bold ${isMe ? 'text-primary' : 'text-white'}`}>{member.name} {isMe && '(You)'}</p>
                                          </div>
                                          <div className="text-right">
                                              <p className="text-xs font-bold text-white">{member.finalMetrics?.distanceKm || member.currentDistance.toFixed(2)} km</p>
                                              <p className="text-[10px] text-slate-500">{member.finalMetrics?.duration || 'DNF'}</p>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  )}

                  {!selectedEvent.leaderboard && (
                      <div className="bg-slate-950 p-4 rounded-xl text-center border border-slate-800 border-dashed">
                          <p className="text-sm text-slate-500">Solo Activity</p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};
