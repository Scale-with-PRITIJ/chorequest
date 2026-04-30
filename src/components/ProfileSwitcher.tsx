import React, { useState } from 'react';
import { User } from '../types';
import { useFamily } from '../lib/FamilyContext';
import { auth, signOut } from '../lib/firebase';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

interface ProfileSwitcherProps {
  onSelect: (user: User) => void;
}

export function ProfileSwitcher({ onSelect }: ProfileSwitcherProps) {
  const { users, addUser, updateUser } = useFamily();
  const [setupName, setSetupName] = useState('');
  const [setupPin, setSetupPin] = useState('');

  // PIN entry states
  const [selectedParent, setSelectedParent] = useState<User | null>(null);
  const [pinEntry, setPinEntry] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleProfileClick = (user: User) => {
    if (user.role === 'parent') {
      setSelectedParent(user);
      setPinEntry('');
      setPinError(false);
    } else {
      onSelect(user);
    }
  };

  const handlePinSubmit = () => {
    if (!selectedParent) return;
    
    // If parent doesn't have a PIN, set this as their new PIN
    if (!selectedParent.pin) {
      updateUser({ ...selectedParent, pin: pinEntry });
      onSelect(selectedParent);
      setSelectedParent(null);
      return;
    }

    if (pinEntry === selectedParent.pin) {
      onSelect(selectedParent);
      setSelectedParent(null);
    } else {
      setPinError(true);
      setPinEntry('');
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center space-y-8 w-full max-w-md mx-auto">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-stone-900">Welcome to ChoreQuest!</h2>
          <p className="text-stone-500">Your family database is currently empty. Let's create the first Parent profile to get started.</p>
        </div>
        <Card className="border-none shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="parent-name">Your Name (Parent)</Label>
              <Input 
                id="parent-name" 
                value={setupName} 
                onChange={e => setSetupName(e.target.value)} 
                placeholder="e.g. Mom, Dad, or your first name" 
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="parent-pin">Create 4-Digit PIN</Label>
              <Input 
                id="parent-pin" 
                type="password"
                maxLength={4}
                value={setupPin} 
                onChange={e => setSetupPin(e.target.value.replace(/\D/g, ''))} 
                placeholder="e.g. 1234" 
              />
            </div>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!setupName.trim() || setupPin.length < 4}
              onClick={() => {
                addUser({
                  name: setupName,
                  role: 'parent',
                  points: 0,
                  level: 1,
                  gender: 'other',
                  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${setupName}`,
                  pin: setupPin
                });
              }}
            >
              Create Parent Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-center space-y-8 w-full max-w-2xl">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-stone-900">Who is playing today?</h2>
        <p className="text-stone-500">Select your profile to start your quest!</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {users.filter(u => u.role !== 'pet').map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="cursor-pointer hover:ring-4 hover:ring-orange-400 transition-all border-none shadow-xl overflow-hidden group"
              onClick={() => handleProfileClick(user)}
            >
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  {user.role === 'parent' && (
                    <div className="absolute -top-2 -right-2 bg-stone-800 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      Parent
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-lg text-stone-800">{user.name}</p>
                  {user.role === 'child' && (
                    <p className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      Level {user.level}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="pt-12 text-center">
        <Button 
          variant="ghost" 
          className="text-stone-400 hover:text-stone-600"
          onClick={async () => {
            try {
              localStorage.removeItem('chorequest_user');
              await signOut(auth);
            } catch (err) {
              console.error('Error during logout', err);
              await signOut(auth);
            }
          }}
        >
          Sign out of Family Account
        </Button>
      </div>

      {/* PIN Entry Dialog */}
      <Dialog open={!!selectedParent} onOpenChange={(open) => !open && setSelectedParent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {!selectedParent?.pin ? 'Create Parent PIN' : 'Enter Parent PIN'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
            {!selectedParent?.pin && (
              <p className="text-sm text-stone-500">
                You haven't set a PIN yet. Please create a 4-digit PIN to secure your profile.
              </p>
            )}
            {pinError && (
              <p className="text-sm text-red-500 font-medium">Incorrect PIN. Try again.</p>
            )}
            <Input 
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              className="text-center text-3xl tracking-widest h-16 max-w-[200px] mx-auto font-bold"
              value={pinEntry}
              onChange={(e) => {
                setPinEntry(e.target.value.replace(/\D/g, ''));
                setPinError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pinEntry.length === 4) {
                  handlePinSubmit();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={handlePinSubmit} 
              disabled={pinEntry.length < 4}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full max-w-[200px]"
            >
              {!selectedParent?.pin ? 'Set PIN' : 'Enter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
