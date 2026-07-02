import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import type { RoadmapProject } from '../../types/roadmap';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: RoadmapProject;
  onProjectComplete: (msg: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onProjectComplete
}) => {
  const { progress, toggleProgress, stats, updateStats, addActivityDate } = useAuth();
  const { playSound } = useAudio();

  if (!isOpen) return null;

  const paperIDs = project.paper.map((_, i) => `pp_${project.id}_${i}`);
  const buildIDs = project.build.map((_, i) => `pb_${project.id}_${i}`);
  const doneIDs = project.done.map((_, i) => `pd_${project.id}_${i}`);

  const isPaperDone = paperIDs.every(id => progress[id]);

  const handleStepToggle = async (stepId: string, stepType: 'pp' | 'pb' | 'pd') => {
    const isCurrentlyChecked = !!progress[stepId];
    playSound('click');

    if (!isCurrentlyChecked) {
      if (stepType === 'pd') {
        const confirmRecall = confirm(
          `M1 Recall Check: Can you explain "${project.ttl}" from memory with no notes?\n\nClick OK if you can explain it. Click Cancel to restudy first.`
        );
        if (!confirmRecall) return;
      }

      // Check item
      await toggleProgress(stepId, true);

      // Add activity date
      const todayStr = new Date().toISOString().split('T')[0];
      await addActivityDate(todayStr);

      // Compute XP boost
      let xpBoost = 10; // default for 'pp'
      if (stepType === 'pb') xpBoost = 15;
      if (stepType === 'pd') xpBoost = 20;

      if (stats) {
        await updateStats({ xp: stats.xp + xpBoost });
      }

      // Check if project is completely finished
      const allIDs = [...paperIDs, ...buildIDs, ...doneIDs];
      const allCheckedExceptCurrent = allIDs.every(id => id === stepId || progress[id]);
      if (allCheckedExceptCurrent) {
        onProjectComplete(`Project "${project.ttl}" Completed! +50 XP 🏆`);
        // Award extra 50 XP for finishing project
        if (stats) {
          await updateStats({ xp: stats.xp + xpBoost + 50 });
        }
      }
    } else {
      // Uncheck item
      await toggleProgress(stepId, false);

      let xpReduction = 10;
      if (stepType === 'pb') xpReduction = 15;
      if (stepType === 'pd') xpReduction = 20;

      if (stats) {
        // If the project was fully complete before, reduce by another 50 XP
        const allIDs = [...paperIDs, ...buildIDs, ...doneIDs];
        const wasFullyComplete = allIDs.every(id => progress[id]);
        const penalty = wasFullyComplete ? (xpReduction + 50) : xpReduction;
        await updateStats({ xp: Math.max(0, stats.xp - penalty) });
      }
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div 
        className="modal-card text-left max-w-xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header border-b border-[var(--border-color)] pb-3">
          <div className="modal-header-left">
            <span className="modal-tag">PROJECT CHECKLIST</span>
            <h2 className="modal-title">{project.ttl}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-content-body flex flex-col gap-4 pt-4">
          <div className="text-sm font-semibold text-[var(--text-muted)] bg-[var(--bg-page)] border border-[var(--border-color)] p-4 rounded-2xl">
            <strong>Overview:</strong> {project.learn}
          </div>

          <div className="flex justify-between items-center bg-[var(--bg-page)] p-3 border border-[var(--border-color)] rounded-xl text-xs">
            <span className="font-mono text-[var(--text-faint)] overflow-hidden text-ellipsis whitespace-nowrap max-w-[250px]">
              Search: "{project.search}"
            </span>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(project.search)}`, '_blank')}
                className="btn-chunky btn-gray btn-sm font-extrabold"
              >
                YouTube
              </button>
              <button
                onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(project.search)}`, '_blank')}
                className="btn-chunky btn-gray btn-sm font-extrabold"
              >
                Google
              </button>
            </div>
          </div>

          {/* Project step sections */}
          <div className="project-steps mt-2 flex flex-col gap-4">
            
            {/* 1. Paper First */}
            <div className="project-step-section">
              <div className="project-step-section-title font-black text-sm text-[var(--text-main)] mb-2 flex justify-between">
                <span>1. Paper First (Derivations)</span>
              </div>
              <div className="project-step-list flex flex-col gap-2">
                {project.paper.map((step, i) => {
                  const id = `pp_${project.id}_${i}`;
                  const checked = !!progress[id];
                  return (
                    <label 
                      key={id} 
                      className={`project-step-item flex gap-3 p-2 bg-[var(--bg-main)] hover:bg-[var(--sidebar-hover-bg)] rounded-xl border border-[var(--border-color)] cursor-pointer select-none transition-all ${checked ? 'checked opacity-75' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleStepToggle(id, 'pp')}
                        className="mt-0.5"
                      />
                      <span className="text-xs font-bold leading-normal">{step}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. Build Code */}
            <div className="project-step-section">
              <div className="project-step-section-title font-black text-sm text-[var(--text-main)] mb-2 flex justify-between">
                <span>2. Build Code (Implementation)</span>
                {!isPaperDone && <span className="lock-note text-[10px] text-[var(--color-red)] font-black">🛡️ Complete paper steps first</span>}
              </div>
              <div className="project-step-list flex flex-col gap-2">
                {project.build.map((step, i) => {
                  const id = `pb_${project.id}_${i}`;
                  const checked = !!progress[id];
                  return (
                    <label 
                      key={id} 
                      className={`project-step-item flex gap-3 p-2 bg-[var(--bg-main)] hover:bg-[var(--sidebar-hover-bg)] rounded-xl border border-[var(--border-color)] cursor-pointer select-none transition-all ${checked ? 'checked opacity-75' : ''}`}
                      style={{ opacity: isPaperDone ? 1 : 0.5 }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!isPaperDone}
                        onChange={() => handleStepToggle(id, 'pb')}
                        className="mt-0.5"
                      />
                      <span className="text-xs font-bold leading-normal">
                        {!isPaperDone ? '🔒 ' : ''}{step}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Verification */}
            <div className="project-step-section">
              <div className="project-step-section-title font-black text-sm text-[var(--text-main)] mb-2 flex justify-between">
                <span>3. Verification (Done Check)</span>
                {!isPaperDone && <span className="lock-note text-[10px] text-[var(--color-red)] font-black">🛡️ Complete paper steps first</span>}
              </div>
              <div className="project-step-list flex flex-col gap-2">
                {project.done.map((step, i) => {
                  const id = `pd_${project.id}_${i}`;
                  const checked = !!progress[id];
                  return (
                    <label 
                      key={id} 
                      className={`project-step-item flex gap-3 p-2 bg-[var(--bg-main)] hover:bg-[var(--sidebar-hover-bg)] rounded-xl border border-[var(--border-color)] cursor-pointer select-none transition-all ${checked ? 'checked opacity-75' : ''}`}
                      style={{ opacity: isPaperDone ? 1 : 0.5 }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!isPaperDone}
                        onChange={() => handleStepToggle(id, 'pd')}
                        className="mt-0.5"
                      />
                      <span className="text-xs font-bold leading-normal">
                        {!isPaperDone ? '🔒 ' : ''}{step}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
