import React from 'react';
import type { RoadmapPhase, RoadmapItem } from '../../types/roadmap';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';

interface TheoryListModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: RoadmapPhase;
  phaseIdx: number;
  onTopicClick: (topic: RoadmapItem) => void;
}

export const TheoryListModal: React.FC<TheoryListModalProps> = ({
  isOpen,
  onClose,
  phase,
  phaseIdx,
  onTopicClick
}) => {
  const { progress } = useAuth();
  const { playSound } = useAudio();

  if (!isOpen) return null;

  const handleClose = () => {
    playSound('click');
    onClose();
  };

  return (
    <div className="modal-overlay open animate-fade-in" onClick={handleClose}>
      <div 
        className="modal-card max-w-md bg-[var(--bg-main)] border-3 border-[var(--border-color)] rounded-[28px] p-6 flex flex-col gap-4 shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-blue)]">
              Phase {phaseIdx} Theory Core
            </span>
            <h2 className="modal-title text-lg font-black text-[var(--text-main)]">
              {phase.name.replace(/^Phase \d+ - /, "")}
            </h2>
          </div>
          <button className="modal-close-btn text-xl text-[var(--text-faint)] hover:text-[var(--text-main)]" onClick={handleClose}>
            &times;
          </button>
        </div>

        <div className="modal-content-body flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
          {phase.groups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-color)] pb-1">
                {group.title}
              </h3>
              <div className="flex flex-col gap-1.5">
                {group.items.map((item) => {
                  const isCompleted = !!progress[`t_${item.id}`];
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        playSound('click');
                        onTopicClick(item);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[var(--color-blue)] cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-[var(--text-main)]">
                          {item.ttl}
                        </span>
                        <span className="text-[10px] text-[var(--text-faint)] font-mono">
                          Topic {item.id}
                        </span>
                      </div>
                      <div 
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 border-[var(--border-color)] ${
                          isCompleted ? 'bg-[var(--color-green)] border-[var(--color-green)] text-white' : 'bg-[var(--bg-main)]'
                        }`}
                      >
                        {isCompleted && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer pt-2">
          <button onClick={handleClose} className="w-full btn-chunky btn-gray font-black text-xs py-3.5">
            Back to Command Deck
          </button>
        </div>
      </div>
    </div>
  );
};
