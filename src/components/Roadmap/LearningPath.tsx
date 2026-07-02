import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import { roadmap } from '../../data/roadmapData';
import type { RoadmapPhase } from '../../types/roadmap';
import { SVG_ICONS } from '../Common/Assets';

interface LearningPathProps {
  onNodeClick: (type: 'topic' | 'project' | 'gate', id: string, phaseIndex: number) => void;
}

const offsetClasses = [
  "offset-center",
  "offset-right-1",
  "offset-right-2",
  "offset-right-1",
  "offset-center",
  "offset-left-1",
  "offset-left-2",
  "offset-left-1"
];

const unitColors = [
  "var(--color-green)",
  "var(--color-blue)",
  "var(--color-purple)",
  "var(--color-orange)"
];

export const LearningPath: React.FC<LearningPathProps> = ({ onNodeClick }) => {
  const { progress } = useAuth();
  const { playSound } = useAudio();

  // Track expanded resource states locally
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

  // Flatten nodes for rendering
  const getPhaseNodes = (p: RoadmapPhase) => {
    const nodes: any[] = [];
    p.groups.forEach(g => {
      g.items.forEach(t => {
        nodes.push({
          type: t.optional ? "sidequest" : "topic",
          id: `t_${t.id}`,
          title: t.ttl,
          code: t.id,
          data: t,
          keystone: !!t.keystone,
          optional: !!t.optional
        });
      });
    });

    p.projects.forEach(pr => {
      nodes.push({
        type: "project",
        id: pr.id,
        title: pr.ttl,
        code: pr.id,
        data: pr,
        keystone: true
      });
    });

    nodes.push({
      type: "gate",
      id: `gate_${p.id}`,
      title: p.gate.title,
      code: "GATE",
      data: p.gate,
      keystone: true
    });

    return nodes;
  };

  // Compute active task in the whole path
  const getCurrentTask = () => {
    for (let i = 0; i < roadmap.length; i++) {
      const p = roadmap[i];
      if (!isPhaseUnlocked(i)) continue;

      for (const g of p.groups) {
        for (const t of g.items) {
          if (t.optional) continue;
          if (!progress[`t_${t.id}`]) {
            return { type: 'topic', id: `t_${t.id}` };
          }
        }
      }

      for (const pr of p.projects) {
        const paperIDs = pr.paper.map((_, idx) => `pp_${pr.id}_${idx}`);
        const buildIDs = pr.build.map((_, idx) => `pb_${pr.id}_${idx}`);
        const doneIDs = pr.done.map((_, idx) => `pd_${pr.id}_${idx}`);
        const allIDs = [...paperIDs, ...buildIDs, ...doneIDs];
        const incomplete = allIDs.find(id => !progress[id]);
        if (incomplete) {
          return { type: 'project', id: pr.id };
        }
      }

      const gateIDs = p.gate.criteria.map(c => `gate_${c.id}`);
      const incompleteGate = gateIDs.find(id => !progress[id]);
      if (incompleteGate) {
        return { type: 'gate', id: `gate_${p.id}` };
      }
    }
    return null;
  };

  const currentTask = getCurrentTask();

  const getNodeStatus = (node: any, phaseIndex: number) => {
    if (!isPhaseUnlocked(phaseIndex)) return "locked";

    let isComplete = false;
    if (node.type === "topic" || node.type === "sidequest") {
      isComplete = !!progress[node.id];
    } else if (node.type === "project") {
      const pr = node.data;
      const paperIDs = pr.paper.map((_: string, idx: number) => `pp_${pr.id}_${idx}`);
      const buildIDs = pr.build.map((_: string, idx: number) => `pb_${pr.id}_${idx}`);
      const doneIDs = pr.done.map((_: string, idx: number) => `pd_${pr.id}_${idx}`);
      isComplete = [...paperIDs, ...buildIDs, ...doneIDs].every(id => progress[id]);
    } else if (node.type === "gate") {
      const gate = node.data;
      isComplete = gate.criteria.every((c: any) => progress[`gate_${c.id}`]);
    }

    if (isComplete) return "completed";
    if (node.type === "sidequest") return "current"; // Sidequests are unlocked since their phase is active
    if (currentTask && node.type === currentTask.type && node.id === currentTask.id) return "current";

    return "locked";
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
        const bannerColor = unitColors[phaseIdx % unitColors.length];
        const nodes = getPhaseNodes(phase);

        // Group main winding nodes vs sidequests
        // We accumulate main nodes and attach sidequests inside their preceding main node
        const renderNodes: any[] = [];
        let tempMainNodeCount = 0;

        nodes.forEach((node) => {
          const status = getNodeStatus(node, phaseIdx);
          if (node.type === "sidequest") {
            const lastMain = renderNodes[renderNodes.length - 1];
            if (lastMain) {
              if (!lastMain.sidequests) lastMain.sidequests = [];
              lastMain.sidequests.push({ ...node, status });
            }
          } else {
            renderNodes.push({
              ...node,
              status,
              offsetClass: offsetClasses[tempMainNodeCount % offsetClasses.length],
              sidequests: []
            });
            tempMainNodeCount++;
          }
        });

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

            {/* Python Slice */}
            {phase.pyslice && (
              <div className="python-slice-card text-left">
                <strong className="text-xs">Python Slice:</strong> {phase.pyslice}
              </div>
            )}

            {/* Nodes Path */}
            <div 
              className="path-nodes-container"
              style={{ opacity: unlocked ? 1 : 0.5, filter: unlocked ? 'none' : 'grayscale(1)' }}
            >
              <div className="path-connector-line"></div>

              {renderNodes.map((mainNode) => {
                const nodeBtnClass = `node-btn ${mainNode.type === 'project' ? 'project-boss' : ''} ${mainNode.type === 'gate' ? 'gate-boss' : ''} ${mainNode.status}`;
                
                return (
                  <div key={mainNode.id} className={`node-wrapper ${mainNode.offsetClass}`}>
                    {/* Main Node */}
                    <button
                      onClick={() => unlocked && onNodeClick(mainNode.type, mainNode.id, phaseIdx)}
                      className={nodeBtnClass}
                      aria-label={mainNode.title}
                      disabled={!unlocked || mainNode.status === 'locked'}
                    >
                      {renderInsideIcon(mainNode.status, mainNode.type)}
                    </button>
                    <span className="node-label">
                      {mainNode.code === 'GATE' ? '' : `${mainNode.code}: `}{mainNode.title}
                    </span>

                    {/* Attached Sidequests */}
                    {mainNode.sidequests && mainNode.sidequests.map((sq: any, sqIdx: number) => {
                      const branchSide = sqIdx % 2 === 0 ? 'branch-right' : 'branch-left';
                      const sqBtnClass = `node-btn sidequest ${sq.status}`;
                      
                      return (
                        <React.Fragment key={sq.id}>
                          <div className={`sidequest-node ${branchSide}`}>
                            <button
                              onClick={() => unlocked && onNodeClick('topic', sq.id, phaseIdx)}
                              className={sqBtnClass}
                              aria-label={sq.title}
                              disabled={!unlocked || sq.status === 'locked'}
                            >
                              {renderInsideIcon(sq.status, sq.type)}
                            </button>
                            <span className="node-label" style={{ backgroundColor: 'var(--active-node-bg)', borderColor: 'var(--color-purple)' }}>
                              {sq.code}: {sq.title}
                            </span>
                          </div>
                          <div className="sidequest-node-line"></div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                );
              })}
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
    </div>
  );
};
