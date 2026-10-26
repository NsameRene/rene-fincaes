import React, { useState } from 'react';
import { X, Fingerprint, ScanFace, ShieldAlert } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { BiometryType } from '@aparajita/capacitor-biometric-auth';

interface Props {
  isOpen: boolean;
  actionTitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SensitiveAccessModal: React.FC<Props> = ({ isOpen, actionTitle, onSuccess, onCancel }) => {
  const { settings, biometricStatus, triggerBiometricUnlock, unlockApp } = useFinance();
  const [isPinMode, setIsPinMode] = useState(!settings.biometric_enabled);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isFaceId = biometricStatus?.biometryType === BiometryType.faceAuthentication || 
                   biometricStatus?.biometryType === BiometryType.faceId;

  const handleBiometric = async () => {
    setError(null);
    const success = await triggerBiometricUnlock();
    if (success) {
      onSuccess();
    } else {
      setIsPinMode(true);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    const success = unlockApp(pin);
    if (success) {
      onSuccess();
    } else {
      setError('Incorrect security PIN');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-xs bg-white dark:bg-[#161F30] rounded-xl shadow-lg border border-[#E6E9EF] dark:border-[#222C3E] p-5 space-y-4 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b border-[#E6E9EF] dark:border-[#222C3E]">
          <div className="flex items-center space-x-1.5 text-[#202633] dark:text-[#F3F5F9] font-medium text-[12px]">
            <ShieldAlert className="w-4 h-4 text-[#B7791F]" />
            <span>Identity verification</span>
          </div>
          <button onClick={onCancel} className="text-[#737B89] hover:text-[#202633] dark:hover:text-[#F3F5F9]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-[14px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
            {actionTitle || 'Authorize sensitive action'}
          </h3>
          <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8] mt-1">
            Authenticate using device biometrics or security PIN.
          </p>
        </div>

        {error && (
          <p className="text-[12px] text-[#D64545] bg-[#D64545]/10 py-1 px-2 rounded-lg border border-[#D64545]/20">
            {error}
          </p>
        )}

        {!isPinMode && settings.biometric_enabled ? (
          <div className="space-y-3 py-2">
            <button
              onClick={handleBiometric}
              className="w-16 h-16 mx-auto rounded-xl bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] flex items-center justify-center text-[#2457E6] hover:border-[#2457E6] transition-colors shadow-2xs"
            >
              {isFaceId ? <ScanFace className="w-8 h-8" /> : <Fingerprint className="w-8 h-8" />}
            </button>
            <p className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
              Tap icon to verify {biometricStatus?.typeName || 'biometrics'}
            </p>
            <button
              onClick={() => setIsPinMode(true)}
              className="text-[12px] text-[#2457E6] hover:underline"
            >
              Enter fallback PIN instead
            </button>
          </div>
        ) : (
          <form onSubmit={handlePinSubmit} className="space-y-3 py-1">
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={e => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                placeholder="4-digit PIN"
                className="w-full text-center tracking-[0.5em] text-[18px] py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9] focus:outline-none focus:border-[#2457E6]"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] text-[12px] font-medium text-[#202633] dark:text-[#F3F5F9] border border-[#E6E9EF] dark:border-[#222C3E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] text-white text-[12px] font-medium shadow-2xs transition-colors"
              >
                Confirm
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
