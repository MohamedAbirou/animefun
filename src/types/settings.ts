export interface Settings {
  id: string;
  key: string;
  value: LockerSettings[];
  created_at: string;
  updated_at: string;
}

export interface LockerSettings {
  wallpapers_enabled: boolean;
  quizzes_enabled: boolean;
  games_enabled: boolean;
}