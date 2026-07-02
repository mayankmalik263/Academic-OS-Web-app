import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import type { RoadmapItem } from '../../types/roadmap';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: RoadmapItem;
  phaseIndex: number;
  onFocusClick: (topicId: string) => void;
  onCompleteToast: (msg?: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  topic,
  onFocusClick,
  onCompleteToast
}) => {
  const { progress, toggleProgress, stats, updateStats, addActivityDate } = useAuth();
  const { playSound } = useAudio();

  if (!isOpen) return null;

  const checkId = `t_${topic.id}`;
  const isCompleted = !!progress[checkId];

  const handleToggleComplete = async () => {
    playSound('click');

    if (!isCompleted) {
      if (topic.keystone) {
        const confirmRecall = confirm(
          `M1 Recall Check: Can you explain "${topic.ttl}" from memory with no notes?\n\nClick OK if you can explain it. Click Cancel to restudy first.`
        );
        if (!confirmRecall) return;
      }
      
      // Update progress
      await toggleProgress(checkId, true);
      
      // Update stats: add 10 XP for topic
      if (stats) {
        await updateStats({ xp: stats.xp + 10 });
      }

      // Log today's study date
      const todayStr = new Date().toISOString().split('T')[0];
      await addActivityDate(todayStr);

      onCompleteToast();
    } else {
      await toggleProgress(checkId, false);
      if (stats) {
        await updateStats({ xp: Math.max(0, stats.xp - 10) });
      }
    }
    onClose();
  };

  const handleFocus = () => {
    onFocusClick(topic.id);
    onClose();
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div 
        className="modal-card text-left max-w-lg" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header border-b border-[var(--border-color)] pb-3">
          <div className="modal-header-left">
            <span className="modal-tag">TOPIC {topic.id}</span>
            <h2 className="modal-title">{topic.ttl}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-content-body flex flex-col gap-4 pt-4">
          <div className="focus-tip-box learn">
            <strong className="block text-xs uppercase tracking-wider mb-1 text-[var(--color-blue)]">
              Learn Instructions
            </strong>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] font-medium">
              {topic.learn}
            </p>
          </div>

          <div className="focus-tip-box skip">
            <strong className="block text-xs uppercase tracking-wider mb-1 text-[var(--color-red)]">
              Skipped / Out-of-Scope
            </strong>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] font-medium">
              {topic.skip}
            </p>
          </div>

          <div className="flex justify-between items-center bg-[var(--bg-page)] p-3 border-2 border-[var(--border-color)] rounded-xl text-xs">
            <span className="font-mono text-[var(--text-faint)] overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]" title={topic.search}>
              Search: "{topic.search}"
            </span>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.search)}`, '_blank')}
                className="btn-chunky btn-gray btn-sm font-extrabold"
              >
                YouTube
              </button>
              <button
                onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(topic.search)}`, '_blank')}
                className="btn-chunky btn-gray btn-sm font-extrabold"
              >
                Google
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={handleFocus}
              className="btn-chunky btn-blue text-white font-bold flex-1"
            >
              Isolate Focus
            </button>
            <button
              onClick={handleToggleComplete}
              className={`btn-chunky ${isCompleted ? 'btn-gray' : 'btn-green'} font-bold flex-1`}
            >
              {isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
