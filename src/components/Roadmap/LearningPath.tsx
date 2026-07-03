import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import { roadmap } from '../../data/roadmapData';
import { pythonSubsteps } from '../../data/pythonSliceData';
import type { RoadmapPhase, RoadmapItem, RoadmapProject } from '../../types/roadmap';
import { SVG_ICONS } from '../Common/Assets';

interface LearningPathProps {
  onNodeClick: (type: 'topic' | 'project' | 'gate', id: string, phaseIndex: number) => void;
}

// Mobile breakpoint matches the existing 580px media query in index.css.
// The winding node layout is computed in JS (fixed px columns), so we need the
// breakpoint in JS to stack the two tracks vertically instead of side-by-side.
const MOBILE_MAX_WIDTH = 580;

const isNarrow = () =>
  typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX_WIDTH;

// Uses window.innerWidth on every resize rather than only matchMedia('change').
// This is more robust: if the component ever first mounts at a wider width, a
// later resize (or the mount-time re-check) still corrects it, so it can never
// get stuck rendering the wide two-column desktop layout on a phone.
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(isNarrow);
  useEffect(() => {
    const check = () => setIsMobile(isNarrow());
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);
  return isMobile;
};

// Coordinate calculator for winding nodes. windScale shrinks the horizontal
// winding offset (1 = full desktop winding, <1 for the narrower mobile column).
const getCoords = (i: number, centerX: number, startY: number, spacingY: number, windScale = 1) => {
  const idx = i % 8;
  let offsetX = 0;
  if (idx === 0) offsetX = 0;
  else if (idx === 1) offsetX = 22;
  else if (idx === 2) offsetX = 44;
  else if (idx === 3) offsetX = 22;
  else if (idx === 4) offsetX = 0;
  else if (idx === 5) offsetX = -22;
  else if (idx === 6) offsetX = -44;
  else if (idx === 7) offsetX = -22;
  return {
    x: centerX + offsetX * windScale,
    y: startY + (i * spacingY)
  };
};

export const LearningPath: React.FC<LearningPathProps> = ({ onNodeClick }) => {
  const { progress } = useAuth();
  const { playSound } = useAudio();
  const isMobile = useIsMobile();
  // On mobile the tracks stack full-width; shrink the winding so wide node
  // labels don't spill past a narrow phone viewport.
  const windScale = isMobile ? 0.5 : 1;

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
  const renderColumnLines = (items: any[], isCompletedCheck: (id: string) => boolean, centerX: number, startY: number, spacingY: number, windScale = 1) => {
    if (items.length <= 1) return null;

    const segments: React.ReactNode[] = [];
    for (let i = 0; i < items.length - 1; i++) {
      const p1 = getCoords(i, centerX, startY, spacingY, windScale);
      const p2 = getCoords(i + 1, centerX, startY, spacingY, windScale);
      
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

        // Dynamic height based on number of items in the column
        const columnHeightTheory = theoryItems.length > 0 ? (theoryItems.length - 1) * 140 + 120 : 0;
        const columnHeightPython = pythonItems.length > 0 ? (pythonItems.length - 1) * 140 + 120 : 0;
        const maxTrackHeight = Math.max(columnHeightTheory, columnHeightPython);

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

            {/* Parallel Fully Expanded Tracks (stacked vertically on mobile) */}
            <div
              className={`flex px-2 max-w-xl mx-auto gap-4 md:gap-12 ${isMobile ? 'flex-col items-center my-8' : 'justify-center items-start my-8'}`}
              style={{
                opacity: unlocked ? 1 : 0.5,
                filter: unlocked ? 'none' : 'grayscale(1)',
                height: isMobile ? 'auto' : `${maxTrackHeight}px`
              }}
            >
              {/* Left Column: Math & Theory */}
              <div
                className="relative"
                style={{ width: '200px', height: `${columnHeightTheory}px` }}
              >
                <h3 className="absolute -top-8 left-0 right-0 text-[10px] font-black uppercase tracking-widest text-[var(--text-faint)] border-b border-[var(--border-color)] pb-1.5 w-full text-center">
                  Theory Core
                </h3>
                
                {renderColumnLines(
                  theoryItems.map(item => ({ id: `t_${item.id}` })),
                  (id) => !!progress[id],
                  100, // centerX
                  36,  // startY
                  140, // spacingY
                  windScale
                )}

                {theoryItems.map((item, idx) => {
                  const checkId = `t_${item.id}`;
                  const isCompleted = !!progress[checkId];
                  const isCurrent = unlocked && !isCompleted && theoryItems.slice(0, idx).every(prev => progress[`t_${prev.id}`]);
                  const status = isCompleted ? 'completed' : (isCurrent ? 'current' : 'locked');
                  const { x, y } = getCoords(idx, 100, 36, 140, windScale);

                  return (
                    <div 
                      key={item.id} 
                      className="absolute -translate-x-1/2 flex flex-col items-center z-10"
                      style={{ left: `${x}px`, top: `${y - 36}px`, width: '180px' }}
                    >
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
                      {item.estMinutes !== undefined && (
                        <span className="node-est">~{item.estMinutes} min</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Divider vertical rule in middle (desktop only; hidden when stacked) */}
              {!isMobile && (
                <div
                  className="border-r border-[var(--border-color)] self-stretch my-2 opacity-50"
                  style={{ height: `${maxTrackHeight - 40}px` }}
                ></div>
              )}

              {/* Right Column: Python Coding */}
              <div
                className={`relative ${isMobile ? 'mt-10' : ''}`}
                style={{ width: '200px', height: `${columnHeightPython}px` }}
              >
                <h3 className="absolute -top-8 left-0 right-0 text-[10px] font-black uppercase tracking-widest text-[var(--color-gold)] border-b border-[var(--border-color)] pb-1.5 w-full text-center">
                  Python Coding
                </h3>

                {renderColumnLines(
                  pythonItems.map(item => ({ id: item.id })),
                  (id) => !!progress[id],
                  100, // centerX
                  36,  // startY
                  140, // spacingY
                  windScale
                )}

                {pythonItems.map((item, idx) => {
                  const isCompleted = !!progress[item.id];
                  const isCurrent = unlocked && !isCompleted && pythonItems.slice(0, idx).every(prev => progress[prev.id]);
                  const status = isCompleted ? 'completed' : (isCurrent ? 'current' : 'locked');
                  const { x, y } = getCoords(idx, 100, 36, 140, windScale);

                  return (
                    <div 
                      key={item.id} 
                      className="absolute -translate-x-1/2 flex flex-col items-center z-10"
                      style={{ left: `${x}px`, top: `${y - 36}px`, width: '180px' }}
                    >
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

            {/* Reconnect Center Area - Projects & Gates */}
            <div 
              className="flex flex-col items-center gap-7 border-t border-[var(--border-color)] pt-8 max-w-sm mx-auto my-6 mt-16"
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
                    {pr.estMinutes !== undefined && (
                      <span className="node-est">~{pr.estMinutes} min</span>
                    )}
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
