import { Request, Response } from 'express';
import { db } from '../utils/firebase';
import { collection, doc, getDoc, getDocs, setDoc, query, where, updateDoc, arrayUnion } from 'firebase/firestore';
import { storageService } from '../services/storageService';
import { emailService } from '../utils/emailService';
import logger from '../utils/logger';

export const createInvite = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    const { email, inviterName: frontendInviterName } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ message: 'Missing user or email' });
    }

    const familyId = await storageService.resolveFamilyId(uid);
    if (!familyId) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // Get inviter info for the email
    const users = await storageService.getUsers(familyId);
    const inviter = users.find(u => u.id === uid);
    const inviterName = frontendInviterName || inviter?.name || 'A parent';

    const inviteRef = doc(db, 'invites', email.toLowerCase());
    await setDoc(inviteRef, {
      familyId,
      invitedBy: uid,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    logger.info(`Invite created in DB for ${email} by user ${uid} to family ${familyId}`);

    // Send the real email
    try {
      await emailService.sendInviteEmail(email, inviterName, 'your family');
      logger.info(`Invitation email sent successfully to ${email}`);
    } catch (emailErr) {
      logger.error('Failed to send invitation email but invite record was created:', emailErr);
      // We don't fail the whole request if the email fails, 
      // but the record is there for the user to still join manually.
    }

    res.status(201).json({ message: 'Invite created and email sent' });
  } catch (err) {
    logger.error('Error creating invite:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const checkInvite = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    const email = req.query.email as string;
    if (!uid || !email) {
      return res.status(400).json({ message: 'Missing user or email' });
    }

    const inviteRef = doc(db, 'invites', email.toLowerCase());
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      return res.json({ hasInvite: false });
    }

    const inviteData = inviteSnap.data();
    if (inviteData.status !== 'pending') {
      return res.json({ hasInvite: false });
    }

    const familyId = inviteData.familyId;

    const familyDocRef = doc(db, 'families', familyId);

    // Make sure family doc exists before updating
    const familyDocSnap = await getDoc(familyDocRef);
    if (!familyDocSnap.exists()) {
      // Create it if it doesn't exist (migrate old families)
      await setDoc(familyDocRef, {
        parentIds: [familyId, uid],
        name: `Family`
      });
    } else {
      await updateDoc(familyDocRef, {
        parentIds: arrayUnion(uid)
      });
    }

    await updateDoc(inviteRef, {
      status: 'accepted',
      acceptedBy: uid,
      acceptedAt: new Date().toISOString()
    });

    logger.info(`User ${uid} joined family ${familyId} via invite`);

    res.json({ hasInvite: true, familyId });
  } catch (err) {
    logger.error('Error checking invite:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
