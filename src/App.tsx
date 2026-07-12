import React, { useState, useEffect, useRef } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { useAudio } from './hooks/useAudio';
import { triggerConfetti } from './components/Common/Confetti';
import { roadmap } from './data/roadmapData';
import { pythonSubsteps } from './data/pythonSliceData';
import type { RoadmapItem, RoadmapProject, RoadmapPhase } from './types/roadmap';

// Layout
import { Sidebar } from './components/Layout/Sidebar';
import { HUD } from './components/Layout/HUD';

// Tabs
import { QuestCard } from './components/Roadmap/QuestCard';
import { LearningPath } from './components/Roadmap/LearningPath';
import { MetaLearning } from './components/Tabs/MetaLearning';
import { StatsDashboard } from './components/Tabs/StatsDashboard';
import { WorkspaceTools } from './components/Tabs/WorkspaceTools';
import { SettingsTab } from './components/Tabs/SettingsTab';

// Auth
import { LoginPage } from './components/Auth/LoginPage';

// Modals & Common
import { LessonModal } from './components/Modals/LessonModal';
import { ProjectModal } from './components/Modals/ProjectModal';
import { GateModal } from './components/Modals/GateModal';
import { LevelUpModal } from './components/Modals/LevelUpModal';
import { FocusOverlay } from './components/Modals/FocusOverlay';
import { StatsModal } from './components/Modals/StatsModal';
import { Toast } from './components/Common/Toast';
import { ACHIEVEMENTS_DEF } from './components/Common/Assets';

const getRankName = (level: number) => {
  if (level >= 8) return "AI Architect";
  if (level >= 5) return "ML Engineer";
  if (level >= 3) return "Apprentice";
  return "Initiate";
};

