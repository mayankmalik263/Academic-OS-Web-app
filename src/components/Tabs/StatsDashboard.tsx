import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import { ACHIEVEMENTS_DEF, SVG_ICONS } from '../Common/Assets';
import { DailyActivityModal } from '../Modals/DailyActivityModal';

export const StatsDashboard: React.FC = () => {
  const { stats, activityDates, consumedFreezeDates, achievements } = useAuth();
  const { playSound } = useAudio();

  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleMonthChange = (offset: number) => {
    playSound('click');
    let nextMonth = calMonth + offset;
    let nextYear = calYear;

    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear--;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear++;
    }

    setCalMonth(nextMonth);
    setCalYear(nextYear);
  };

  const getLocalDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const renderCalendarCells = () => {
    const todayStr = getLocalDateString(new Date());
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    const cells: React.ReactNode[] = [];

    // Empty cells before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell bg-transparent"></div>);
    }

    // Day cells
    const activeSet = new Set(activityDates);
    const frozenSet = new Set(consumedFreezeDates);

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(calYear, calMonth, day);
      const cellDateStr = getLocalDateString(cellDate);

      let classes = "calendar-cell cursor-pointer hover:scale-110 transition-transform duration-200";
      if (activeSet.has(cellDateStr)) {
        classes += " active-day";
      } else if (frozenSet.has(cellDateStr)) {
        classes += " frozen-day";
      }

      if (cellDateStr === todayStr) {
        classes += " today";
      }

      cells.push(
        <div 
          key={`day-${day}`} 
          className={classes}
          onClick={() => {
            playSound('click');
            setSelectedDate(cellDateStr);
            setIsModalOpen(true);
          }}
        >
          {day}
        </div>
      );
    }

    return cells;
  };

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* HUD Widgets */}
      <div className="card">
        <h2 className="card-title text-xl font-black mb-4">Stats Summary</h2>
        <div className="hud-widgets mb-6">
          <div className="hud-widget streak" title="Streak Days">
            {SVG_ICONS.flame}
            <span>{stats.current_streak} Days</span>
          </div>
          <div className="hud-widget xp" title="Total XP">
            {SVG_ICONS.star}
            <span>{stats.xp} XP</span>
          </div>
          <div className="hud-widget level" title={`Level ${stats.level}`}>
            <span>Lvl {stats.level}</span>
          </div>
          <div className="hud-widget freeze" title="Streaks freezes">
            {SVG_ICONS.shield}
            <span>{stats.freezes}/2 Freezes</span>
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="calendar-widget mt-2">
          <div className="calendar-header">
            <button className="calendar-nav-btn font-black text-lg" onClick={() => handleMonthChange(-1)}>
              &larr;
            </button>
            <span className="calendar-month-title font-extrabold text-sm">
              {monthNames[calMonth]} {calYear}
            </span>
            <button className="calendar-nav-btn font-black text-lg" onClick={() => handleMonthChange(1)}>
              &rarr;
            </button>
          </div>
          
          <div className="calendar-grid">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(name => (
              <div key={name} className="calendar-day-name font-black">
                {name}
              </div>
            ))}
            {renderCalendarCells()}
          </div>

          <div className="calendar-stats border-t border-[var(--border-color)] pt-3 mt-3 flex flex-col gap-2 text-xs font-bold text-[var(--text-muted)]">
            <div className="calendar-stat-item flex justify-between">
              <span>Current Streak:</span>
              <strong className="text-[var(--text-main)]">{stats.current_streak} Days 🔥</strong>
            </div>
            <div className="calendar-stat-item flex justify-between">
              <span>Longest Streak:</span>
              <strong className="text-[var(--text-main)]">{stats.longest_streak} Days 👑</strong>
            </div>
            <div className="calendar-stat-item flex justify-between">
              <span>Freezes Left:</span>
              <strong className="text-[var(--text-main)]">{stats.freezes}/2 🛡️</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Trophy Case */}
      <div className="card">
        <h2 className="card-title text-xl font-black">Trophy Case</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Earn gold badges by leveling up and finishing milestones.
        </p>

        <div className="trophy-grid">
          {ACHIEVEMENTS_DEF.map(ach => {
            const isUnlocked = achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`trophy-card ${isUnlocked ? 'unlocked' : ''}`}
              >
                <div className="trophy-icon">{ach.icon}</div>
                <div className="trophy-title">{ach.title}</div>
                <div className="trophy-desc">{ach.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <DailyActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dateStr={selectedDate}
      />
    </div>
  );
};
