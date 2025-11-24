import React from 'react';
import { Crown, Medal, TrendingUp } from 'lucide-react';
import { User } from '../types';

interface LeaderboardProps {
  currentUser: User;
}

const mockUsers: User[] = [
  { id: '1', name: 'Zainab Ahmed', avatar: 'https://picsum.photos/seed/u1/100/100', points: 12500, rank: 1, badges: [] },
  { id: '2', name: 'Emeka Okonkwo', avatar: 'https://picsum.photos/seed/u2/100/100', points: 11200, rank: 2, badges: [] },
  { id: '3', name: 'Chioma Adebayo', avatar: 'https://picsum.photos/seed/u3/100/100', points: 10850, rank: 3, badges: [] },
  { id: '4', name: 'Tunde (You)', avatar: 'https://picsum.photos/seed/user/100/100', points: 9400, rank: 4, badges: [] },
  { id: '5', name: 'Yusuf Ibrahim', avatar: 'https://picsum.photos/seed/u5/100/100', points: 8900, rank: 5, badges: [] },
  { id: '6', name: 'Adesua Etomi', avatar: 'https://picsum.photos/seed/u6/100/100', points: 8200, rank: 6, badges: [] },
];

export const Leaderboard: React.FC<LeaderboardProps> = () => {
  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Leaderboard</h1>
        
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 opacity-20">
                <Crown size={120} />
             </div>
             <div className="relative z-10 text-center">
                 <h2 className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-90">Current Champion</h2>
                 <img src={mockUsers[0].avatar} className="w-20 h-20 rounded-full border-4 border-white/30 mx-auto mb-3 shadow-xl" alt="Winner" />
                 <h3 className="text-2xl font-bold">{mockUsers[0].name}</h3>
                 <p className="font-mono text-lg opacity-90">{mockUsers[0].points.toLocaleString()} pts</p>
             </div>
        </div>

        <div className="space-y-3">
            {mockUsers.map((user) => (
                <div 
                    key={user.id} 
                    className={`flex items-center p-4 rounded-xl border ${
                        user.id === '4' 
                        ? 'bg-blue-900/20 border-blue-800 shadow-md shadow-blue-900/20' 
                        : 'bg-slate-900 border-slate-800'
                    }`}
                >
                    <div className="w-8 font-bold text-slate-500 text-center mr-2">
                        {user.rank <= 3 ? (
                           <Medal size={20} className={
                               user.rank === 1 ? 'text-yellow-500' :
                               user.rank === 2 ? 'text-slate-400' : 'text-amber-700'
                           } /> 
                        ) : (
                            <span className="text-slate-500">{user.rank}</span>
                        )}
                    </div>
                    <img src={user.avatar} className="w-10 h-10 rounded-full mr-3 border border-slate-700" alt={user.name} />
                    <div className="flex-1">
                        <h4 className={`font-bold text-sm ${user.id === '4' ? 'text-blue-400' : 'text-white'}`}>
                            {user.name}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center">
                            <TrendingUp size={10} className="mr-1 text-green-500" />
                            Top 5%
                        </p>
                    </div>
                    <div className="font-mono font-bold text-slate-400">
                        {user.points.toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};