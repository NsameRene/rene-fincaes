import React, { useState, useRef } from 'react';
import { 
  Palette, 
  DollarSign, 
  User, 
  Lock, 
  Tag, 
  Download, 
  Upload, 
  Sparkles, 
  Trash2, 
  ShieldCheck, 
  Smartphone, 
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  Check,
  Fingerprint,
  KeyRound,
  Clock,
  Shield
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SUPPORTED_CURRENCIES } from '../../lib/currencies';
import { CategoryManagerModal } from './CategoryManagerModal';
import { AndroidPackagingGuideModal } from './AndroidPackagingGuideModal';
import { DatabaseBackup } from '../../types';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    setAppPin, 
    removeAppPin, 
    biometricStatus,
    disableBiometrics,
    triggerBiometricUnlock,
    lockApp,
    requestSensitiveAccess,
    exportCSV, 
    exportJSONBackup, 
    importJSONBackup, 
    resetAllData, 
    seedDemoData, 
    clearDemoData 
  } = useFinance();

  const [displayName, setDisplayName] = useState(settings.display_name);
  const [nameSaved, setNameSaved] = useState(false);

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // PIN & Biometrics settings state
  const [pinInput, setPinInput] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinError, setPinError] = useState('');

  const [bioTestStatus, setBioTestStatus] = useState<string | null>(null);
  const [showBioFallbackPrompt, setShowBioFallbackPrompt] = useState(false);
  const [fallbackPinInput, setFallbackPinInput] = useState('');
  const [fallbackPinError, setFallbackPinError] = useState('');

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [demoLoadedFeedback, setDemoLoadedFeedback] = useState(false);

  // Backup restore
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    await updateSettings({ display_name: displayName.trim() });
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleSavePin = async () => {
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setPinError('PIN must be exactly 4 digits');
      return;
    }
    await setAppPin(pinInput);
    setPinInput('');
    setShowPinDialog(false);
    setPinError('');
  };

  const handleToggleBiometrics = async () => {
    if (settings.biometric_enabled) {
      await disableBiometrics();
      setBioTestStatus('Biometric unlock disabled.');
      setTimeout(() => setBioTestStatus(null), 3000);
    } else {
      if (settings.pin_hash) {
        await updateSettings({ biometric_enabled: true });
        setBioTestStatus('Biometric unlock enabled.');
        setTimeout(() => setBioTestStatus(null), 3000);
      } else {
        setShowBioFallbackPrompt(true);
      }
    }
  };

  const handleConfirmBioWithFallbackPin = async () => {
    if (fallbackPinInput.length !== 4 || !/^\d{4}$/.test(fallbackPinInput)) {
      setFallbackPinError('Fallback PIN must be 4 digits');
      return;
    }
    await setAppPin(fallbackPinInput);
    await updateSettings({ biometric_enabled: true });
    setShowBioFallbackPrompt(false);
    setFallbackPinInput('');
    setFallbackPinError('');
    setBioTestStatus('Biometric unlock & fallback PIN configured.');
    setTimeout(() => setBioTestStatus(null), 3000);
  };

  const handleTestBiometrics = async () => {
    setBioTestStatus('Triggering device prompt...');
    const ok = await triggerBiometricUnlock();
    if (ok) {
      setBioTestStatus('Biometric verified successfully!');
    } else {
      setBioTestStatus('Biometric prompt cancelled or failed.');
    }
    setTimeout(() => setBioTestStatus(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text) as DatabaseBackup;

        if (parsed.app !== 'rene_finance' || !parsed.version) {
          setImportStatus('Error: Invalid backup file format');
          return;
        }

        await importJSONBackup(parsed, 'replace');
        setImportStatus('Backup restored successfully!');
        setTimeout(() => setImportStatus(null), 3500);
      } catch (err: any) {
        setImportStatus(`Restore failed: ${err?.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadDemo = async () => {
    await seedDemoData();
    setDemoLoadedFeedback(true);
    setTimeout(() => setDemoLoadedFeedback(false), 3000);
  };

  const handleClearDemo = async () => {
    await clearDemoData();
  };

  return (
    <div className="p-4 space-y-4 pb-safe-nav">
      {/* Title */}
      <div>
        <h1 className="text-[20px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
          Settings
        </h1>
        <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">Personalization, security & local data</p>
      </div>

      {/* 1. Profile Display Name */}
      <div className="bg-white dark:bg-[#161F30] rounded-xl p-4 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 text-[#202633] dark:text-[#F3F5F9]">
          <User className="w-4 h-4 text-[#2457E6]" />
          <h2 className="text-[14px] font-medium">Profile information</h2>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="flex-1 px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[13px] text-[#202633] dark:text-[#F3F5F9] focus:outline-none focus:border-[#2457E6]"
          />
          <button
            onClick={handleSaveName}
            className="px-4 py-2 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] text-white font-medium text-[12px] flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            {nameSaved ? <Check className="w-3.5 h-3.5 text-white" /> : <span>Save</span>}
          </button>
        </div>
      </div>

      {/* 2. Theme & Currency */}
      <div className="bg-white dark:bg-[#161F30] rounded-xl p-4 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs space-y-4">
        {/* Theme */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#202633] dark:text-[#F3F5F9] flex items-center space-x-1.5">
            <Palette className="w-4 h-4 text-[#2457E6]" />
            <span>Theme appearance</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'system'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => updateSettings({ theme: t })}
                className={`py-2 rounded-lg text-[12px] font-medium capitalize transition-all border ${
                  settings.theme === t
                    ? 'bg-[#2457E6] border-[#2457E6] text-white'
                    : 'bg-[#F7F8FA] dark:bg-[#0E131F] border-[#E6E9EF] dark:border-[#222C3E] text-[#737B89] dark:text-[#8E98A8]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="space-y-1.5 pt-2 border-t border-[#E6E9EF] dark:border-[#222C3E]">
          <label className="text-[13px] font-medium text-[#202633] dark:text-[#F3F5F9] flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-[#16845B]" />
              <span>Default currency</span>
            </span>
            <span className="text-[11px] text-[#16845B]">
              Active: {settings.default_currency}
            </span>
          </label>
          <select
            value={settings.default_currency}
            onChange={e => updateSettings({ default_currency: e.target.value })}
            className="w-full p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] text-[#202633] dark:text-[#F3F5F9] focus:outline-none"
          >
            {Object.values(SUPPORTED_CURRENCIES).map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.code} ({curr.symbol}) — {curr.name}
              </option>
            ))}
          </select>
        </div>

        {/* First Day of the Week */}
        <div className="space-y-1.5 pt-2 border-t border-[#E6E9EF] dark:border-[#222C3E]">
          <label className="text-[13px] font-medium text-[#202633] dark:text-[#F3F5F9] flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-[#2457E6]" />
            <span>First day of the week</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: 1, label: 'Monday (Default)' },
              { val: 0, label: 'Sunday' },
            ].map(d => (
              <button
                key={d.val}
                type="button"
                onClick={() => updateSettings({ first_day_of_week: d.val as any })}
                className={`py-2 rounded-lg text-[12px] font-medium transition-all border ${
                  settings.first_day_of_week === d.val
                    ? 'bg-[#2457E6] border-[#2457E6] text-white'
                    : 'bg-[#F7F8FA] dark:bg-[#0E131F] border-[#E6E9EF] dark:border-[#222C3E] text-[#737B89] dark:text-[#8E98A8]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Category Management */}
      <div className="bg-white dark:bg-[#161F30] rounded-xl p-4 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] text-[#2457E6] flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[14px] font-medium text-[#202633] dark:text-[#F3F5F9]">Categories management</h2>
            <p className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">Custom income and expense categories</p>
          </div>
        </div>
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="px-3 py-1.5 rounded-lg border border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9] text-[12px] font-medium hover:bg-[#F7F8FA] dark:hover:bg-[#0E131F] transition-colors shadow-2xs"
        >
          Manage
        </button>
      </div>

      {/* 4. Biometric & Device Security Suite */}
      <div className="bg-white dark:bg-[#161F30] rounded-xl p-4 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] text-[#2457E6] flex items-center justify-center">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-[14px] font-medium text-[#202633] dark:text-[#F3F5F9]">Biometric authentication</h2>
                <span className="text-[10px] text-[#16845B]">
                  ({biometricStatus?.typeName || 'Biometrics'})
                </span>
              </div>
              <p className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
                Prompt on launch and after inactivity
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleBiometrics}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              settings.biometric_enabled ? 'bg-[#2457E6]' : 'bg-[#E6E9EF] dark:bg-[#222C3E]'
            }`}
            aria-label="Toggle biometrics"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                settings.biometric_enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {bioTestStatus && (
          <div className="p-2.5 rounded-lg bg-[#2457E6]/10 border border-[#2457E6]/20 text-[#2457E6] text-[12px] text-center font-medium">
            {bioTestStatus}
          </div>
        )}

        {/* Test Biometrics button if enabled */}
        {settings.biometric_enabled && (
          <div className="flex items-center justify-between p-2.5 bg-[#F7F8FA] dark:bg-[#0E131F] rounded-lg border border-[#E6E9EF] dark:border-[#222C3E]">
            <span className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">Test biometric sensor</span>
            <button
              onClick={handleTestBiometrics}
              className="px-3 py-1 rounded-md bg-[#2457E6] hover:bg-[#1d46b8] text-white font-medium text-[12px] shadow-2xs transition-colors"
            >
              Test sensor
            </button>
          </div>
        )}

        {/* Fallback PIN Configuration Modal / Inline */}
        {showBioFallbackPrompt && (
          <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#0E131F] rounded-xl border border-[#B7791F]/40 space-y-2 text-[12px]">
            <div className="flex items-center space-x-1.5 text-[#B7791F] font-medium">
              <KeyRound className="w-4 h-4" />
              <span>Set fallback security PIN</span>
            </div>
            <p className="text-[11px] text-[#737B89] dark:text-[#8E98A8] leading-tight">
              A 4-digit fallback PIN is required to ensure access if biometric verification fails or is unavailable.
            </p>
            <div className="flex space-x-2 pt-1">
              <input
                type="password"
                maxLength={4}
                value={fallbackPinInput}
                onChange={e => setFallbackPinInput(e.target.value)}
                placeholder="4 digits"
                className="w-28 text-center tracking-widest text-[14px] px-3 py-1.5 rounded-lg bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] focus:outline-none"
              />
              <button
                onClick={handleConfirmBioWithFallbackPin}
                className="px-3 py-1.5 rounded-lg bg-[#2457E6] text-white font-medium text-[12px] hover:bg-[#1d46b8]"
              >
                Enable
              </button>
              <button
                onClick={() => {
                  setShowBioFallbackPrompt(false);
                  setFallbackPinInput('');
                  setFallbackPinError('');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#E6E9EF] dark:bg-[#222C3E] text-[#202633] dark:text-[#F3F5F9] text-[12px] font-medium"
              >
                Cancel
              </button>
            </div>
            {fallbackPinError && <p className="text-[11px] text-[#D64545] font-medium">{fallbackPinError}</p>}
          </div>
        )}

        {/* Fallback Security PIN Section */}
        <div className="pt-2 border-t border-[#E6E9EF] dark:border-[#222C3E] flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#737B89]" />
              <span className="text-[13px] font-medium text-[#202633] dark:text-[#F3F5F9]">
                Fallback security PIN
              </span>
            </div>
            <p className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
              {settings.pin_enabled ? '4-digit PIN is configured' : 'No PIN configured'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {settings.pin_enabled ? (
              <>
                <button
                  onClick={() => setShowPinDialog(true)}
                  className="px-2.5 py-1 rounded-md border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] font-medium text-[#202633] dark:text-[#F3F5F9] hover:bg-[#F7F8FA]"
                >
                  Change
                </button>
                <button
                  onClick={removeAppPin}
                  className="px-2.5 py-1 rounded-md border border-[#D64545]/30 text-[#D64545] text-[12px] font-medium hover:bg-[#D64545]/10"
                >
                  Disable
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowPinDialog(true)}
                className="px-3 py-1.5 rounded-lg bg-[#2457E6] text-white text-[12px] font-medium hover:bg-[#1d46b8]"
              >
                Set PIN
              </button>
            )}
          </div>
        </div>

        {/* Change / Set PIN Form */}
        {showPinDialog && (
          <div className="p-3 bg-[#F7F8FA] dark:bg-[#0E131F] rounded-lg border border-[#E6E9EF] dark:border-[#222C3E] space-y-2 text-[12px]">
            <label className="text-[12px] font-medium text-[#202633] dark:text-[#F3F5F9] block">
              Enter 4-digit security PIN
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="4 digits"
                className="w-28 text-center tracking-widest text-[14px] px-3 py-1.5 rounded-lg bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] focus:outline-none"
              />
              <button
                onClick={handleSavePin}
                className="px-3 py-1.5 rounded-lg bg-[#2457E6] text-white font-medium text-[12px]"
              >
                Save PIN
              </button>
              <button
                onClick={() => {
                  setShowPinDialog(false);
                  setPinInput('');
                  setPinError('');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#E6E9EF] dark:bg-[#222C3E] text-[#202633] dark:text-[#F3F5F9] text-[12px] font-medium"
              >
                Cancel
              </button>
            </div>
            {pinError && <p className="text-[11px] text-[#D64545] font-medium">{pinError}</p>}
          </div>
        )}

        {/* Inactivity Auto-Lock Period Selector */}
        <div className="pt-2 border-t border-[#E6E9EF] dark:border-[#222C3E] space-y-1.5">
          <label className="text-[13px] font-medium text-[#202633] dark:text-[#F3F5F9] flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2457E6]" />
              <span>Inactivity auto-lock</span>
            </span>
            <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
              {settings.inactivity_lock_minutes === 0
                ? 'On minimize'
                : settings.inactivity_lock_minutes === -1
                ? 'Never'
                : `${settings.inactivity_lock_minutes} min`}
            </span>
          </label>
          <div className="grid grid-cols-4 gap-1.5 text-[11px]">
            {[
              { val: 0, label: 'Instant' },
              { val: 1, label: '1 min' },
              { val: 2, label: '2 min' },
              { val: 5, label: '5 min' },
            ].map(item => (
              <button
                key={item.val}
                type="button"
                onClick={() => updateSettings({ inactivity_lock_minutes: item.val })}
                className={`py-1.5 rounded-md border font-medium transition-all ${
                  settings.inactivity_lock_minutes === item.val
                    ? 'bg-[#2457E6] border-[#2457E6] text-white'
                    : 'bg-[#F7F8FA] dark:bg-[#0E131F] border-[#E6E9EF] dark:border-[#222C3E] text-[#737B89] dark:text-[#8E98A8]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sensitive Sections Protection Toggle */}
        <div className="pt-2 border-t border-[#E6E9EF] dark:border-[#222C3E] flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-[#B7791F]" />
              <span className="text-[13px] font-medium text-[#202633] dark:text-[#F3F5F9]">
                Protect sensitive actions
              </span>
            </div>
            <p className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
              Prompt biometrics before exporting backups or wiping data
            </p>
          </div>

          <button
            onClick={() => updateSettings({ protect_sensitive_sections: !settings.protect_sensitive_sections })}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              settings.protect_sensitive_sections ? 'bg-[#2457E6]' : 'bg-[#E6E9EF] dark:bg-[#222C3E]'
            }`}
            aria-label="Toggle sensitive sections protection"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                settings.protect_sensitive_sections ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Instant Lock Button */}
        {(settings.biometric_enabled || settings.pin_enabled) && (
          <div className="pt-2 border-t border-[#E6E9EF] dark:border-[#222C3E]">
            <button
              onClick={lockApp}
              className="w-full py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] hover:border-[#2457E6]/40 text-[#202633] dark:text-[#F3F5F9] font-medium text-[12px] flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5 text-[#2457E6]" />
              <span>Lock application now</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Backup, Restore & CSV Export */}
      <div className="bg-white dark:bg-[#161F30] rounded-xl p-4 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs space-y-3">
        <h2 className="text-[14px] font-medium text-[#202633] dark:text-[#F3F5F9] flex items-center space-x-1.5">
          <Download className="w-4 h-4 text-[#2457E6]" />
          <span>Local backup & export</span>
        </h2>

        {importStatus && (
          <div className="p-2.5 rounded-lg bg-[#2457E6]/10 border border-[#2457E6]/20 text-[#2457E6] text-[12px] font-medium text-center">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <button
            onClick={async () => {
              const authorized = await requestSensitiveAccess('Export Database Backup');
              if (authorized) {
                await exportJSONBackup();
              }
            }}
            className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] flex flex-col items-center justify-center text-center space-y-1 hover:border-[#2457E6]/40 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#2457E6]" />
            <span className="font-medium text-[#202633] dark:text-[#F3F5F9]">Export JSON</span>
            <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">Complete database</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] flex flex-col items-center justify-center text-center space-y-1 hover:border-[#2457E6]/40 transition-colors shadow-2xs"
          >
            <Upload className="w-4 h-4 text-[#16845B]" />
            <span className="font-medium text-[#202633] dark:text-[#F3F5F9]">Restore JSON</span>
            <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">Select backup file</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* CSV Export */}
        <button
          onClick={() => exportCSV()}
          className="w-full py-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9] font-medium text-[12px] flex items-center justify-center space-x-2 hover:border-[#2457E6]/40 transition-colors shadow-2xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#16845B]" />
          <span>Export all transactions to CSV</span>
        </button>

        {settings.last_backup_at && (
          <p className="text-[11px] text-[#737B89] dark:text-[#8E98A8] text-center">
            Last backup exported: {new Date(settings.last_backup_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* 6. Demo Data Mode */}
      <div className="bg-white dark:bg-[#161F30] rounded-xl p-4 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs space-y-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#B7791F]" />
          <h2 className="text-[14px] font-medium text-[#202633] dark:text-[#F3F5F9]">Sample demo data</h2>
        </div>
        <p className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
          Load sample records to evaluate all views, charts, and budget limits.
        </p>

        {demoLoadedFeedback && (
          <div className="p-2 bg-[#16845B]/10 border border-[#16845B]/20 text-[#16845B] text-[12px] text-center rounded-lg font-medium">
            Sample records populated successfully!
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1 text-[12px]">
          <button
            onClick={handleLoadDemo}
            className="py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] hover:border-[#2457E6]/40 text-[#202633] dark:text-[#F3F5F9] font-medium transition-colors"
          >
            Load sample records
          </button>
          <button
            onClick={handleClearDemo}
            className="py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[#737B89] dark:text-[#8E98A8] font-medium hover:text-[#202633] transition-colors"
          >
            Clear sample records
          </button>
        </div>
      </div>

      {/* 7. Android Packaging Guide Button */}
      <div className="bg-[#17233B] rounded-xl p-4 text-white border border-[#222C3E] shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#161F30] text-[#2457E6] flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[14px] font-medium">Android APK packaging</h2>
            <p className="text-[11px] text-[#8E98A8]">Capacitor Android build instructions</p>
          </div>
        </div>
        <button
          onClick={() => setIsGuideOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-white text-[#202633] font-medium text-[12px] hover:bg-slate-100 transition-colors shadow-2xs"
        >
          View guide
        </button>
      </div>

      {/* 8. Data Privacy Explanation & Architecture */}
      <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[#737B89] dark:text-[#8E98A8] text-[11px] space-y-1.5">
        <div className="flex items-center space-x-1.5 font-medium text-[#202633] dark:text-[#F3F5F9]">
          <ShieldCheck className="w-4 h-4 text-[#16845B]" />
          <span>Local offline architecture</span>
        </div>
        <p className="leading-relaxed">
          Rene Finance stores all records locally on your device in a normalized SQLite database. No personal financial information is ever uploaded to external servers, cloud providers, or third-party trackers.
        </p>
      </div>

      {/* 9. Reset All Data */}
      <div className="pt-2">
        {showResetConfirm ? (
          <div className="p-4 bg-[#D64545]/5 rounded-xl border border-[#D64545]/20 space-y-2 text-center">
            <AlertTriangle className="w-5 h-5 text-[#D64545] mx-auto" />
            <h3 className="text-[14px] font-semibold text-[#D64545]">
              Permanently delete all financial records?
            </h3>
            <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8] leading-tight">
              This will wipe all accounts, transactions, budgets, and savings goals from this device. This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] text-[12px] font-medium text-[#202633] dark:text-[#F3F5F9] border border-[#E6E9EF] dark:border-[#222C3E]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const authorized = await requestSensitiveAccess('Wipe All Financial Data');
                  if (authorized) {
                    await resetAllData();
                    setShowResetConfirm(false);
                  }
                }}
                className="py-2 rounded-lg bg-[#D64545] hover:bg-[#b53434] text-white text-[12px] font-medium shadow-2xs"
              >
                Delete everything
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 rounded-lg border border-[#D64545]/30 text-[#D64545] font-medium text-[12px] flex items-center justify-center space-x-1.5 hover:bg-[#D64545]/5 transition-colors shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset all financial data</span>
          </button>
        )}
      </div>

      {/* Modals */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <AndroidPackagingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
