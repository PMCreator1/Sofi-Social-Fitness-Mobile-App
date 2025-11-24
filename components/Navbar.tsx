
import React from 'react';
import { Home, Compass, Trophy, User, Users, Dumbbell } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'coach', icon: Dumbbell, label: 'Coach' },
    { id: 'teams', icon: Users, label: 'Teams' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe pt-2 px-4 h-20 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.3)] z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center w-14 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary' : 'text-slate-500'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
