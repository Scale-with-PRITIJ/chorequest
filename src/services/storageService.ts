import { User, Chore, Reward, CreateUserPayload } from '../types';
import { auth } from '../lib/firebase';

class StorageService {
  private async getHeaders() {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error('Not authenticated: No Firebase user token available');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
    };
  }

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorBody = await res.text().catch(() => 'Unknown error');
      throw new Error(`API ${options?.method || 'GET'} ${url} failed (${res.status}): ${errorBody}`);
    }
    return res.json();
  }

  // ── Users ──────────────────────────────────────────────

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/family');
  }

  async updateUser(user: User): Promise<User> {
    return this.request<User>(`/api/family/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async addUser(userData: CreateUserPayload): Promise<User> {
    return this.request<User>('/api/family', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // ── Invites ────────────────────────────────────────────

  async checkInvite(email: string): Promise<{ hasInvite: boolean; familyId?: string }> {
    return this.request<{ hasInvite: boolean; familyId?: string }>(`/api/invites/check?email=${encodeURIComponent(email)}`);
  }

  async createInvite(email: string, inviterName?: string): Promise<void> {
    return this.request<void>('/api/invites', {
      method: 'POST',
      body: JSON.stringify({ email, inviterName }),
    });
  }

  // ── Quests / Chores ────────────────────────────────────

  async getQuests(): Promise<Chore[]> {
    return this.request<Chore[]>('/api/quests');
  }

  async addQuest(questData: Omit<Chore, 'id' | 'completedDates'>): Promise<Chore> {
    return this.request<Chore>('/api/quests', {
      method: 'POST',
      body: JSON.stringify(questData),
    });
  }

  async updateQuest(id: string, questData: Partial<Chore>): Promise<Chore> {
    return this.request<Chore>(`/api/quests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questData),
    });
  }

  async deleteQuest(id: string): Promise<void> {
    return this.request<void>(`/api/quests/${id}`, {
      method: 'DELETE',
    });
  }

  async completeQuest(questId: string, userId: string, date?: string): Promise<{ quest: Chore; user: User }> {
    return this.request<{ quest: Chore; user: User }>(`/api/quests/${questId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ userId, date }),
    });
  }

  // ── Rewards ────────────────────────────────────────────

  async getRewards(): Promise<Reward[]> {
    return this.request<Reward[]>('/api/rewards');
  }

  async addReward(rewardData: Omit<Reward, 'id' | 'isClaimed'>): Promise<Reward> {
    return this.request<Reward>('/api/rewards', {
      method: 'POST',
      body: JSON.stringify(rewardData),
    });
  }

  async updateReward(id: string, rewardData: Partial<Reward>): Promise<Reward> {
    return this.request<Reward>(`/api/rewards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rewardData),
    });
  }

  async deleteReward(id: string): Promise<void> {
    return this.request<void>(`/api/rewards/${id}`, {
      method: 'DELETE',
    });
  }

  async claimReward(rewardId: string, userId: string): Promise<{ reward: Reward; user: User }> {
    return this.request<{ reward: Reward; user: User }>('/api/rewards/claim', {
      method: 'POST',
      body: JSON.stringify({ rewardId, userId }),
    });
  }
}

export const storageService = new StorageService();
