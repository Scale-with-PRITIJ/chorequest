import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ChildDashboard } from '../src/components/ChildDashboard';
import { ParentDashboard } from '../src/components/ParentDashboard';
import { ProfileSwitcher } from '../src/components/ProfileSwitcher';
import * as FamilyContext from '../src/lib/FamilyContext';
import React from 'react';

// Mock confetti
vi.mock('canvas-confetti', () => {
  return { default: vi.fn() };
});

vi.mock('../src/lib/firebase', () => ({
  auth: {},
  signOut: vi.fn(),
}));

vi.mock('../src/services/storageService', () => ({
  storageService: { createInvite: vi.fn() }
}));

describe('P0 Production Readiness Fixes - Comprehensive Edge Cases', () => {
  const mockUser = {
    id: 'child1',
    name: 'Leo',
    role: 'child',
    points: 100,
    level: 1,
    gender: 'other',
    avatar: ''
  };

  const mockFamilyContext = {
    users: [
      mockUser, 
      { id: 'parent1', name: 'Mom', role: 'parent', pin: '1234' }
    ],
    chores: [],
    rewards: [],
    currentUser: null,
    addChore: vi.fn(),
    updateChore: vi.fn(),
    deleteChore: vi.fn(),
    addReward: vi.fn(),
    updateReward: vi.fn(),
    deleteReward: vi.fn(),
    addUser: vi.fn(),
    updateUser: vi.fn(),
    completeChore: vi.fn().mockResolvedValue(undefined),
    claimReward: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(FamilyContext, 'useFamily').mockReturnValue(mockFamilyContext as any);
  });

  describe('Issue 1 & 5: ParentDashboard Empty States & Restock', () => {
    it('shows empty state for chores when chores array is explicitly empty', () => {
      render(<ParentDashboard />);
      fireEvent.click(screen.getByText('Manage Chores'));
      expect(screen.getByText('No quests yet!')).not.toBeNull();
      expect(screen.queryByText('CheckCircle')).toBeNull(); // Ensure no chores are rendered
    });

    it('shows empty state for rewards when rewards array is explicitly empty', () => {
      render(<ParentDashboard />);
      fireEvent.click(screen.getByText('Manage Rewards'));
      expect(screen.getByText('No rewards yet!')).not.toBeNull();
    });

    it('shows restock button ONLY for claimed rewards (Edge Case)', () => {
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        rewards: [
          { id: 'r1', title: 'Claimed Reward', cost: 50, isClaimed: true },
          { id: 'r2', title: 'Unclaimed Reward', cost: 50, isClaimed: false }
        ]
      } as any);
      render(<ParentDashboard />);
      fireEvent.click(screen.getByText('Manage Rewards'));
      
      const restockButtons = screen.getAllByText('Restock');
      expect(restockButtons.length).toBe(1); // Only one restock button should exist
    });

    it('calls updateReward with isClaimed: false when Restock is clicked (Edge Case)', () => {
      const updateRewardMock = vi.fn();
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        updateReward: updateRewardMock,
        rewards: [{ id: 'r1', title: 'Claimed Reward', cost: 50, isClaimed: true }]
      } as any);
      
      render(<ParentDashboard />);
      fireEvent.click(screen.getByText('Manage Rewards'));
      fireEvent.click(screen.getByText('Restock'));
      
      expect(updateRewardMock).toHaveBeenCalledWith('r1', { isClaimed: false });
    });
  });

  describe('Issue 2: ChildDashboard Filters & Edge Cases', () => {
    it('shows rewards with undefined or empty assignedTo, and assigned to self', () => {
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        rewards: [
          { id: 'r1', title: 'All Kids Reward (undefined)', cost: 10, isClaimed: false },
          { id: 'r2', title: 'All Kids Reward (empty string)', cost: 10, assignedTo: '', isClaimed: false },
          { id: 'r3', title: 'Leos Reward', cost: 10, assignedTo: 'child1', isClaimed: false },
          { id: 'r4', title: 'Siblings Reward', cost: 10, assignedTo: 'child2', isClaimed: false }
        ]
      } as any);

      render(<ChildDashboard user={mockUser as any} />);
      fireEvent.click(screen.getByText('Treasure Shop'));
      
      expect(screen.getByText('All Kids Reward (undefined)')).not.toBeNull();
      expect(screen.getByText('All Kids Reward (empty string)')).not.toBeNull();
      expect(screen.getByText('Leos Reward')).not.toBeNull();
      expect(screen.queryByText('Siblings Reward')).toBeNull(); // Sibling's reward is hidden
    });

    it('displays "Need X more" if points are insufficient (Edge Case)', () => {
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        rewards: [{ id: 'r1', title: 'Expensive Reward', cost: 500, isClaimed: false }] // user has 100
      } as any);

      render(<ChildDashboard user={mockUser as any} />);
      fireEvent.click(screen.getByText('Treasure Shop'));
      
      const button = screen.getByText('Need 400 more');
      expect(button).not.toBeNull();
      expect(button.closest('button')?.disabled).toBe(true);
    });

    it('displays "Claimed!" and disables button if reward is already claimed (Edge Case)', () => {
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        rewards: [{ id: 'r1', title: 'Claimed Item', cost: 50, isClaimed: true }]
      } as any);

      render(<ChildDashboard user={mockUser as any} />);
      fireEvent.click(screen.getByText('Treasure Shop'));
      
      const button = screen.getByText('Claimed!');
      expect(button).not.toBeNull();
      expect(button.closest('button')?.disabled).toBe(true);
    });
  });

  describe('Issue 3 & 8: ChildDashboard Loading and Error States', () => {
    it('sets loading state and calls completeChore successfully', async () => {
      const completeChoreMock = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        completeChore: completeChoreMock,
        chores: [{ id: 'c1', title: 'Daily Chore', points: 10, assignedTo: 'child1', frequency: 'daily', completedDates: [] }]
      } as any);

      render(<ChildDashboard user={mockUser as any} />);
      
      const doneButton = screen.getByText('Done!');
      await act(async () => {
        fireEvent.click(doneButton);
      });
      
      expect(completeChoreMock).toHaveBeenCalledWith('c1', 'child1');
    });

    it('displays error banner if completeChore throws an error (Edge Case)', async () => {
      const completeChoreMock = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        completeChore: completeChoreMock,
        chores: [{ id: 'c1', title: 'Daily Chore', points: 10, assignedTo: 'child1', frequency: 'daily', completedDates: [] }]
      } as any);

      render(<ChildDashboard user={mockUser as any} />);
      
      await act(async () => {
        fireEvent.click(screen.getByText('Done!'));
      });
      
      // The error banner should appear
      expect(screen.getByText('Oops! Something went wrong completing that chore.')).not.toBeNull();
    });

    it('displays error banner if claimReward throws an error (Edge Case)', async () => {
      const claimRewardMock = vi.fn().mockRejectedValue(new Error('Failed to claim'));
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        claimReward: claimRewardMock,
        rewards: [{ id: 'r1', title: 'Affordable Reward', cost: 50, isClaimed: false }]
      } as any);

      render(<ChildDashboard user={mockUser as any} />);
      fireEvent.click(screen.getByText('Treasure Shop'));
      
      await act(async () => {
        fireEvent.click(screen.getByText('Claim Treasure!'));
      });
      
      // The error banner should appear
      expect(screen.getByText('Oops! Something went wrong claiming that reward.')).not.toBeNull();
    });
  });

  describe('Issue 4: ProfileSwitcher', () => {
    it('does not contain the duplicate "Sign out of Family Account" ghost button', () => {
      render(<ProfileSwitcher onSelect={() => {}} />);
      expect(screen.queryByText('Sign out of Family Account')).toBeNull();
    });

    it('still correctly handles parent profile clicks and opens PIN dialog (Edge Case)', () => {
      render(<ProfileSwitcher onSelect={() => {}} />);
      
      // Click on Mom's profile
      fireEvent.click(screen.getByText('Mom'));
      
      // Dialog should open asking for PIN
      expect(screen.getByText('Enter Parent PIN')).not.toBeNull();
    });
  });
});
