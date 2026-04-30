import { Parent } from './Parent';
import { Child } from './Child';
import { Quest } from './Quest';
import { Reward } from './Reward';

export interface AppState {
  users: (Parent | Child)[];
  quests: Quest[];
  rewards: Reward[];
}
