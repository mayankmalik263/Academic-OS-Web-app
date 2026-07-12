import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type { Profile, Stats } from '../types/database';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  stats: Stats | null;
  progress: Record<string, boolean>;
  activityDates: string[];
  consumedFreezeDates: string[];
  achievements: string[];
  brainDump: string;
  lastSyncedAt: Date | null;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  toggleProgress: (checkId: string, value: boolean) => Promise<void>;
  addActivityDate: (dateStr: string) => Promise<void>;
  updateStats: (updates: Partial<Stats>) => Promise<void>;
  updateBrainDump: (content: string) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  consumeFreeze: (dateStr: string) => Promise<void>;
  importLegacyData: (legacyData: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Dashboard state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [activityDates, setActivityDates] = useState<string[]>([]);
  const [consumedFreezeDates, setConsumedFreezeDates] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [brainDump, setBrainDump] = useState<string>('');
  // Client-side "last synced" marker. Only advanced after a confirmed successful
  // Supabase write (see markSynced usage), so the sidebar indicator never lies.
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const clearState = () => {
    setProfile(null);
    setStats(null);
    setProgress({});
    setActivityDates([]);
    setConsumedFreezeDates([]);
    setAchievements([]);
    setBrainDump('');
    setLastSyncedAt(null);
  };

  const refreshUserData = async (currentUser: User) => {
    try {
      // Fetch all tables in parallel to optimize load times
      const [
        profileRes,
        statsRes,
        dumpRes,
        progressRes,
        activityRes,
        freezeRes,
        achievementsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', currentUser.id).single(),
        supabase.from('stats').select('*').eq('user_id', currentUser.id).single(),
        supabase.from('brain_dump').select('*').eq('user_id', currentUser.id).single(),
        supabase.from('progress').select('check_id, state').eq('user_id', currentUser.id),
        supabase.from('activity').select('activity_date').eq('user_id', currentUser.id),
        supabase.from('consumed_freezes').select('freeze_date').eq('user_id', currentUser.id),
        supabase.from('achievements').select('achievement_id').eq('user_id', currentUser.id)
      ]);

      // 1. Process Profile
      if (profileRes.error && profileRes.error.code === 'PGRST116') {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            display_name: currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || 'Explorer',
            avatar_seed: '#05C46B',
            theme: 'dark'
          })
          .select()
          .single();
        if (newProfile) setProfile(newProfile);
      } else if (profileRes.data) {
        setProfile(profileRes.data);
      }

      // 2. Process Stats
      if (statsRes.error && statsRes.error.code === 'PGRST116') {
        const { data: newStats } = await supabase
          .from('stats')
          .insert({
            user_id: currentUser.id,
            xp: 0,
            level: 1,
            current_streak: 0,
            longest_streak: 0,
            freezes: 1
          })
          .select()
          .single();
        if (newStats) setStats(newStats);
      } else if (statsRes.data) {
        setStats(statsRes.data);
      }

      // 3. Process Brain Dump
      if (dumpRes.error && dumpRes.error.code === 'PGRST116') {
        const { data: newDump } = await supabase
          .from('brain_dump')
          .insert({ user_id: currentUser.id, content: '' })
          .select()
          .single();
        if (newDump) setBrainDump(newDump.content);
      } else if (dumpRes.data) {
        setBrainDump(dumpRes.data.content);
      }

      // 4. Process Progress Checkmarks
      if (progressRes.data) {
        const progMap: Record<string, boolean> = {};
        progressRes.data.forEach((item: any) => {
          progMap[item.check_id] = item.state;
        });
        setProgress(progMap);
      }

      // 5. Process Activity Dates
      if (activityRes.data) {
        setActivityDates(activityRes.data.map((item: any) => item.activity_date));
      }

      // 6. Process Consumed Freezes
      if (freezeRes.data) {
        setConsumedFreezeDates(freezeRes.data.map((item: any) => item.freeze_date));
      }

      // 7. Process Achievements
      if (achievementsRes.data) {
        setAchievements(achievementsRes.data.map((item: any) => item.achievement_id));
      }

    } catch (err) {
      console.error('Error fetching user dashboard data from Supabase:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        setSession(activeSession);
        setUser(activeSession?.user ?? null);

        if (activeSession?.user) {
          await refreshUserData(activeSession.user);
        }
      } catch (err) {
        console.error("Error getting initial session:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;
        
        // Skip INITIAL_SESSION since initializeAuth handles it
        if (_event === 'INITIAL_SESSION') return;

        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          try {
            await refreshUserData(newSession.user);
          } catch (err) {
            console.error("Error in auth refresh:", err);
          }
        } else {
          clearState();
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    clearState();
  };

  // State mutation functions linked to Supabase
  const toggleProgress = async (checkId: string, value: boolean) => {
    if (!user) return;
    
    try {
      let error;
      if (value) {
        ({ error } = await supabase
          .from('progress')
          .upsert({ user_id: user.id, check_id: checkId, state: true }));

        // Update local state immediately for snappy UX
        setProgress(prev => ({ ...prev, [checkId]: true }));
      } else {
        ({ error } = await supabase
          .from('progress')
          .delete()
          .match({ user_id: user.id, check_id: checkId }));

        setProgress(prev => {
          const next = { ...prev };
          delete next[checkId];
          return next;
        });
      }
      if (!error) setLastSyncedAt(new Date());
    } catch (e) {
      console.error('Error toggling progress:', e);
    }
  };

  const addActivityDate = async (dateStr: string) => {
    if (!user || activityDates.includes(dateStr)) return;
    
    try {
      const { error } = await supabase
        .from('activity')
        .upsert({ user_id: user.id, activity_date: dateStr });

      setActivityDates(prev => [...prev, dateStr]);
      if (!error) setLastSyncedAt(new Date());
    } catch (e) {
      console.error('Error logging activity date:', e);
    }
  };

  const updateStats = async (updates: Partial<Stats>) => {
    if (!user || !stats) return;
    
    try {
      const newStats = { ...stats, ...updates };
      delete (newStats as any).user_id; // prevent primary key update issues

      const { error } = await supabase
        .from('stats')
        .update(newStats)
        .eq('user_id', user.id);

      setStats(prev => prev ? { ...prev, ...updates } : null);
      if (!error) setLastSyncedAt(new Date());
    } catch (e) {
      console.error('Error updating stats:', e);
    }
  };

  const updateBrainDump = async (content: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('brain_dump')
        .upsert({ user_id: user.id, content });

      setBrainDump(content);
      if (!error) setLastSyncedAt(new Date());
    } catch (e) {
      console.error('Error saving brain dump:', e);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!user || achievements.includes(achievementId)) return;
    
    try {
      const { error } = await supabase
        .from('achievements')
        .upsert({ user_id: user.id, achievement_id: achievementId });

      setAchievements(prev => [...prev, achievementId]);
      if (!error) setLastSyncedAt(new Date());
    } catch (e) {
      console.error('Error unlocking achievement:', e);
    }
  };

  const consumeFreeze = async (dateStr: string) => {
    if (!user || consumedFreezeDates.includes(dateStr)) return;
    
    try {
      const { error } = await supabase
        .from('consumed_freezes')
        .upsert({ user_id: user.id, freeze_date: dateStr });

      setConsumedFreezeDates(prev => [...prev, dateStr]);
      if (!error) setLastSyncedAt(new Date());
    } catch (e) {
      console.error('Error recording consumed freeze:', e);
    }
  };

  // Helper to import legacy JSON backups directly to Supabase
  const importLegacyData = async (legacyData: any): Promise<boolean> => {
    if (!user || !legacyData) return false;
    
    try {
      // 1. Upload progress checks
      const checks = legacyData.checks || {};
      const progressInserts = Object.keys(checks)
        .filter(check_id => checks[check_id])
        .map(check_id => ({
          user_id: user.id,
          check_id,
          state: true
        }));
      
      if (progressInserts.length > 0) {
        await supabase.from('progress').upsert(progressInserts);
      }

      // 2. Upload activity dates
      const dates = legacyData.activityDates || [];
      const activityInserts = dates.map((dateStr: string) => ({
        user_id: user.id,
        activity_date: dateStr
      }));
      
      if (activityInserts.length > 0) {
        await supabase.from('activity').upsert(activityInserts);
      }

      // 3. Upload consumed freeze dates
      const freezesDates = legacyData.consumedFreezeDates || [];
      const freezeInserts = freezesDates.map((dateStr: string) => ({
        user_id: user.id,
        freeze_date: dateStr
      }));
      
      if (freezeInserts.length > 0) {
        await supabase.from('consumed_freezes').upsert(freezeInserts);
      }

      // 4. Upload achievements
      const achs = legacyData.achievements || [];
      const achievementInserts = achs.map((achievement_id: string) => ({
        user_id: user.id,
        achievement_id
      }));
      
      if (achievementInserts.length > 0) {
        await supabase.from('achievements').upsert(achievementInserts);
      }

      // 5. Update Brain Dump notepad
      if (legacyData.dump) {
        await supabase
          .from('brain_dump')
          .upsert({ user_id: user.id, content: legacyData.dump });
      }

      // 6. Update Stats
      const finalXP = progressInserts.reduce((acc, curr) => {
        const id = curr.check_id;
        if (id.startsWith('t_')) return acc + 10;
        if (id.startsWith('pp_')) return acc + 10;
        if (id.startsWith('pb_')) return acc + 15;
        if (id.startsWith('pd_')) return acc + 20;
        if (id.startsWith('gate_')) return acc + 30;
        return acc;
      }, 0);

      // Simple calculation for Level
      let finalLevel = 1;
      if (finalXP >= 2700) finalLevel = 10 + Math.floor((finalXP - 2700) / 500);
      else if (finalXP >= 2200) finalLevel = 9;
      else if (finalXP >= 1750) finalLevel = 8;
      else if (finalXP >= 1350) finalLevel = 7;
      else if (finalXP >= 1000) finalLevel = 6;
      else if (finalXP >= 700) finalLevel = 5;
      else if (finalXP >= 450) finalLevel = 4;
      else if (finalXP >= 250) finalLevel = 3;
      else if (finalXP >= 100) finalLevel = 2;

      const finalStats: Partial<Stats> = {
        xp: finalXP,
        level: finalLevel,
        current_streak: legacyData.currentStreak || 0,
        longest_streak: legacyData.maxStreak || 0,
        freezes: legacyData.freezes !== undefined ? legacyData.freezes : 1
      };
      
      await supabase
        .from('stats')
        .update(finalStats)
        .eq('user_id', user.id);

      // Re-trigger global sync
      await refreshUserData();
      return true;
    } catch (e) {
      console.error('Error migrating local storage progress:', e);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profile,
        stats,
        progress,
        activityDates,
        consumedFreezeDates,
        achievements,
        brainDump,
        lastSyncedAt,
        signOut,
        refreshUserData,
        toggleProgress,
        addActivityDate,
        updateStats,
        updateBrainDump,
        unlockAchievement,
        consumeFreeze,
        importLegacyData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
