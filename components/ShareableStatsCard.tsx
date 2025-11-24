import React from 'react';
import { Share2, Flame, Map, Zap, Mountain, Trophy, Award, Medal, Crown } from 'lucide-react';
import { User, UserGoal } from '../types';

interface ShareableStatsCardProps {
  user: User;
  goal: UserGoal;
}

export const ShareableStatsCard: React.FC<ShareableStatsCardProps> = ({ user, goal }) => {
  const level = Math.floor(user.points / 1000);
  const progressToNextLevel = (user.points % 1000) / 1000 * 100;

  const handleShare = async () => {
    const shareData = {
      title: 'My Pulse Stats',
      text: `I'm Level ${level} on Pulse! 🔥 ${goal.streakDays} day streak and ${goal.currentDistanceKm}km crushed this week. Catch me if you can!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      alert("Screenshot this card to share your progress! (Sharing not supported on this device)");
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame size={18} className="text-orange-500" />;
      case 'Zap': return <Zap size={18} className="text-yellow-400" />;
      case 'Mountain': return <Mountain size={18} className="text-emerald-500" />;
      case 'Trophy': return <Trophy size={18} className="text-amber-400" />;
      default: return <Award size={18} className="text-blue-400" />;
    }
  };

  return (
    <div className="mb-8 relative group">
      {/* Card Container */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl shadow-black/40">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none opacity-50"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.08] pointer-events-none"></div>

        <div className="p-6 relative z-10">
          {/* Header / Brand */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-6 bg-primary rounded-full transform -skew-x-12"></div>
              <span className="font-black text-xl tracking-tighter italic text-white">PULSE <span className="text-primary">CARD</span></span>
            </div>
            <div className="bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
               <span className="text-[10px] font-mono text-slate-400">SEASON 24</span>
            </div>
          </div>

          {/* User Main Info */}
          <div className="flex items-center mb-6">
            <div className="relative mr-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 p-0.5 shadow-lg shadow-orange-500/20">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover rounded-[14px] bg-slate-900" 
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-800 border border-slate-700 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md flex items-center">
                 <Crown size={12} className="text-yellow-500 mr-1" />
                 Lvl {level}
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white leading-tight">{user.name}</h2>
              <p className="text-slate-500 text-sm mb-2">Elite Member</p>
              
              {/* Level Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-yellow-500" 
                  style={{ width: `${progressToNextLevel}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-500">{user.points} XP</span>
                <span className="text-[10px] text-slate-500">{(level + 1) * 1000} XP</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800 text-center">
               <Flame size={20} className="text-orange-500 mx-auto mb-1" />
               <div className="text-lg font-bold text-white">{goal.streakDays}</div>
               <div className="text-[10px] uppercase text-slate-500 font-bold">Day Streak</div>
            </div>
            <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800 text-center">
               <Map size={20} className="text-blue-500 mx-auto mb-1" />
               <div className="text-lg font-bold text-white">{goal.currentDistanceKm}</div>
               <div className="text-[10px] uppercase text-slate-500 font-bold">Km Week</div>
            </div>
             <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800 text-center">
               <Medal size={20} className="text-yellow-500 mx-auto mb-1" />
               <div className="text-lg font-bold text-white">Top 5%</div>
               <div className="text-[10px] uppercase text-slate-500 font-bold">Rank</div>
            </div>
          </div>

          {/* Badges Strip */}
          <div className="bg-slate-950/30 rounded-xl p-3 border border-slate-800">
            <h3 className="text-[10px] uppercase text-slate-500 font-bold mb-2 tracking-wider">Recent Achievements</h3>
            <div className="flex space-x-3">
              {user.badges.slice(0, 4).map((badge) => (
                <div key={badge.id} className="relative group/tooltip">
                   <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:border-primary/50 transition-colors cursor-help shadow-sm">
                      {getBadgeIcon(badge.icon)}
                   </div>
                   {/* Tooltip */}
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-slate-800 text-xs text-white p-2 rounded shadow-xl border border-slate-700 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
                      <p className="font-bold">{badge.name}</p>
                      <p className="text-[10px] text-slate-400">{badge.description}</p>
                   </div>
                </div>
              ))}
              <div className="w-10 h-10 rounded-lg border border-dashed border-slate-700 flex items-center justify-center opacity-50">
                 <span className="text-xs text-slate-600 font-bold">+</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Share Action */}
      <button 
        onClick={handleShare}
        className="absolute -bottom-4 right-6 bg-white hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-full shadow-lg shadow-black/50 flex items-center space-x-2 font-bold text-sm transition-transform active:scale-95 z-20"
      >
        <Share2 size={16} />
        <span>Share Card</span>
      </button>
    </div>
  );
};