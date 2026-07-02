import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';

interface WorkspaceToolsProps {
  pomoRunning: boolean;
  setPomoRunning: (running: boolean) => void;
  pomoMode: 'focus' | 'break';
  setPomoMode: (mode: 'focus' | 'break') => void;
  onCelebrationTrigger: (msg: string) => void;
}

export const WorkspaceTools: React.FC<WorkspaceToolsProps> = ({
  pomoRunning,
  setPomoRunning,
  pomoMode,
  setPomoMode,
  onCelebrationTrigger
}) => {
  const { brainDump, updateBrainDump } = useAuth();
  const { playSound } = useAudio();

  // Pomodoro local state
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const intervalRef = useRef<any>(null);

  // Brain Dump local state for debouncing
  const [localDump, setLocalDump] = useState(brainDump);
  const [saveStatus, setSaveStatus] = useState(false);

  // Sync initial brain dump from database
  useEffect(() => {
    setLocalDump(brainDump);
  }, [brainDump]);

  // Debounced auto-save for Brain Dump
  useEffect(() => {
    if (localDump === brainDump) return;

    const timer = setTimeout(async () => {
      await updateBrainDump(localDump);
      setSaveStatus(true);
      const resetStatus = setTimeout(() => setSaveStatus(false), 1500);
      return () => clearTimeout(resetStatus);
    }, 1000);

    return () => clearTimeout(timer);
  }, [localDump, brainDump]);

  // Pomodoro logic
  useEffect(() => {
    if (pomoRunning) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setPomoRunning(false);
            
            if (pomoMode === 'focus') {
              setPomoMode('break');
              setTimeRemaining(5 * 60);
              onCelebrationTrigger("Focus block completed! Take a 5-minute break. ☕");
              playSound('fanfare');
            } else {
              setPomoMode('focus');
              setTimeRemaining(25 * 60);
              onCelebrationTrigger("Break is over! Time to focus again. 🧠");
              playSound('fanfare');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pomoRunning, pomoMode]);

  const togglePomo = () => {
    playSound('click');
    setPomoRunning(!pomoRunning);
  };

  const resetPomo = () => {
    playSound('click');
    clearInterval(intervalRef.current!);
    setPomoRunning(false);
    setPomoMode('focus');
    setTimeRemaining(25 * 60);
  };

  const handleClearDump = () => {
    if (confirm("Clear all text from your Brain Dump notepad?")) {
      playSound('click');
      setLocalDump('');
      updateBrainDump('');
    }
  };

  // Format MM:SS
  const formatTime = () => {
    const m = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
    const s = String(timeRemaining % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const maxTime = (pomoMode === 'focus' ? 25 : 5) * 60;
  const progressOffset = 283 - (timeRemaining / maxTime) * 283;

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Pomodoro Clock Widget */}
      <div className="pomo-widget">
        <div className="pomo-timer-circle">
          <svg className="pomo-svg" viewBox="0 0 100 100">
            <circle className="pomo-bg-ring" cx="50" cy="50" r="45"></circle>
            <circle
              className="pomo-progress-ring"
              id="pomoProgressCircle"
              cx="50"
              cy="50"
              r="45"
              strokeDasharray="283"
              strokeDashoffset={progressOffset}
              style={{
                stroke: pomoMode === 'focus' ? 'var(--color-orange)' : 'var(--color-green)'
              }}
            ></circle>
          </svg>
          <div className="pomo-timer-text">
            <span className="pomo-timer-time" id="pomoTimerText">
              {formatTime()}
            </span>
            <span className="pomo-timer-label" id="pomoTimerLabel">
              {pomoMode === 'focus' ? 'FOCUS BLOCK' : 'REST BREAK'}
            </span>
          </div>
        </div>
        <div className="pomo-widget-controls">
          <button
            onClick={togglePomo}
            className={`btn-chunky ${pomoRunning ? 'btn-gray' : 'btn-green'} font-bold`}
          >
            {pomoRunning ? 'Pause Timer' : 'Start Focus'}
          </button>
          <button
            onClick={resetPomo}
            className="btn-chunky btn-gray font-bold"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Brain Dump Notepad Widget */}
      <div className="dump-widget">
        <h2 className="card-title text-xl font-black">Brain Dump Notepad</h2>
        <p className="text-xs text-[var(--text-muted)] -mt-1 leading-normal">
          Type random thoughts, tasks, or distractions here to park them during focus blocks.
        </p>
        <textarea
          value={localDump}
          onChange={(e) => setLocalDump(e.target.value)}
          className="dump-textarea focus:border-[var(--color-blue)]"
          placeholder="Write anything... saved automatically."
        ></textarea>
        <div className="dump-footer">
          <span
            className={`dump-status ${saveStatus ? 'visible opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            id="dumpSaveStatus"
          >
            Saved ✓
          </span>
          <button
            onClick={handleClearDump}
            className="btn-chunky btn-gray btn-sm font-bold text-xs"
          >
            Clear Notepad
          </button>
        </div>
      </div>
    </div>
  );
};
