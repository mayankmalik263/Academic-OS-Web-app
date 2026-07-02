import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../hooks/useAudio';
import { supabase } from '../../supabase';

export const SettingsTab: React.FC = () => {
  const {
    signOut,
    stats,
    progress,
    brainDump,
    activityDates,
    consumedFreezeDates,
    achievements,
    refreshUserData,
    importLegacyData
  } = useAuth();

  const { playSound, muted: audioMuted, toggleMute } = useAudio();
  const [resetting, setResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDarkTheme = () => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  };

  const toggleTheme = () => {
    playSound('click');
    const isDark = isDarkTheme();
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('zeroToModernAI_theme', nextTheme);
  };

  const handleExportBackup = () => {
    playSound('click');
    const backupData = {
      checks: progress,
      dump: brainDump,
      activityDates,
      consumedFreezeDates,
      freezes: stats?.freezes ?? 1,
      currentStreak: stats?.current_streak ?? 0,
      maxStreak: stats?.longest_streak ?? 0,
      lastSeenLevel: stats?.level ?? 1,
      achievements
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zeroToModernAI_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    playSound('click');
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed && typeof parsed === "object") {
          const success = await importLegacyData(parsed);
          if (success) {
            alert("Backup successfully imported to your account!");
            playSound('success');
          } else {
            alert("Import failed. Please ensure the backup file is valid.");
          }
        }
      } catch (e) {
        alert("Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
    // Clear input so same file can be uploaded again
    event.target.value = '';
  };

  const handleResetAllData = async () => {
    const confirmed = confirm("WARNING: Are you sure you want to reset all progress, streak logs, achievements, and notepad data? This cannot be undone.");
    if (!confirmed) return;

    playSound('click');
    setResetting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Wipe tables associated with user
      await supabase.from('progress').delete().eq('user_id', user.id);
      await supabase.from('activity').delete().eq('user_id', user.id);
      await supabase.from('consumed_freezes').delete().eq('user_id', user.id);
      await supabase.from('achievements').delete().eq('user_id', user.id);
      await supabase.from('brain_dump').update({ content: '' }).eq('user_id', user.id);
      await supabase.from('stats').update({
        xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        freezes: 1
      }).eq('user_id', user.id);

      await refreshUserData();
      alert("All progression has been reset!");
      playSound('success');
    } catch (e) {
      console.error(e);
      alert("Error resetting data.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Settings Options */}
      <div className="card flex flex-col gap-4">
        <h2 className="card-title text-xl font-black">Gamified Settings & Audio</h2>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)]">
            <span className="text-sm font-bold text-[var(--text-main)]">Account Profile</span>
            <button className="btn-chunky btn-gray text-xs py-2 px-4 font-bold" onClick={() => signOut()}>
              Sign Out 👤
            </button>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)]">
            <span className="text-sm font-bold text-[var(--text-main)]">Sound Effects</span>
            <button className="btn-chunky btn-gray text-xs py-2 px-4 font-bold" onClick={toggleMute}>
              {audioMuted ? 'Off 🔇' : 'On 🔊'}
            </button>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)]">
            <span className="text-sm font-bold text-[var(--text-main)]">Dark / Light Mode Toggle</span>
            <button className="btn-chunky btn-gray text-xs py-2 px-4 font-bold" onClick={toggleTheme}>
              {isDarkTheme() ? 'On ☽' : 'Off ☼'}
            </button>
          </div>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="card flex flex-col gap-4">
        <h2 className="card-title text-xl font-black">Backup & Restore</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Export your cloud progression data to a local file, or restore progress by importing a previously exported backup file.
        </p>
        <div className="flex gap-3 flex-wrap mt-2">
          <button className="btn-chunky btn-blue text-xs font-bold text-white" onClick={handleExportBackup}>
            Export Backup
          </button>
          <button className="btn-chunky btn-gray text-xs font-bold" onClick={handleImportClick}>
            Import Backup
          </button>
          <button
            className="btn-chunky btn-red text-xs font-bold text-white disabled:opacity-50"
            onClick={handleResetAllData}
            disabled={resetting}
          >
            {resetting ? 'Resetting...' : 'Reset All Data'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept="application/json"
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};
