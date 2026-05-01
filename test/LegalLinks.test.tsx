import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginRegister } from '../src/components/LoginRegister';
import { PrivacyPolicy } from '../src/components/PrivacyPolicy';
import { LandingPage } from '../src/components/LandingPage';
import { AppContent } from '../src/App';
import { FamilyProvider } from '../src/lib/FamilyContext';
import React from 'react';

// Mock dependencies
vi.mock('../src/lib/FamilyContext', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    FamilyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useFamily: vi.fn(() => ({
      currentUser: null,
      setCurrentUser: vi.fn(),
      isAuthenticated: false,
      loading: false,
      logout: vi.fn(),
      users: [],
    })),
  };
});

// Mock browser fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ status: 'ok' }),
  })
) as any;

describe('ChoreQuest Legal Integration & Edge Cases', () => {
  
  describe('LoginRegister Component', () => {
    it('should preserve form input when toggling between login and register', () => {
      render(
        <LoginRegister 
          onSuccess={() => {}} 
          onViewPrivacy={() => {}} 
          onViewTerms={() => {}} 
        />
      );

      const emailInput = screen.getByPlaceholderText(/parent@example.com/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput.value).toBe('test@example.com');

      const toggleButton = screen.getByText(/Register here/i);
      fireEvent.click(toggleButton);

      // Still should have the same email
      expect((screen.getByPlaceholderText(/parent@example.com/i) as HTMLInputElement).value).toBe('test@example.com');
    });

    it('should show the correct legal disclaimer on both login and register views', () => {
      const { rerender } = render(
        <LoginRegister 
          onSuccess={() => {}} 
          onViewPrivacy={() => {}} 
          onViewTerms={() => {}} 
        />
      );

      expect(screen.getByText(/By signing in to ChoreQuest, you agree to our/i)).toBeDefined();

      const toggleButton = screen.getByText(/Register here/i);
      fireEvent.click(toggleButton);

      expect(screen.getByText(/By signing in to ChoreQuest, you agree to our/i)).toBeDefined();
    });
  });

  describe('App Navigation Flow (Integration)', () => {
    it('should navigate to Privacy Policy from Landing Page and go back', async () => {
      render(
        <FamilyProvider>
          <AppContent />
        </FamilyProvider>
      );

      // Find the Privacy Policy link in the footer
      const privacyLink = screen.getByRole('button', { name: /Privacy Policy/i });
      fireEvent.click(privacyLink);

      // Should see the Privacy Policy heading
      expect(screen.getByText(/Privacy Policy/i, { selector: 'h1' })).toBeDefined();
      expect(screen.getByText(/Information we collect/i)).toBeDefined();

      // Click Back
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      // Should be back on Landing Page
      expect(screen.getByText(/Turn Family Chores into a/i)).toBeDefined();
    });

    it('should navigate to Terms from Login Page and go back', async () => {
      const { useFamily } = await import('../src/lib/FamilyContext');
      (useFamily as any).mockReturnValue({
        currentUser: null,
        isAuthenticated: false,
        logout: vi.fn(),
      });

      render(
        <FamilyProvider>
          <AppContent />
        </FamilyProvider>
      );

      // Go to Login
      const getStartedBtn = screen.getByText(/Get Started Free/i);
      fireEvent.click(getStartedBtn);

      // Find Terms link
      const termsLink = screen.getByText(/Terms/i, { selector: 'button' });
      fireEvent.click(termsLink);

      // Should see Terms heading
      expect(screen.getByText(/Terms of Service/i, { selector: 'h1' })).toBeDefined();

      // Click Back
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      // Should be back on Login page (not Landing)
      expect(screen.getByText(/Welcome Back!/i)).toBeDefined();
    });
  });

  describe('Contact Information & Support Links', () => {
    it('should display the correct support email in Privacy Policy', () => {
      render(<PrivacyPolicy onBack={() => {}} />);
      expect(screen.getByText(/chorequest.pro@gmail.com/i)).toBeDefined();
      expect(screen.queryByText(/support@chorequest.app/i)).toBeNull();
    });

    it('should have a working mailto link in the Landing Page footer', () => {
      render(
        <LandingPage 
          onGetStarted={() => {}} 
          onViewPrivacy={() => {}} 
          onViewTerms={() => {}} 
        />
      );

      const supportLink = screen.getByRole('link', { name: /Support/i });
      expect(supportLink.getAttribute('href')).toBe('mailto:chorequest.pro@gmail.com');
    });
  });

  describe('Accessibility & Responsiveness', () => {
    it('should have correct ARIA labels for legal links', () => {
      render(
        <LoginRegister 
          onSuccess={() => {}} 
          onViewPrivacy={() => {}} 
          onViewTerms={() => {}} 
        />
      );
      
      const termsLink = screen.getByText('Terms');
      const privacyLink = screen.getByText('Privacy Policy');
      
      expect(termsLink.tagName).toBe('BUTTON');
      expect(privacyLink.tagName).toBe('BUTTON');
    });
  });
});
