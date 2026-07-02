export interface Profile {
  id: string;
  display_name: string;
  avatar_seed: string;
  theme: string;
  updated_at?: string;
}

export interface Stats {
  user_id: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  freezes: number;
  updated_at?: string;
}

export interface ProgressItem {
  user_id: string;
  check_id: string;
  state: boolean;
  updated_at?: string;
}

export interface ActivityItem {
  user_id: string;
  activity_date: string;
}

export interface ConsumedFreezeItem {
  user_id: string;
  freeze_date: string;
}

export interface AchievementItem {
  user_id: string;
  achievement_id: string;
}

export interface BrainDump {
  user_id: string;
  content: string;
  updated_at?: string;
}

export interface UserDashboardData {
  profile: Profile | null;
  stats: Stats | null;
  progress: Record<string, boolean>;
  activityDates: string[];
  consumedFreezeDates: string[];
  achievements: string[];
  brainDump: string;
}
