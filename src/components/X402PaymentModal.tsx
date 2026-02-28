import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Box, FileText } from 'lucide-react';

export interface X402PaymentDetails {
  amount: number;
  recipient: string;
  network: string;
  description: string;
  actionType: 'unlock' | 'simulate';
}

interface X402PaymentModalProps {
  details: X402PaymentDetails | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function X402PaymentModal({ details, onSuccess, onCancel }: X402PaymentModalProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    // Reset status when details change
    setStatus('idle');
  }, [details]);

  if (!details) return null;

  const handlePay = () => {
    setStatus('processing');
    
    // Simulate payment process
    setTimeout(() => {
      setStatus('success');
      
      // Auto-close and trigger success after short delay
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        className={`w-full max-w-sm bg-[#0a0a0a] border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)] rounded-lg overflow-hidden flex flex-col font-mono relative transition-all duration-300 ${
          status === 'success' ? 'border-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.4)] scale-105' : 'scale-100'
        }`}
      >
        {/* Receipt Header pattern */}
        <div className="h-4 w-full bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 10px 0, transparent 10px, #0a0a0a 11px)', backgroundSize: '20px 20px', backgroundPosition: '-10px -10px' }}></div>
        </div>

        <div className="p-6 pt-4 flex flex-col items-center">
          {/* Header */}
          <div className="flex flex-col items-center mb-6 w-full text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              {details.actionType === 'simulate' ? <Box size={24} /> : <FileText size={24} />}
            </div>
            <h2 className="text-white text-lg font-bold tracking-widest uppercase mb-1">
              x402 Digital Bill
            </h2>
            <p className="text-white/50 text-xs tracking-wider">
              {details.actionType === 'simulate' ? 'MISTRAL SANDBOX SIMULATION' : 'KNOWLEDGE UNLOCK'}
            </p>
          </div>

          {/* Dotted separator */}
          <div className="w-full border-t-2 border-dashed border-white/20 mb-6"></div>

          {/* Details */}
          <div className="w-full space-y-4 text-sm mb-6">
            <div className="flex justify-between items-start">
              <span className="text-white/50 uppercase">Description</span>
              <span className="text-white text-right max-w-[200px] leading-snug">{details.description}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/50 uppercase">Recipient</span>
              <span className="text-white bg-white/5 px-2 py-0.5 rounded">{details.recipient}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/50 uppercase">Network</span>
              <span className="text-emerald-400">{details.network}</span>
            </div>
          </div>

          {/* Dotted separator */}
          <div className="w-full border-t-2 border-dashed border-white/20 mb-6"></div>

          {/* Total */}
          <div className="w-full flex justify-between items-end mb-8">
            <span className="text-white/70 uppercase font-bold tracking-widest">Total Amount</span>
            <div className="text-right">
              <div className="text-3xl text-emerald-400 font-black">${details.amount.toFixed(2)}</div>
              <div className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">USD EQUIVALENT</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-3">
            {status === 'idle' && (
              <>
                <button
                  onClick={handlePay}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-widest text-sm py-3 rounded transition-colors"
                >
                  Confirm Payment
                </button>
                <button
                  onClick={onCancel}
                  className="w-full bg-transparent hover:bg-white/5 border border-white/20 text-white/70 font-bold uppercase tracking-widest text-xs py-3 rounded transition-colors"
                >
                  Cancel
                </button>
              </>
            )}

            {status === 'processing' && (
              <button
                disabled
                className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-widest text-sm py-3 rounded flex items-center justify-center gap-2 cursor-wait"
              >
                <Loader2 size={16} className="animate-spin" />
                Processing Transaction...
              </button>
            )}

            {status === 'success' && (
              <button
                disabled
                className="w-full bg-emerald-500 text-black font-bold uppercase tracking-widest text-sm py-3 rounded flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                Payment Successful
              </button>
            )}
          </div>
        </div>

        {/* Receipt Footer pattern */}
        <div className="h-4 w-full bg-[#0a0a0a] relative overflow-hidden mt-auto">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 10px 20px, transparent 10px, #0a0a0a 11px)', backgroundSize: '20px 20px', backgroundPosition: '-10px 0px' }}></div>
        </div>
      </div>
    </div>
  );
}
