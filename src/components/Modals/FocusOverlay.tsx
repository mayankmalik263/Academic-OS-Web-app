import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import type { RoadmapItem } from '../../types/roadmap';

interface FocusOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  topic: RoadmapItem;
  onCompleteToast: (msg?: string) => void;
}

export const FocusOverlay: React.FC<FocusOverlayProps> = ({
  isOpen,
  onClose,
  topic,
  onCompleteToast
}) => {
  const { progress, toggleProgress, stats, updateStats, addActivityDate } = useAuth();
  const { playSound } = useAudio();

  if (!isOpen) return null;

  const checkId = `t_${topic.id}`;
  const isCompleted = !!progress[checkId];

  const handleComplete = async () => {
    if (isCompleted) {
      // Uncheck
      playSound('click');
      await toggleProgress(checkId, false);
      if (stats) {
        await updateStats({ xp: Math.max(0, stats.xp - 10) });
      }
      onClose();
    } else {
      // Check
      if (topic.keystone) {
        const confirmRecall = confirm(
          `M1 Recall Check: Can you explain "${topic.ttl}" from memory with no notes?\n\nClick OK if you can explain it. Click Cancel to restudy first.`
        );
        if (!confirmRecall) return;
      }
      
      playSound('click');
      await toggleProgress(checkId, true);
      
      // Update stats
      if (stats) {
        await updateStats({ xp: stats.xp + 10 });
      }

      // Log activity
      const todayStr = new Date().toISOString().split('T')[0];
      await addActivityDate(todayStr);

      onCompleteToast();
      onClose();
    }
  };

  return (
    <div className="focus-overlay open">
      <div className="focus-container text-left">
        <div className="focus-header-row flex justify-between items-center mb-2">
          <span className="modal-tag font-black">FOCUS MODE: TOPIC {topic.id}</span>
          <button 
            onClick={onClose}
            className="btn-chunky btn-gray btn-sm font-bold text-xs"
          >
            Quit Focus
          </button>
        </div>

        <h2 className="modal-title text-3xl font-black mb-4">{topic.ttl}</h2>

        <div className="focus-tip-box learn border-l-5 border-[var(--color-blue)]">
          <strong className="block text-xs uppercase tracking-wider mb-1 text-[var(--color-blue)]">
            Instructions (LEARN)
          </strong>
          <p className="text-sm font-medium leading-relaxed text-[var(--text-muted)]">
            {topic.learn}
          </p>
        </div>

        <div className="focus-tip-box skip border-l-5 border-[var(--color-red)] mt-4">
          <strong className="block text-xs uppercase tracking-wider mb-1 text-[var(--color-red)]">
            Skipped / Out-of-Scope (SKIP)
          </strong>
          <p className="text-sm font-medium leading-relaxed text-[var(--text-muted)]">
            {topic.skip}
          </p>
        </div>

        <div className="flex justify-between items-center bg-[var(--bg-main)] p-3 border-2 border-[var(--border-color)] rounded-xl text-xs mt-6">
          <span className="font-mono text-[var(--text-faint)] overflow-hidden text-ellipsis whitespace-nowrap max-w-[280px]">
            Search Query: "{topic.search}"
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

        <div className="flex gap-3 mt-8">
          <button
            onClick={handleComplete}
            className={`btn-chunky ${isCompleted ? 'btn-gray' : 'btn-green'} text-white font-bold flex-[2] py-4`}
          >
            {isCompleted ? 'Mark Incomplete' : "I've Learned This! 🔥"}
          </button>
          <button
            onClick={onClose}
            className="btn-chunky btn-gray font-bold flex-1"
          >
            Not Yet
          </button>
        </div>
      </div>
    </div>
  );
};
