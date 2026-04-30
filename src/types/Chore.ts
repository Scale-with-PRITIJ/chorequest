export type ChoreFrequency = 'daily' | 'weekly';

export interface Chore {
  id: string;
  title: string;
  description: string;
  points: number;
  frequency: ChoreFrequency;
  assignedTo: string;
  daysOfWeek?: number[]; // 0=Sun, 1=Mon, etc. (used for weekly frequency)
  completedDates: string[]; // ISO strings
}

export interface Quest extends Chore {}
