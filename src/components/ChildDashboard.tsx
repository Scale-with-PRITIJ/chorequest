import React, { useState } from 'react';
import { User, Chore, Reward } from '../types';
import { useFamily } from '../lib/FamilyContext';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { CheckCircle2, Trophy, Star, Gift, Zap, Heart } from 'lucide-react';
import { VirtualPet } from './VirtualPet';

import confetti from 'canvas-confetti';

interface ChildDashboardProps {
  user: User;
}

export function ChildDashboard({ user }: ChildDashboardProps) {
  const { chores, rewards, completeChore, claimReward, updateUser } = useFamily();
  const [activeTab, setActiveTab] = useState('chores');

  const handleComplete = (choreId: string) => {
    completeChore(choreId, user.id);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#fbbf24', '#22c55e']
    });
  };

  const userChores = chores.filter(c => c.assignedTo === user.id);
  const today = new Date().toLocaleDateString('en-CA');
  
  const dailyChores = userChores.filter(c => c.frequency === 'daily');
  const weeklyChores = userChores.filter(c => c.frequency === 'weekly');
  
  const completedTodayCount = dailyChores.filter(c => c.completedDates.includes(today)).length;
  const dailyProgress = dailyChores.length > 0 ? (completedTodayCount / dailyChores.length) * 100 : 0;

  const nextLevelPoints = user.level * 500;
  const levelProgress = (user.points % 500) / 5; // 0-100

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-400 to-orange-600 text-white border-none shadow-lg overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
            <Star size={120} fill="currentColor" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-orange-100 font-medium uppercase tracking-wider text-xs">Total Points</p>
              <Zap size={20} className="text-orange-200" />
            </div>
            <h3 className="text-4xl font-black">{user.points}</h3>
            <p className="text-orange-100 text-sm mt-1">Keep it up, {user.name}!</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-stone-500 font-medium uppercase tracking-wider text-xs">Level {user.level}</p>
              <Trophy size={18} className="text-yellow-500" />
            </div>
            <Progress value={levelProgress} className="h-3 bg-stone-100" />
            <p className="text-[10px] text-stone-400 mt-2 text-right font-medium">
              {nextLevelPoints - (user.points % 500)} points to Level {user.level + 1}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-stone-500 font-medium uppercase tracking-wider text-xs">Daily Goal</p>
              <CheckCircle2 size={18} className="text-green-500" />
            </div>
            <Progress value={dailyProgress} className="h-3 bg-stone-100" />
            <p className="text-[10px] text-stone-400 mt-2 text-right font-medium">
              {completedTodayCount} / {dailyChores.length} chores done
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Virtual Pet Section */}
      {user.pet && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 flex-shrink-0">
              <VirtualPet pet={user.pet} />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-bold text-blue-900">{user.pet.name}</h3>
                <Badge variant="secondary" className="bg-blue-200 text-blue-700 hover:bg-blue-200">
                  {user.pet.type}
                </Badge>
              </div>
              <p className="text-blue-700 text-sm">
                {user.pet.stage === 0 ? "Your pet is just an egg! Complete chores to help it hatch." : 
                 user.pet.stage === 1 ? "Your pet is a baby! It's growing fast." :
                 user.pet.stage === 2 ? "Your pet is a teenager! It looks cool." :
                 "Your pet is fully grown! Wow!"}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                {user.pet.accessories.map(acc => (
                  <Badge key={acc} variant="outline" className="border-blue-300 text-blue-600 bg-white/50">
                    {acc}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-stone-100 p-1 rounded-xl">
          <TabsTrigger value="chores" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            My Quests
          </TabsTrigger>
          <TabsTrigger value="rewards" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Treasure Shop
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chores" className="mt-6 space-y-6">
          <div className="space-y-4">
            <h4 className="font-bold text-stone-800 flex items-center gap-2">
              <Zap size={18} className="text-orange-500" />
              Daily Tasks
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {dailyChores.map(chore => {
                const isDone = chore.completedDates.includes(today);
                return (
                  <motion.div key={chore.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Card className={`border-none shadow-sm transition-all ${isDone ? 'bg-green-50 opacity-75' : 'bg-white'}`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDone ? 'bg-green-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                            {isDone ? <CheckCircle2 size={24} /> : <div className="w-3 h-3 rounded-full border-2 border-stone-300" />}
                          </div>
                          <div>
                            <p className={`font-bold ${isDone ? 'text-green-700 line-through' : 'text-stone-800'}`}>{chore.title}</p>
                            <p className="text-xs text-stone-500">{chore.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-black text-orange-600">+{chore.points}</p>
                            <p className="text-[10px] text-stone-400 uppercase font-bold">Points</p>
                          </div>
                          {!isDone && (
                            <Button 
                              size="sm" 
                              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 shadow-md shadow-orange-100"
                              onClick={() => handleComplete(chore.id)}
                            >
                              Done!
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
              {dailyChores.length === 0 && (
                <p className="text-center py-8 text-stone-400 italic">No daily chores yet. Ask Mom or Dad!</p>
              )}
            </div>
          </div>

          {weeklyChores.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-bold text-stone-800 flex items-center gap-2">
                <Star size={18} className="text-yellow-500" />
                Weekly Quests
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {weeklyChores.map(chore => {
                  const now = new Date();
                  const day = now.getDay(); // 0=Sun, 1=Mon...
                  const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
                  const monday = new Date(now.setDate(diff));
                  monday.setHours(0, 0, 0, 0);
                  const startOfWeekStr = monday.toISOString().split('T')[0];
                  
                  const isDone = chore.completedDates.some(d => d >= startOfWeekStr);
                  
                  return (
                    <motion.div key={chore.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Card className={`border-none shadow-sm transition-all ${isDone ? 'bg-green-50 opacity-75' : 'bg-white'}`}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDone ? 'bg-green-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                              {isDone ? <CheckCircle2 size={24} /> : <Star size={20} />}
                            </div>
                            <div>
                              <p className={`font-bold ${isDone ? 'text-green-700 line-through' : 'text-stone-800'}`}>{chore.title}</p>
                              <p className="text-xs text-stone-500">{chore.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-black text-orange-600">+{chore.points}</p>
                              <p className="text-[10px] text-stone-400 uppercase font-bold">Points</p>
                            </div>
                            {!isDone && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-orange-200 text-orange-600 hover:bg-orange-50 rounded-full px-4"
                                onClick={() => handleComplete(chore.id)}
                              >
                                Done!
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rewards" className="mt-6 space-y-8">
          <div className="space-y-4">
            <h4 className="font-bold text-stone-800 flex items-center gap-2">
              <Star size={18} className="text-orange-500" />
              Real World Rewards
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.map(reward => {
                const canAfford = user.points >= reward.cost;
                return (
                  <Card key={reward.id} className={`border-none shadow-sm overflow-hidden ${reward.isClaimed ? 'opacity-50 grayscale' : ''}`}>
                    <div className={`h-2 ${reward.isClaimed ? 'bg-stone-300' : 'bg-orange-400'}`} />
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h5 className="font-bold text-stone-800">{reward.title}</h5>
                          <div className="flex items-center gap-1 text-orange-600 font-black">
                            <Zap size={14} />
                            <span>{reward.cost}</span>
                          </div>
                        </div>
                        <div className="bg-stone-100 p-2 rounded-lg">
                          <Gift size={24} className="text-stone-400" />
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white"
                        variant={canAfford && !reward.isClaimed ? 'default' : 'secondary'}
                        disabled={!canAfford || reward.isClaimed}
                        onClick={() => claimReward(reward.id, user.id)}
                      >
                        {reward.isClaimed ? 'Claimed!' : canAfford ? 'Claim Treasure!' : `Need ${reward.cost - user.points} more`}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
