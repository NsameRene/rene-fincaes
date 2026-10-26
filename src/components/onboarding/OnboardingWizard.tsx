import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, Shield, Wallet } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SUPPORTED_CURRENCIES } from '../../lib/currencies';

export const OnboardingWizard: React.FC = () => {
  const { completeOnboarding, seedDemoData } = useFinance();
  const [step, setStep] = useState(1);

  // Form states
  const [displayName, setDisplayName] = useState('Rene');
  const [currency, setCurrency] = useState('XAF');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('');

  // Opening balances for primary accounts
  const [balances, setBalances] = useState({
    cash: 0,
    mtn_momo: 0,
    orange_money: 0,
    bank: 0,
  });

  const handleFinish = async (loadDemo: boolean = false) => {
    await completeOnboarding({
      display_name: displayName.trim() || 'Rene',
      default_currency: currency,
      theme,
      openingBalances: balances,
      monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : undefined,
    });

    if (loadDemo) {
      await seedDemoData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E131F] text-[#F3F5F9] flex flex-col justify-between p-6 overflow-y-auto">
      {/* Step Indicators */}
      <div className="flex items-center justify-between pt-safe pb-4">
        <div className="flex items-center space-x-1.5">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-[#2457E6]' : step > s ? 'w-4 bg-[#16845B]' : 'w-4 bg-[#222C3E]'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => handleFinish(false)}
          className="text-[12px] text-[#8E98A8] hover:text-white px-2 py-1 rounded transition-colors"
        >
          Skip to app
        </button>
      </div>

      {/* Content for Steps */}
      <div className="my-auto py-6 max-w-sm mx-auto w-full">
        {step === 1 && (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden bg-white border border-[#222C3E] p-1.5 mb-5 shadow-xs">
              <img
                src="/assets/aistudio/rene_finance_38616079.jpg"
                alt="Rene Finance"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-white">Rene Finance</h1>
            <p className="text-[13px] font-normal text-[#16845B] mt-1">
              Understand your money. Control your future.
            </p>
            <p className="text-[12px] text-[#8E98A8] mt-3 leading-relaxed">
              A private, offline-first personal financial tool. No accounts, no subscriptions, and no cloud leaks. Your data stays 100% on this device.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 text-left">
              <div className="bg-[#161F30] border border-[#222C3E] rounded-xl p-3">
                <Shield className="w-4 h-4 text-[#2457E6] mb-1.5" />
                <h2 className="text-[13px] font-medium text-white">100% offline</h2>
                <p className="text-[11px] text-[#8E98A8] mt-0.5">Works in airplane mode with full local SQLite storage.</p>
              </div>
              <div className="bg-[#161F30] border border-[#222C3E] rounded-xl p-3">
                <Wallet className="w-4 h-4 text-[#16845B] mb-1.5" />
                <h2 className="text-[13px] font-medium text-white">Mobile money</h2>
                <p className="text-[11px] text-[#8E98A8] mt-0.5">Native tracking for MTN MoMo, Orange Money, Cash & Banks.</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in space-y-4">
            <div className="text-center mb-4">
              <h1 className="text-[18px] font-semibold text-white">Personalize your wallet</h1>
              <p className="text-[12px] text-[#8E98A8] mt-1">What should we call you and which currency do you prefer?</p>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] text-[#8E98A8]">Your name / nickname</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Rene"
                className="w-full px-3.5 py-2 rounded-lg bg-[#161F30] border border-[#222C3E] text-white focus:outline-none focus:border-[#2457E6] text-[13px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] text-[#8E98A8] flex items-center justify-between">
                <span>Default currency</span>
                <span className="text-[11px] text-[#16845B]">XAF selected by default</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {Object.values(SUPPORTED_CURRENCIES).map(curr => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrency(curr.code)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                      currency === curr.code
                        ? 'bg-[#2457E6]/10 border-[#2457E6] text-white'
                        : 'bg-[#161F30] border-[#222C3E] text-[#8E98A8] hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-[12px] text-white">{curr.code}</div>
                      <div className="text-[10px] text-[#8E98A8] truncate max-w-[90px]">{curr.name}</div>
                    </div>
                    <span className="text-[12px] tabular-nums text-[#8E98A8]">{curr.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in space-y-4">
            <div className="text-center mb-4">
              <h1 className="text-[18px] font-semibold text-white">Opening balances</h1>
              <p className="text-[12px] text-[#8E98A8] mt-1">Enter your initial balances (or leave at 0 to start fresh).</p>
            </div>

            <div className="space-y-2">
              <div className="bg-[#161F30] border border-[#222C3E] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-medium text-white">Cash in hand</div>
                  <div className="text-[10px] text-[#8E98A8]">Physical banknotes</div>
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    value={balances.cash || ''}
                    onChange={e => setBalances({ ...balances, cash: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full text-right px-2.5 py-1.5 rounded-md bg-[#0E131F] border border-[#222C3E] text-white tabular-nums text-[13px] focus:outline-none focus:border-[#2457E6]"
                  />
                </div>
              </div>

              <div className="bg-[#161F30] border border-[#222C3E] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-medium text-[#B7791F]">MTN Mobile Money</div>
                  <div className="text-[10px] text-[#8E98A8]">MTN MoMo wallet</div>
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    value={balances.mtn_momo || ''}
                    onChange={e => setBalances({ ...balances, mtn_momo: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full text-right px-2.5 py-1.5 rounded-md bg-[#0E131F] border border-[#222C3E] text-white tabular-nums text-[13px] focus:outline-none focus:border-[#2457E6]"
                  />
                </div>
              </div>

              <div className="bg-[#161F30] border border-[#222C3E] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-medium text-[#EA580C]">Orange Money</div>
                  <div className="text-[10px] text-[#8E98A8]">OM electronic wallet</div>
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    value={balances.orange_money || ''}
                    onChange={e => setBalances({ ...balances, orange_money: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full text-right px-2.5 py-1.5 rounded-md bg-[#0E131F] border border-[#222C3E] text-white tabular-nums text-[13px] focus:outline-none focus:border-[#2457E6]"
                  />
                </div>
              </div>

              <div className="bg-[#161F30] border border-[#222C3E] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-medium text-[#2457E6]">Bank account</div>
                  <div className="text-[10px] text-[#8E98A8]">Checking / Savings account</div>
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    value={balances.bank || ''}
                    onChange={e => setBalances({ ...balances, bank: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full text-right px-2.5 py-1.5 rounded-md bg-[#0E131F] border border-[#222C3E] text-white tabular-nums text-[13px] focus:outline-none focus:border-[#2457E6]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in space-y-4">
            <div className="text-center mb-4">
              <h1 className="text-[18px] font-semibold text-white">Finishing touches</h1>
              <p className="text-[12px] text-[#8E98A8] mt-1">Set an optional monthly budget limit and choose your theme.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] text-[#8E98A8]">Monthly spending budget (Optional)</label>
              <div className="relative">
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={e => setMonthlyBudget(e.target.value)}
                  placeholder={currency === 'XAF' ? '300000' : '2000'}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#161F30] border border-[#222C3E] text-white focus:outline-none focus:border-[#2457E6] text-[13px] tabular-nums"
                />
                <span className="absolute right-3.5 top-2 text-[12px] text-[#8E98A8]">{currency}</span>
              </div>
              <p className="text-[11px] text-[#8E98A8]">Deterministic alerts at threshold limits.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] text-[#8E98A8]">Theme preference</label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'system'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`p-2 rounded-lg border text-center capitalize text-[12px] font-medium transition-colors ${
                      theme === t
                        ? 'bg-[#2457E6] border-[#2457E6] text-white'
                        : 'bg-[#161F30] border-[#222C3E] text-[#8E98A8] hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#222C3E]">
              <div className="bg-[#161F30] border border-[#222C3E] rounded-lg p-3 flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-[#B7791F] flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#8E98A8]">
                  Want to explore features with sample records? You can load demo data below, and remove it anytime in Settings.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="space-y-2 pt-4 border-t border-[#222C3E] pb-safe">
        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="w-full py-3 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] font-medium text-white flex items-center justify-center space-x-2 text-[13px] transition-colors shadow-2xs"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => handleFinish(false)}
              className="w-full py-3 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] font-medium text-white flex items-center justify-center space-x-2 text-[13px] transition-colors shadow-2xs"
            >
              <Check className="w-4 h-4" />
              <span>Launch Rene Finance</span>
            </button>
            <button
              onClick={() => handleFinish(true)}
              className="w-full py-2.5 rounded-lg bg-[#161F30] hover:bg-[#1a253a] border border-[#222C3E] text-[#F3F5F9] text-[12px] font-medium transition-colors flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B7791F]" />
              <span>Launch with sample demo records</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
