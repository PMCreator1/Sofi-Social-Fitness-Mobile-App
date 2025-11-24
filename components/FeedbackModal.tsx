import React, { useState } from 'react';
import { X, Star, MessageSquare, Bug, Lightbulb, AlertCircle, CheckCircle, Send } from 'lucide-react';

interface FeedbackModalProps {
  onClose: () => void;
}

type FeedbackCategory = 'usability' | 'bug' | 'feature' | 'content';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory>('usability');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const categories = [
    { id: 'usability', label: 'Usability', icon: AlertCircle },
    { id: 'bug', label: 'Bug Report', icon: Bug },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb },
    { id: 'content', label: 'Content', icon: MessageSquare },
  ];

  const handleSubmit = () => {
    if (rating === 0) return;
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
      setTimeout(onClose, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
        
        {status === 'success' ? (
          <div className="p-12 text-center flex flex-col items-center justify-center h-80">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Thanks!</h2>
            <p className="text-slate-400">Your feedback helps us improve.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-lg font-bold text-white">App Feedback</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-8 text-center">
                <p className="text-sm text-slate-400 mb-3">How was your experience?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-700'}`}
                    >
                      <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Category</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id as FeedbackCategory)}
                        className={`flex items-center p-3 rounded-xl border transition-all ${
                          isSelected 
                          ? 'bg-primary/20 border-primary text-white' 
                          : 'bg-slate-800 border-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <Icon size={16} className={`mr-2 ${isSelected ? 'text-primary' : ''}`} />
                        <span className="text-xs font-bold">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-primary min-h-[100px]"
                  placeholder="Share your thoughts..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                disabled={rating === 0 || status === 'submitting'}
                className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-orange-900/20"
              >
                {status === 'submitting' ? (
                  <span className="animate-pulse">Sending...</span>
                ) : (
                  <>
                    <Send size={18} className="mr-2" /> Submit Feedback
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};