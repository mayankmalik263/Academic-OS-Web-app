import React from 'react';
import { useAudio } from '../../hooks/useAudio';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'level' | 'achievement' | null;
  data: {
    level?: number;
    rank?: string;
    freezeRewarded?: boolean;
    title?: string;
    desc?: string;
    icon?: string;
  } | null;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
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

  return (
    <div className="celebrate-overlay open" onClick={handleClose}>
      <div 
        className="celebrate-card bg-[var(--bg-main)] border-3 border-[var(--border-color)] rounded-[28px] shadow-2xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mascot Celebrating */}
        <div className="mb-2">
          <img src="/logo.png" alt="Mascot Celebrating" className="w-[100px] h-[100px] object-contain mx-auto animate-bounce" />
        </div>

        {type === 'level' ? (
          <>
            <h2 className="celebrate-title text-3xl font-black text-[var(--color-gold)] mt-2">
              LEVEL UP!
            </h2>
            <p className="celebrate-subtitle text-white leading-relaxed text-sm">
              You've advanced to <strong className="text-[var(--color-gold)]">Level {data.level}</strong>!
              <br />
              <span className="text-xs opacity-80 mt-1 block">Rank: {data.rank}</span>
            </p>
            
            <div className="celebrate-rewards flex gap-3 mt-2">
              <div className="reward-badge">
                <span className="reward-val text-[var(--color-gold)]">Lvl {data.level}</span>
                <span className="reward-lbl">Current Level</span>
              </div>
              {data.freezeRewarded && (
                <div className="reward-badge">
                  <span className="reward-val text-[var(--color-blue)]">+1 🛡️</span>
                  <span className="reward-lbl">Streak Freeze</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="celebrate-title text-3xl font-black text-[var(--color-gold)] mt-2">
              ACHIEVEMENT!
            </h2>
            <p className="celebrate-subtitle text-white leading-relaxed text-sm">
              Unlocked: <strong className="text-[var(--color-gold)]">{data.title}</strong>
              <br />
              <span className="text-xs opacity-80 mt-1 block leading-relaxed">{data.desc}</span>
            </p>

            <div className="celebrate-rewards justify-center mt-2">
              <div className="reward-badge">
                <span className="reward-val text-[var(--color-gold)] text-3xl">{data.icon}</span>
                <span className="reward-lbl">Badge Earned</span>
              </div>
            </div>
          </>
        )}

        <button
          onClick={handleClose}
          className="btn-chunky btn-green text-white font-bold w-full max-w-[200px] mt-4"
        >
          Awesome! 🚀
        </button>
      </div>
    </div>
  );
};
