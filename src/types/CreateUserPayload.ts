import { UserRole } from './UserRole';
import { Pet } from './Pet';

// Payload for creating a new user — enforces required fields
export interface CreateUserPayload {
  name: string;
  role: UserRole;
  parentId?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  pet?: Pet;
}
