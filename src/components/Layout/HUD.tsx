import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import { SVG_ICONS, getProfileAvatarSVG } from '../Common/Assets';

interface HUDProps {
  onTabChange?: (tab: string) => void;
}

export const HUD: React.FC<HUDProps> = ({ onTabChange }) => {
  const { profile, stats, signOut, updateStats } = useAuth();
  const { playSound } = useAudio();

  const handleSignOut = () => {
    playSound('click');
    signOut();
  };

  const handleStreakClick = () => {
    playSound('click');
    if (onTabChange) onTabChange('stats');
  };

  const getRankName = (level: number) => {
    if (level >= 8) return "AI Architect";
    if (level >= 5) return "ML Engineer";
    if (level >= 3) return "Apprentice";
    return "Initiate";
  };

  const handleLevelClick = () => {
    if (!stats) return;
    playSound('click');
    alert(`Level Progress:\n\nCurrent Level: ${stats.level}\nRank: ${getRankName(stats.level)}\n\nGain XP by completing topics (+10 XP) and projects (+10 to +20 XP) to rank up!`);
  };

  const handleBuyFreeze = async () => {
    if (!stats) return;
    playSound('click');
    
    if (stats.freezes >= 2) {
      playSound('locked');
      alert("Maximum 2 Streak Freezes allowed. You already have 2!");
      return;
    }
    
    if (stats.xp < 50) {
      playSound('locked');
      alert(`Need 50 XP to buy a Streak Freeze.\n(Current: ${stats.xp} XP, Cost: 50 XP)`);
      return;
    }
    
    const confirmBuy = confirm(`Buy a Streak Freeze for 50 XP?\n\nThis will protect your streak if you miss a study day.\n\nCurrent freezes: ${stats.freezes}/2\nCurrent XP: ${stats.xp} XP`);
    if (confirmBuy) {
      try {
        await updateStats({
          xp: stats.xp - 50,
          freezes: stats.freezes + 1
        });
        playSound('success');
        
        // Dynamically import confetti to avoid chunk size overhead
        const { triggerConfetti } = await import('../../components/Common/Confetti');
        triggerConfetti();
        
        alert("Purchase successful! Streak Freeze added. 🛡️");
      } catch (e) {
        console.error(e);
        alert("Failed to buy Streak Freeze.");
      }
    }
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
