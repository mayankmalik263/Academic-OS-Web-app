import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { roadmap } from '../../data/roadmapData';

interface QuestCardProps {
  onNodeClick: (type: 'topic' | 'project' | 'gate', id: string, phaseIndex: number) => void;
  onFocusClick: (topicId: string) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ onNodeClick, onFocusClick }) => {
  const { progress } = useAuth();

  // Helper to determine if a phase is unlocked
  const isPhaseUnlocked = (phaseIndex: number) => {
    if (phaseIndex === 0) return true;
    const prevPhase = roadmap[phaseIndex - 1];
    return prevPhase.gate.criteria.every(c => progress[`gate_${c.id}`]);
  };

  const getCurrentTask = () => {
    for (let i = 0; i < roadmap.length; i++) {
      const p = roadmap[i];
      if (!isPhaseUnlocked(i)) continue;

      // 1. Check topics
      for (const g of p.groups) {
        for (const t of g.items) {
          if (t.optional) continue;
          if (!progress[`t_${t.id}`]) {
            return { type: 'topic', phaseIndex: i, phase: p, topic: t, id: `t_${t.id}` };
          }
        }
      }

      // 2. Check projects
      for (const pr of p.projects) {
        const paperIDs = pr.paper.map((_, idx) => `pp_${pr.id}_${idx}`);
        const buildIDs = pr.build.map((_, idx) => `pb_${pr.id}_${idx}`);
        const doneIDs = pr.done.map((_, idx) => `pd_${pr.id}_${idx}`);
        const allIDs = [...paperIDs, ...buildIDs, ...doneIDs];
        const incomplete = allIDs.find(id => !progress[id]);
        if (incomplete) {
          return { type: 'project', phaseIndex: i, phase: p, project: pr, id: pr.id, incompleteId: incomplete };
        }
      }

      // 3. Check gates
      const gateIDs = p.gate.criteria.map(c => `gate_${c.id}`);
      const incompleteGate = gateIDs.find(id => !progress[id]);
      if (incompleteGate) {
        return { type: 'gate', phaseIndex: i, phase: p, gate: p.gate, id: `gate_${p.id}`, incompleteId: incompleteGate };
      }
    }
    return null;
  };

  const task = getCurrentTask();

  if (!task) {
    return (
      <div className="quest-card">
        <div className="quest-card-header">All clear! 🚀</div>
        <h3 className="quest-card-title text-xl font-extrabold mt-1">Everything Completed</h3>
        <p className="quest-card-body text-sm mt-2 text-[var(--text-muted)]">
          You've finished the roadmap! Go build cool things and teach them aloud.
        </p>
      </div>
    );
  }

  let title = '';
  let body = '';
  let actions: React.ReactNode = null;

  if (task.type === 'topic' && task.topic) {
    const topic = task.topic;
    title = `${topic.id}: ${topic.ttl}`;
    body = topic.learn;
    actions = (
      <>
        <button
          onClick={() => onFocusClick(topic.id)}
          className="btn-chunky btn-green text-white font-bold"
        >
          Start Focus
        </button>
        <button
          onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.search)}`, '_blank')}
          className="btn-chunky btn-gray btn-sm font-bold text-xs"
        >
          YouTube
        </button>
        <button
          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(topic.search)}`, '_blank')}
          className="btn-chunky btn-gray btn-sm font-bold text-xs"
        >
          Google
        </button>
      </>
    );
  } else if (task.type === 'project' && task.project) {
    const project = task.project;
    title = `Project: ${project.ttl}`;
    body = `Next up: ${project.learn}. Work on this project in the roadmap path or click details to complete steps.`;
    actions = (
      <button
        onClick={() => onNodeClick('project', project.id, task.phaseIndex)}
        className="btn-chunky btn-blue text-white font-bold"
      >
        Open Checklist
      </button>
    );
  } else if (task.type === 'gate' && task.gate) {
    const gate = task.gate;
    title = `Gate to Next Zone`;
    body = `Prove your capability to unlock the next phase: ${gate.title}.`;
    actions = (
      <button
        onClick={() => onNodeClick('gate', `gate_${task.phase.id}`, task.phaseIndex)}
        className="btn-chunky btn-red text-white font-bold"
      >
        Open Gate
      </button>
    );
  }

  return (
    <div className="quest-card">
      <div className="quest-card-header font-black text-xs">Next Active Quest</div>
      <h3 className="quest-card-title text-lg font-black mt-1">{title}</h3>
      <p className="quest-card-body text-sm mt-2 text-[var(--text-muted)] leading-relaxed">{body}</p>
      <div className="quest-card-actions flex gap-2 mt-4 flex-wrap">{actions}</div>
    </div>
  );
};
