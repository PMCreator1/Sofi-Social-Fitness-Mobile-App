import React, { useState } from 'react';
import { X, Search, UserPlus, Check } from 'lucide-react';
import { User, GroupMember } from '../types';

interface InviteMembersModalProps {
  currentMembers: GroupMember[];
  onInvite: (user: User) => void;
  onClose: () => void;
}

const MOCK_FRIENDS: User[] = [
  { id: 'u10', name: 'Emmanuel', avatar: 'https://ui-avatars.com/api/?name=Emmanuel&background=ef4444&color=fff', points: 1200, rank: 12, badges: [] },
  { id: 'u11', name: 'Grace', avatar: 'https://ui-avatars.com/api/?name=Grace&background=22c55e&color=fff', points: 900, rank: 45, badges: [] },
  { id: 'u12', name: 'Chinedu', avatar: 'https://ui-avatars.com/api/?name=Chinedu&background=3b82f6&color=fff', points: 3400, rank: 5, badges: [] },
  { id: 'u13', name: 'Fatima', avatar: 'https://ui-avatars.com/api/?name=Fatima&background=eab308&color=fff', points: 2100, rank: 15, badges: [] },
  { id: 'u14', name: 'Samuel', avatar: 'https://ui-avatars.com/api/?name=Samuel&background=a855f7&color=fff', points: 500, rank: 80, badges: [] },
  { id: 'u15', name: 'Ngozi', avatar: 'https://ui-avatars.com/api/?name=Ngozi&background=f97316&color=fff', points: 4200, rank: 3, badges: [] },
];

export const InviteMembersModal: React.FC<InviteMembersModalProps> = ({ currentMembers, onInvite, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  const availableUsers = MOCK_FRIENDS.filter(
    friend => !currentMembers.some(member => member.id === friend.id)
  ).filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = (user: User) => {
    onInvite(user);
    setInvitedIds(prev => new Set(prev).add(user.id));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col h-[70vh] sm:h-[600px] animate-in slide-in-from-bottom duration-300">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
            <h2 className="text-lg font-bold text-white">Invite Friends</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800">
                <X size={20} />
            </button>
        </div>

        <div className="p-4 bg-slate-950">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
                <Search size={18} className="text-slate-500 mr-2" />
                <input 
                    type="text"
                    placeholder="Search name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-white text-sm outline-none w-full placeholder-slate-600"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
            {availableUsers.length > 0 ? (
                availableUsers.map(user => {
                    const isInvited = invitedIds.has(user.id);
                    return (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800/50">
                            <div className="flex items-center">
                                <img src={user.avatar} className="w-10 h-10 rounded-full mr-3 border border-slate-700" alt={user.name} />
                                <div>
                                    <div className="text-white font-bold text-sm">{user.name}</div>
                                    <div className="text-xs text-slate-500">Rank #{user.rank}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleInvite(user)}
                                disabled={isInvited}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-all ${
                                    isInvited 
                                    ? 'bg-green-600/20 text-green-500 cursor-default' 
                                    : 'bg-primary text-white hover:bg-orange-600 shadow-lg shadow-orange-900/20'
                                }`}
                            >
                                {isInvited ? (
                                    <>
                                        <Check size={14} className="mr-1" /> Sent
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={14} className="mr-1" /> Invite
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-10 text-slate-500">
                    <p>No friends found.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};