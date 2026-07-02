import React from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, visible }) => {
  return (
    <div
      className={`fixed bottom-[90px] md:bottom-[40px] left-1/2 -translate-x-1/2 z-[300] bg-[var(--bg-main)] border-2 border-[var(--border-color)] text-[var(--text-main)] font-black text-sm px-6 py-3 rounded-full shadow-lg transition-all duration-300 pointer-events-none ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-[100px] opacity-0'
      }`}
    >
      {message}
    </div>
  );
};
export default Toast;
