import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import { roadmap } from '../../data/roadmapData';
import { pythonSubsteps } from '../../data/pythonSliceData';
import type { RoadmapPhase, RoadmapItem, RoadmapProject } from '../../types/roadmap';
import { SVG_ICONS } from '../Common/Assets';

interface LearningPathProps {
  onNodeClick: (type: 'topic' | 'project' | 'gate', id: string, phaseIndex: number) => void;
}

// Subtle alternating offsets for Duolingo-style winding column
const columnOffsets = [
  "translate-x-0",
  "translate-x-3",
  "translate-x-6",
  "translate-x-3",
  "translate-x-0",
  "-translate-x-3",
  "-translate-x-6",
  "-translate-x-3"
];

export const LearningPath: React.FC<LearningPathProps> = ({ onNodeClick }) => {
  const { progress } = useAuth();
  const { playSound } = useAudio();

  // Expanded resources panel accordion
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const toggleDetails = (phaseId: string) => {
    playSound('click');
    setExpandedDetails(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  // Helper to determine if a phase is unlocked
  const isPhaseUnlocked = (phaseIndex: number) => {
    if (phaseIndex === 0) return true;
    const prevPhase = roadmap[phaseIndex - 1];
    return prevPhase.gate.criteria.every(c => progress[`gate_${c.id}`]);
  };

  // Helper to check if a project is completed
  const isProjectCompleted = (pr: RoadmapProject) => {
    const paperIDs = pr.paper.map((_, idx) => `pp_${pr.id}_${idx}`);
    const buildIDs = pr.build.map((_, idx) => `pb_${pr.id}_${idx}`);
    const doneIDs = pr.done.map((_, idx) => `pd_${pr.id}_${idx}`);
    return [...paperIDs, ...buildIDs, ...doneIDs].every(id => progress[id]);
  };

  // Helper to calculate progress percentage for a phase
  const calculatePhaseProgress = (phase: RoadmapPhase) => {
    let totalItems = 0;
    let completedItems = 0;

    // 1. Math/Theory items
    phase.groups.forEach(g => {
      g.items.forEach(t => {
        totalItems++;
        if (progress[`t_${t.id}`]) completedItems++;
      });
    });

    // 2. Python items
    const pyList = pythonSubsteps[phase.id] || [];
    pyList.forEach(t => {
      totalItems++;
      if (progress[t.id]) completedItems++;
    });

    // 3. Projects
    phase.projects.forEach(pr => {
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

    // 4. Gates
    phase.gate.criteria.forEach(c => {
      totalItems++;
      if (progress[`gate_${c.id}`]) completedItems++;
    });

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const renderInsideIcon = (status: string, type: string) => {
    if (status === "completed") return SVG_ICONS.check;
    if (status === "locked") return SVG_ICONS.lock;
    
    if (type === "project") return SVG_ICONS.sword;
    if (type === "gate") return SVG_ICONS.key;
    return SVG_ICONS.star;
  };

  const renderResourceLink = (r: any) => {
    if (r.url) {
      return (
        <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-extrabold text-[var(--color-blue)] hover:underline">
          {r.name}
        </a>
      );
    }
    return (
      <span className="text-[var(--text-muted)] font-bold italic flex items-center gap-2">
        {r.name}
        <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-900/60 leading-none">
          Link Pending
        </span>
      </span>
    );
  };

  // Helper to render connection lines between circles inside a column
  const renderColumnLines = (items: any[], isCompletedCheck: (id: string) => boolean) => {
    if (items.length <= 1) return null;
    const centerX = 80;
    const startY = 36;
    const spacingY = 130;

    const getCoords = (i: number) => {
      const idx = i % 8;
      let offsetX = 0;
      if (idx === 0) offsetX = 0;
      else if (idx === 1) offsetX = 12;
      else if (idx === 2) offsetX = 24;
      else if (idx === 3) offsetX = 12;
      else if (idx === 4) offsetX = 0;
      else if (idx === 5) offsetX = -12;
      else if (idx === 6) offsetX = -24;
      else if (idx === 7) offsetX = -12;
      return {
        x: centerX + offsetX,
        y: startY + (i * spacingY)
      };
    };

    const segments: React.ReactNode[] = [];
    for (let i = 0; i < items.length - 1; i++) {
      const p1 = getCoords(i);
      const p2 = getCoords(i + 1);
      
      const segmentDone = isCompletedCheck(items[i].id) && isCompletedCheck(items[i + 1].id);
      const strokeColor = segmentDone 
        ? "var(--color-green)" 
        : "var(--border-color)";

      segments.push(
        <line
          key={i}
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
      );
    }

    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
        {segments}
      </svg>
    );
  };

  return (
    <div className="w-full">
      {roadmap.map((phase, phaseIdx) => {
        const unlocked = isPhaseUnlocked(phaseIdx);
        const pct = calculatePhaseProgress(phase);
        const bannerColor = phaseIdx === 0 ? "var(--color-blue)" : phaseIdx === 1 ? "var(--color-green)" : phaseIdx === 2 ? "var(--color-purple)" : "var(--color-orange)";

        // Flatten all theory items inside the phase
        const theoryItems: RoadmapItem[] = [];
        phase.groups.forEach(g => {
          g.items.forEach(t => {
            theoryItems.push(t);
          });
        });

        // Get Python items for this phase
        const pythonItems = pythonSubsteps[phase.id] || [];

        return (
          <div key={phase.id} className="unit-container" id={`phase-banner-${phaseIdx}`}>
            {/* Phase Banner */}
            <div className="unit-banner" style={{ backgroundColor: bannerColor }}>
              <div className="unit-banner-left">
                <h2>Phase {phaseIdx}: {phase.name.replace(/^Phase \d+ - /, "")}</h2>
                <p>{phase.theory}</p>
              </div>
              <div className="unit-banner-right">
                <div className="unit-progress-circle">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle" strokeDasharray={`${pct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="unit-pct text-white">{pct}%</span>
                </div>
              </div>
            </div>

            {/* Parallel Fully Expanded Tracks */}
            <div 
              className="flex gap-8 md:gap-16 justify-center items-start my-8 px-2 max-w-xl mx-auto relative"
              style={{ opacity: unlocked ? 1 : 0.5, filter: unlocked ? 'none' : 'grayscale(1)' }}
            >
              {/* Left Column: Math & Theory */}
              <div className="flex-1 flex flex-col items-center">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-faint)] mb-4 border-b border-[var(--border-color)] pb-1.5 w-full text-center">
                  Theory Core
                </h3>
                
                {/* Winding list of nodes with SVG background lines */}
                <div className="relative w-[160px] flex flex-col items-center gap-7">
                  {renderColumnLines(
                    theoryItems.map(item => ({ id: `t_${item.id}` })), 
                    (id) => !!progress[id]
                  )}
                  
                  {theoryItems.map((item, idx) => {
                    const checkId = `t_${item.id}`;
                    const isCompleted = !!progress[checkId];
                    const isCurrent = unlocked && !isCompleted && theoryItems.slice(0, idx).every(prev => progress[`t_${prev.id}`]);
                    const status = isCompleted ? 'completed' : (isCurrent ? 'current' : 'locked');
                    const offsetClass = columnOffsets[idx % columnOffsets.length];

                    return (
                      <div key={item.id} className={`node-wrapper ${offsetClass} transition-all duration-200 z-10`}>
                        <button
                          onClick={() => unlocked && onNodeClick('topic', checkId, phaseIdx)}
                          className={`node-btn ${status}`}
                          disabled={!unlocked || status === 'locked'}
                          aria-label={item.ttl}
                        >
                          {renderInsideIcon(status, 'topic')}
                        </button>
                        <span className="node-label">
                          {item.ttl}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Python Coding */}
              <div className="flex-1 flex flex-col items-center">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-gold)] mb-4 border-b border-[var(--border-color)] pb-1.5 w-full text-center">
                  Python Coding
                </h3>

                {/* Winding list of nodes with SVG background lines */}
                <div className="relative w-[160px] flex flex-col items-center gap-7">
                  {renderColumnLines(
                    pythonItems.map(item => ({ id: item.id })), 
                    (id) => !!progress[id]
                  )}

                  {pythonItems.map((item, idx) => {
                    const isCompleted = !!progress[item.id];
                    const isCurrent = unlocked && !isCompleted && pythonItems.slice(0, idx).every(prev => progress[prev.id]);
                    const status = isCompleted ? 'completed' : (isCurrent ? 'current' : 'locked');
                    const offsetClass = columnOffsets[idx % columnOffsets.length];

                    return (
                      <div key={item.id} className={`node-wrapper ${offsetClass} transition-all duration-200 z-10`}>
                        <button
                          onClick={() => unlocked && onNodeClick('topic', item.id, phaseIdx)}
                          className={`node-btn yellow ${status}`}
                          disabled={!unlocked || status === 'locked'}
                          aria-label={item.ttl}
                        >
                          {renderInsideIcon(status, 'topic')}
                        </button>
                        <span className="node-label">
                          {item.ttl}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reconnect Center Area - Projects & Gates */}
            <div 
              className="flex flex-col items-center gap-7 border-t border-[var(--border-color)] pt-8 max-w-sm mx-auto my-6"
              style={{ opacity: unlocked ? 1 : 0.5, filter: unlocked ? 'none' : 'grayscale(1)' }}
            >
              {/* Project Node */}
              {phase.projects.map((pr) => {
                const theoryDone = phase.groups.every(g => g.items.every(t => progress[`t_${t.id}`]));
                const pythonDone = pythonItems.every(t => progress[t.id]);
                const prCompleted = isProjectCompleted(pr);
                const prStatus = unlocked 
                  ? (prCompleted ? 'completed' : (theoryDone && pythonDone ? 'current' : 'locked')) 
                  : 'locked';

                return (
                  <div key={pr.id} className="flex flex-col items-center">
                    <button
                      onClick={() => unlocked && prStatus !== 'locked' && onNodeClick('project', pr.id, phaseIdx)}
                      className={`node-btn project-boss ${prStatus}`}
                      aria-label={pr.ttl}
                      disabled={prStatus === 'locked'}
                    >
                      {renderInsideIcon(prStatus, 'project')}
                    </button>
                    <span className="node-label">
                      Project: {pr.ttl}
                    </span>
                  </div>
                );
              })}

              {/* Gate Node */}
              {(() => {
                const prCompleted = phase.projects.every(pr => isProjectCompleted(pr));
                const gateDone = phase.gate.criteria.every(c => progress[`gate_${c.id}`]);
                const gateStatus = unlocked 
                  ? (gateDone ? 'completed' : (prCompleted ? 'current' : 'locked')) 
                  : 'locked';

                return (
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => unlocked && gateStatus !== 'locked' && onNodeClick('gate', `gate_${phase.id}`, phaseIdx)}
                      className={`node-btn gate-boss ${gateStatus}`}
                      aria-label={phase.gate.title}
                      disabled={gateStatus === 'locked'}
                    >
                      {renderInsideIcon(gateStatus, 'gate')}
                    </button>
                    <span className="node-label">
                      {phase.gate.title}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Resources Panel */}
            <div className="resources-panel text-left mt-8">
              <div className="resources-title">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--color-green)">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
                </svg>
                <span className="font-extrabold text-base">Learning Resources & Tools</span>
              </div>

              <div className="resources-tier mt-2">
                <div className="resources-tier-title text-xs">Basic Resources (Use-now)</div>
                <ul className="resources-list mt-2">
                  {phase.resources.basic.map((r, rIdx) => (
                    <li key={rIdx}>💡 {renderResourceLink(r)}</li>
                  ))}
                </ul>
              </div>

              {/* Collapsible details for Intermediate and Advanced */}
              <div className="resources-details-box border-t border-[var(--border-color)] pt-3 mt-3">
                <button
                  onClick={() => toggleDetails(phase.id)}
                  className="resources-details-summary w-full text-left font-black flex items-center justify-between"
                >
                  <span>{expandedDetails[phase.id] ? 'Hide details' : 'Go deeper (parked tiers)'}</span>
                  <span className="text-xs">{expandedDetails[phase.id] ? '▲' : '▼'}</span>
                </button>

                {expandedDetails[phase.id] && (
                  <div className="mt-4 transition-all duration-300">
                    <div className="resources-tier">
                      <div className="resources-tier-title parked text-xs">Intermediate Resources</div>
                      <ul className="resources-list mt-2">
                        {phase.resources.intermediate.map((r, rIdx) => (
                          <li key={rIdx}>🔍 {renderResourceLink(r)}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="resources-tier mt-4">
                      <div className="resources-tier-title parked text-xs">Advanced Resources</div>
                      <ul className="resources-list mt-2">
                        {phase.resources.advanced.map((r, rIdx) => (
                          <li key={rIdx}>⚡ {renderResourceLink(r)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* CV resources */}
              {phase.resources.cv && (
                <div className="resources-tier mt-4 border-t border-dashed border-[var(--border-color)] pt-3">
                  <div className="resources-tier-title text-xs">Computer Vision (Optional)</div>
                  <ul className="resources-list mt-2">
                    {phase.resources.cv.basic.map((r, rIdx) => (
                      <li key={rIdx}>🖼️ {renderResourceLink(r)}</li>
                    ))}
                  </ul>
                  
                  <div className="resources-details-box border-t border-[var(--border-color)] pt-2 mt-2">
                    <button
                      onClick={() => toggleDetails(phase.id + '_cv')}
                      className="resources-details-summary w-full text-left text-xs font-black flex items-center justify-between"
                    >
                      <span>{expandedDetails[phase.id + '_cv'] ? 'Hide cv advanced/parked' : 'Show cv advanced/parked'}</span>
                      <span>{expandedDetails[phase.id + '_cv'] ? '▲' : '▼'}</span>
                    </button>
                    
                    {expandedDetails[phase.id + '_cv'] && (
                      <ul className="resources-list mt-2">
                        {phase.resources.cv.parked.map((r, rIdx) => (
                          <li key={rIdx} className="opacity-70">
                            💤 {renderResourceLink(r)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Portfolio Project */}
              {phase.resources.optionalProject && (
                <div className="portfolio-project-box mt-4">
                  <strong className="text-[10px]">Optional Portfolio Project (Pick at most one)</strong>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{phase.resources.optionalProject}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
