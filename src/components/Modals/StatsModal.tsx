import React from 'react';
import { useAudio } from '../../hooks/useAudio';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'level' | 'freeze_confirm' | 'freeze_error' | 'freeze_success' | null;
  data: {
    level?: number;
    rank?: string;
    xp?: number;
    freezes?: number;
    errorMessage?: string;
    onConfirm?: () => void;
  } | null;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  type,
  data
}) => {
  const { playSound } = useAudio();

  if (!isOpen || !type || !data) return null;

  const handleClose = () => {
    playSound('click');
    onClose();
  };

  const handleConfirm = () => {
    playSound('click');
    if (data.onConfirm) data.onConfirm();
    onClose();
  };

  let title = '';
  let content: React.ReactNode = null;
  let buttons: React.ReactNode = null;

  if (type === 'level') {
    title = 'Level Status';
    content = (
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl my-2">⭐</div>
        <div className="text-left w-full flex flex-col gap-2 bg-[var(--bg-page)] border-2 border-[var(--border-color)] p-4 rounded-2xl text-xs font-bold text-[var(--text-muted)]">
          <div className="flex justify-between border-b border-[var(--border-color)] pb-1.5">
            <span>Current Level:</span>
            <span className="text-[var(--color-gold)] font-black text-sm">Lvl {data.level}</span>
          </div>
          <div className="flex justify-between border-b border-[var(--border-color)] pb-1.5">
            <span>Rank Name:</span>
            <span className="text-[var(--color-blue)] font-black text-sm">{data.rank}</span>
          </div>
          <div className="flex justify-between">
            <span>Total XP:</span>
            <span className="text-[var(--color-green)] font-black text-sm">{data.xp} XP</span>
          </div>
        </div>
        <p className="text-xs text-[var(--text-faint)] leading-normal mt-2">
          Gain XP by completing roadmap topics (+10 XP) and project checklist steps (+10 to +20 XP) to rank up and unlock new freeze purchase abilities.
        </p>
      </div>
    );
    buttons = (
      <button onClick={handleClose} className="w-full btn-chunky btn-green text-white font-black">
        Got it! 🚀
      </button>
    );
  } else if (type === 'freeze_confirm') {
    title = 'Buy Streak Freeze';
    content = (
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl my-2">🛡️</div>
        <p className="text-sm font-bold text-[var(--text-main)] leading-relaxed">
          Would you like to buy a **Streak Freeze** for <strong className="text-[var(--color-gold)]">50 XP</strong>?
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg-page)] border border-[var(--border-color)] p-3 rounded-xl w-full">
          Streak Freezes protect your study streak if you miss a day.
          <br />
          <span className="mt-1 block text-[10px] font-mono text-[var(--text-faint)]">
            Owned: {data.freezes}/2 | Current XP: {data.xp} XP
          </span>
        </p>
      </div>
    );
    buttons = (
      <div className="flex gap-3 w-full">
        <button onClick={handleConfirm} className="flex-1 btn-chunky btn-blue text-white font-black">
          Buy (50 XP) 🛒
        </button>
        <button onClick={handleClose} className="flex-1 btn-chunky btn-gray font-black">
          Cancel
        </button>
      </div>
    );
  } else if (type === 'freeze_error') {
    title = 'Purchase Locked';
    content = (
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl my-2">🔒</div>
        <p className="text-sm font-bold text-[var(--color-red)] leading-relaxed">
          {data.errorMessage}
        </p>
      </div>
    );
    buttons = (
      <button onClick={handleClose} className="w-full btn-chunky btn-gray font-black">
        Close
      </button>
    );
  } else if (type === 'freeze_success') {
    title = 'Purchase Success!';
    content = (
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl my-2">🎉</div>
        <p className="text-sm font-bold text-[var(--color-green)] leading-relaxed">
          Streak Freeze successfully purchased!
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-normal bg-[var(--bg-page)] border border-[var(--border-color)] p-3 rounded-xl w-full">
          Your learning streak is now protected. Available freezes: <strong className="text-[var(--color-blue)]">{data.freezes}/2</strong>.
        </p>
      </div>
    );
    buttons = (
      <button onClick={handleClose} className="w-full btn-chunky btn-green text-white font-black">
        Awesome! 🚀
      </button>
    );
  }

  return (
    <div className="modal-overlay open animate-fade-in" onClick={handleClose}>
      <div 
        className="modal-card max-w-sm text-center bg-[var(--bg-main)] border-3 border-[var(--border-color)] rounded-[28px] p-6 flex flex-col gap-5 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <h2 className="modal-title text-xl font-black text-[var(--text-main)]">{title}</h2>
          <button className="modal-close-btn text-xl text-[var(--text-faint)] hover:text-[var(--text-main)]" onClick={handleClose}>
            &times;
          </button>
        </div>
        
        <div className="modal-content-body py-1 text-sm text-[var(--text-main)]">
          {content}
        </div>

        <div className="modal-footer flex gap-2 pt-2">
          {buttons}
        </div>
      </div>
    </div>
  );
};
