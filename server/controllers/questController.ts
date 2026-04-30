import { Request, Response } from 'express';
import { storageService } from '../services/storageService';
import logger from '../utils/logger';

const getFamilyId = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
  const familyId = await storageService.resolveFamilyId(uid);
  if (!familyId) {
    res.status(404).json({ message: 'Family not found' });
    return null;
  }
  return familyId;
};

export const getQuests = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    logger.debug('Fetching all quests');
    const quests = await storageService.getQuests(familyId);
    res.json(quests);
  } catch (err) {
    logger.error('Error fetching quests:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const addQuest = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    logger.info(`Adding new quest: ${req.body.title}`);
    const newQuest = await storageService.addQuest(familyId, req.body);
    res.status(201).json(newQuest);
  } catch (err) {
    logger.error('Error adding quest:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const completeQuest = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    const questId = req.params.id;
    const { userId } = req.body;
    logger.info(`Attempting to complete quest ${questId} for user ${userId}`);

    const quests = await storageService.getQuests(familyId);
    const quest = quests.find(q => q.id === questId);
    const user = await storageService.getUserById(familyId, userId);

    if (!quest || !user) {
      logger.warn(`Complete quest failed: Quest ${questId} or User ${userId} not found`);
      return res.status(404).json({ message: 'Quest or User not found' });
    }

    const today = req.body.date || new Date().toISOString().split('T')[0];
    
    // Check for duplicate completion
    if (quest.frequency === 'weekly') {
      const now = new Date(today);
      const day = now.getDay(); // 0=Sun, 1=Mon...
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      const startOfWeekStr = monday.toISOString().split('T')[0];
      
      if ((quest.completedDates || []).some(d => d >= startOfWeekStr)) {
        logger.warn(`Complete quest failed: Weekly quest ${questId} already completed this week`);
        return res.status(400).json({ message: 'Weekly quest already completed this week' });
      }
    } else if ((quest.completedDates || []).includes(today)) {
      logger.warn(`Complete quest failed: Quest ${questId} already completed today`);
      return res.status(400).json({ message: 'Quest already completed today' });
    }

    const updatedQuest = await storageService.updateQuest(familyId, questId, {
      completedDates: [...(quest.completedDates || []), today]
    });

    const newPoints = user.points + quest.points;
    const newLevel = Math.floor(newPoints / 500) + 1;
    const petStage = user.pet ? Math.min(3, Math.floor(newLevel / 2)) : undefined;

    const updatedUser = await storageService.updateUser(familyId, userId, {
      points: newPoints,
      level: newLevel,
      pet: user.pet ? { ...user.pet, stage: petStage! } : undefined
    });

    res.json({ quest: updatedQuest, user: updatedUser });
  } catch (err) {
    logger.error('Error completing quest:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getRewards = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    logger.debug('Fetching all rewards');
    const rewards = await storageService.getRewards(familyId);
    res.json(rewards);
  } catch (err) {
    logger.error('Error fetching rewards:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const addReward = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    logger.info(`Adding new reward: ${req.body.title}`);
    const newReward = await storageService.addReward(familyId, req.body);
    res.status(201).json(newReward);
  } catch (err) {
    logger.error('Error adding reward:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const claimReward = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    const { rewardId, userId } = req.body;
    logger.info(`Attempting to claim reward ${rewardId} by user ${userId}`);

    const rewards = await storageService.getRewards(familyId);
    const reward = rewards.find(r => r.id === rewardId);
    const user = await storageService.getUserById(familyId, userId);

    if (!reward || !user) {
      return res.status(404).json({ message: 'Reward or User not found' });
    }

    if (user.points < reward.cost || reward.isClaimed) {
      return res.status(400).json({ message: 'Cannot claim reward' });
    }

    const updatedReward = await storageService.updateReward(familyId, rewardId, {
      isClaimed: true,
      claimedBy: userId
    });

    const updatedUser = await storageService.updateUser(familyId, userId, {
      points: user.points - reward.cost
    });

    res.json({ reward: updatedReward, user: updatedUser });
  } catch (err) {
    logger.error('Error claiming reward:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateQuest = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    const questId = req.params.id;
    logger.info(`Updating quest ${questId}`);
    const updatedQuest = await storageService.updateQuest(familyId, questId, req.body);
    if (!updatedQuest) return res.status(404).json({ message: 'Quest not found' });
    res.json(updatedQuest);
  } catch (err) {
    logger.error('Error updating quest:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteQuest = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    const questId = req.params.id;
    logger.info(`Deleting quest ${questId}`);
    await storageService.deleteQuest(familyId, questId);
    res.json({ message: 'Quest deleted' });
  } catch (err) {
    logger.error('Error deleting quest:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateReward = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    const rewardId = req.params.id;
    logger.info(`Updating reward ${rewardId}`);
    const updatedReward = await storageService.updateReward(familyId, rewardId, req.body);
    if (!updatedReward) return res.status(404).json({ message: 'Reward not found' });
    res.json(updatedReward);
  } catch (err) {
    logger.error('Error updating reward:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteReward = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    const rewardId = req.params.id;
    logger.info(`Deleting reward ${rewardId}`);
    await storageService.deleteReward(familyId, rewardId);
    res.json({ message: 'Reward deleted' });
  } catch (err) {
    logger.error('Error deleting reward:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
