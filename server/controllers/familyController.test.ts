import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { addUser, getUsers } from './familyController';
import { storageService } from '../services/storageService';

// Mock the storage service
vi.mock('../services/storageService', () => ({
  storageService: {
    addUser: vi.fn(),
    getUsers: vi.fn(),
  }
}));

describe('familyController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      body: {},
      query: {}
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  describe('addUser', () => {
    it('should successfully add a user and return 201', async () => {
      const newUserData = { name: 'Mom', role: 'parent' };
      mockReq.body = newUserData;
      
      const expectedSavedUser = { id: 'test-123', ...newUserData };
      (storageService.addUser as any).mockResolvedValue(expectedSavedUser);

      await addUser(mockReq as Request, mockRes as Response);

      expect(storageService.addUser).toHaveBeenCalledWith(newUserData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expectedSavedUser);
    });

    it('should handle errors and return 500', async () => {
      mockReq.body = { name: 'Mom' };
      (storageService.addUser as any).mockRejectedValue(new Error('DB Error'));

      await addUser(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });

  describe('getUsers', () => {
    it('should return all users if no userId is provided', async () => {
      const mockUsers = [{ id: '1', name: 'Mom' }];
      (storageService.getUsers as any).mockResolvedValue(mockUsers);

      await getUsers(mockReq as Request, mockRes as Response);

      expect(storageService.getUsers).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });
  });
});
