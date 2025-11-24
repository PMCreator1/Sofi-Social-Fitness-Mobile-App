
import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Lock, Loader2, CheckCircle } from 'lucide-react';
import { Event } from '../types';

interface PaymentModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ event, onClose, onConfirm }) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  
  const handlePay = () => {
    setStep('processing');
    // Simulate API call
    setTimeout(() => {
        setStep('success');
        setTimeout(() => {
            onConfirm();
        }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-300 relative">
        
        {step !== 'success' && (
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10">
            <X size={24} />
            </button>
        )}

        {step === 'details' && (
            <div className="p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                        <CreditCard size={32} className="text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Secure Checkout</h2>
                    <p className="text-slate-400 text-sm">Complete payment to join event</p>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 mb-6 border border-slate-800 flex items-start">
                    <img src={event.image} className="w-16 h-16 rounded-lg object-cover mr-4 bg-slate-800" />
                    <div>
                        <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">{event.title}</h3>
                        <p className="text-xs text-slate-500 mb-2">{event.date} • {event.time}</p>
                        <div className="text-primary font-bold text-lg">
                            {event.currency} {event.price?.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <button className="w-full bg-slate-800 border border-slate-700 hover:border-primary/50 rounded-xl p-4 flex items-center justify-between transition-all group">
                        <div className="flex items-center">
                            <div className="w-8 h-5 bg-slate-600 rounded mr-3"></div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">**** 4242</p>
                                <p className="text-[10px] text-slate-500">Expires 12/25</p>
                            </div>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary"></div>
                    </button>
                    
                    <button className="w-full bg-slate-800 border border-slate-700 hover:border-primary/50 rounded-xl p-4 flex items-center justify-between transition-all">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-slate-700 rounded mr-3 flex items-center justify-center text-[10px] font-bold">USSD</div>
                            <span className="text-sm font-bold text-slate-300">Bank Transfer / USSD</span>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                    </button>
                </div>

                <button 
                    onClick={handlePay}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center transition-all"
                >
                    <Lock size={16} className="mr-2" />
                    Pay {event.currency} {event.price?.toLocaleString()}
                </button>
                
                <div className="mt-4 flex justify-center items-center text-[10px] text-slate-500">
                    <ShieldCheck size={12} className="mr-1" />
                    Encrypted & Secure Payment
                </div>
            </div>
        )}

        {step === 'processing' && (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 size={48} className="text-primary animate-spin mb-6" />
                <h2 className="text-xl font-bold text-white mb-2">Processing Payment</h2>
                <p className="text-slate-400 text-sm">Please wait while we confirm...</p>
            </div>
        )}

        {step === 'success' && (
             <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
                    <CheckCircle size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                <p className="text-slate-400 text-sm">You have successfully joined the event.</p>
            </div>
        )}

      </div>
    </div>
  );
};
