import React, { useState } from 'react';
import { X, Smartphone, Copy, Check, Terminal, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidPackagingGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const commands = [
    { title: '1. Build static assets', cmd: 'npm run build' },
    { title: '2. Add Android platform', cmd: 'npx cap add android' },
    { title: '3. Sync web assets & SQLite', cmd: 'npx cap sync android' },
    { title: '4. Open in Android Studio', cmd: 'npx cap open android' },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#161F30] rounded-xl shadow-lg border border-[#E6E9EF] dark:border-[#222C3E] p-5 space-y-4 max-h-[88vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E6E9EF] dark:border-[#222C3E] pb-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-[#2457E6]" />
            <div>
              <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">Android APK packaging</h2>
              <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8] font-mono">com.rene.finance</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[#737B89] hover:text-[#202633] dark:hover:text-[#F3F5F9]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-[12px] text-[#737B89] dark:text-[#8E98A8]">
          <p className="leading-relaxed">
            Rene Finance is packaged as an offline Android APK via Capacitor. Output bundles build into <code className="bg-[#F7F8FA] dark:bg-[#0E131F] px-1 py-0.5 rounded text-[#2457E6] font-mono">dist/</code>.
          </p>

          <div className="bg-[#F7F8FA] dark:bg-[#0E131F] p-3 rounded-lg border border-[#E6E9EF] dark:border-[#222C3E] space-y-2">
            <div className="font-medium text-[#202633] dark:text-[#F3F5F9] flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#2457E6]" />
              <span>Packaging commands</span>
            </div>

            {commands.map((c, i) => (
              <div key={i} className="space-y-1">
                <span className="text-[10px] text-[#737B89] dark:text-[#8E98A8]">{c.title}</span>
                <div className="flex items-center justify-between bg-[#17233B] text-white px-2.5 py-1.5 rounded-md font-mono text-[11px] border border-[#222C3E]">
                  <span>{c.cmd}</span>
                  <button
                    onClick={() => handleCopy(c.cmd, i)}
                    className="p-1 text-[#8E98A8] hover:text-white"
                  >
                    {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-[#16845B]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] p-3 rounded-lg">
            <div className="font-medium text-[#202633] dark:text-[#F3F5F9] flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
              <span>Offline verification steps</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-tight">
              <li>In Android Studio, click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</li>
              <li>Transfer <code>app-debug.apk</code> to your Android device.</li>
              <li>Enable <strong>Airplane Mode</strong> (turn off Wi-Fi and Cellular).</li>
              <li>Launch Rene Finance and verify offline persistence.</li>
            </ol>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-[#2457E6] text-white font-medium text-[12px] hover:bg-[#1d46b8] transition-colors shadow-2xs"
        >
          Close guide
        </button>
      </div>
    </div>
  );
};
