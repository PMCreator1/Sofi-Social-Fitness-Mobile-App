
import React, { useState } from 'react';
import { Users, Plus, Target, MapPin, ArrowRight, Phone, X, Calendar, Activity, Music, MessageCircle } from 'lucide-react';
import { VirtualGroup, GroupMember, User, ActivityType, Event, EventMetrics, GroupMilestone } from '../types';
import { LiveGroupSession } from '../components/LiveGroupSession';
import { AdminContactInterface } from '../components/AdminContactInterface';
import { GroupDetailView } from '../components/GroupDetailView';
import { GroupCelebration } from '../components/GroupCelebration';

interface ConnectProps {
  user: User;
  groups: VirtualGroup[];
  onSaveActivity: (event: Event) => void;
  onCreateGroup: (group: VirtualGroup) => void;
  onUpdateGroup: (group: VirtualGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onPlanNextSession: (groupId: string, details: { title: string; activityType: ActivityType; targetDistance: number; startTime: string }) => void;
  onSendMessage: (groupId: string, text: string) => void;
}

export const Connect: React.FC<ConnectProps> = ({ 
    user, 
    groups, 
    onSaveActivity, 
    onCreateGroup, 
    onUpdateGroup,
    onDeleteGroup,
    onPlanNextSession,
    onSendMessage
}) => {
  const [activeSession, setActiveSession] = useState<VirtualGroup | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<VirtualGroup | null>(null);
  const [contactingAdmin, setContactingAdmin] = useState<User | null>(null);
  
  // Celebration State
  const [celebrationData, setCelebrationData] = useState<{
      group: VirtualGroup;
      sessionTotalDistance: number;
      newMilestones: GroupMilestone[];
      finalMembers: GroupMember[];
      metrics: EventMetrics;
  } | null>(null);
  
  // Creation State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    title: '',
    activityType: 'Running' as ActivityType,
    targetDistance: 5,
    startTime: '',
    spotifyPlaylistUrl: ''
  });

  const getPlaceholderImage = (type: ActivityType): string => {
    switch (type) {
      case 'Running': return 'https://images.unsplash.com/photo-1552674605-46d527273191?auto=format&fit=crop&w=800&q=80';
      case 'Cycling': return 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=800&q=80';
      default: return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80';
    }
  };

  const handleJoin = (lobbyId: string) => {
      const lobby = groups.find(l => l.id === lobbyId);
      if (lobby) {
          // Check if already joined
          const isMember = lobby.members.some(m => m.id === user.id);
          
          if (!isMember) {
              const currentUserMember: GroupMember = {
                  ...user,
                  status: 'ready',
                  currentDistance: 0,
                  location: 'You'
              };
              const updatedLobby = {
                  ...lobby,
                  members: [...lobby.members, currentUserMember]
              };
              onUpdateGroup(updatedLobby);
              setSelectedGroup(updatedLobby);
          } else {
              setSelectedGroup(lobby);
          }
      }
  };

  const handleAddMember = (newUser: User) => {
      if (selectedGroup) {
          const newMember: GroupMember = {
              ...newUser,
              status: 'ready',
              currentDistance: 0,
              location: 'Virtual'
          };
          
          const updatedGroup = {
              ...selectedGroup,
              members: [...selectedGroup.members, newMember]
          };
          
          onUpdateGroup(updatedGroup);
          setSelectedGroup(updatedGroup);
      }
  };

  const handleStartLiveSession = () => {
      if (selectedGroup) {
          setActiveSession(selectedGroup);
          setSelectedGroup(null); // Close detail view when going live
      }
  };

  const handleContactAdmin = (lobby: VirtualGroup) => {
      const admin = lobby.members.find(m => m.id === lobby.adminId);
      if (admin) {
          setContactingAdmin(admin);
      }
  };

  const handleExitSession = () => {
      setActiveSession(null);
  };

  const handleSaveSession = (metrics: EventMetrics, finalMembers: GroupMember[]) => {
      if (!activeSession) return;

      // 1. Calculate Group Cumulative Stats
      const sessionTotalDist = finalMembers.reduce((acc, m) => acc + m.currentDistance, 0);
      const sessionTotalCals = finalMembers.reduce((acc, m) => acc + (m.finalMetrics?.calories || 0), 0);
      
      const updatedStats = {
          totalDistance: (activeSession.stats?.totalDistance || 0) + sessionTotalDist,
          totalSessions: (activeSession.stats?.totalSessions || 0) + 1,
          totalCalories: (activeSession.stats?.totalCalories || 0) + sessionTotalCals
      };

      // 2. Check for Milestones
      const newMilestones: GroupMilestone[] = [];
      const currentMilestoneIds = activeSession.milestones?.map(m => m.id) || [];
      
      // Example Milestone: 100km Club
      if (updatedStats.totalDistance >= 100 && !currentMilestoneIds.includes('m-100k')) {
          newMilestones.push({
              id: 'm-100k',
              name: '100km Club',
              icon: 'Mountain',
              description: 'The group has covered 100km together!',
              unlockedAt: new Date().toISOString()
          });
      }
      
      // Example Milestone: 5 Sessions
      if (updatedStats.totalSessions >= 5 && !currentMilestoneIds.includes('m-5sess')) {
          newMilestones.push({
              id: 'm-5sess',
              name: 'Consistent Crew',
              icon: 'Sunrise',
              description: '5 Sessions completed as a squad.',
              unlockedAt: new Date().toISOString()
          });
      }

      // 3. Prepare updated group object with stats but DO NOT save yet (wait for celebration close)
      const updatedGroup: VirtualGroup = {
          ...activeSession,
          status: 'completed',
          members: finalMembers,
          stats: updatedStats,
          milestones: [...(activeSession.milestones || []), ...newMilestones]
      };

      // 4. Trigger Celebration
      setCelebrationData({
          group: updatedGroup,
          sessionTotalDistance: sessionTotalDist,
          newMilestones: newMilestones,
          finalMembers: finalMembers,
          metrics: metrics
      });
  };

  const handleCloseCelebration = () => {
      if (celebrationData) {
          const { group, metrics, finalMembers } = celebrationData;
          
          // 1. Save Event to User History
          const newEvent: Event = {
              id: `group-${Date.now()}`,
              title: group.title,
              club: 'Virtual Group',
              type: group.activityType,
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              location: 'Virtual Session',
              attendees: group.members.length,
              image: getPlaceholderImage(group.activityType),
              description: `Completed virtual group session with ${group.members.length} runners.`,
              isJoined: true,
              status: 'completed',
              metrics: metrics,
              leaderboard: finalMembers // Store the final results
          };
          onSaveActivity(newEvent);

          // 2. Update Group Status to Completed and sync Members data
          onUpdateGroup(group);

          // 3. Close Session View
          setCelebrationData(null);
          setActiveSession(null);
      }
  };

  const handleCreateGroupSubmit = () => {
      if (!newGroup.title || !newGroup.startTime) return;

      const newLobby: VirtualGroup = {
          id: `v-${Date.now()}`,
          title: newGroup.title,
          activityType: newGroup.activityType,
          targetDistance: newGroup.targetDistance,
          startTime: newGroup.startTime,
          status: 'recruiting',
          adminId: user.id,
          spotifyPlaylistUrl: newGroup.spotifyPlaylistUrl,
          members: [
              { ...user, status: 'ready', currentDistance: 0, location: 'You' }
          ],
          chatHistory: [],
          pastSessions: [],
          stats: { totalDistance: 0, totalSessions: 0, totalCalories: 0 },
          milestones: []
      };

      onCreateGroup(newLobby);
      setIsCreateModalOpen(false);
      setNewGroup({ title: '', activityType: 'Running', targetDistance: 5, startTime: '', spotifyPlaylistUrl: '' });
  };

  // Render Views Logic
  if (celebrationData) {
      return (
          <GroupCelebration 
              group={celebrationData.group}
              sessionTotalDistance={celebrationData.sessionTotalDistance}
              newMilestones={celebrationData.newMilestones}
              onClose={handleCloseCelebration}
          />
      );
  }

  if (activeSession) {
      const currentUserMember = activeSession.members.find(m => m.id === user.id) || {
          ...user, status: 'ready', currentDistance: 0, location: 'You'
      };

      return (
          <LiveGroupSession 
            group={activeSession} 
            currentUser={currentUserMember}
            onExit={handleExitSession}
            onSave={handleSaveSession}
            onSendMessage={(text) => onSendMessage(activeSession.id, text)}
          />
      );
  }

  if (selectedGroup) {
      return (
          <GroupDetailView 
              group={selectedGroup} 
              currentUser={user}
              onBack={() => setSelectedGroup(null)}
              onStartSession={handleStartLiveSession}
              onSendMessage={onSendMessage}
              onDelete={() => {
                  onDeleteGroup(selectedGroup.id);
                  setSelectedGroup(null);
              }}
              onPlanNext={(details) => onPlanNextSession(selectedGroup.id, details)}
              onAddMember={handleAddMember}
          />
      );
  }

  const activityOptions: ActivityType[] = ['Running', 'Cycling', 'Hiking', 'Walking'];
  const myGroups = groups.filter(g => g.members.some(m => m.id === user.id));
  const otherGroups = groups.filter(g => !g.members.some(m => m.id === user.id));

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Virtual Teams</h1>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-orange-600 text-white p-2 rounded-full transition-colors shadow-lg shadow-orange-500/30"
          >
              <Plus size={24} />
          </button>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-8 shadow-lg shadow-blue-900/40">
          <h2 className="text-lg font-bold text-white mb-2">Connect & Compete</h2>
          <p className="text-sm text-blue-100 mb-4">
              Join users from other states for real-time virtual events. 
              Share playlists and chat before the run!
          </p>
          <div className="flex -space-x-3 mb-4">
              {[1,2,3,4].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/${i+20}/100/100`} className="w-8 h-8 rounded-full border-2 border-indigo-600" />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-white flex items-center justify-center text-[10px] text-indigo-700 font-bold">
                  +42
              </div>
          </div>
      </div>

      {myGroups.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-white mb-4 flex items-center">
                <Users size={18} className="mr-2 text-primary" />
                My Squads
            </h3>
            <div className="space-y-3">
                {myGroups.map(group => (
                    <div 
                        key={group.id} 
                        onClick={() => setSelectedGroup(group)}
                        className={`bg-slate-900 border ${group.status === 'completed' ? 'border-green-500/50' : 'border-slate-800'} rounded-2xl p-4 flex items-center cursor-pointer hover:border-primary transition-colors`}
                    >
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mr-4 relative overflow-hidden">
                             {/* Initials as avatar */}
                             <span className="text-xl font-bold text-slate-500">{group.title.charAt(0)}</span>
                             {group.activityType === 'Running' && <div className="absolute inset-0 bg-blue-500/10"></div>}
                             {group.activityType === 'Cycling' && <div className="absolute inset-0 bg-orange-500/10"></div>}
                             {group.status === 'completed' && (
                                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                     <Activity size={20} className="text-green-500" />
                                 </div>
                             )}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-white">{group.title}</h4>
                            <div className="flex items-center text-xs text-slate-500 mt-1">
                                <span className="mr-2">{group.activityType}</span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full mr-2"></span>
                                <span>{group.members.length} Members</span>
                            </div>
                        </div>
                        <div className="bg-slate-800 p-2 rounded-full text-slate-400">
                             <MessageCircle size={18} />
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}

      <h3 className="font-bold text-white mb-4 flex items-center">
          <Target size={18} className="mr-2 text-green-500" />
          Discover Lobbies
      </h3>

      <div className="space-y-4">
          {otherGroups.map(lobby => (
              <div key={lobby.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 hover:border-blue-500 transition-colors relative shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                      <div>
                          <span className="text-xs font-bold text-primary uppercase tracking-wider bg-orange-500/10 px-2 py-1 rounded-md mb-2 inline-block border border-orange-500/20">
                              {lobby.activityType}
                          </span>
                          <h4 className="text-lg font-bold text-white">{lobby.title}</h4>
                      </div>
                      <div className="text-right">
                          <span className="text-2xl font-bold text-white">{lobby.targetDistance}</span>
                          <span className="text-xs text-slate-500 block">km</span>
                      </div>
                  </div>

                  <div className="flex items-center text-sm text-slate-400 mb-4">
                      <Users size={14} className="mr-2" />
                      <span>{lobby.members.length} runners waiting</span>
                  </div>
                  
                  {/* Locations Preview */}
                  <div className="flex flex-wrap gap-2 mb-4">
                      {lobby.members.slice(0, 3).map(m => (
                          <div key={m.id} className="flex items-center bg-slate-800 rounded-full px-2 py-1 border border-slate-700">
                              <MapPin size={10} className="text-slate-400 mr-1" />
                              <span className="text-xs text-slate-300">{m.location}</span>
                          </div>
                      ))}
                      {lobby.members.length > 3 && (
                          <div className="px-2 py-1 text-xs text-slate-500">+ {lobby.members.length - 3}</div>
                      )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                        onClick={() => handleContactAdmin(lobby)}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                        title="Contact Admin"
                    >
                        <Phone size={18} />
                    </button>
                    <button 
                        onClick={() => handleJoin(lobby.id)}
                        className="flex-1 bg-white hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center transition-all group"
                    >
                        Join Lobby <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
              </div>
          ))}
          
          {otherGroups.length === 0 && (
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No other groups available right now.
              </div>
          )}
      </div>

      {/* Admin Contact Overlay */}
      {contactingAdmin && (
          <AdminContactInterface 
              admin={contactingAdmin} 
              onClose={() => setContactingAdmin(null)} 
          />
      )}

      {/* Create Group Modal */}
      {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-slate-800 animate-in slide-in-from-bottom duration-300 shadow-2xl overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-white">Create New Group</h2>
                      <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Group Title</label>
                          <input 
                              type="text"
                              value={newGroup.title}
                              onChange={(e) => setNewGroup({...newGroup, title: e.target.value})}
                              placeholder="e.g. Saturday Morning Run"
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                               <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Activity</label>
                               <div className="relative">
                                   <select 
                                        value={newGroup.activityType}
                                        onChange={(e) => setNewGroup({...newGroup, activityType: e.target.value as ActivityType})}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-primary"
                                   >
                                       {activityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                   </select>
                                   <Activity size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                               </div>
                          </div>
                          <div>
                               <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Distance (km)</label>
                               <div className="relative">
                                   <input 
                                        type="number"
                                        value={newGroup.targetDistance}
                                        onChange={(e) => setNewGroup({...newGroup, targetDistance: Number(e.target.value)})}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                                   />
                                   <span className="absolute right-3 top-3.5 text-xs text-slate-500 font-bold">KM</span>
                               </div>
                          </div>
                      </div>

                      <div>
                          <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Start Time</label>
                          <div className="relative">
                              <input 
                                  type="datetime-local"
                                  value={newGroup.startTime}
                                  onChange={(e) => setNewGroup({...newGroup, startTime: e.target.value})}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-primary [color-scheme:dark]"
                              />
                              <Calendar size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                          </div>
                      </div>

                      <div>
                          <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Spotify Playlist URL (Optional)</label>
                          <div className="relative">
                              <input 
                                  type="text"
                                  value={newGroup.spotifyPlaylistUrl}
                                  onChange={(e) => setNewGroup({...newGroup, spotifyPlaylistUrl: e.target.value})}
                                  placeholder="https://open.spotify.com/playlist/..."
                                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                              />
                              <Music size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                          </div>
                      </div>

                      <button 
                          onClick={handleCreateGroupSubmit}
                          disabled={!newGroup.title || !newGroup.startTime}
                          className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl mt-4 transition-colors"
                      >
                          Create Group
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
