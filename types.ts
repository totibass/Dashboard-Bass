
export enum TaskType {
  TECHNIQUE = 'Technique',
  THEORY = 'Théorie',
  REPERTOIRE = 'Répertoire',
  EAR_TRAINING = 'Oreille',
  IMPROVISATION = 'Improvisation',
  RHYTHM = 'Rythme'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  durationMinutes: number;
  completed: boolean;
  isReview: boolean; // Is this a Spaced Repetition review?
  originalLessonId?: string; // Links back to the original lesson for reviews
  
  // New fields for adaptive learning
  minStrings?: number; // 4, 5, or 6
  requiredSkill?: string; // Key in knownSkills. If true, user might skip basic versions.
}

export interface DayPlan {
  date: string; // ISO string YYYY-MM-DD
  dayIndex: number; // 1 to 90
  tasks: Task[];
  isRestDay: boolean;
  weekNumber: number;
}

export interface UserSettings {
  startDate: string;
  weeklyAvailability: {
    [key: string]: boolean; // 'Mon': true, 'Tue': false...
  };
  dailyMinutes: number;
  userName: string;
  bassType: '4' | '5' | '6';
  knownSkills: {
    // Basics
    holding_posture: boolean;
    tuning: boolean;
    // Right Hand
    alternate_plucking: boolean;
    raking: boolean;
    floating_thumb: boolean;
    // Left Hand
    shifting: boolean;
    hammer_pull: boolean;
    // Theory / Fretboard
    notes_first_5_frets: boolean;
    major_scale_shape: boolean;
    intervals_basic: boolean;
    // Advanced
    slap_basic: boolean;
    tapping: boolean;
    chords: boolean;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
