import React from 'react';

export const MobileContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#EEF0F4] dark:bg-[#080B12] flex justify-center transition-colors duration-150">
      <div className="w-full max-w-[440px] min-h-screen bg-[#F7F8FA] dark:bg-[#0E131F] shadow-[0_0_40px_rgba(0,0,0,0.06)] dark:shadow-[0_0_40px_rgba(0,0,0,0.3)] relative flex flex-col overflow-x-hidden border-x border-[#E6E9EF] dark:border-[#1E2738]">
        {children}
      </div>
    </div>
  );
};
