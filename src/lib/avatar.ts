/**
 * Generates a gender-neutral DiceBear "bottts" avatar URL.
 *
 * Style choice: bottts — cute robot faces, works for all roles (parent/child/pet).
 * Gender is stored in Firestore for future use but is NOT used to determine the avatar.
 * Avatar uniqueness comes from the name seed alone — deterministic and collision-resistant.
 *
 * @param name  - The user's display name (used as the seed)
 * @param role  - 'parent' | 'child' | 'pet' (kept for API compatibility, currently unused)
 * @param gender - kept for signature compatibility; stored in DB but not used here
 */
export function getAvatarUrl(name: string, role?: string, gender?: string): string {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}
