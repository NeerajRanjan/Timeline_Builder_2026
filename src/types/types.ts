export interface GoalItem {
  id: string;
  title: string;
  category: 'health' | 'career' | 'skill' | 'finance' | 'personal' | 'relationship';
  color: string;
}

export interface PlacedGoal extends GoalItem {
  monthIndex: number; // 0 = Jan, 11 = Dec
  suggestion?: string;
  frequency?: string;
}

export interface AppState {
  screen: 'onboarding' | 'builder' | 'summary';
  userName: string;
  placedGoals: PlacedGoal[];
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PREDEFINED_GOALS: GoalItem[] = [
  { id: 'g1', title: 'Learn Guitar', category: 'skill', color: 'bg-orange-500' },
  { id: 'g2', title: 'Lose 5kg', category: 'health', color: 'bg-emerald-500' },
  { id: 'g3', title: 'Read 12 Books', category: 'personal', color: 'bg-blue-500' },
  { id: 'g4', title: 'Start YouTube', category: 'career', color: 'bg-red-500' },
  { id: 'g5', title: 'Save ₹50k/mo', category: 'finance', color: 'bg-yellow-500' },
  { id: 'g6', title: 'Run a Marathon', category: 'health', color: 'bg-green-500' },
  { id: 'g7', title: 'Learn Spanish', category: 'skill', color: 'bg-pink-500' },
  { id: 'g8', title: 'Meditate Daily', category: 'health', color: 'bg-purple-500' },
];