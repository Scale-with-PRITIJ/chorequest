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

export const getUsers = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    logger.debug(`Fetching users for family: ${familyId}`);
    const users = await storageService.getUsers(familyId);
    return res.json(users);
  } catch (err) {
    logger.error('Error fetching users:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    logger.debug(`Fetching user by ID: ${req.params.id}`);
    const user = await storageService.getUserById(familyId, req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    logger.error(`Error fetching user ${req.params.id}:`, err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    logger.info(`Updating user ID: ${req.params.id}`);
    const user = await storageService.updateUser(familyId, req.params.id, req.body);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    logger.error(`Error updating user ${req.params.id}:`, err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const familyId = await getFamilyId(req, res);
    if (!familyId) return;

    logger.info(`Adding new user: ${req.body.name}`);
    const newUser = await storageService.addUser(familyId, req.body);
    res.status(201).json(newUser);
  } catch (err) {
    logger.error('Error adding user:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
