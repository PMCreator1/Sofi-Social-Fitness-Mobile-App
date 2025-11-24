
import React from 'react';
import { Calendar, MapPin, Users, CheckCircle, Play, Trophy, MessageCircle, Wallet } from 'lucide-react';
import { Event } from '../types';
import { EventMetrics } from './EventMetrics';

interface EventCardProps {
  event: Event;
  onToggleJoin: (id: string) => void;
  onStartActivity?: (id: string) => void;
  onContact?: (id: string) => void;
  onClick?: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onToggleJoin, onStartActivity, onContact, onClick }) => {
  const isToday = new Date(event.date).toDateString() === new Date().toDateString();
  const isCompleted = event.status === 'completed';
  const isPaid = event.price && event.price > 0;

  return (
    <div 
        onClick={() => onClick && onClick(event)}
        className={`bg-slate-900 rounded-2xl overflow-hidden shadow-lg mb-4 border transition-transform active:scale-[0.99] cursor-pointer ${isCompleted ? 'border-primary/30' : 'border-slate-800'}`}
    >
      <div className="relative h-32 w-full group">
        <img 
          src={event.image} 
          alt={event.title} 
          className={`w-full h-full object-cover transition-all duration-500 ${isCompleted ? 'grayscale opacity-60' : 'opacity-80'}`}
        />
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/60 to-transparent"></div>
        
        <div className="absolute top-2 right-2 flex gap-2">
            {isPaid && (
                <div className="bg-green-600/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold tracking-wider text-white shadow-sm border border-white/10 flex items-center">
                    <Wallet size={10} className="mr-1" />
                    {event.currency || 'NGN'} {event.price?.toLocaleString()}
                </div>
            )}
            <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white shadow-sm border border-white/10">
              {event.type}
            </div>
        </div>
        
        {isCompleted && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/60">
               <span className="bg-green-600/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                   <Trophy size={12} className="mr-1" /> Completed
               </span>
           </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-white leading-tight">{event.title}</h3>
        </div>
        <p className="text-primary text-sm font-medium mb-3">{event.club}</p>
        
        <div className="space-y-2 text-slate-400 text-sm mb-4">
          <div className="flex items-center">
            <Calendar size={14} className="mr-2 text-slate-500" />
            <span>{event.date} • {event.time}</span>
          </div>
          <div className="flex items-center">
            <MapPin size={14} className="mr-2 text-slate-500" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center">
            <Users size={14} className="mr-2 text-slate-500" />
            <span>{event.attendees} going</span>
          </div>
        </div>

        {isCompleted && event.metrics ? (
            <EventMetrics metrics={event.metrics} />
        ) : (
            <div className="flex gap-2">
                {onContact && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onContact(event.id);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl border border-slate-700 transition-colors"
                        title="Contact Organizer"
                    >
                        <MessageCircle size={20} />
                    </button>
                )}
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleJoin(event.id);
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center transition-all ${
                        event.isJoined 
                        ? 'bg-green-900/30 text-green-400 border border-green-800' 
                        : isPaid 
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90 shadow-lg shadow-green-900/20'
                            : 'bg-white text-slate-900 hover:bg-slate-200'
                    }`}
                >
                {event.isJoined ? (
                    <>
                    <CheckCircle size={18} className="mr-2" />
                    Joined
                    </>
                ) : (
                    isPaid ? 'Pay & Join' : 'Join Event'
                )}
                </button>

                {event.isJoined && isToday && onStartActivity && (
                    <button 
                        onClick={(e) => {
                             e.stopPropagation();
                             onStartActivity(event.id);
                        }}
                        className="flex-1 bg-primary hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center shadow-lg shadow-orange-500/20 animate-pulse"
                    >
                        <Play size={18} className="mr-2 fill-current" />
                        Start
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
