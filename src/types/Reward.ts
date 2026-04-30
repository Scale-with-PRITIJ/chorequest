export interface Reward {
  id: string;
  title: string;
  cost: number;
  isClaimed: boolean;
  claimedBy?: string;
  assignedTo?: string; // If empty/undefined, available to all kids
}
