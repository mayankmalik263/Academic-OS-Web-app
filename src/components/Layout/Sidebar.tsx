import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import { roadmap } from '../../data/roadmapData';
import { SVG_MASCOT } from '../Common/Assets';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pomoRunning: boolean;
  pomoMode: 'focus' | 'break';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pomoRunning,
  pomoMode
}) => {
  const { progress } = useAuth();
  const { playSound, muted: audioMuted, toggleMute } = useAudio();

  const isDarkTheme = () => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  };

  const toggleTheme = () => {
    playSound('click');
    const isDark = isDarkTheme();
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('zeroToModernAI_theme', nextTheme);
    // Force rerender or state update if necessary (standard HTML attribute update takes care of base CSS rules)
  };

  // Helper to calculate progress percentage for a phase
  const calculatePhaseProgress = (phaseIndex: number) => {
    const p = roadmap[phaseIndex];
    let totalItems = 0;
    let completedItems = 0;

    // Topics
    p.groups.forEach(g => {
      g.items.forEach(t => {
        totalItems++;
        if (progress[`t_${t.id}`]) completedItems++;
      });
    });

    // Projects
    p.projects.forEach(pr => {
      pr.paper.forEach((_, i) => {
        totalItems++;
        if (progress[`pp_${pr.id}_${i}`]) completedItems++;
      });
      pr.build.forEach((_, i) => {
        totalItems++;
        if (progress[`pb_${pr.id}_${i}`]) completedItems++;
      });
      pr.done.forEach((_, i) => {
        totalItems++;
        if (progress[`pd_${pr.id}_${i}`]) completedItems++;
      });
    });

    // Gates
    p.gate.criteria.forEach(c => {
      totalItems++;
      if (progress[`gate_${c.id}`]) completedItems++;
    });

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  // Helper to determine if a phase is unlocked
  const isPhaseUnlocked = (phaseIndex: number) => {
    if (phaseIndex === 0) return true;
    const prevPhase = roadmap[phaseIndex - 1];
    return prevPhase.gate.criteria.every(c => progress[`gate_${c.id}`]);
  };

  const handleTabChange = (tabId: string) => {
    playSound('click');
    setActiveTab(tabId);
  };

  const scrollToPhase = (phaseIndex: number) => {
    playSound('click');
    setActiveTab('roadmap');
    setTimeout(() => {
      const el = document.getElementById(`phase-banner-${phaseIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Mascot mood based on Pomodoro state
  const getMascotMood = () => {
    if (pomoRunning) {
      return pomoMode === 'focus' ? 'studying' : 'sleeping';
    }
    const allDone = roadmap.every((_, idx) => calculatePhaseProgress(idx) === 100);
    return allDone ? 'celebrating' : 'happy';
  };

  return (
    <aside className="left-sidebar">
      {/* Brand logo & Mascot */}
      <div className="brand-container">
        <div className="brand-logo">
          {SVG_MASCOT[getMascotMood()](44, 44)}
        </div>
        <div>
          <h1 className="brand-title">ZERO TO AI</h1>
          <div className="brand-subtitle">COMMAND DECK</div>
        </div>
      </div>

      <div className="left-sidebar-scroll">
        {/* Chapters list (DataCamp style) */}
        <div className="section-title">Track Courses</div>
        <div className="course-chapters-list">
          {roadmap.map((phase, idx) => {
            const unlocked = isPhaseUnlocked(idx);
            const pct = calculatePhaseProgress(idx);
            const isParked = idx >= 2;
            const radius = 12;
            const circ = 2 * Math.PI * radius;
            const strokeDash = circ - (pct / 100) * circ;

            return (
              <button
                key={phase.id}
                onClick={() => scrollToPhase(idx)}
                className={`chapter-item ${isParked ? 'parked' : ''}`}
                style={{ opacity: unlocked ? 1 : 0.5 }}
                disabled={!unlocked}
              >
                <div className="chapter-title-box">
                  <div className="chapter-title-num">Course {idx}</div>
                  <div className="chapter-title-name">
                    {phase.name.replace(/^Phase \d+ - /, '')}
                    {isParked && ' (Parked)'}
                  </div>
                </div>
                <div className="chapter-progress">
                  <svg className="circular-chart" viewBox="0 0 32 32">
                    <circle className="circle-bg" cx="16" cy="16" r={radius} />
                    <circle
                      className="circle"
                      cx="16"
                      cy="16"
                      r={radius}
                      strokeDasharray={circ}
                      strokeDashoffset={strokeDash}
                    />
                  </svg>
                  <span className="chapter-pct">{pct}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="section-title">Navigation</div>
        <nav className="nav-menu">
          <button
            onClick={() => handleTabChange('roadmap')}
            className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            Map Path
          </button>
          <button
            onClick={() => handleTabChange('meta')}
            className={`nav-item ${activeTab === 'meta' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5.47 18.6L12 22l6.53-3.4L12 15.2L5.47 18.6z" />
            </svg>
            Meta-Learning
          </button>
          <button
            onClick={() => handleTabChange('stats')}
            className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            Stats & Trophies
          </button>
          <button
            onClick={() => handleTabChange('tools')}
            className={`nav-item ${activeTab === 'tools' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
            Workspace Tools
          </button>
          <button
            onClick={() => handleTabChange('settings')}
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            Backup Settings
          </button>
        </nav>
      </div>

      {/* Audio and Theme Controls */}
      <div className="left-sidebar-footer">
        <div className="utility-row">
          <span>Sound SFX</span>
          <button
            onClick={toggleMute}
            className="btn-chunky btn-gray btn-sm"
          >
            {audioMuted ? 'Off 🔇' : 'On 🔊'}
          </button>
        </div>
        <div className="utility-row">
          <span>Dark Theme</span>
          <button
            onClick={toggleTheme}
            className="btn-chunky btn-gray btn-sm"
          >
            {isDarkTheme() ? 'On ☽' : 'Off ☼'}
          </button>
        </div>
      </div>
    </aside>
  );
};
