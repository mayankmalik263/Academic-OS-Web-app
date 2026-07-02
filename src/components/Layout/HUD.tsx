import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import { SVG_ICONS, getProfileAvatarSVG } from '../Common/Assets';

interface HUDProps {
  onStreakClick?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ onStreakClick }) => {
  const { profile, stats, signOut } = useAuth();
  const { playSound } = useAudio();

  const handleSignOut = () => {
    playSound('click');
    signOut();
  };

  const handleStreakClick = () => {
    playSound('click');
    if (onStreakClick) onStreakClick();
  };

  if (!profile || !stats) return null;

  return (
    <div className="hud-widgets">
      {/* Profile info */}
      <div className="hud-profile-info flex items-center mr-2">
        <div className="flex-shrink-0">
          {getProfileAvatarSVG(profile.display_name, profile.avatar_seed, 28)}
        </div>
        <span className="hud-profile-name ml-2 text-xs font-black">{profile.display_name}</span>
      </div>

      <button
        onClick={handleSignOut}
        className="btn-chunky btn-gray btn-sm px-2 py-1 text-[9px] shadow-sm mr-3"
        title="Sign Out"
      >
        Sign Out
      </button>

      {/* Streak widget */}
      <div
        onClick={handleStreakClick}
        className="hud-widget streak cursor-pointer"
        title={`Current Streak: ${stats.current_streak} Days`}
      >
        {SVG_ICONS.flame}
        <span>{stats.current_streak}</span>
      </div>

      {/* XP widget */}
      <div className="hud-widget xp" title={`Total XP: ${stats.xp} XP`}>
        {SVG_ICONS.star}
        <span>{stats.xp} XP</span>
      </div>

      {/* Level widget */}
      <div className="hud-widget level" title={`Level ${stats.level}`}>
        <span>Lvl {stats.level}</span>
      </div>

      {/* Freeze widget */}
      <div
        onClick={handleStreakClick}
        className="hud-widget freeze cursor-pointer"
        title={`Streak Freezes Available: ${stats.freezes}/2`}
      >
        {SVG_ICONS.shield}
        <span>{stats.freezes}</span>
      </div>
    </div>
  );
};
