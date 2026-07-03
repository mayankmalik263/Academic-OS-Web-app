
export const SVG_ICONS = {
  check: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v3c0 2.42 1.72 4.44 4.005 4.901C7.8 14.39 9.74 16 12 16s4.2-.1.9-.9C17.28 14.44 19 12.42 19 10V7c0-1.1-.9-2-2-2zm-12 5V7h2v3c0 .55-.45 1-1 1s-1-.45-1-1zm10 0c0 .55-.45 1-1 1s-1-.45-1-1V7h2v3zm-3 8h-4v2h4v-2z"/>
    </svg>
  ),
  key: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>
  ),
  sword: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M6 2v10h2V2H6zm6 0v6h2V2h-2zm6 0v14h2V2h-2zM4 14h16v2H4v-2zm4 4h8v2H8v-2zm-6 2h20v2H2v-2z"/>
    </svg>
  ),
  flame: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M19.48 12.35c-1.57-4.08-7.16-6.7-5.81-10.21-.1-.04-.21-.06-.31-.06-.81 0-1.64.44-2.22 1.25-1.15 1.6-1.52 3.9-.31 5.62.13.18.3.36.48.55.2.2.47.47.64.8.98 1.95.12 4.67-1.92 6.06-.47-.4-.81-1-1.04-1.6-.28-.75-.31-1.74-.1-2.67.06-.27-.21-.5-.45-.38-2.26 1.15-3.37 3.5-3.17 6.13.06.84.28 1.66.63 2.4.9 1.88 2.78 3.19 4.96 3.42 2.66.28 5.25-.79 6.84-2.88 1.63-2.14 2.1-5.11.81-7.83z"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
    </svg>
  )
};

export const ACHIEVEMENTS_DEF = [
  { id: "first_topic", title: "First Step", desc: "Complete your first learning topic", icon: "🚀" },
  { id: "phase_0_gate", title: "Math Graduate", desc: "Pass the Phase 0 Gate", icon: "📐" },
  { id: "phase_1_gate", title: "ML Practitioner", desc: "Pass the Phase 1 Gate", icon: "🤖" },
  { id: "paper_champion", title: "Theory First", desc: "Complete all paper steps in any project first", icon: "📝" },
  { id: "streak_3", title: "Consistent", desc: "Reach a 3-day learning streak", icon: "🔥" },
  { id: "streak_7", title: "Unstoppable", desc: "Reach a 7-day learning streak", icon: "⚡" },
  { id: "keystone_master", title: "Key Master", desc: "Complete a keystone topic", icon: "🔑" }
];

export function getProfileAvatarSVG(profileName: string, avatarColor: string, size = 32) {
  const initial = profileName ? profileName.charAt(0).toUpperCase() : "A";
  const fontSize = Math.round(size * 0.45);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <circle cx="50" cy="50" r="48" fill={avatarColor || '#05C46B'} stroke="var(--border-color)" strokeWidth="4"/>
      <text x="50" y="55" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-main)" fontSize={fontSize * 2} fontWeight="900" fill="#FFFFFF">{initial}</text>
    </svg>
  );
}
