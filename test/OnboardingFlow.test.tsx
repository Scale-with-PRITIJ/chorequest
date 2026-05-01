import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginRegister } from '../src/components/LoginRegister';
import { ParentDashboard } from '../src/components/ParentDashboard';
import { ProfileSwitcher } from '../src/components/ProfileSwitcher';
import * as FamilyContext from '../src/lib/FamilyContext';
import * as firebase from '../src/lib/firebase';
import React from 'react';

// Mocking dependencies
vi.mock('../src/lib/firebase', () => ({
  auth: {},
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
}));

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('Onboarding Flow - Professional Implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  describe('Registration Logic', () => {
    it('captures name and gender and saves to localStorage on signup', async () => {
      render(<LoginRegister onSuccess={() => {}} />);
      
      // Switch to Register
      fireEvent.click(screen.getByText('Register here'));
      
      const nameInput = screen.getByLabelText(/Your Name/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const genderSelect = screen.getByLabelText(/Your Gender/i);
      
      fireEvent.change(nameInput, { target: { value: 'Parent Leo' } });
      fireEvent.change(emailInput, { target: { value: 'leo@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(genderSelect, { target: { value: 'male' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
      
      await waitFor(() => {
        expect(window.localStorage.getItem('chorequest_signup_name')).toBe('Parent Leo');
        expect(window.localStorage.getItem('chorequest_signup_gender')).toBe('male');
      });
      expect(firebase.createUserWithEmailAndPassword).toHaveBeenCalled();
    });

    it('defaults to other if no gender is explicitly changed', async () => {
      render(<LoginRegister onSuccess={() => {}} />);
      fireEvent.click(screen.getByText('Register here'));
      fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'Tester' } });
      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
      
      await waitFor(() => {
        expect(window.localStorage.getItem('chorequest_signup_gender')).toBe('other');
      });
    });
  });

  describe('ProfileSwitcher - Wizard Removal', () => {
    it('does NOT show the Welcome Wizard even if users list is empty', () => {
      const mockContext = {
        users: [],
        addUser: vi.fn(),
        updateUser: vi.fn(),
      };
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue(mockContext as any);
      
      render(<ProfileSwitcher onSelect={() => {}} />);
      
      expect(screen.queryByText(/Welcome to ChoreQuest!/i)).toBeNull();
      expect(screen.getByText(/Who is playing today?/i)).not.toBeNull();
    });
  });

  describe('ParentDashboard - Themed Empty State', () => {
    it('displays the Quest themed empty state when no children are present', () => {
      const mockContext = {
        users: [{ id: 'p1', name: 'Parent', role: 'parent' }],
        chores: [],
        rewards: [],
        currentUser: { id: 'p1', name: 'Parent', role: 'parent' },
        addUser: vi.fn(),
        addChore: vi.fn(),
        addReward: vi.fn(),
      };
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue(mockContext as any);
      
      render(<ParentDashboard />);
      
      expect(screen.getByText(/Your family quest begins here!/i)).not.toBeNull();
      expect(screen.getByText(/Add your kids to start their adventure/i)).not.toBeNull();
      // Use getByText for the button since Base UI wraps it in another button
      expect(screen.getByText(/Add Your First Member/i)).not.toBeNull();
    });

    it('does NOT show empty state if children are present', () => {
      const mockContext = {
        users: [
          { id: 'p1', name: 'Parent', role: 'parent' },
          { id: 'c1', name: 'Child', role: 'child', level: 1, points: 0, avatar: '' }
        ],
        chores: [],
        rewards: [],
        currentUser: { id: 'p1', name: 'Parent', role: 'parent' },
        addUser: vi.fn(),
      };
      vi.spyOn(FamilyContext, 'useFamily').mockReturnValue(mockContext as any);
      
      render(<ParentDashboard />);
      
      expect(screen.queryByText(/Your family quest begins here!/i)).toBeNull();
      expect(screen.getByText('Child')).not.toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('handles whitespace in names correctly', async () => {
      render(<LoginRegister onSuccess={() => {}} />);
      fireEvent.click(screen.getByText('Register here'));
      fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: '  Leo  ' } });
      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
      
      await waitFor(() => {
        expect(window.localStorage.getItem('chorequest_signup_name')).toBe('Leo');
      });
    });

    it('handles invite scenario correctly (conceptual)', async () => {
      render(<LoginRegister onSuccess={() => {}} />);
      fireEvent.click(screen.getByText('Register here'));
      fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'Invited Guest' } });
      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
      
      await waitFor(() => {
        expect(window.localStorage.getItem('chorequest_signup_name')).toBe('Invited Guest');
      });
    });
  });
});
