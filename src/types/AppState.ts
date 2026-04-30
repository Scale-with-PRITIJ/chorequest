import { User } from './User';
import { Chore } from './Chore';
import { Reward } from './Reward';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedBy: string[];
}

export interface AppState {
  users: User[];
  chores: Chore[];
  rewards: Reward[];
  badges: Badge[];
  currentUser: User | null;
}
