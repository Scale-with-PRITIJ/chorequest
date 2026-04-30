import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where } from "firebase/firestore";
import { db } from "../utils/firebase";
import { User, Quest, Reward } from '../types';
import logger from '../utils/logger';

class StorageService {
  async resolveFamilyId(uid: string): Promise<string | null> {
    logger.debug(`Resolving familyId for user: ${uid}`);
    const q = query(collection(db, 'families'), where('parentIds', 'array-contains', uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
    // Fallback for existing families that haven't been migrated yet, 
    // or brand new users creating a family.
    return uid;
  }

  async getUsers(familyId: string): Promise<User[]> {
    logger.debug(`Fetching users for family: ${familyId}`);
    const snapshot = await getDocs(collection(db, 'families', familyId, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  async getUserById(familyId: string, id: string): Promise<User | null> {
    logger.debug(`Fetching user ${id} for family ${familyId}`);
    const docRef = doc(db, 'families', familyId, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  }

  async updateUser(familyId: string, id: string, data: Partial<User>): Promise<User | null> {
    logger.debug(`Updating user ${id} in family ${familyId}`);
    const docRef = doc(db, 'families', familyId, 'users', id);
    await updateDoc(docRef, data);
    return this.getUserById(familyId, id);
  }

  async addUser(familyId: string, userData: any): Promise<User> {
    logger.debug(`Adding user to family ${familyId}`);

    // Validate required fields
    if (!userData.name || !userData.role) {
      throw new Error('Missing required fields: name and role');
    }

    const familyDocRef = doc(db, 'families', familyId);
    const familyDoc = await getDoc(familyDocRef);
    if (!familyDoc.exists()) {
      await setDoc(familyDocRef, {
        parentIds: [familyId],
        name: `${userData.name}'s Family`
      });
    }

    const docRef = doc(collection(db, 'families', familyId, 'users'));
    const newUser = {
      id: docRef.id,
      name: userData.name,
      role: userData.role,
      parentId: userData.parentId || null,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
      points: userData.points ?? 0,
      level: userData.level ?? 1,
      gender: userData.gender || 'other',
      birthday: userData.birthday || null,
      pet: userData.pet || null,
      pin: userData.pin || null,
      createdAt: new Date().toISOString(),
    };
    await setDoc(docRef, newUser);
    return newUser as User;
  }

  async getQuests(familyId: string): Promise<Quest[]> {
    logger.debug(`Fetching quests for family ${familyId}`);
    const snapshot = await getDocs(collection(db, 'families', familyId, 'quests'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quest));
  }

  async addQuest(familyId: string, quest: any): Promise<Quest> {
    logger.debug(`Adding quest to family ${familyId}`);
    const docRef = doc(collection(db, 'families', familyId, 'quests'));
    const newQuest = { ...quest, id: docRef.id, completedDates: [] };
    await setDoc(docRef, newQuest);
    return newQuest as Quest;
  }

  async updateQuest(familyId: string, id: string, data: Partial<Quest>): Promise<Quest | null> {
    logger.debug(`Updating quest ${id} in family ${familyId}`);
    const docRef = doc(db, 'families', familyId, 'quests', id);
    await updateDoc(docRef, data);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Quest) : null;
  }

  async deleteQuest(familyId: string, id: string): Promise<void> {
    logger.debug(`Deleting quest ${id} in family ${familyId}`);
    const { deleteDoc } = await import("firebase/firestore");
    const docRef = doc(db, 'families', familyId, 'quests', id);
    await deleteDoc(docRef);
  }

  async getRewards(familyId: string): Promise<Reward[]> {
    logger.debug(`Fetching rewards for family ${familyId}`);
    const snapshot = await getDocs(collection(db, 'families', familyId, 'rewards'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reward));
  }

  async addReward(familyId: string, reward: any): Promise<Reward> {
    logger.debug(`Adding reward to family ${familyId}`);
    const docRef = doc(collection(db, 'families', familyId, 'rewards'));
    const newReward = { ...reward, id: docRef.id, isClaimed: false };
    await setDoc(docRef, newReward);
    return newReward as Reward;
  }

  async updateReward(familyId: string, id: string, data: Partial<Reward>): Promise<Reward | null> {
    logger.debug(`Updating reward ${id} in family ${familyId}`);
    const docRef = doc(db, 'families', familyId, 'rewards', id);
    await updateDoc(docRef, data);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Reward) : null;
  }

  async deleteReward(familyId: string, id: string): Promise<void> {
    logger.debug(`Deleting reward ${id} in family ${familyId}`);
    const { deleteDoc } = await import("firebase/firestore");
    const docRef = doc(db, 'families', familyId, 'rewards', id);
    await deleteDoc(docRef);
  }
}

export const storageService = new StorageService();
