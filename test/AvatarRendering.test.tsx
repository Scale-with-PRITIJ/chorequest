import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParentDashboard } from '../src/components/ParentDashboard';
import * as FamilyContext from '../src/lib/FamilyContext';
import React from 'react';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
vi.mock('../src/lib/firebase', () => ({ auth: {}, signOut: vi.fn() }));

describe('Avatar Rendering Logic', () => {
  const leo = {
    id: 'leo-id',
    name: 'Leo',
    role: 'child',
    points: 0,
    level: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&top=shortHair'
  };

  const manny = {
    id: 'manny-id',
    name: 'Manny',
    role: 'child',
    points: 0,
    level: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manny'
  };

  const mockFamilyContext = {
    users: [leo, manny, { id: 'p1', name: 'Mom', role: 'parent' }],
    chores: [],
    rewards: [],
    currentUser: { id: 'p1', name: 'Mom', role: 'parent' },
    isAuthenticated: true,
  };

  beforeEach(() => {
    vi.spyOn(FamilyContext, 'useFamily').mockReturnValue(mockFamilyContext as any);
  });

  it('renders AvatarImage with correct src for Leo and Manny', () => {
    const { container } = render(<ParentDashboard />);
    
    // Find all images in the document
    const images = container.querySelectorAll('img');
    const sources = Array.from(images).map(img => img.src);
    
    console.log('Detected Image Sources:', sources);

    // Verify Leo's avatar src is present
    expect(sources.some(src => src.includes('seed=Leo'))).toBe(true);
    // Verify Manny's avatar src is present
    expect(sources.some(src => src.includes('seed=Manny'))).toBe(true);
  });

  it('renders fallback if avatar is missing', () => {
    const brokenUser = {
      id: 'broken-id',
      name: 'Broken',
      role: 'child',
      points: 0,
      level: 1,
      avatar: '' // Empty avatar
    };

    vi.spyOn(FamilyContext, 'useFamily').mockReturnValue({
      ...mockFamilyContext,
      users: [brokenUser, { id: 'p1', name: 'Mom', role: 'parent' }]
    } as any);

    render(<ParentDashboard />);
    
    // Should show "B" as fallback
    expect(screen.getByText('B')).not.toBeNull();
  });
});
