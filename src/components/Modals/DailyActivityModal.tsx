import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { roadmap } from '../../data/roadmapData';

interface DailyActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
}

const getChecklistTitle = (checkId: string): string => {
  if (checkId.startsWith('t_') || checkId.startsWith('pyslice_')) {
    const rawId = checkId.replace('t_', '');
    for (const phase of roadmap) {
      for (const group of phase.groups) {
        for (const item of group.items) {
          if (item.id === rawId) return item.ttl;
        }
      }
    }
  } else if (checkId.startsWith('pp_') || checkId.startsWith('pb_') || checkId.startsWith('pd_')) {
    const parts = checkId.split('_');
    if (parts.length >= 3) {
      const type = parts[0];
      const projectId = parts[1];
      const stepIndex = parseInt(parts[2], 10);
      for (const phase of roadmap) {
        for (const proj of phase.projects) {
          if (proj.id === projectId) {
            let prefix = '';
            if (type === 'pp') prefix = `[Paper] ${proj.ttl}`;
            if (type === 'pb') prefix = `[Build] ${proj.ttl}`;
            if (type === 'pd') prefix = `[Verify] ${proj.ttl}`;
            return `${prefix} - Step ${stepIndex + 1}`;
          }
        }
      }
    }
  } else if (checkId.startsWith('gate_')) {
    const rawId = checkId.replace('gate_', '');
    for (const phase of roadmap) {
      if (phase.gate) {
        for (const c of phase.gate.criteria) {
          if (c.id === rawId) return `[Gate] ${c.text}`;
        }
      }
    }
  }
  return checkId;
};

export const DailyActivityModal: React.FC<DailyActivityModalProps> = ({
  isOpen,
  onClose,
  dateStr
}) => {
  const { progressDates, activityNotes, updateDailyNote } = useAuth();
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes(activityNotes[dateStr] || '');
    }
  }, [isOpen, dateStr, activityNotes]);

  if (!isOpen) return null;

  // Find all items completed on this date
  const completedItems = Object.entries(progressDates)
    .filter(([_, dateCompleted]) => dateCompleted.startsWith(dateStr))
    .map(([checkId]) => getChecklistTitle(checkId));

  const handleSaveNotes = async () => {
    setIsSaving(true);
    await updateDailyNote(dateStr, notes);
    setIsSaving(false);
    onClose();
  };

  const formattedDate = new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div 
        className="modal-card text-left max-w-lg w-full flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header border-b border-[var(--border-color)] pb-3 flex-shrink-0">
          <div className="modal-header-left">
            <span className="modal-tag">DAILY LOG</span>
            <h2 className="modal-title">{formattedDate}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-content-body flex flex-col gap-6 pt-4 overflow-y-auto">
          
          <div className="completed-section">
            <h3 className="text-sm font-black text-[var(--color-blue)] uppercase tracking-wider mb-3 flex items-center gap-2">
              🏆 Completed Actions ({completedItems.length})
            </h3>
            {completedItems.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {completedItems.map((title, idx) => (
                  <li key={idx} className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg p-3 text-sm font-bold flex items-start gap-3">
                    <span className="text-[var(--color-green)]">✓</span>
                    <span className="flex-1">{title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm font-bold text-[var(--text-faint)] bg-[var(--bg-main)] p-4 rounded-xl text-center border border-[var(--border-color)] border-dashed">
                No roadmap items were marked complete on this day.
              </div>
            )}
          </div>

          <div className="notes-section flex-1 flex flex-col">
            <h3 className="text-sm font-black text-[var(--color-yellow)] uppercase tracking-wider mb-2 flex justify-between items-end">
              <span>📝 Daily Notes</span>
            </h3>
            <textarea
              className="w-full h-40 bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl p-4 font-mono text-sm leading-relaxed resize-none focus:border-[var(--color-yellow)] focus:outline-none transition-colors"
              placeholder="Jot down your thoughts, struggles, or breakthroughs for the day..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 mt-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="btn-chunky btn-gray font-bold flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="btn-chunky btn-yellow text-black font-extrabold flex-1 flex justify-center items-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};
