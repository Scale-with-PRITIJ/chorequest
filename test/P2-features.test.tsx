import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppContent } from '../src/App';
import { VirtualPet } from '../src/components/VirtualPet';
import { ProfileSwitcher } from '../src/components/ProfileSwitcher';
import * as FamilyContext from '../src/lib/FamilyContext';
import React from 'react';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('../src/lib/firebase', () => ({
  auth: { currentUser: { uid: '123' } },
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => {
    return vi.fn();
  }),
}));

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
});

// Mock fetch for AppContent
global.fetch = vi.fn().mockResolvedValue({
  json: vi.fn().mockResolvedValue({ status: 'ok' })
});

describe('P2 Normal Issues & Bug Fixes', () => {
  describe('Header UI Updates', () => {
    it('displays the child avatar in the header when logged in as a child', () => {
      const mockChild = {
        id: 'child1',
        name: 'Leo',
        role: 'child',
        points: 100,
        level: 1,
        gender: 'other',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
        pet: { type: 'cat', name: 'Bud', stage: 3, accessories: [] }
      };

      const mockFamilyContext = {
        users: [mockChild],
        chores: [],
        rewards: [],
        currentUser: mockChild,
        isAuthenticated: true,
        firebaseUser: { uid: '123' },
        setCurrentUser: vi.fn(),
      };

      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue(mockFamilyContext as any);

      const { container } = render(<AppContent />);
      
      // The child's name should be visible
      expect(screen.getByText('Leo')).not.toBeNull();
      
      // There should be an image with the child's avatar in the header
      const headerImg = container.querySelector('header img') as HTMLImageElement;
      expect(headerImg).not.toBeNull();
      expect(headerImg.src).toContain('Leo');
    });
  });

  describe('Virtual Pet Visual Variants', () => {
    it('renders a Dragon with wings and horns when stage > 0', () => {
      const pet = { type: 'dragon', name: 'Drago', stage: 2, accessories: [] };
      const { container } = render(<VirtualPet pet={pet} />);
      
      // Should contain orange color fill
      expect(container.innerHTML).toContain('#f97316');
      // Should contain secondary color (gold/yellow for horns/wings)
      expect(container.innerHTML).toContain('#fbbf24');
    });

    it('renders a Cat with ears and whiskers when stage >= 2', () => {
      const pet = { type: 'cat', name: 'Bud', stage: 3, accessories: [] };
      const { container } = render(<VirtualPet pet={pet} />);
      
      // Should contain blue color fill
      expect(container.innerHTML).toContain('#3b82f6');
      
      // Should contain <g> for whiskers which we added for cats at stage >= 2
      expect(container.innerHTML).toContain('stroke="#64748b"');
    });

    it('renders a Dog with floppy ears when stage > 0', () => {
      const pet = { type: 'dog', name: 'Rex', stage: 2, accessories: [] };
      const { container } = render(<VirtualPet pet={pet} />);
      
      // Should contain purple color fill
      expect(container.innerHTML).toContain('#8b5cf6');
      
      // Should contain snout which we added for dogs at stage >= 2
      expect(container.innerHTML).toContain('r="8"');
    });
    
    it('renders a Unicorn with magic sparkles when stage >= 3', () => {
      const pet = { type: 'unicorn', name: 'Uni', stage: 3, accessories: [] };
      const { container } = render(<VirtualPet pet={pet} />);
      
      // Should contain pink color fill
      expect(container.innerHTML).toContain('#ec4899');
      
      // Should contain sparkles (circle with gold fill)
      expect(container.innerHTML).toContain('#fbbf24');
      // Must have the horn path
      expect(container.innerHTML).toContain('M50 25 L');
    });
  });

});
