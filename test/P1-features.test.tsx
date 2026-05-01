import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParentDashboard } from '../src/components/ParentDashboard';
import { ChildDashboard } from '../src/components/ChildDashboard';
import * as FamilyContext from '../src/lib/FamilyContext';
import React from 'react';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('../src/lib/firebase', () => ({
  auth: {},
  signOut: vi.fn(),
}));

vi.mock('../src/services/storageService', () => ({
  storageService: { createInvite: vi.fn() }
}));

describe('P1 Important Issues', () => {
  const mockChild = {
    id: 'child1',
    name: 'Leo',
    role: 'child',
    points: 100,
    level: 1,
    gender: 'other',
    avatar: ''
  };

  const mockFamilyContext = {
    users: [mockChild, { id: 'parent1', name: 'Mom', role: 'parent', pin: '1234' }],
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

  describe('Issue 6: Delete Confirmation Dialog', () => {
    it('shows confirmation dialog and calls deleteChore if confirmed', () => {
      const deleteChoreMock = vi.fn();
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        deleteChore: deleteChoreMock,
        chores: [{ id: 'c1', title: 'Test Chore', points: 10, assignedTo: 'child1', frequency: 'daily', completedDates: [] }]
      } as any);

      render(<ParentDashboard />);
      fireEvent.click(screen.getByText('Manage Chores'));
      
      const buttons = screen.getAllByRole('button');
      const deleteBtn = buttons[buttons.length - 1]; // Last button is trash
      
      fireEvent.click(deleteBtn); // Opens the dialog
      
      // Click the Delete button in the modal
      const modalDeleteBtn = screen.getAllByText('Delete').find(b => b.closest('button'));
      fireEvent.click(modalDeleteBtn as HTMLElement);
      
      expect(deleteChoreMock).toHaveBeenCalledWith('c1');
    });

    it('does NOT call deleteChore if confirmation is cancelled', () => {
      const deleteChoreMock = vi.fn();
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        deleteChore: deleteChoreMock,
        chores: [{ id: 'c1', title: 'Test Chore', points: 10, assignedTo: 'child1', frequency: 'daily', completedDates: [] }]
      } as any);

      render(<ParentDashboard />);
      fireEvent.click(screen.getByText('Manage Chores'));
      
      const buttons = screen.getAllByRole('button');
      const deleteBtn = buttons[buttons.length - 1];
      
      fireEvent.click(deleteBtn); // Opens the dialog
      
      // Click Cancel in the modal
      const modalCancelBtn = screen.getByText('Cancel');
      fireEvent.click(modalCancelBtn);
      
      expect(deleteChoreMock).not.toHaveBeenCalled();
    });

    it('shows confirmation dialog and calls deleteReward if confirmed', () => {
      const deleteRewardMock = vi.fn();
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        deleteReward: deleteRewardMock,
        rewards: [{ id: 'r1', title: 'Test Reward', cost: 10, isClaimed: false }]
      } as any);

      render(<ParentDashboard />);
      fireEvent.click(screen.getByText('Manage Rewards'));
      
      const buttons = screen.getAllByRole('button');
      const deleteBtn = buttons[buttons.length - 1];
      
      fireEvent.click(deleteBtn); // Opens the dialog
      
      const modalDeleteBtn = screen.getAllByText('Delete').find(b => b.closest('button'));
      fireEvent.click(modalDeleteBtn as HTMLElement);
      
      expect(deleteRewardMock).toHaveBeenCalledWith('r1');
    });
  });

  describe('Issue 10: Weekly chores in overview', () => {
    it('displays the Weekly badge in the ParentDashboard overview', () => {
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        chores: [
          { id: 'c1', title: 'Weekly Chore', points: 10, assignedTo: 'child1', frequency: 'weekly', completedDates: [] }
        ]
      } as any);

      render(<ParentDashboard />);
      expect(screen.getByText('0/1 Weekly')).not.toBeNull();
    });

    it('calculates weekly completions correctly', () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        chores: [
          { id: 'c1', title: 'Weekly Chore 1', points: 10, assignedTo: 'child1', frequency: 'weekly', completedDates: [todayStr] },
          { id: 'c2', title: 'Weekly Chore 2', points: 10, assignedTo: 'child1', frequency: 'weekly', completedDates: [] }
        ]
      } as any);

      render(<ParentDashboard />);
      expect(screen.getByText('1/2 Weekly')).not.toBeNull();
    });

    it('does NOT display Weekly badge if there are no weekly chores (Edge Case)', () => {
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        chores: [
          { id: 'c1', title: 'Daily Chore', points: 10, assignedTo: 'child1', frequency: 'daily', completedDates: [] }
        ]
      } as any);

      render(<ParentDashboard />);
      expect(screen.queryByText('0/0 Weekly')).toBeNull();
    });
  });

  describe('Issue 13: Hide empty description line', () => {
    it('renders description if it exists', () => {
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        chores: [{ id: 'c1', title: 'Task 1', description: 'Real Description', points: 10, assignedTo: 'child1', frequency: 'daily', completedDates: [] }]
      } as any);

      render(<ChildDashboard user={mockChild as any} />);
      expect(screen.getByText('Real Description')).not.toBeNull();
    });

    it('does NOT render empty description p tag if description is missing', () => {
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
        ...mockFamilyContext,
        chores: [{ id: 'c1', title: 'Task 1', description: '', points: 10, assignedTo: 'child1', frequency: 'daily', completedDates: [] }]
      } as any);

      const { container } = render(<ChildDashboard user={mockChild as any} />);
      // We check if an empty <p> with class "text-xs text-stone-500" exists inside the chore card.
      const descriptionParagraphs = container.querySelectorAll('.text-xs.text-stone-500');
      
      // Filter out any elements that might match but aren't empty descriptions
      const emptyDescriptions = Array.from(descriptionParagraphs).filter(p => p.textContent === '');
      expect(emptyDescriptions.length).toBe(0);
    });
  });
});
