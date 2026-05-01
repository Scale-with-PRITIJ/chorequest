import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Chore, Reward, Badge, AppState, CreateUserPayload } from '../types';
import { storageService } from '../services/storageService';
import { auth, onAuthStateChanged } from '../lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { getAvatarUrl } from './avatar';

interface FamilyContextType extends AppState {
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: User | null) => void;
  completeChore: (choreId: string, userId: string) => Promise<void>;
  claimReward: (rewardId: string, userId: string) => Promise<void>;
  addChore: (choreData: Omit<Chore, 'id' | 'completedDates'>) => Promise<void>;
  updateChore: (id: string, choreData: Partial<Chore>) => Promise<void>;
  deleteChore: (id: string) => Promise<void>;
  addReward: (rewardData: Omit<Reward, 'id' | 'isClaimed'>) => Promise<void>;
  updateReward: (id: string, rewardData: Partial<Reward>) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  addUser: (userData: CreateUserPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    users: [],
    chores: [],
    rewards: [],
    badges: [],
    currentUser: null,
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setLoading(true);
        // Clear stale profile selection if the Firebase user changed
        const lastUid = localStorage.getItem('chorequest_family_uid');
        if (lastUid && lastUid !== user.uid) {
          localStorage.removeItem('chorequest_user');
        }
        localStorage.setItem('chorequest_family_uid', user.uid);

        // Force a fresh token to avoid stale token after logout+re-login
        try {
          await user.getIdToken(true); // true = force refresh
        } catch (tokenErr) {
          console.warn('Token refresh warning:', tokenErr);
        }

        try {
          const savedUserId = localStorage.getItem('chorequest_user') || undefined;
          
          let [users, chores, rewards] = await Promise.all([
            storageService.getUsers(),
            storageService.getQuests(),
            storageService.getRewards(),
          ]);

          // PRIMARY KEY FIX: If this family has NO users, auto-create
          // the parent profile using the Firebase Auth email as the anchor.
          // This means: email → Firebase Auth UID → familyId → parent profile
          // The email IS the primary key — it always resolves to the same UID.
          if (users.length === 0 && user.email) {
            const signupName = localStorage.getItem('chorequest_signup_name');
            const signupGender = localStorage.getItem('chorequest_signup_gender') || 'other';
            const displayName = signupName || user.displayName || user.email.split('@')[0];
            if (signupName) {
              localStorage.removeItem('chorequest_signup_name');
              localStorage.removeItem('chorequest_signup_gender');
            }

            // Check if user was invited
            const inviteResponse = await storageService.checkInvite(user.email);
            if (inviteResponse.hasInvite) {
              // Add the new parent profile to the shared family
              await storageService.addUser({
                name: displayName,
                role: 'parent',
                gender: signupGender,
                avatar: getAvatarUrl(displayName, 'parent', signupGender),
              });
              
              // Now fetch the shared family data
              [users, chores, rewards] = await Promise.all([
                storageService.getUsers(),
                storageService.getQuests(),
                storageService.getRewards(),
              ]);
            } else {
              // No invite, create a brand new family
              const newParent = await storageService.addUser({
                name: displayName,
                role: 'parent',
                gender: signupGender,
                avatar: getAvatarUrl(displayName, 'parent', signupGender),
              });
              users = [newParent];
            }
          }

          // Auto-select: if there's a saved user, restore them.
          // Otherwise, if there's only one parent and no saved selection, auto-select them.
          let currentUser = savedUserId 
            ? users.find((u: User) => u.id === savedUserId) || null 
            : null;
          
          if (!currentUser) {
            const parents = users.filter((u: User) => u.role === 'parent');
            const isResettingPin = !!localStorage.getItem('chorequest_reset_pin_user_id');
            const parentHasPin = parents.length > 0 && !!parents[0].pin;
            
            // Auto-select the parent ONLY if there's exactly 1 parent, 
            // they don't have a PIN, and they are NOT currently resetting their PIN.
            if (parents.length === 1 && !parentHasPin && !isResettingPin) {
              currentUser = parents[0];
              localStorage.setItem('chorequest_user', currentUser!.id);
            }
          }

          setState({
            users,
            chores,
            rewards,
            badges: [], 
            currentUser,
          });
        } catch (err) {
          console.error('Failed to fetch data', err);
        } finally {
          setLoading(false);
        }
      } else {
        setState({
          users: [],
          chores: [],
          rewards: [],
          badges: [],
          currentUser: null,
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const setCurrentUser = (user: User | null) => {
    if (user) {
      localStorage.setItem('chorequest_user', user.id);
    } else {
      localStorage.removeItem('chorequest_user');
    }
    setState(prev => ({ ...prev, currentUser: user }));
  };

  const completeChore = async (choreId: string, userId: string) => {
    try {
      const today = new Date().toLocaleDateString('en-CA');
      const { quest, user } = await storageService.completeQuest(choreId, userId, today);
      setState(prev => ({
        ...prev,
        chores: prev.chores.map(c => c.id === quest.id ? quest : c),
        users: prev.users.map(u => u.id === user.id ? user : u),
        currentUser: prev.currentUser?.id === user.id ? user : prev.currentUser,
      }));
    } catch (err) {
      console.error('Failed to complete chore', err);
    }
  };

  const claimReward = async (rewardId: string, userId: string) => {
    try {
      const { reward, user } = await storageService.claimReward(rewardId, userId);
      setState(prev => ({
        ...prev,
        rewards: prev.rewards.map(r => r.id === reward.id ? reward : r),
        users: prev.users.map(u => u.id === user.id ? user : u),
        currentUser: prev.currentUser?.id === user.id ? user : prev.currentUser,
      }));
    } catch (err) {
      console.error('Failed to claim reward', err);
    }
  };

  const addChore = async (choreData: Omit<Chore, 'id' | 'completedDates'>) => {
    try {
      const newChore = await storageService.addQuest(choreData);
      setState(prev => ({
        ...prev,
        chores: [...prev.chores, newChore],
      }));
    } catch (err) {
      console.error('Failed to add chore', err);
    }
  };

  const addReward = async (rewardData: Omit<Reward, 'id' | 'isClaimed'>) => {
    try {
      const newReward = await storageService.addReward(rewardData);
      setState(prev => ({
        ...prev,
        rewards: [...prev.rewards, newReward],
      }));
    } catch (err) {
      console.error('Failed to add reward', err);
    }
  };

  const updateChore = async (id: string, choreData: Partial<Chore>) => {
    try {
      const updatedChore = await storageService.updateQuest(id, choreData);
      setState(prev => ({
        ...prev,
        chores: prev.chores.map(c => c.id === id ? updatedChore : c),
      }));
    } catch (err) {
      console.error('Failed to update chore', err);
    }
  };

  const deleteChore = async (id: string) => {
    try {
      await storageService.deleteQuest(id);
      setState(prev => ({
        ...prev,
        chores: prev.chores.filter(c => c.id !== id),
      }));
    } catch (err) {
      console.error('Failed to delete chore', err);
    }
  };

  const updateReward = async (id: string, rewardData: Partial<Reward>) => {
    try {
      const updatedReward = await storageService.updateReward(id, rewardData);
      setState(prev => ({
        ...prev,
        rewards: prev.rewards.map(r => r.id === id ? updatedReward : r),
      }));
    } catch (err) {
      console.error('Failed to update reward', err);
    }
  };

  const deleteReward = async (id: string) => {
    try {
      await storageService.deleteReward(id);
      setState(prev => ({
        ...prev,
        rewards: prev.rewards.filter(r => r.id !== id),
      }));
    } catch (err) {
      console.error('Failed to delete reward', err);
    }
  };

  const updateUser = async (user: User) => {
    try {
      const updatedUser = await storageService.updateUser(user);
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
        currentUser: prev.currentUser?.id === updatedUser.id ? updatedUser : prev.currentUser
      }));
    } catch (err) {
      console.error('Failed to update user', err);
    }
  };

  const addUser = async (userData: any) => {
    try {
      const newUser = await storageService.addUser(userData);
      setState(prev => ({
        ...prev,
        users: [...prev.users, newUser],
      }));
    } catch (err) {
      console.error('Failed to add user', err);
    }
  };

  const logout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      localStorage.removeItem('chorequest_user');
      setState(prev => ({ ...prev, currentUser: null }));
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-indigo-50">
        <div className="text-xl font-medium text-indigo-600 animate-pulse">Loading ChoreQuest...</div>
      </div>
    );
  }

  return (
    <FamilyContext.Provider value={{ 
      ...state, 
      firebaseUser,
      isAuthenticated: !!firebaseUser,
      setCurrentUser, 
      completeChore, 
      claimReward, 
      addChore, 
      updateChore,
      deleteChore,
      addReward,
      updateReward,
      deleteReward,
      updateUser,
      addUser,
      logout
    }}>
      {children}
    </FamilyContext.Provider>
  );
};


export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};
