export interface Reward {
  id: string;
  title: string;
  cost: number;
  isClaimed: boolean;
  claimedBy?: string;
}
