import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import type { RoadmapPhase } from '../../types/roadmap';

interface GateModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: RoadmapPhase;
  phaseIdx: number;
  onGateUnlocked: (msg: string) => void;
}

export const GateModal: React.FC<GateModalProps> = ({
  isOpen,
  onClose,
  phase,
  phaseIdx,
  onGateUnlocked
}) => {
  const { progress, toggleProgress, stats, updateStats, addActivityDate } = useAuth();
  const { playSound } = useAudio();

  if (!isOpen) return null;

  const criteria = phase.gate.criteria;
  const gatePassedBefore = criteria.every(c => progress[`gate_${c.id}`]);

  const handleCriteriaToggle = async (critId: string) => {
    const isCurrentlyChecked = !!progress[critId];
    playSound('click');

    if (!isCurrentlyChecked) {
      await toggleProgress(critId, true);
      
      // Update activity date
      const todayStr = new Date().toISOString().split('T')[0];
      await addActivityDate(todayStr);

      // +30 XP for gate criteria
      if (stats) {
        await updateStats({ xp: stats.xp + 30 });
      }

      // Check if gate is now fully passed
      const nowPassed = criteria.every(c => `gate_${c.id}` === critId || progress[`gate_${c.id}`]);
      if (!gatePassedBefore && nowPassed) {
        onGateUnlocked(`Zone Unlocked! Phase ${phaseIdx + 1} is now accessible! 🗝️`);
      }
    } else {
      await toggleProgress(critId, false);
      if (stats) {
        await updateStats({ xp: Math.max(0, stats.xp - 30) });
      }
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div 
        className="modal-card text-left max-w-md" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header border-b border-[var(--border-color)] pb-3">
          <div className="modal-header-left">
            <span className="modal-tag">ZONE GATE</span>
            <h2 className="modal-title">{phase.gate.title}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-content-body flex flex-col gap-4 pt-4">
          <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed">
            Complete all capability criteria below to unlock the next Phase zone.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            {criteria.map(crit => {
              const critId = `gate_${crit.id}`;
              const checked = !!progress[critId];

              return (
                <label
                  key={critId}
                  className={`flex gap-3 p-3 bg-[var(--bg-main)] hover:bg-[var(--sidebar-hover-bg)] rounded-2xl border-2 border-[var(--border-color)] cursor-pointer select-none transition-all ${checked ? 'border-[var(--color-green)] text-[var(--text-faint)]' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCriteriaToggle(critId)}
                    className="mt-0.5"
                  />
                  <span className="text-xs font-black leading-relaxed">{crit.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
