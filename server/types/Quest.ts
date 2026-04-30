export type ChoreFrequency = 'daily' | 'weekly';

export interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  frequency: ChoreFrequency;
  assignedTo: string;
  completedDates: string[];
}
