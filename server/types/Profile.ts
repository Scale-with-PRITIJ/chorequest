import { UserRole } from './UserRole';
import { Pet } from './Pet';

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  parentId?: string;
  avatar: string;
  points: number;
  level: number;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  pet?: Pet;
  pin?: string;
}
