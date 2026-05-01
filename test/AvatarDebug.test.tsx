import { describe, it, expect } from 'vitest';
import { getAvatarUrl } from '../src/lib/avatar';

describe('getAvatarUrl — gender-neutral bottts style', () => {
  it('returns a valid DiceBear bottts URL for a parent', () => {
    const url = getAvatarUrl('Priti Jagtap', 'parent', 'female');
    expect(url).toContain('dicebear.com/7.x/bottts/svg');
    expect(url).toContain('seed=Priti%20Jagtap');
    expect(url).toContain('backgroundColor=');
  });

  it('returns a valid DiceBear bottts URL for a male child', () => {
    const url = getAvatarUrl('Leo', 'child', 'male');
    expect(url).toContain('dicebear.com/7.x/bottts/svg');
    expect(url).toContain('seed=Leo');
  });

  it('returns a valid DiceBear bottts URL for a female child', () => {
    const url = getAvatarUrl('Anna', 'child', 'female');
    expect(url).toContain('dicebear.com/7.x/bottts/svg');
    expect(url).toContain('seed=Anna');
  });

  it('returns a valid bottts URL for a pet', () => {
    const url = getAvatarUrl('Buddy', 'pet');
    expect(url).toContain('dicebear.com/7.x/bottts/svg');
    expect(url).toContain('seed=Buddy');
  });

  it('produces different URLs for different names (uniqueness check)', () => {
    const url1 = getAvatarUrl('Leo', 'child');
    const url2 = getAvatarUrl('Anna', 'child');
    expect(url1).not.toBe(url2);
  });

  it('produces the SAME URL for the same name regardless of gender (gender-neutral)', () => {
    const urlMale   = getAvatarUrl('Sam', 'child', 'male');
    const urlFemale = getAvatarUrl('Sam', 'child', 'female');
    const urlOther  = getAvatarUrl('Sam', 'child', 'other');
    expect(urlMale).toBe(urlFemale);
    expect(urlFemale).toBe(urlOther);
  });

  it('encodes special characters in names correctly', () => {
    const url = getAvatarUrl("O'Brien Jr.", 'parent');
    expect(url).toContain('seed=');
    // encodeURIComponent encodes spaces as %20 — spaces must not appear raw
    expect(url).not.toContain(' ');
    // The seed should be present (apostrophe is valid unencoded per RFC 3986)
    expect(url).toContain("O'Brien");
  });

  it('works when role and gender are omitted (all optional)', () => {
    const url = getAvatarUrl('Ghost');
    expect(url).toContain('dicebear.com/7.x/bottts/svg');
    expect(url).toContain('seed=Ghost');
  });
});

