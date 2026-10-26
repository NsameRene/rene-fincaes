import React, { useState, useEffect } from 'react';
import { Fingerprint, ScanFace, Lock, Delete, ShieldCheck, KeyRound, RefreshCw } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { BiometryType } from '@aparajita/capacitor-biometric-auth';

export const BiometricLockScreen: React.FC = () => {
  const { 
    settings, 
    biometricStatus, 
    triggerBiometricUnlock, 
    unlockApp 
  } = useFinance();

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPinMode, setIsPinMode] = useState(!settings.biometric_enabled);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const isFaceId = biometricStatus?.biometryType === BiometryType.faceAuthentication || 
                   biometricStatus?.biometryType === BiometryType.faceId;

  const biometricName = biometricStatus?.typeName || 'Biometrics';

  // Automatically attempt biometric prompt when screen appears if biometrics is enabled
  useEffect(() => {
    if (settings.biometric_enabled && !isPinMode) {
      handleBiometricAuth();
    }
  }, [settings.biometric_enabled]);

  const handleBiometricAuth = async () => {
    setError(null);
    setIsAuthenticating(true);
    try {
      const success = await triggerBiometricUnlock();
      if (!success) {
        // Fallback to PIN option
        setIsPinMode(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Biometric verification unsuccessful');
      setIsPinMode(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);

      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = unlockApp(nextPin);
          if (!success) {
            setError('Incorrect security PIN. Please try again.');
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E131F] flex flex-col items-center justify-between px-6 py-10 text-white select-none animate-fade-in">
      {/* Top Branding */}
      <div className="flex flex-col items-center mt-6">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#222C3E] mb-3 p-1 shadow-xs">
          <img 
            src="/assets/aistudio/rene_finance_38616079.jpg" 
            alt="Rene Finance" 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <h1 className="text-[20px] font-semibold tracking-tight text-[#F3F5F9]">Rene Finance</h1>
        <p className="text-[12px] text-[#8E98A8] mt-0.5">Encrypted offline storage</p>
      </div>

      {/* Main Center Area: Biometric or PIN View */}
      <div className="w-full max-w-xs flex flex-col items-center my-auto">
        {!isPinMode && settings.biometric_enabled ? (
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Biometric Icon Scanner */}
            <div 
              onClick={handleBiometricAuth}
              className="relative cursor-pointer group"
              title="Tap to verify biometrics"
            >
              <div className="w-20 h-20 rounded-2xl bg-[#161F30] border border-[#222C3E] flex items-center justify-center group-hover:border-[#2457E6] transition-colors shadow-xs">
                {isFaceId ? (
                  <ScanFace className="w-10 h-10 text-[#2457E6]" />
                ) : (
                  <Fingerprint className="w-10 h-10 text-[#2457E6]" />
                )}
              </div>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-[#F3F5F9]">
                {isFaceId ? 'Verify Face ID' : 'Touch fingerprint sensor'}
              </h2>
              <p className="text-[12px] text-[#8E98A8] mt-1 max-w-[220px]">
                {isAuthenticating
                  ? 'Verifying biometric identity...'
                  : `Authenticate with your device ${biometricName}`}
              </p>
            </div>

            {error && (
              <p className="text-[12px] text-[#D64545] font-medium px-3 py-1 bg-[#D64545]/10 rounded-lg border border-[#D64545]/20">
                {error}
              </p>
            )}

            {/* Switch to PIN Fallback Button */}
            <div className="pt-2 flex flex-col space-y-2 w-full">
              <button
                onClick={() => setIsPinMode(true)}
                className="w-full py-2.5 px-4 rounded-lg bg-[#161F30] border border-[#222C3E] hover:border-[#2457E6]/50 text-[12px] font-medium text-[#F3F5F9] flex items-center justify-center space-x-2 transition-colors shadow-2xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#B7791F]" />
                <span>Use fallback security PIN</span>
              </button>

              <button
                onClick={handleBiometricAuth}
                className="text-[12px] text-[#2457E6] hover:underline font-medium py-1 flex items-center justify-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry {biometricName}</span>
              </button>
            </div>
          </div>
        ) : (
          /* PIN Entry Mode */
          <div className="w-full flex flex-col items-center">
            <h2 className="text-[15px] font-semibold text-[#F3F5F9]">
              {settings.biometric_enabled ? 'Fallback security PIN' : 'Enter security PIN'}
            </h2>
            <p className="text-[12px] text-[#8E98A8] mt-0.5">
              {settings.biometric_enabled ? 'Biometric fallback' : 'Unlock your local data'}
            </p>

            {/* PIN Dots */}
            <div className="flex items-center space-x-4 my-6">
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
              <p className="text-[12px] text-[#D64545] font-medium mb-3 text-center">
                {error}
              </p>
            )}

            {/* Numeric Keypad */}
            <div className="w-full grid grid-cols-3 gap-y-3 gap-x-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  onClick={() => handleDigit(num)}
                  className="w-14 h-14 mx-auto rounded-xl bg-[#161F30] border border-[#222C3E] text-[18px] font-medium text-[#F3F5F9] active:bg-[#2457E6] active:border-[#2457E6] transition-colors flex items-center justify-center shadow-2xs"
                >
                  {num}
                </button>
              ))}

              {settings.biometric_enabled ? (
                <button
                  onClick={() => {
                    setIsPinMode(false);
                    setError(null);
                  }}
                  className="w-14 h-14 mx-auto rounded-xl bg-[#161F30] text-[#2457E6] hover:text-white transition-colors flex items-center justify-center"
                  title={`Switch back to ${biometricName}`}
                >
                  {isFaceId ? <ScanFace className="w-5 h-5" /> : <Fingerprint className="w-5 h-5" />}
                </button>
              ) : (
                <div className="w-14 h-14 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#8E98A8]" />
                </div>
              )}

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
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center pb-2">
        <p className="text-[11px] text-[#8E98A8] flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
          <span>Local biometrics</span>
          <span>·</span>
          <span>Offline private</span>
        </p>
      </div>
    </div>
  );
};