const AppContent: React.FC = () => {
  const {
    user,
    loading,
    progress,
    stats,
    activityDates,
    consumedFreezeDates,
    achievements,
    updateStats,
    consumeFreeze,
    unlockAchievement,
    importLegacyData
  } = useAuth();

  const { playSound } = useAudio();

  // Active Tab
  const [activeTab, setActiveTab] = useState('roadmap');

  // Pomodoro shared states (needed for mascot mood updates in sidebar)
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<'focus' | 'break'>('focus');

  // Modals state
  const [activeLesson, setActiveLesson] = useState<RoadmapItem | null>(null);
  const [activeProject, setActiveProject] = useState<RoadmapProject | null>(null);
  const [activeGatePhase, setActiveGatePhase] = useState<RoadmapPhase | null>(null);
  const [activeGateIdx, setActiveGateIdx] = useState<number>(0);
  const [activeFocusTopic, setActiveFocusTopic] = useState<RoadmapItem | null>(null);

  // Level Up / Achievements Celebrations
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'level' | 'achievement' | null>(null);
  const [celebrationData, setCelebrationData] = useState<any>(null);

  // Stats Modal (custom alerts / confirms for stats widgets)
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [statsModalType, setStatsModalType] = useState<'level' | 'freeze_confirm' | 'freeze_error' | 'freeze_success' | null>(null);
  const [statsModalData, setStatsModalData] = useState<any>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef<any>(null);

  // Migration Helper banner
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Refs to track updates for Level Up and Achievements
  const prevLevelRef = useRef<number | null>(null);
  const prevAchievementsCountRef = useRef<number | null>(null);
  const prevAchievementsRef = useRef<string[]>([]);
  const streakCheckedRef = useRef<boolean>(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  };

  // 1. Detect Legacy Local Storage progress to prompt migration
  useEffect(() => {
    if (user && !loading) {
      const oldV2Data = localStorage.getItem("zeroToModernAI_v2");
      const migrationDismissed = localStorage.getItem("zeroToModernAI_migration_dismissed");
      if (oldV2Data && !migrationDismissed) {
        setShowMigrationBanner(true);
      }
    }
  }, [user, loading]);

  const handleMigration = async () => {
    const oldV2Data = localStorage.getItem("zeroToModernAI_v2");
    if (!oldV2Data) return;

    playSound('click');
    setMigrating(true);

    try {
      const parsed = JSON.parse(oldV2Data);
      const success = await importLegacyData(parsed);
      if (success) {
        triggerConfetti();
        playSound('success');
        showToast('Local progress imported successfully! 🎉');
        localStorage.setItem("zeroToModernAI_migration_dismissed", "true");
        setShowMigrationBanner(false);
      } else {
        alert('Could not migrate progress. Ensure file format is valid.');
      }
    } catch (e) {
      console.error(e);
      alert('Error parsing local data.');
    } finally {
      setMigrating(false);
    }
  };

  const dismissMigration = () => {
    playSound('click');
    localStorage.setItem("zeroToModernAI_migration_dismissed", "true");
    setShowMigrationBanner(false);
  };

  // 2. recalculate and sync streak on user login
  useEffect(() => {
    const runStreakCheck = async () => {
      if (user && stats && !loading && !streakCheckedRef.current) {
        streakCheckedRef.current = true;
        
        const dates = new Set(activityDates);
        const consumed = new Set(consumedFreezeDates);
        const todayStr = new Date().toISOString().split('T')[0];

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let tempFreezes = stats.freezes;
        let currentStreak = 0;

        const isTodayActive = dates.has(todayStr) || consumed.has(todayStr);
        const isYesterdayActive = dates.has(yesterdayStr) || consumed.has(yesterdayStr);

        let activeStreakFound = false;
        let checkDate = new Date();

        if (isTodayActive) {
          activeStreakFound = true;
        } else if (isYesterdayActive) {
          activeStreakFound = true;
          checkDate = yesterday;
        } else {
          // Neither today nor yesterday was active. Consume freezes?
          const dby = new Date();
          dby.setDate(dby.getDate() - 2);
          const dbyStr = dby.toISOString().split('T')[0];
          const wasDbyActive = dates.has(dbyStr) || consumed.has(dbyStr);

          if (wasDbyActive && tempFreezes > 0) {
            tempFreezes--;
            consumed.add(yesterdayStr);
            await consumeFreeze(yesterdayStr);
            activeStreakFound = true;
            checkDate = yesterday;
          } else if (!wasDbyActive && tempFreezes > 1) {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            const tdaStr = threeDaysAgo.toISOString().split('T')[0];
            const wasTdaActive = dates.has(tdaStr) || consumed.has(tdaStr);
            
            if (wasTdaActive) {
              tempFreezes -= 2;
              consumed.add(yesterdayStr);
              consumed.add(dbyStr);
              await consumeFreeze(yesterdayStr);
              await consumeFreeze(dbyStr);
              activeStreakFound = true;
              checkDate = yesterday;
            }
          }
        }

        if (activeStreakFound) {
          let curr = new Date(checkDate);
          while (true) {
            const currStr = curr.toISOString().split('T')[0];
            if (dates.has(currStr) || consumed.has(currStr)) {
              currentStreak++;
            } else {
              const hasOlderActivity = Array.from(dates).some(d => d < currStr);
              if (hasOlderActivity && tempFreezes > 0) {
                tempFreezes--;
                consumed.add(currStr);
                await consumeFreeze(currStr);
                currentStreak++;
              } else {
                break;
              }
            }
            curr.setDate(curr.getDate() - 1);
          }
        }

        if (
          currentStreak !== stats.current_streak ||
          tempFreezes !== stats.freezes ||
          currentStreak > stats.longest_streak
        ) {
          await updateStats({
            current_streak: currentStreak,
            longest_streak: Math.max(stats.longest_streak, currentStreak),
            freezes: tempFreezes
          });
        }
      }
    };
    runStreakCheck();
  }, [user, stats, loading]);

  // 3. Monitor Level-Up chimes
  useEffect(() => {
    if (stats) {
      if (prevLevelRef.current !== null && stats.level > prevLevelRef.current) {
        setCelebrationType('level');
        setCelebrationData({
          level: stats.level,
          rank: getRankName(stats.level),
          freezeRewarded: stats.freezes < 2
        });
        setCelebrationOpen(true);
        triggerConfetti();
        playSound('fanfare');
      }
      prevLevelRef.current = stats.level;
    } else {
      prevLevelRef.current = null;
    }
  }, [stats?.level]);

  // 4. Monitor Achievement unlocks
  useEffect(() => {
    if (achievements && achievements.length > 0) {
      if (
        prevAchievementsCountRef.current !== null && 
        achievements.length > prevAchievementsCountRef.current
      ) {
        const newAchId = achievements.find(id => !prevAchievementsRef.current.includes(id));
        const achDef = ACHIEVEMENTS_DEF.find(a => a.id === newAchId);
        if (achDef) {
          setCelebrationType('achievement');
          setCelebrationData(achDef);
          setCelebrationOpen(true);
          triggerConfetti();
          playSound('fanfare');
        }
      }
      prevAchievementsCountRef.current = achievements.length;
      prevAchievementsRef.current = achievements;
    } else {
      prevAchievementsCountRef.current = null;
      prevAchievementsRef.current = [];
    }
  }, [achievements]);

  // 5. Auto unlock achievements based on progress changes
  useEffect(() => {
    const checkTrophies = async () => {
      if (!user || !stats) return;

      const topicsDone = Object.keys(progress).filter(k => k.startsWith("t_") && progress[k]);
      if (topicsDone.length >= 1) await unlockAchievement("first_topic");

      const p0GatePassed = roadmap[0].gate.criteria.every(c => progress["gate_" + c.id]);
      if (p0GatePassed) await unlockAchievement("phase_0_gate");

      const p1GatePassed = roadmap[1].gate.criteria.every(c => progress["gate_" + c.id]);
      if (p1GatePassed) await unlockAchievement("phase_1_gate");

      let paperChamp = false;
      roadmap.forEach(p => {
        p.projects.forEach(pr => {
          const buildChecked = pr.build.some((_, i) => progress["pb_" + pr.id + "_" + i]);
          if (buildChecked) paperChamp = true;
        });
      });
      if (paperChamp) await unlockAchievement("paper_champion");

      if (stats.current_streak >= 3) await unlockAchievement("streak_3");
      if (stats.current_streak >= 7) await unlockAchievement("streak_7");

      let keystoneCompleted = false;
      roadmap.forEach(p => {
        p.groups.forEach(g => {
          g.items.forEach(t => {
            if (t.keystone && progress["t_" + t.id]) keystoneCompleted = true;
          });
        });
      });
      if (keystoneCompleted) await unlockAchievement("keystone_master");
    };

    checkTrophies();
  }, [progress, stats?.current_streak, user]);

  // Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLesson(null);
        setActiveProject(null);
        setActiveGatePhase(null);
        setActiveFocusTopic(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const handleNodeClick = (type: 'topic' | 'project' | 'gate', id: string, phaseIndex: number) => {
    playSound('click');
    const phase = roadmap[phaseIndex];

    if (type === 'topic') {
      if (id.startsWith('pyslice_')) {
        const pKey = phase.id;
        const list = pythonSubsteps[pKey] || [];
        const topic = list.find(item => item.id === id);
        if (topic) {
          setActiveLesson(topic);
        }
        return;
      }

      const topicId = id.replace(/^t_/, '');
      const group = phase.groups.find(g => g.items.some(t => t.id === topicId));
      const topic = group?.items.find(t => t.id === topicId);
      if (topic) setActiveLesson(topic);
    } else if (type === 'project') {
      const project = phase.projects.find(pr => pr.id === id);
      if (project) setActiveProject(project);
    } else if (type === 'gate') {
      setActiveGatePhase(phase);
      setActiveGateIdx(phaseIndex);
    }
  };

  const handleCelebration = (msg: string) => {
    triggerConfetti();
    playSound('success');
    showToast(msg);
  };

  const handleLevelClick = () => {
    if (!stats) return;
    setStatsModalType('level');
    setStatsModalData({
      level: stats.level,
      rank: getRankName(stats.level),
      xp: stats.xp
    });
    setStatsModalOpen(true);
  };

  const handleBuyFreezeClick = () => {
    if (!stats) return;
    
    if (stats.freezes >= 2) {
      playSound('locked');
      setStatsModalType('freeze_error');
      setStatsModalData({
        errorMessage: "Maximum 2 Streak Freezes allowed. You already have 2!"
      });
      setStatsModalOpen(true);
      return;
    }
    
    if (stats.xp < 50) {
      playSound('locked');
      setStatsModalType('freeze_error');
      setStatsModalData({
        errorMessage: `Need 50 XP to buy a Streak Freeze.\n(Current: ${stats.xp} XP, Cost: 50 XP)`
      });
      setStatsModalOpen(true);
      return;
    }

    setStatsModalType('freeze_confirm');
    setStatsModalData({
      freezes: stats.freezes,
      xp: stats.xp,
      onConfirm: async () => {
        try {
          await updateStats({
            xp: stats.xp - 50,
            freezes: stats.freezes + 1
          });
          playSound('success');
          triggerConfetti();
          
          setTimeout(() => {
            setStatsModalType('freeze_success');
            setStatsModalData({
              freezes: stats.freezes + 1
            });
            setStatsModalOpen(true);
          }, 300);
        } catch (e) {
          console.error(e);
          alert("Purchase failed.");
        }
      }
    });
    setStatsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-page)] text-[var(--text-main)] font-black gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-green)] border-t-transparent"></div>
        <span>Loading Command Deck...</span>
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pomoRunning={pomoRunning}
        pomoMode={pomoMode}
      />

      {/* Mobile HUD Header */}
      <header className="mobile-hud">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Mascot" className="w-[36px] h-[36px] object-contain rounded-lg" />
          <h1 className="brand-title text-sm">ZERO TO AI</h1>
        </div>
        <HUD 
          onTabChange={setActiveTab} 
          onLevelClick={handleLevelClick}
          onBuyFreezeClick={handleBuyFreezeClick}
        />
      </header>

      {/* Main Content Column */}
      <main className="main-content">
        {/* Migration Banner alert */}
        {showMigrationBanner && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 text-left border-3 border-[var(--color-blue)] rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
            <div>
              <strong className="text-sm text-[var(--text-main)] block">⚡ Offline Progress Found!</strong>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-medium leading-relaxed">
                We detected local storage progress from your previous Command Deck session. Import it to sync it securely with your cloud account.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleMigration}
                disabled={migrating}
                className="btn-chunky btn-green text-xs font-bold text-white py-2 px-4 shadow-sm"
              >
                {migrating ? 'Syncing...' : 'Import Progress'}
              </button>
              <button
                onClick={dismissMigration}
                className="btn-chunky btn-gray text-xs font-bold py-2 px-3 shadow-sm border border-[var(--border-color)]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tab Routing (Persistent Mounting to prevent unmounting reloads and state resets) */}
        <div className={activeTab === 'roadmap' ? 'flex flex-col gap-6' : 'hidden'}>
          <div className="commitment-card text-left">
            <strong>Commitment Zone</strong>
            Phase 0 & Phase 1 are active. Phases 2 & 3 are parked on purpose — not a backlog! Focus on code-first principles, not the polish.
          </div>
          
          {/* Highlight Active Quest Banner */}
          <QuestCard
            onNodeClick={handleNodeClick}
            onFocusClick={(topicId) => {
              const phase = roadmap.find(ph => ph.groups.some(g => g.items.some(t => t.id === topicId)));
              const group = phase?.groups.find(g => g.items.some(t => t.id === topicId));
              const topic = group?.items.find(t => t.id === topicId);
              if (topic) {
                playSound('click');
                setActiveFocusTopic(topic);
              }
            }}
          />

          {/* Learning Path */}
          <LearningPath onNodeClick={handleNodeClick} />
        </div>

        <div className={activeTab === 'meta' ? '' : 'hidden'}>
          <MetaLearning />
        </div>

        <div className={activeTab === 'stats' ? '' : 'hidden'}>
          <StatsDashboard />
        </div>

        <div className={activeTab === 'tools' ? '' : 'hidden'}>
          <WorkspaceTools
            pomoRunning={pomoRunning}
            setPomoRunning={setPomoRunning}
            pomoMode={pomoMode}
            setPomoMode={setPomoMode}
            onCelebrationTrigger={handleCelebration}
          />
        </div>

        <div className={activeTab === 'settings' ? '' : 'hidden'}>
          <SettingsTab />
        </div>
      </main>

      {/* Desktop Right Sidebar Widgets */}
      <aside className="right-sidebar">
        <HUD 
          onTabChange={setActiveTab} 
          onLevelClick={handleLevelClick}
          onBuyFreezeClick={handleBuyFreezeClick}
        />
        
        {/* Right Quest Card */}
        <div className={activeTab === 'roadmap' ? '' : 'hidden'}>
          <QuestCard
            onNodeClick={handleNodeClick}
            onFocusClick={(topicId) => {
              const phase = roadmap.find(ph => ph.groups.some(g => g.items.some(t => t.id === topicId)));
              const group = phase?.groups.find(g => g.items.some(t => t.id === topicId));
              const topic = group?.items.find(t => t.id === topicId);
              if (topic) {
                playSound('click');
                setActiveFocusTopic(topic);
              }
            }}
          />
        </div>

        {/* Inline calendar */}
        <StatsDashboard />
      </aside>

      {/* Mobile bottom navigation bar */}
      <nav className="mobile-nav-bar">
        <button
          onClick={() => { playSound('click'); setActiveTab('roadmap'); }}
          className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          Path
        </button>
        <button
          onClick={() => { playSound('click'); setActiveTab('meta'); }}
          className={`nav-item ${activeTab === 'meta' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5.47 18.6L12 22l6.53-3.4L12 15.2L5.47 18.6z"/></svg>
          Meta
        </button>
        <button
          onClick={() => { playSound('click'); setActiveTab('stats'); }}
          className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          Stats
        </button>
        <button
          onClick={() => { playSound('click'); setActiveTab('tools'); }}
          className={`nav-item ${activeTab === 'tools' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
          Tools
        </button>
        <button
          onClick={() => { playSound('click'); setActiveTab('settings'); }}
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
          Backup
        </button>
      </nav>

      {/* ================= MODAL MOUNTS ================= */}
      {activeLesson && (
        <LessonModal
          isOpen={true}
          onClose={() => setActiveLesson(null)}
          topic={activeLesson}
          phaseIndex={roadmap.findIndex(ph => ph.groups.some(g => g.items.some(t => t.id === activeLesson.id)))}
          onFocusClick={() => {
            setActiveFocusTopic(activeLesson);
          }}
          onCompleteToast={() => handleCelebration("Nice job! Topic completed! +10 XP 🔥")}
        />
      )}

      {activeProject && (
        <ProjectModal
          isOpen={true}
          onClose={() => setActiveProject(null)}
          project={activeProject}
          onProjectComplete={handleCelebration}
        />
      )}

      {activeGatePhase && (
        <GateModal
          isOpen={true}
          onClose={() => setActiveGatePhase(null)}
          phase={activeGatePhase}
          phaseIdx={activeGateIdx}
          onGateUnlocked={handleCelebration}
        />
      )}

      {activeFocusTopic && (
        <FocusOverlay
          isOpen={true}
          onClose={() => setActiveFocusTopic(null)}
          topic={activeFocusTopic}
          onCompleteToast={() => handleCelebration("Milestone finished! +10 XP 🔥")}
        />
      )}

      <LevelUpModal
        isOpen={celebrationOpen}
        onClose={() => setCelebrationOpen(false)}
        type={celebrationType}
        data={celebrationData}
      />

      <StatsModal
        isOpen={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        type={statsModalType}
        data={statsModalData}
      />

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
};


export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
