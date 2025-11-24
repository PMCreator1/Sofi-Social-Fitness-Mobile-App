import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { ActivityType } from '../types';

interface OnboardingProps {
  onComplete: (data: { name: string; location: string; interests: ActivityType[]; goal: number }) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState<ActivityType[]>([]);
  const [goal, setGoal] = useState(15);

  const activities: ActivityType[] = ['Running', 'Cycling', 'Hiking', 'Yoga', 'Boxing', 'Football', 'Tabata', 'Zumba', 'Swimming', 'Tennis'];

  const toggleInterest = (type: ActivityType) => {
    if (interests.includes(type)) {
      setInterests(interests.filter(i => i !== type));
    } else {
      setInterests([...interests, type]);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete({ name, location, interests, goal });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="z-10 w-full max-w-md">
            {step === 1 && (
                <div className="animate-in slide-in-from-right duration-500">
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome to Pulse.</h1>
                    <p className="text-slate-400 mb-8 text-lg">Your journey to an active lifestyle starts here.</p>
                    
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Your Name</label>
                            <input 
                                value={name} onChange={e => setName(e.target.value)}
                                className="w-full bg-slate-800 border-b-2 border-slate-700 focus:border-primary text-white text-xl py-2 outline-none transition-colors"
                                placeholder="e.g. Tunde"
                            />
                        </div>
                        <div>
                             <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">City</label>
                            <input 
                                value={location} onChange={e => setLocation(e.target.value)}
                                className="w-full bg-slate-800 border-b-2 border-slate-700 focus:border-primary text-white text-xl py-2 outline-none transition-colors"
                                placeholder="e.g. Lagos"
                            />
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-in slide-in-from-right duration-500">
                    <h2 className="text-3xl font-bold text-white mb-2">What moves you?</h2>
                    <p className="text-slate-400 mb-6">Select activities you enjoy.</p>
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {activities.map(act => (
                            <button 
                                key={act}
                                onClick={() => toggleInterest(act)}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                    interests.includes(act) 
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-orange-900/40' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                                }`}
                            >
                                <span className="font-bold">{act}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-in slide-in-from-right duration-500">
                     <h2 className="text-3xl font-bold text-white mb-2">Set a Weekly Goal</h2>
                     <p className="text-slate-400 mb-10">How many kilometers do you want to move this week?</p>
                     
                     <div className="text-center mb-10">
                         <span className="text-6xl font-black text-white">{goal}</span>
                         <span className="text-xl text-slate-500 ml-2">km</span>
                     </div>
                     
                     <input 
                        type="range" min="5" max="100" step="5"
                        value={goal} onChange={e => setGoal(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary mb-8"
                     />
                     <div className="flex justify-between text-xs text-slate-500">
                         <span>Casual (5km)</span>
                         <span>Beast Mode (100km)</span>
                     </div>
                </div>
            )}

            <button 
                onClick={handleNext}
                disabled={step === 1 && (!name || !location)}
                className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center disabled:opacity-50 hover:scale-[1.02] transition-all"
            >
                {step === 3 ? "Let's Go!" : "Next"} <ChevronRight className="ml-2" />
            </button>
        </div>
        
        {/* Step Indicator */}
        <div className="absolute bottom-8 flex space-x-2">
            {[1,2,3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-slate-700'}`}></div>
            ))}
        </div>
    </div>
  );
};