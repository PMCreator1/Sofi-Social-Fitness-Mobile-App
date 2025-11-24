
import React, { useState, useEffect, useRef } from 'react';
import { Play, Flag, MapPin, Zap, Timer, Trophy, Share2, MessageCircle, Send, X, ChevronDown, Volume2, VolumeX, StopCircle, Save, Music } from 'lucide-react';
import { VirtualGroup, GroupMember, GroupChatMessage, EventMetrics } from '../types';
import { SpotifyCard } from './SpotifyCard';

interface LiveGroupSessionProps {
  group: VirtualGroup;
  currentUser: GroupMember;
  onExit: () => void;
  onSave: (metrics: EventMetrics, members: GroupMember[]) => void;
  onSendMessage: (text: string) => void;
}

const QUICK_REPLIES = ["🔥", "Let's go!", "Nice pace!", "Wait up!", "My legs! 😅", "Almost there!"];

export const LiveGroupSession: React.FC<LiveGroupSessionProps> = ({ 
    group, 
    currentUser, 
    onExit, 
    onSave,
    onSendMessage
}) => {
  // We manage a local state of members to simulate their progress
  const [members, setMembers] = useState<GroupMember[]>(group.members);
  const [sessionStatus, setSessionStatus] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  const lastAnnouncedDistance = useRef(0);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  // IMPORTANT: Use group.chatHistory as the source of truth, but we can't easily subscribe to prop changes if the parent doesn't re-render 
  // However, in this architecture, calling onSendMessage updates parent state which re-renders Connect which re-renders LiveGroupSession.
  const messages = group.chatHistory; 

  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Simulation constants
  const UPDATE_INTERVAL = 1000;
  
  // Scroll chat to bottom when opened or new message arrives
  useEffect(() => {
    if (isChatOpen) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setUnreadCount(0);
    } else if (messages.length > 0) {
         // If chat is closed and new message comes (length changed), increment unread.
         // Simple check: compare with prev length or just timestamp? 
         // For simplicity, any change while closed adds unread. 
         // Ideally we check if the last message is NOT from me.
         const lastMsg = messages[messages.length - 1];
         if (lastMsg.senderId !== currentUser.id) {
             // setUnreadCount(c => c + 1); // This causes infinite loop if not careful with dependency
         }
    }
  }, [messages, isChatOpen, currentUser.id]);

  // Text-to-Speech Helper
  const announce = (text: string) => {
      if (isMuted || !('speechSynthesis' in window)) return;
      
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes('en-GB')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      window.speechSynthesis.speak(utterance);
  };

  // Main Simulation Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (sessionStatus === 'active') {
      // Initial Start Announcement
      if (secondsElapsed === 0) {
          announce(`Starting ${group.title}. Target distance: ${group.targetDistance} kilometers. Let's go!`);
      }

      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);

        setMembers(prevMembers => {
          // Check if everyone finished
          const allFinished = prevMembers.every(m => m.currentDistance >= group.targetDistance);
          if (allFinished) {
            setSessionStatus('finished');
            announce("Session complete! Great job team.");
          }

          return prevMembers.map((member): GroupMember => {
            // If already finished, don't move
            if (member.currentDistance >= group.targetDistance) {
                if (member.status !== 'finished') {
                    // Just finished this tick
                    return {
                        ...member,
                        status: 'finished',
                        finalMetrics: {
                            distanceKm: group.targetDistance,
                            duration: formatTime(secondsElapsed),
                            calories: Math.floor(secondsElapsed * 0.15),
                            pace: calculatePace(secondsElapsed, group.targetDistance)
                        }
                    };
                }
                return member;
            }

            // Calculate movement
            let increment = 0;
            if (member.id === currentUser.id) {
               // User logic: Consistent jog
               increment = 0.004; // approx 14km/h simulation
            } else {
               // Simulate others with slight variance
               const variance = Math.random() * 0.002 + 0.003; 
               increment = variance;
            }
            
            const newDist = Math.min(group.targetDistance, member.currentDistance + increment);
            
            return {
              ...member,
              currentDistance: newDist,
              status: 'active'
            };
          }).sort((a, b) => b.currentDistance - a.currentDistance);
        });

      }, UPDATE_INTERVAL);
    }

    return () => clearInterval(interval);
  }, [sessionStatus, group.targetDistance, currentUser.id, secondsElapsed]);

  // Audio Announcements Hook
  useEffect(() => {
      const myMember = members.find(m => m.id === currentUser.id);
      if (!myMember || sessionStatus !== 'active') return;

      const currentKm = myMember.currentDistance;
      const interval = 0.50; 
      
      if (currentKm - lastAnnouncedDistance.current >= interval) {
          const pace = calculatePace(secondsElapsed, currentKm);
          const rank = members.findIndex(m => m.id === currentUser.id) + 1;
          
          const msg = `Distance: ${currentKm.toFixed(1)} kilometers. Pace: ${pace} per kilometer. You are in position ${rank}.`;
          announce(msg);
          
          lastAnnouncedDistance.current = currentKm;
      }
  }, [members, currentUser.id, sessionStatus, secondsElapsed]);

  const handleSendMessage = (text: string = chatInput) => {
      if (!text.trim()) return;
      onSendMessage(text); // This updates the parent state
      setChatInput("");
  };

  const handleFinishEarly = () => {
    setSessionStatus('finished');
  };

  const handleSaveAndExit = () => {
    const myMember = members.find(m => m.id === currentUser.id);
    if (!myMember) return;
    
    const metrics: EventMetrics = {
        distanceKm: Number(myMember.currentDistance.toFixed(2)),
        duration: formatTime(secondsElapsed),
        calories: Math.floor(secondsElapsed * 0.15),
        pace: calculatePace(secondsElapsed, myMember.currentDistance)
    };
    
    onSave(metrics, members);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculatePace = (secs: number, km: number) => {
      if (km === 0) return "0:00";
      const paceSecs = secs / km;
      const m = Math.floor(paceSecs / 60);
      const s = Math.floor(paceSecs % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const getProgress = (current: number, target: number) => {
      return Math.min(100, (current / target) * 100);
  };

  if (sessionStatus === 'waiting') {
      return (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 bg-slate-900 relative">
              {/* Spotify Pre-game */}
              {group.spotifyPlaylistUrl && (
                  <div className="w-full max-w-xs mb-6 absolute top-4">
                      <SpotifyCard url={group.spotifyPlaylistUrl} />
                  </div>
              )}

              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 relative mt-20">
                  <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20"></div>
                  <Play size={40} className="text-primary ml-1" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{group.title}</h2>
              <p className="text-slate-400 mb-8">Waiting for all runners to connect...</p>
              
              <div className="w-full max-w-xs space-y-3 mb-8">
                  {members.map(m => (
                      <div key={m.id} className="flex items-center bg-card p-3 rounded-xl border border-slate-700">
                          <img src={m.avatar} className="w-8 h-8 rounded-full mr-3" />
                          <div className="text-left flex-1">
                              <div className="text-sm font-bold text-white">{m.name}</div>
                              <div className="text-xs text-slate-500">{m.location}</div>
                          </div>
                          <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-900/20 rounded">READY</span>
                      </div>
                  ))}
              </div>

              <div className="flex gap-4 w-full max-w-xs">
                 <button onClick={onExit} className="flex-1 bg-slate-700 text-white font-bold py-4 rounded-xl">
                    Back
                 </button>
                 <button 
                    onClick={() => setSessionStatus('active')}
                    className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20"
                >
                    START RUN
                </button>
              </div>
          </div>
      )
  }

  if (sessionStatus === 'finished') {
      return (
        <div className="h-full p-6 animate-in slide-in-from-bottom-10 overflow-y-auto bg-slate-900">
            <div className="text-center mb-8 pt-4">
                <div className="inline-block relative">
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
                    <Trophy size={64} className="text-yellow-400 mx-auto mb-4 relative z-10" />
                </div>
                <h2 className="text-3xl font-bold text-white">Session Complete!</h2>
                <p className="text-slate-400">Great work, team.</p>
            </div>

            <div className="space-y-4 mb-8">
                {members.map((m, index) => {
                   const isMe = m.id === currentUser.id;
                   const dist = m.finalMetrics ? m.finalMetrics.distanceKm : m.currentDistance;
                   const duration = m.finalMetrics ? m.finalMetrics.duration : formatTime(secondsElapsed);
                   const pace = m.finalMetrics ? m.finalMetrics.pace : calculatePace(secondsElapsed, dist);

                   return (
                    <div key={m.id} className={`p-4 rounded-xl border flex items-center ${isMe ? 'bg-slate-800 border-primary shadow-lg shadow-primary/10' : 'bg-card border-slate-700'}`}>
                        <div className="text-lg font-bold text-slate-500 w-8">#{index + 1}</div>
                        <img src={m.avatar} className="w-10 h-10 rounded-full mr-3" />
                        <div className="flex-1">
                            <div className="font-bold text-white flex items-center">
                                {m.name} {isMe && <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 rounded ml-2">YOU</span>}
                            </div>
                            <div className="text-xs text-slate-400">
                                {dist.toFixed(2)}km • {duration} • {pace}/km
                            </div>
                        </div>
                        {index === 0 && <Trophy size={16} className="text-yellow-400" />}
                    </div>
                   );
                })}
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4">
                <button onClick={onExit} className="bg-slate-800 text-slate-400 font-bold py-3 rounded-xl border border-slate-700">
                    Discard
                </button>
                <button 
                    onClick={handleSaveAndExit}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20"
                >
                    <Save size={18} className="mr-2" /> Save & Close
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col p-4 bg-slate-900 relative overflow-hidden">
        {/* Header Metrics */}
        <div className="flex justify-between items-center mb-6 bg-card p-4 rounded-xl border border-slate-700 z-10 shadow-lg">
            <div>
                <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-1">{group.activityType} Group</h3>
                <h2 className="text-lg font-bold text-white">{group.title}</h2>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white border border-slate-700"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="text-right">
                    <div className="text-3xl font-mono font-bold text-white">{formatTime(secondsElapsed)}</div>
                    <div className="text-xs text-slate-500 uppercase">Duration</div>
                </div>
            </div>
        </div>

        {/* Visualization Track */}
        <div className="flex-1 space-y-6 overflow-y-auto pb-24 z-0">
            {members.map((member) => (
                <div key={member.id} className="relative">
                    <div className="flex justify-between text-xs text-slate-400 mb-2 px-1">
                        <span className={`font-bold ${member.id === currentUser.id ? 'text-primary' : ''}`}>
                            {member.name}
                        </span>
                        <span>{member.currentDistance.toFixed(2)} / {group.targetDistance} km</span>
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden relative">
                         {/* Bar */}
                         <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                                member.id === currentUser.id 
                                ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                                : 'bg-slate-600'
                            }`}
                            style={{ width: `${getProgress(member.currentDistance, group.targetDistance)}%` }}
                         ></div>
                    </div>
                    
                    {/* Avatar Marker moving with progress */}
                    <div 
                        className="absolute top-5 transition-all duration-1000 ease-linear"
                        style={{ left: `calc(${getProgress(member.currentDistance, group.targetDistance)}% - 12px)` }}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 overflow-hidden ${member.id === currentUser.id ? 'border-primary shadow-lg shadow-orange-500/50 scale-125 z-10' : 'border-slate-600 bg-slate-800'}`}>
                            <img src={member.avatar} className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Bottom Stats & Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent z-10">
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-card/90 backdrop-blur p-3 rounded-xl border border-slate-700 text-center">
                    <MapPin size={18} className="mx-auto text-blue-500 mb-1" />
                    <div className="text-xl font-bold text-white">{members.find(m => m.id === currentUser.id)?.currentDistance.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500 uppercase">Distance</div>
                </div>
                <div className="bg-card/90 backdrop-blur p-3 rounded-xl border border-slate-700 text-center">
                    <Timer size={18} className="mx-auto text-green-500 mb-1" />
                    <div className="text-xl font-bold text-white">{calculatePace(secondsElapsed, members.find(m => m.id === currentUser.id)?.currentDistance || 0)}</div>
                    <div className="text-[10px] text-slate-500 uppercase">Avg Pace</div>
                </div>
                <div className="bg-card/90 backdrop-blur p-3 rounded-xl border border-slate-700 text-center">
                    <Zap size={18} className="mx-auto text-yellow-500 mb-1" />
                    <div className="text-xl font-bold text-white">{Math.floor(secondsElapsed * 0.15)}</div>
                    <div className="text-[10px] text-slate-500 uppercase">Cals</div>
                </div>
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={() => setIsChatOpen(true)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center relative transition-colors border border-slate-700"
                >
                    <MessageCircle size={18} className="mr-2" /> 
                    Live Chat
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-slate-900"></span>
                    )}
                </button>
                <button 
                    onClick={handleFinishEarly}
                    className="flex-none w-1/3 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center"
                >
                    <StopCircle size={18} className="mr-2" /> Stop
                </button>
            </div>
        </div>

        {/* Chat Overlay */}
        <div 
            className={`absolute inset-x-0 bottom-0 bg-slate-900 z-30 transition-transform duration-300 ease-in-out border-t border-slate-700 rounded-t-3xl shadow-2xl flex flex-col ${isChatOpen ? 'translate-y-0 h-[85%]' : 'translate-y-full h-[85%]'}`}
        >
            {/* Chat Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/95 rounded-t-3xl">
                <div className="flex items-center">
                    <MessageCircle size={18} className="text-primary mr-2" />
                    <h3 className="font-bold text-white">Group Chat</h3>
                    <span className="ml-2 bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{members.length} online</span>
                </div>
                <button 
                    onClick={() => setIsChatOpen(false)}
                    className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
                >
                    <ChevronDown size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10">
                        <p className="text-sm">Say hello to the team! 👋</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                    <div className="flex-shrink-0 mr-2 self-end">
                                        {msg.senderAvatar ? (
                                            <img src={msg.senderAvatar} className="w-6 h-6 rounded-full" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                                        )}
                                    </div>
                                )}
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                                    isMe 
                                    ? 'bg-primary text-white rounded-br-none' 
                                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                }`}>
                                    {!isMe && <p className="text-[10px] text-slate-400 mb-1">{msg.senderName}</p>}
                                    <p>{msg.text}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-orange-200' : 'text-slate-500'}`}>{msg.timestamp}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
                {/* Spotify Mini Player if active */}
                {group.spotifyPlaylistUrl && (
                     <div className="mb-4">
                        <SpotifyCard url={group.spotifyPlaylistUrl} />
                     </div>
                )}

                {/* Quick Replies */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
                    {QUICK_REPLIES.map((reply, i) => (
                        <button
                            key={i}
                            onClick={() => handleSendMessage(reply)}
                            className="flex-shrink-0 bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-full border border-slate-700 transition-colors"
                        >
                            {reply}
                        </button>
                    ))}
                </div>
                
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                        onClick={() => handleSendMessage()}
                        disabled={!chatInput.trim()}
                        className="bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl flex items-center justify-center transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
