
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Users, MapPin, Send, MessageCircle, Calendar, Trash2, PlusCircle, History, Clock, Trophy, Mountain, Sunrise, Crown, Medal, UserPlus, Share2 } from 'lucide-react';
import { VirtualGroup, User, GroupChatMessage, ActivityType } from '../types';
import { SpotifyCard } from './SpotifyCard';
import { InviteMembersModal } from './InviteMembersModal';

interface GroupDetailViewProps {
  group: VirtualGroup;
  currentUser: User;
  onBack: () => void;
  onStartSession: () => void;
  onSendMessage: (groupId: string, text: string) => void;
  onDelete: () => void;
  onPlanNext: (details: { title: string; activityType: ActivityType; targetDistance: number; startTime: string }) => void;
  onAddMember: (user: User) => void;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({ 
    group, 
    currentUser, 
    onBack, 
    onStartSession, 
    onSendMessage,
    onDelete,
    onPlanNext,
    onAddMember
}) => {
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isPlanningNext, setIsPlanningNext] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [nextSession, setNextSession] = useState({
      title: group.title, // Default to same title
      activityType: group.activityType,
      targetDistance: group.targetDistance,
      startTime: ''
  });

  const isAdmin = currentUser.id === group.adminId;
  const activityOptions: ActivityType[] = ['Running', 'Cycling', 'Hiking', 'Walking'];

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [group.chatHistory, isPlanningNext]);

  const handleSend = () => {
      if (!chatInput.trim()) return;
      onSendMessage(group.id, chatInput);
      setChatInput("");
  };

  const handlePlanNextSubmit = () => {
      if (!nextSession.startTime) return;
      onPlanNext(nextSession);
      setIsPlanningNext(false);
      setNextSession({ title: group.title, activityType: group.activityType, targetDistance: group.targetDistance, startTime: '' });
  };

  const handleShareGroup = async () => {
      const shareData = {
          title: `Join my group: ${group.title}`,
          text: `Come join us for a ${group.activityType} session on Routine!`,
          url: window.location.href // In a real app, this would be a deep link
      };
      
      if (navigator.share) {
          try {
              await navigator.share(shareData);
          } catch (err) {
              console.log('Error sharing', err);
          }
      } else {
          alert('Link copied to clipboard!');
      }
  };

  const getMilestoneIcon = (name: string) => {
    switch(name) {
        case 'Sunrise': return <Sunrise size={20} className="text-yellow-400" />;
        case 'Mountain': return <Mountain size={20} className="text-blue-400" />;
        case 'Crown': return <Crown size={20} className="text-orange-400" />;
        default: return <Medal size={20} className="text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-40 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center shadow-md z-10">
            <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
                <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
                <h1 className="text-lg font-bold text-white leading-tight">{group.title}</h1>
                <p className="text-xs text-primary">{group.activityType} • {group.members.length} Members</p>
            </div>
            
            <button 
                onClick={handleShareGroup}
                className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg mr-2"
                title="Share Group Link"
            >
                <Share2 size={18} />
            </button>

            {isAdmin && (
                <button 
                    onClick={() => {
                        if(confirm("Are you sure you want to disband this group? This cannot be undone.")) {
                            onDelete();
                        }
                    }}
                    className="p-2 bg-red-900/20 text-red-500 rounded-lg mr-2"
                >
                    <Trash2 size={18} />
                </button>
            )}
            
            {group.status !== 'completed' && (
                <button 
                    onClick={onStartSession}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-xl flex items-center shadow-lg shadow-green-900/20 text-sm"
                >
                    <Play size={16} className="mr-2 fill-current" /> GO LIVE
                </button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 space-y-6">
            
            {/* COMPLETED STATE / PLAN NEXT */}
            {group.status === 'completed' && !isPlanningNext && (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 border border-indigo-500/30 text-center animate-in zoom-in-95">
                    <h2 className="text-2xl font-bold text-white mb-2">Adventure Complete! 🎉</h2>
                    <p className="text-slate-400 mb-6">The group has finished the last session. Ready for the next challenge?</p>
                    
                    <button 
                        onClick={() => setIsPlanningNext(true)}
                        className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center hover:scale-[1.02] transition-transform"
                    >
                        <PlusCircle size={20} className="mr-2" /> Plan Next Run
                    </button>
                </div>
            )}

            {/* PLANNING FORM */}
            {isPlanningNext && (
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 animate-in slide-in-from-bottom">
                    <h3 className="font-bold text-white mb-4">Setup Next Session</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Title</label>
                            <input 
                                value={nextSession.title}
                                onChange={e => setNextSession({...nextSession, title: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Activity</label>
                                <select 
                                    value={nextSession.activityType}
                                    onChange={e => setNextSession({...nextSession, activityType: e.target.value as ActivityType})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white"
                                >
                                    {activityOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Dist (km)</label>
                                <input 
                                    type="number"
                                    value={nextSession.targetDistance}
                                    onChange={e => setNextSession({...nextSession, targetDistance: Number(e.target.value)})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white"
                                />
                             </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Start Time</label>
                            <input 
                                type="datetime-local"
                                value={nextSession.startTime}
                                onChange={e => setNextSession({...nextSession, startTime: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white [color-scheme:dark]"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                             <button onClick={() => setIsPlanningNext(false)} className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl">Cancel</button>
                             <button onClick={handlePlanNextSubmit} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Current Details Card */}
            {group.status !== 'completed' && !isPlanningNext && (
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center text-slate-400 text-sm">
                            <Calendar size={16} className="mr-2" />
                            <span>{new Date(group.startTime).toLocaleDateString()} at {new Date(group.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                            <span className="text-lg font-bold text-white">{group.targetDistance}</span>
                            <span className="text-xs text-slate-500 ml-1">KM</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-end mb-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase">Squad Members</h3>
                        <button 
                            onClick={() => setShowInviteModal(true)}
                            className="text-xs text-primary font-bold flex items-center hover:text-orange-400"
                        >
                            <UserPlus size={14} className="mr-1" /> Invite
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {group.members.map(m => (
                            <div key={m.id} className="flex items-center bg-slate-950 rounded-full pl-1 pr-3 py-1 border border-slate-800">
                                <img src={m.avatar} className="w-6 h-6 rounded-full mr-2" />
                                <span className="text-xs text-slate-300">{m.name}</span>
                            </div>
                        ))}
                        <button 
                            onClick={() => setShowInviteModal(true)}
                            className="w-8 h-8 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-slate-500 hover:text-white hover:border-white transition-colors"
                        >
                            +
                        </button>
                    </div>
                </div>
            )}
            
            {/* Trophy Room (Stats & Milestones) */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Total Km</div>
                    <div className="text-2xl font-black text-white">{group.stats.totalDistance.toFixed(0) || 0}</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Sessions</div>
                    <div className="text-2xl font-black text-white">{group.stats.totalSessions || 0}</div>
                </div>
            </div>

            {group.milestones && group.milestones.length > 0 && (
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Trophy size={64} className="text-yellow-500" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center">
                        <Trophy size={16} className="text-yellow-500 mr-2" /> 
                        Milestones
                    </h3>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                        {group.milestones.map(m => (
                            <div key={m.id} className="flex-shrink-0 bg-slate-950 p-3 rounded-xl border border-slate-800 w-32 flex flex-col items-center text-center">
                                <div className="mb-2">
                                    {getMilestoneIcon(m.icon)}
                                </div>
                                <div className="text-xs font-bold text-white mb-1">{m.name}</div>
                                <div className="text-[10px] text-slate-500 leading-tight">{m.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Past Sessions History */}
            {group.pastSessions && group.pastSessions.length > 0 && !isPlanningNext && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="bg-slate-800/50 p-3 border-b border-slate-800 flex items-center">
                        <History size={16} className="text-slate-400 mr-2" />
                        <span className="text-sm font-bold text-white">Past Runs</span>
                    </div>
                    <div className="p-2 space-y-1">
                        {group.pastSessions.map(session => (
                            <div key={session.id} className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-xl transition-colors">
                                <div>
                                    <div className="text-white text-sm font-bold">{session.title}</div>
                                    <div className="text-xs text-slate-500">{session.date} • {session.activityType}</div>
                                </div>
                                <div className="text-primary text-xs font-bold">{session.distance}km</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Spotify Integration */}
            {group.spotifyPlaylistUrl && (
                <SpotifyCard url={group.spotifyPlaylistUrl} />
            )}

            {/* Persistent Chat Area */}
            <div className="flex flex-col h-[400px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center">
                    <MessageCircle size={16} className="text-slate-400 mr-2" />
                    <span className="text-sm font-bold text-white">Team Chat</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {group.chatHistory.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <p className="text-sm text-slate-500">No messages yet.</p>
                            <p className="text-xs text-slate-600">Start the conversation!</p>
                        </div>
                    ) : (
                        group.chatHistory.map(msg => {
                            const isMe = msg.senderId === currentUser.id;
                            if (msg.isSystem) {
                                return (
                                    <div key={msg.id} className="flex justify-center my-4">
                                        <div className="bg-slate-800/50 text-slate-400 text-[10px] px-3 py-1 rounded-full flex items-center">
                                            <Clock size={10} className="mr-1" />
                                            {msg.text}
                                        </div>
                                    </div>
                                )
                            }
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {!isMe && (
                                        <img src={msg.senderAvatar} className="w-6 h-6 rounded-full mr-2 self-end mb-1" />
                                    )}
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                        isMe 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : 'bg-slate-800 text-slate-300 rounded-bl-none'
                                    }`}>
                                        {!isMe && <p className="text-[10px] text-slate-400 mb-0.5">{msg.senderName}</p>}
                                        <p>{msg.text}</p>
                                        <p className="text-[9px] opacity-60 text-right mt-1">{msg.timestamp}</p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                    <input 
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button 
                        onClick={handleSend}
                        className="bg-primary hover:bg-orange-600 text-white p-2 rounded-xl transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
            <InviteMembersModal 
                currentMembers={group.members}
                onInvite={onAddMember}
                onClose={() => setShowInviteModal(false)}
            />
        )}
    </div>
  );
};
