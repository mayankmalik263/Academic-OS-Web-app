import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import { SVG_ICONS, getProfileAvatarSVG } from '../Common/Assets';

interface HUDProps {
  onTabChange?: (tab: string) => void;
  onLevelClick?: () => void;
  onBuyFreezeClick?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ onTabChange, onLevelClick, onBuyFreezeClick }) => {
  const { profile, stats, signOut } = useAuth();
  const { playSound } = useAudio();

  const handleSignOut = () => {
    playSound('click');
    signOut();
  };

  const handleStreakClick = () => {
    playSound('click');
    if (onTabChange) onTabChange('stats');
  };

  const handleLevelClick = () => {
    playSound('click');
    if (onLevelClick) onLevelClick();
  };

  const handleBuyFreeze = () => {
    playSound('click');
    if (onBuyFreezeClick) onBuyFreezeClick();
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
        title={`Current Streak: ${stats.current_streak} Days (Click to view calendar)`}
      >
        {SVG_ICONS.flame}
        <span>{stats.current_streak}</span>
      </div>

      {/* XP widget */}
      <div 
        onClick={handleLevelClick}
        className="hud-widget xp cursor-pointer" 
        title={`Total XP: ${stats.xp} XP (Click to view level info)`}
      >
        {SVG_ICONS.star}
        <span>{stats.xp} XP</span>
      </div>

      {/* Level widget */}
      <div 
        onClick={handleLevelClick}
        className="hud-widget level cursor-pointer" 
        title={`Level ${stats.level} (Click to view level info)`}
      >
        <span>Lvl {stats.level}</span>
      </div>

      {/* Freeze widget */}
      <div
        onClick={handleBuyFreeze}
        className="hud-widget freeze cursor-pointer"
        title={`Streak Freezes Available: ${stats.freezes}/2 (Click to purchase for 50 XP)`}
      >
        {SVG_ICONS.shield}
        <span>{stats.freezes}</span>
      </div>
    </div>
  );
};
