import React from 'react';

const META_RULES = [
  {
    badge: "M1",
    title: "Active Recall Check",
    desc: "After completing each topic, close all tabs and notes. Explain the concept aloud or write it down from memory. Any gap in memory is a signal to immediately restudy."
  },
  {
    badge: "M2",
    title: "Feynman Technique",
    desc: "Explain the topic in plain, simple words as if teaching a beginner. If you must resort to jargon or fail to find a simple analogy, you haven't fully learned it."
  },
  {
    badge: "M3",
    title: "Anki / Flashcards",
    desc: "Use flashcards ONLY for things you repeatedly forget (e.g. math formulas, exact terms, specific dimensions). Do not front-load general theory."
  },
  {
    badge: "M4",
    title: "Interleaving",
    desc: "For every study session, mix old concepts with new ones (e.g., 1 old topic review + 1 new topic block) to prevent passive recognition and strengthen long-term recall."
  },
  {
    badge: "M5",
    title: "Build & Explain",
    desc: "After building any ML project or step, force yourself to explain why each part works, what each line of code accomplishes, and what would happen if you changed parameters."
  },
  {
    badge: "M6",
    title: "Spaced Repetition",
    desc: "Revisit each finished topic at exactly ~1 week, ~1 month, and ~3 months intervals. Set up reminders or track dates to keep the memory pathways active."
  },
  {
    badge: "M7",
    title: "3-Layer Attack",
    desc: "For any hard concept: obtain Intuition (3Blue1Brown/StatQuest), read the Primary Teaching source, then do the Implementation (write pure NumPy code/derivations). Do these in pairs, not sequentially."
  },
  {
    badge: "M8",
    title: "Build-then-Explain Loop",
    desc: "Immediately follow Abhishek's \"paper-to-code loop\": derive on paper first, code from scratch, and then write/speak a clear explanation of how the math translates to lines of code."
  },
  {
    badge: "M9",
    title: "Teach to Retain",
    desc: "If a concept continues to slip out of memory, write an article, make a short video, or teach the concept aloud to someone else. The act of packaging the idea for another brain seals it in yours."
  }
];

export const MetaLearning: React.FC = () => {
  return (
    <div className="card text-left">
      <h2 className="card-title text-2xl font-black">Meta-Learning System</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Open before each study session to align your study habits with cognitive science principles.
      </p>

      <div className="meta-panel flex flex-col gap-4">
        {META_RULES.map((rule) => (
          <div key={rule.badge} className="meta-item flex gap-4 p-4 border-2 border-[var(--border-color)] bg-[var(--bg-main)] rounded-2xl">
            <div className="meta-badge flex-shrink-0 flex items-center justify-center bg-[var(--meta-bullet-bg)] text-[var(--meta-bullet-text)] font-black text-sm w-9 h-9 border-2 border-[var(--border-color)] rounded-xl">
              {rule.badge}
            </div>
            <div className="meta-content flex-1">
              <h3 className="meta-title font-extrabold text-base text-[var(--text-main)] mb-1">
                {rule.title}
              </h3>
              <p className="meta-desc text-xs text-[var(--text-muted)] leading-relaxed">
                {rule.desc}
              </p>
            </div>
          </div>
        ))}

        {/* Keystone Highlight Rule */}
        <div className="meta-item flex gap-4 p-4 border-2 border-[var(--color-orange)] bg-[var(--bg-main)] rounded-2xl">
          <div className="meta-badge flex-shrink-0 flex items-center justify-center bg-[var(--color-orange)] text-white font-black text-lg w-9 h-9 rounded-xl">
            ★
          </div>
          <div className="meta-content flex-1">
            <h3 className="meta-title font-extrabold text-base text-[var(--text-main)] mb-1">
              Keystone Rule: Paper First
            </h3>
            <p className="meta-desc text-xs text-[var(--text-muted)] leading-relaxed">
              <strong>Derive before building.</strong> Do not touch code until you have mapped the equations, dimensions, and derivatives on paper. Photograph your derivations to keep a visual proof-log.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
