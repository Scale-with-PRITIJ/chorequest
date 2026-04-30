import { User, Chore, Reward, Badge } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'parent-1',
    name: 'Mom',
    role: 'parent',
    points: 0,
    level: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mom',
  },
  {
    id: 'child-1',
    name: 'Leo',
    role: 'child',
    points: 150,
    level: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
    pet: {
      type: 'Dragon',
      name: 'Sparky',
      stage: 1,
      accessories: ['Hat'],
    },
  },
  {
    id: 'child-2',
    name: 'Mia',
    role: 'child',
    points: 45,
    level: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    pet: {
      type: 'Unicorn',
      name: 'Luna',
      stage: 0,
      accessories: [],
    },
  },
];

export const MOCK_CHORES: Chore[] = [
  {
    id: 'chore-1',
    title: 'Make your bed',
    description: 'Straighten the sheets and fluff the pillows.',
    points: 10,
    frequency: 'daily',
    assignedTo: 'child-1',
    completedDates: [],
  },
  {
    id: 'chore-2',
    title: 'Brush teeth',
    description: 'Brush for 2 minutes, morning and night!',
    points: 5,
    frequency: 'daily',
    assignedTo: 'child-1',
    completedDates: [],
  },
  {
    id: 'chore-3',
    title: 'Feed the dog',
    description: 'Give Buddy his breakfast and dinner.',
    points: 15,
    frequency: 'daily',
    assignedTo: 'child-2',
    completedDates: [],
  },
  {
    id: 'chore-4',
    title: 'Clean room',
    description: 'Put all toys back in their bins.',
    points: 50,
    frequency: 'weekly',
    assignedTo: 'child-1',
    completedDates: [],
  },
];

export const MOCK_REWARDS: Reward[] = [
  {
    id: 'reward-1',
    title: 'Extra 30 mins Screen Time',
    cost: 100,
    isClaimed: false,
  },
  {
    id: 'reward-2',
    title: 'Ice Cream Treat',
    cost: 250,
    isClaimed: false,
  },
  {
    id: 'reward-3',
    title: 'New Toy',
    cost: 1000,
    isClaimed: false,
  },
];

export const MOCK_BADGES: Badge[] = [
  {
    id: 'badge-1',
    title: 'Early Bird',
    icon: '🌅',
    description: 'Completed a chore before 8 AM',
    earnedBy: ['child-1'],
  },
  {
    id: 'badge-2',
    title: 'Super Cleaner',
    icon: '🧹',
    description: 'Completed all daily chores for 3 days in a row',
    earnedBy: [],
  },
];
