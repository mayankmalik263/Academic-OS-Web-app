import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import { roadmap } from '../../data/roadmapData';
import type { RoadmapPhase, RoadmapItem, RoadmapProject } from '../../types/roadmap';
import { SVG_ICONS } from '../Common/Assets';
import { TheoryListModal } from '../Modals/TheoryListModal';

interface LearningPathProps {
  onNodeClick: (type: 'topic' | 'project' | 'gate', id: string, phaseIndex: number) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({ onNodeClick }) => {
  const { progress } = useAuth();
  const { playSound } = useAudio();

  // Expanded resources panel accordion
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  // Local state for the Theory checklist popup modal
  const [theoryModalOpen, setTheoryModalOpen] = useState(false);
  const [activeTheoryPhase, setActiveTheoryPhase] = useState<RoadmapPhase | null>(null);
  const [activeTheoryPhaseIdx, setActiveTheoryPhaseIdx] = useState<number>(0);

  const toggleDetails = (phaseId: string) => {
    playSound('click');
    setExpandedDetails(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const handleTheoryNodeClick = (phase: RoadmapPhase, idx: number) => {
    playSound('click');
    setActiveTheoryPhase(phase);
    setActiveTheoryPhaseIdx(idx);
    setTheoryModalOpen(true);
  };

  const handlePythonNodeClick = (phase: RoadmapPhase, idx: number) => {
    playSound('click');
    onNodeClick('topic', `pyslice_${phase.id}`, idx);
  };

  const handleTopicSelect = (topic: RoadmapItem) => {
    // Forward the select event to the parent AppContent container
    onNodeClick('topic', `t_${topic.id}`, activeTheoryPhaseIdx);
  };

  // Helper to determine if a phase is unlocked
  const isPhaseUnlocked = (phaseIndex: number) => {
    if (phaseIndex === 0) return true;
    const prevPhase = roadmap[phaseIndex - 1];
    return prevPhase.gate.criteria.every(c => progress[`gate_${c.id}`]);
  };

  // Helper to check if the theory/math topics are completed
  const isPhaseTheoryCompleted = (phase: RoadmapPhase) => {
    return phase.groups.every(g => g.items.every(t => progress[`t_${t.id}`]));
  };

  // Helper to check if the Python slice is completed
  const isPythonSliceCompleted = (phaseId: string) => {
    return !!progress[`pyslice_${phaseId}`];
  };

  // Helper to check if a project is completed
  const isProjectCompleted = (pr: RoadmapProject) => {
    const paperIDs = pr.paper.map((_, idx) => `pp_${pr.id}_${idx}`);
    const buildIDs = pr.build.map((_, idx) => `pb_${pr.id}_${idx}`);
    const doneIDs = pr.done.map((_, idx) => `pd_${pr.id}_${idx}`);
    return [...paperIDs, ...buildIDs, ...doneIDs].every(id => progress[id]);
  };

  // Helper to check if a gate is completed
  const isGateCompleted = (phase: RoadmapPhase) => {
    return phase.gate.criteria.every(c => progress[`gate_${c.id}`]);
  };

  // Helper to calculate progress percentage for a phase
  const calculatePhaseProgress = (phase: RoadmapPhase) => {
    let totalItems = 0;
    let completedItems = 0;

    phase.groups.forEach(g => {
      g.items.forEach(t => {
        totalItems++;
        if (progress[`t_${t.id}`]) completedItems++;
      });
    });

    // Add 1 slot for the Python slice itself
    totalItems++;
    if (progress[`pyslice_${phase.id}`]) completedItems++;

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

  return (
    <div className="w-full">
      {roadmap.map((phase, phaseIdx) => {
        const unlocked = isPhaseUnlocked(phaseIdx);
        const pct = calculatePhaseProgress(phase);
        const bannerColor = phaseIdx === 0 ? "var(--color-blue)" : phaseIdx === 1 ? "var(--color-green)" : phaseIdx === 2 ? "var(--color-purple)" : "var(--color-orange)";

        const theoryStatus = unlocked ? (isPhaseTheoryCompleted(phase) ? 'completed' : 'current') : 'locked';
        const pythonStatus = unlocked ? (isPythonSliceCompleted(phase.id) ? 'completed' : 'current') : 'locked';

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

            {/* Split Fork Learning Path */}
            <div 
              className="path-fork-container fork-spacing" 
              style={{ opacity: unlocked ? 1 : 0.5, filter: unlocked ? 'none' : 'grayscale(1)' }}
            >
              {/* Triangular fork path lines */}
              <svg className="path-fork-svg" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left path (Theory) */}
                <line x1="160" y1="10" x2="65" y2="105" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />
                {/* Right path (Python Coding) */}
                <line x1="160" y1="10" x2="255" y2="105" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />
                {/* Left bottom path (Theory merge) */}
                <line x1="65" y1="105" x2="160" y2="200" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />
                {/* Right bottom path (Python merge) */}
                <line x1="255" y1="105" x2="160" y2="200" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />
              </svg>

              {/* Top connector dot */}
              <div className="path-center-top"></div>

              {/* Left Branch - Theory Node */}
              <div className="path-fork-left">
                <button
                  onClick={() => unlocked && handleTheoryNodeClick(phase, phaseIdx)}
                  className={`node-btn ${theoryStatus}`}
                  aria-label="Theory Topics"
                  disabled={!unlocked}
                >
                  {renderInsideIcon(theoryStatus, 'topic')}
                </button>
                <span className="node-label">
                  {phaseIdx === 0 ? 'Math Foundation' : phaseIdx === 1 ? 'ML Core Theory' : phaseIdx === 2 ? 'DL Deep Theory' : 'LLM Core Theory'}
                </span>
              </div>

              {/* Right Branch - Python/Coding Node (strictly Yellow/Gold when current) */}
              <div className="path-fork-right">
                <button
                  onClick={() => unlocked && handlePythonNodeClick(phase, phaseIdx)}
                  className={`node-btn yellow ${pythonStatus}`}
                  aria-label="Python slice"
                  disabled={!unlocked}
                >
                  {renderInsideIcon(pythonStatus, 'topic')}
                </button>
                <span className="node-label text-center">
                  {phaseIdx === 0 ? 'NumPy & Python' : phaseIdx === 1 ? 'ML Scratch Code' : phaseIdx === 2 ? 'PyTorch Basics' : 'GPT Build Code'}
                </span>
              </div>

              {/* Bottom Merged Area - Projects & Gates */}
              <div className="path-center-bottom">
                {/* Project Node */}
                {phase.projects.map((pr) => {
                  const theoryDone = isPhaseTheoryCompleted(phase);
                  const pythonDone = isPythonSliceCompleted(phase.id);
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
                  const gateDone = isGateCompleted(phase);
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
            </div>

            {/* Resources Panel */}
            <div className="resources-panel text-left">
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

      {activeTheoryPhase && (
        <TheoryListModal
          isOpen={theoryModalOpen}
          onClose={() => setTheoryModalOpen(false)}
          phase={activeTheoryPhase}
          phaseIdx={activeTheoryPhaseIdx}
          onTopicClick={handleTopicSelect}
        />
      )}
    </div>
  );
};
