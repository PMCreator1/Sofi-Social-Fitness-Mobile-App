
import React from 'react';
import { X, MapPin, Calendar, Clock, Users, Star, CheckCircle, ShieldCheck, Wallet, Share2 } from 'lucide-react';
import { Event } from '../types';

interface EventDetailModalProps {
  event: Event;
  onClose: () => void;
  onToggleJoin: (id: string) => void;
  onContact?: (id: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onToggleJoin, onContact }) => {
  const isPaid = event.price && event.price > 0;
  
  // Mock organizer if missing (fallback)
  const organizer = event.organizer || {
      id: 'org-default',
      name: event.club,
      avatar: `https://ui-avatars.com/api/?name=${event.club}&background=f97316&color=fff`,
      rating: 4.5,
      reviews: 42,
      bio: `Community organizer for ${event.type} events in ${event.location.split(',')[0]}.`,
      isVerified: false
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-950 w-full sm:max-w-md h-[90vh] sm:h-auto sm:rounded-3xl rounded-t-3xl border-t sm:border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* Header Image */}
        <div className="relative h-64 w-full flex-shrink-0">
            <img src={event.image} className="w-full h-full object-cover" alt={event.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60"></div>
            
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-full border border-white/10 transition-colors"
            >
                <X size={20} />
            </button>

            <div className="absolute top-4 left-4">
                 <span className="bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
                     {event.type}
                 </span>
            </div>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 -mt-6 relative z-10 bg-slate-950 rounded-t-3xl">
            {/* Title & Price */}
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white leading-tight flex-1 mr-4">{event.title}</h2>
                {isPaid ? (
                    <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-green-500">{event.currency} {event.price?.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Per Person</span>
                    </div>
                ) : (
                    <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">Free</span>
                )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center">
                    <Calendar size={18} className="text-primary mr-3" />
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Date</p>
                        <p className="text-sm font-bold text-white">{event.date}</p>
                    </div>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center">
                    <Clock size={18} className="text-primary mr-3" />
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Time</p>
                        <p className="text-sm font-bold text-white">{event.time}</p>
                    </div>
                </div>
                <div className="col-span-2 bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center">
                    <MapPin size={18} className="text-primary mr-3" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 uppercase font-bold">Location</p>
                        <p className="text-sm font-bold text-white truncate">{event.location}</p>
                    </div>
                </div>
            </div>

            {/* Organizer Card */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center">
                    <ShieldCheck size={16} className="text-green-500 mr-2" />
                    Organizer
                </h3>
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <div className="flex items-center mb-3">
                        <img src={organizer.avatar} alt={organizer.name} className="w-12 h-12 rounded-full mr-3 object-cover border border-slate-700" />
                        <div>
                            <div className="flex items-center">
                                <h4 className="text-white font-bold">{organizer.name}</h4>
                                {organizer.isVerified && <CheckCircle size={14} className="text-blue-500 ml-1 fill-current" />}
                            </div>
                            <div className="flex items-center text-xs text-slate-400 mt-1">
                                <Star size={12} className="text-yellow-500 fill-current mr-1" />
                                <span className="text-white font-bold mr-1">{organizer.rating}</span>
                                <span>({organizer.reviews} reviews)</span>
                            </div>
                        </div>
                        {onContact && (
                             <button 
                                onClick={() => onContact(organizer.id)}
                                className="ml-auto bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition-colors"
                             >
                                 Contact
                             </button>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
                        {organizer.bio}
                    </p>
                </div>
            </div>

            {/* Description */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">About Event</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{event.description}</p>
            </div>

            {/* Attendees Preview */}
            <div className="mb-8">
                 <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Attendees</h3>
                    <span className="text-xs text-primary font-bold">{event.attendees} Going</span>
                 </div>
                 <div className="flex items-center">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 -ml-2 first:ml-0 bg-slate-800 overflow-hidden relative">
                             <img src={`https://picsum.photos/seed/${event.id}-${i}/100/100`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-slate-950 -ml-2 bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">
                        +{(event.attendees || 5) - 5}
                    </div>
                 </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3 pb-safe">
             <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-4 rounded-xl transition-colors border border-slate-700">
                 <Share2 size={20} />
             </button>
             <button
                onClick={() => {
                    onToggleJoin(event.id);
                    if (event.isJoined) onClose();
                }}
                className={`flex-1 font-bold py-4 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-[0.98] ${
                    event.isJoined 
                    ? 'bg-green-900/30 text-green-400 border border-green-800'
                    : isPaid 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-900/20'
                        : 'bg-primary text-white hover:bg-orange-600 shadow-orange-900/20'
                }`}
            >
                {event.isJoined ? (
                    <>
                        <CheckCircle size={20} className="mr-2" /> Joined
                    </>
                ) : (
                    <>
                        {isPaid && <Wallet size={18} className="mr-2" />}
                        {isPaid ? `Pay ${event.currency} ${event.price?.toLocaleString()}` : 'Join Event'}
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};
