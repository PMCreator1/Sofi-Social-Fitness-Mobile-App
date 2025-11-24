
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, MapPin, Filter, Map as MapIcon, List, X, Camera, Loader2, Check } from 'lucide-react';
import { Event, ActivityType, User } from '../types';
import { EventCard } from '../components/EventCard';
import { searchEventsWithGemini, extractEventFromFlyer } from '../services/geminiService';
import { AdminContactInterface } from '../components/AdminContactInterface';
import { EventDetailModal } from '../components/EventDetailModal';

interface ExploreProps {
  events: Event[];
  onToggleJoin: (id: string) => void;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

export const Explore: React.FC<ExploreProps> = ({ events, onToggleJoin, setEvents }) => {
  const [activeFilter, setActiveFilter] = useState<ActivityType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [contactingOrganizer, setContactingOrganizer] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedMapEvent, setSelectedMapEvent] = useState<Event | null>(null);
  const [detailedEvent, setDetailedEvent] = useState<Event | null>(null);
  
  // Flyer Scanning State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedEvent, setScannedEvent] = useState<Partial<Event> | null>(null);

  useEffect(() => {
     if ("geolocation" in navigator) {
       navigator.geolocation.getCurrentPosition((position) => {
         // Simulated geocoding
       });
     }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setAiMessage("Scouting for the best spots in town...");
    
    const result = await searchEventsWithGemini(searchQuery, location);
    
    setAiMessage(result.text);
    if (result.events.length > 0) {
        setEvents(prev => {
            const newIds = new Set(result.events.map(e => e.id));
            const filteredPrev = prev.filter(e => !newIds.has(e.id));
            return [...result.events, ...filteredPrev];
        });
    }
    setIsSearching(false);
  };

  const handleContactOrganizer = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
        setContactingOrganizer({
            id: `org-${event.id}`,
            name: event.organizer?.name || `${event.club} Admin`,
            avatar: event.organizer?.avatar || `https://picsum.photos/seed/${event.club}/100/100`,
            points: 0,
            rank: 0,
            badges: []
        });
    }
  };

  // --- Flyer Scanning Logic ---
  const handleCameraClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsScanning(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64 = reader.result as string;
          // Extract Base64 data part
          const base64Data = base64.split(',')[1];
          
          const result = await extractEventFromFlyer(base64Data);
          
          if (result) {
              setScannedEvent(result);
          } else {
              alert("Could not read the flyer. Please try again.");
          }
          setIsScanning(false);
      };
      reader.readAsDataURL(file);
      
      // Reset input
      e.target.value = '';
  };

  const handleConfirmScannedEvent = () => {
      if (scannedEvent) {
          // Complete the partial event
          const newEvent: Event = {
              id: scannedEvent.id || `scan-${Date.now()}`,
              title: scannedEvent.title || "Untitled Event",
              club: scannedEvent.club || "Community",
              type: (scannedEvent.type as ActivityType) || "Walking",
              date: scannedEvent.date || new Date().toISOString().split('T')[0],
              time: scannedEvent.time || "09:00",
              location: scannedEvent.location || "TBD",
              attendees: scannedEvent.attendees || 1,
              image: scannedEvent.image || "https://images.unsplash.com/photo-1517649763962-0c623066013b",
              description: scannedEvent.description || "Imported from flyer",
              isJoined: false,
              status: 'upcoming',
              price: scannedEvent.price,
              currency: scannedEvent.currency || 'NGN'
          };

          setEvents(prev => [newEvent, ...prev]);
          setScannedEvent(null);
          // Scroll top?
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const filteredEvents = activeFilter === 'All' 
    ? events 
    : events.filter(e => e.type === activeFilter);

  const filters: (ActivityType | 'All')[] = [
      'All', 'Running', 'Cycling', 'Football', 'Yoga', 'Boxing', 'Tabata', 'Zumba', 'Badminton', 'Golf', 'Tennis', 'Swimming', 'Hiking'
  ];

  const getEventCoordinates = (id: string) => {
      const hash = id.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
      const top = 10 + (hash % 80);
      const left = 10 + ((hash * 13) % 80);
      return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen relative">
      <div className="sticky top-0 bg-slate-950/95 backdrop-blur-md z-10 pb-2 pt-2">
        <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-bold text-white">Explore</h1>
             {/* View Toggle */}
             <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                 <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                     <List size={18} />
                 </button>
                 <button 
                    onClick={() => setViewMode('map')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                     <MapIcon size={18} />
                 </button>
             </div>
        </div>

        {/* AI Search Bar */}
        <div className="relative mb-4 flex gap-2">
            <form onSubmit={handleSearch} className="relative flex-1">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask AI..."
                    className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary placeholder-slate-500 shadow-sm"
                />
                <Sparkles size={18} className="absolute left-3 top-3.5 text-primary animate-pulse" />
                {isSearching && (
                    <div className="absolute right-3 top-3">
                        <Loader2 size={18} className="text-primary animate-spin" />
                    </div>
                )}
            </form>
            
            <button 
                onClick={handleCameraClick}
                disabled={isScanning}
                className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center relative"
            >
                {isScanning ? <Loader2 size={20} className="animate-spin text-primary" /> : <Camera size={20} />}
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
            />
        </div>

        {/* Location & Filter Toggle */}
        <div className="flex justify-between items-center text-sm text-slate-500 mb-4 px-1">
            <div className="flex items-center">
                <MapPin size={14} className="mr-1" />
                <span>{location}</span>
            </div>
            <div className="flex items-center">
                <Filter size={14} className="mr-1" />
                <span>Filter</span>
            </div>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2 mb-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === f 
                  ? 'bg-white text-slate-900 shadow-md' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* AI Response Message */}
      {(aiMessage) && !isSearching && (
        <div className="bg-gradient-to-r from-indigo-900/20 to-blue-900/20 p-4 rounded-xl border border-blue-800/30 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start">
                <div className="bg-blue-900/50 p-2 rounded-lg mr-3">
                    <Sparkles size={20} className="text-blue-400" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm mb-1">AI Assistant</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{aiMessage}</p>
                </div>
            </div>
        </div>
      )}

      {/* View Content */}
      {viewMode === 'list' ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            {filteredEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                onToggleJoin={onToggleJoin} 
                onContact={handleContactOrganizer}
                onClick={setDetailedEvent}
              />
            ))}
            {filteredEvents.length === 0 && !isSearching && (
              <div className="text-center py-10 text-slate-500">
                No events found. Try searching or scanning a flyer!
              </div>
            )}
          </div>
      ) : (
          <div className="relative w-full h-[500px] rounded-3xl overflow-hidden border border-slate-800 shadow-inner bg-slate-900 animate-in fade-in duration-300">
              <div className="absolute inset-0 opacity-20" style={{ 
                  backgroundImage: 'radial-gradient(#475569 1.5px, transparent 1.5px), radial-gradient(#475569 1.5px, transparent 1.5px)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                  backgroundColor: '#0f172a'
              }}></div>
              
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M-10,20 Q30,40 50,20 T110,40" fill="none" stroke="#3b82f6" strokeWidth="2" />
                  <path d="M-10,80 Q40,60 70,90 T120,70" fill="none" stroke="#3b82f6" strokeWidth="2" />
              </svg>

              {filteredEvents.map(event => {
                  const coords = getEventCoordinates(event.id);
                  const isSelected = selectedMapEvent?.id === event.id;
                  
                  return (
                      <button
                          key={event.id}
                          onClick={() => setSelectedMapEvent(event)}
                          style={{ top: coords.top, left: coords.left }}
                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group ${isSelected ? 'z-30 scale-110' : 'z-10 hover:scale-110 hover:z-20'}`}
                      >
                          <div className="relative">
                              <MapPin 
                                  size={32} 
                                  className={`drop-shadow-lg ${isSelected ? 'text-primary fill-current' : 'text-slate-300 fill-slate-800'}`} 
                              />
                          </div>
                      </button>
                  );
              })}

              {selectedMapEvent && (
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl z-40 animate-in slide-in-from-bottom-5">
                      <button 
                          onClick={() => setSelectedMapEvent(null)}
                          className="absolute top-2 right-2 text-slate-500 hover:text-white bg-slate-800 rounded-full p-1"
                      >
                          <X size={16} />
                      </button>
                      <div className="flex items-start">
                          <img src={selectedMapEvent.image} className="w-16 h-16 rounded-xl object-cover mr-3 bg-slate-800" />
                          <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white text-sm truncate">{selectedMapEvent.title}</h3>
                              <p className="text-primary text-xs mb-1">{selectedMapEvent.type}</p>
                              <p className="text-slate-400 text-xs flex items-center mb-2">
                                  <MapPin size={10} className="mr-1" />
                                  <span className="truncate">{selectedMapEvent.location}</span>
                              </p>
                              <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        setDetailedEvent(selectedMapEvent);
                                        setSelectedMapEvent(null);
                                    }}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                                >
                                    Details
                                </button>
                                <button 
                                    onClick={() => {
                                        onToggleJoin(selectedMapEvent.id);
                                        setSelectedMapEvent(null);
                                    }}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                                        selectedMapEvent.isJoined 
                                        ? 'bg-green-900/30 text-green-400 border border-green-800'
                                        : 'bg-white text-slate-900'
                                    }`}
                                >
                                    {selectedMapEvent.isJoined ? 'Joined' : 'Join'}
                                </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* Scanned Event Modal */}
      {scannedEvent && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800 animate-in slide-in-from-bottom duration-300 shadow-2xl overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-white flex items-center">
                          <Sparkles size={20} className="text-primary mr-2" />
                          Flyer Scanned!
                      </h2>
                      <button onClick={() => setScannedEvent(null)} className="text-slate-400 hover:text-white">
                          <X size={24} />
                      </button>
                  </div>
                  <p className="text-sm text-slate-400 mb-6">Gemini extracted these details. Confirm to create event.</p>

                  <div className="space-y-4">
                      <div>
                          <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Title</label>
                          <input 
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                              value={scannedEvent.title}
                              onChange={e => setScannedEvent({...scannedEvent, title: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Date</label>
                              <input 
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                  value={scannedEvent.date}
                                  onChange={e => setScannedEvent({...scannedEvent, date: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Time</label>
                              <input 
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                  value={scannedEvent.time}
                                  onChange={e => setScannedEvent({...scannedEvent, time: e.target.value})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Location</label>
                          <input 
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                              value={scannedEvent.location}
                              onChange={e => setScannedEvent({...scannedEvent, location: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Price</label>
                              <input 
                                  type="number"
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                  value={scannedEvent.price}
                                  onChange={e => setScannedEvent({...scannedEvent, price: Number(e.target.value)})}
                              />
                          </div>
                          <div>
                              <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Currency</label>
                              <input 
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                  value={scannedEvent.currency || 'NGN'}
                                  onChange={e => setScannedEvent({...scannedEvent, currency: e.target.value})}
                              />
                          </div>
                      </div>
                  </div>
                  
                  <button 
                      onClick={handleConfirmScannedEvent}
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl mt-6 flex items-center justify-center shadow-lg shadow-green-900/20"
                  >
                      <Check size={20} className="mr-2" /> Create Event
                  </button>
              </div>
          </div>
      )}

      {/* Admin Contact Overlay */}
      {contactingOrganizer && (
          <AdminContactInterface 
              admin={contactingOrganizer} 
              onClose={() => setContactingOrganizer(null)} 
          />
      )}

      {/* Event Details Modal */}
      {detailedEvent && (
          <EventDetailModal 
            event={detailedEvent}
            onClose={() => setDetailedEvent(null)}
            onToggleJoin={onToggleJoin}
            onContact={handleContactOrganizer}
          />
      )}
    </div>
  );
};
