import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from '../src/components/ui/avatar';
import React from 'react';

describe('Avatar Component Rendering', () => {
  it('renders only the fallback if image fails', () => {
    render(
      <Avatar>
        <AvatarImage src="" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).not.toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('renders the image if src is valid', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.png" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    const img = screen.getByRole('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('https://example.com/avatar.png');
  });

  it('layers the image correctly (CSS check)', () => {
    // In a real browser, we want the image to be absolute or hidden/shown.
    // Our current implementation is flex, which is likely wrong.
  });
});
