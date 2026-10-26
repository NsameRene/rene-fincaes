import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const PinLockScreen: React.FC = () => {
  const { unlockApp } = useFinance();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = unlockApp(nextPin);
          if (!success) {
            setError(true);
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E131F] flex flex-col items-center justify-between px-6 py-12 text-white select-none animate-fade-in">
      <div className="flex flex-col items-center mt-6">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#222C3E] mb-3 p-1 shadow-xs">
          <img 
            src="/assets/aistudio/rene_finance_38616079.jpg" 
            alt="Rene Finance" 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <h1 className="text-[20px] font-semibold tracking-tight text-[#F3F5F9]">Rene Finance</h1>
        <p className="text-[12px] text-[#8E98A8] mt-0.5">Enter your 4-digit security PIN</p>

        {/* PIN Dots */}
        <div className="flex items-center space-x-4 mt-6">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                pin.length > idx
                  ? error
                    ? 'bg-[#D64545] border-[#D64545]'
                    : 'bg-[#2457E6] border-[#2457E6]'
                  : error
                  ? 'border-[#D64545]/50'
                  : 'border-[#222C3E]'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-[12px] text-[#D64545] font-medium mt-3">
            Incorrect PIN. Please try again.
          </p>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-y-3 gap-x-4 mb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
          <button
            key={num}
            onClick={() => handleDigit(num)}
            className="w-14 h-14 mx-auto rounded-xl bg-[#161F30] border border-[#222C3E] text-[18px] font-medium text-[#F3F5F9] active:bg-[#2457E6] active:border-[#2457E6] transition-colors flex items-center justify-center shadow-2xs"
          >
            {num}
          </button>
        ))}

        <div className="flex items-center justify-center text-[#8E98A8]">
          <Lock className="w-4 h-4" />
        </div>

        <button
          onClick={() => handleDigit('0')}
          className="w-14 h-14 mx-auto rounded-xl bg-[#161F30] border border-[#222C3E] text-[18px] font-medium text-[#F3F5F9] active:bg-[#2457E6] active:border-[#2457E6] transition-colors flex items-center justify-center shadow-2xs"
        >
          0
        </button>

        <button
          onClick={handleDelete}
          className="w-14 h-14 mx-auto rounded-xl bg-[#161F30] text-[#8E98A8] hover:text-white transition-colors flex items-center justify-center"
          aria-label="Delete digit"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
