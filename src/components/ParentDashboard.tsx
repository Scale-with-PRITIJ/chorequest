import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { useFamily } from '../lib/FamilyContext';
import { Chore, Reward, User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Trash2, Edit2, Users, CheckCircle, BarChart3, Settings, Mail, ChevronDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

const CHORE_CATALOG = [
  { title: 'Make Bed', icon: '🛏️' },
  { title: 'Clean Room', icon: '🧹' },
  { title: 'Do Dishes', icon: '🍽️' },
  { title: 'Take Out Trash', icon: '🗑️' },
  { title: 'Feed Pets', icon: '🐾' },
  { title: 'Brush Teeth', icon: '🪥' },
  { title: 'Homework', icon: '📚' },
  { title: 'Fold Laundry', icon: '👕' },
  { title: 'Vacuum House', icon: '🌀' },
  { title: 'Water Plants', icon: '🌱' },
];

export function ParentDashboard() {
  const { users, chores, rewards, addChore, updateChore, deleteChore, addReward, updateReward, deleteReward, addUser, currentUser } = useFamily();
  const [activeTab, setActiveTab] = useState('overview');

  // Show all children and pets in the family — any parent can manage any child
  const children = users.filter(u => u.role === 'child');
  const pets = users.filter(u => u.role === 'pet');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-900">Parent Dashboard</h2>
        <div className="flex gap-2">
          <InvitePartnerDialog />
          <AddUserDialog onAdd={addUser} parentId={currentUser?.id} />
          <AddChoreDialog onAdd={addChore} children={children} />
          <AddRewardDialog onAdd={addReward} children={children} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-stone-100 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="chores" className="rounded-lg">Manage Chores</TabsTrigger>
          <TabsTrigger value="rewards" className="rounded-lg">Manage Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children.map(child => {
              const childChores = chores.filter(c => c.assignedTo === child.id);
                const today = new Date().toLocaleDateString('en-CA');
                const completedToday = childChores.filter(c => c.completedDates.includes(today)).length;
              
              return (
                <Card key={child.id} className="border-stone-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={child.avatar} />
                      <AvatarFallback>{child.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      <CardDescription>Level {child.level} • {child.points} Points</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {completedToday}/{childChores.filter(c => c.frequency === 'daily').length} Today
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Recent Activity</p>
                        <div className="space-y-1">
                          {childChores.slice(0, 3).map(c => (
                            <div key={c.id} className="flex items-center justify-between text-sm py-1 border-b border-stone-50 last:border-0">
                              <span className="text-stone-700">{c.title}</span>
                              <span className="text-stone-400 text-xs">{c.completedDates.length} total completions</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <ChildReportDialog child={child} chores={chores} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {pets.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-stone-900">Family Pets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pets.map(pet => (
                  <Card key={pet.id} className="border-stone-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={pet.avatar} />
                        <AvatarFallback>{pet.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{pet.name}</CardTitle>
                        <CardDescription>{pet.pet?.type}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Card className="border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 size={20} className="text-stone-400" />
                Weekly Completion Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-2 px-4 mt-8">
                {(() => {
                  const days = Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d;
                  });
                  const completionData = days.map(d => {
                    const dateStr = d.toLocaleDateString('en-CA');
                    const count = (chores || []).reduce((sum, c) => sum + ((c.completedDates || []).includes(dateStr) ? 1 : 0), 0);
                    return { dateStr, count, dayName: d.toLocaleDateString('en-US', { weekday: 'short' }) };
                  });

                  const maxCount = Math.max(1, ...completionData.map(d => d.count));

                  return completionData.map(data => {
                    const height = Math.round((data.count / maxCount) * 100);
                    return (
                      <div key={data.dateStr} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative flex flex-col items-center w-full h-full justify-end">
                          <span className="text-[10px] font-black text-orange-600 mb-1">
                            {data.count}
                          </span>
                          <div 
                            className="w-full bg-orange-500 rounded-t-md relative transition-all duration-700 ease-out shadow-sm"
                            style={{ height: `${Math.max(5, height)}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 rounded-t-md opacity-0 hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase">{data.dayName}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chores" className="mt-6">
          <Card className="border-stone-200 shadow-sm">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y divide-stone-100">
                  {chores.map(chore => {
                    const assignedChild = children.find(c => c.id === chore.assignedTo);
                    return (
                      <div key={chore.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400">
                            <CheckCircle size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-stone-800">{chore.title}</p>
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <span className="capitalize">{chore.frequency}</span>
                              <span>•</span>
                              <span>Assigned to {assignedChild?.name}</span>
                              <span>•</span>
                              <span className="text-orange-600 font-bold">{chore.points} pts</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <EditChoreDialog chore={chore} onEdit={updateChore} children={children} />
                          <Button variant="ghost" size="icon" onClick={() => deleteChore(chore.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.map(reward => (
              <Card key={reward.id} className="border-stone-200 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-stone-800">{reward.title}</p>
                    <p className="text-xs text-orange-600 font-bold">{reward.cost} Points</p>
                    {reward.assignedTo && (
                      <p className="text-[10px] text-stone-500 mt-1 uppercase font-bold tracking-wider">
                        Assigned to {children.find(c => c.id === reward.assignedTo)?.name || 'Unknown'}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <EditRewardDialog reward={reward} onEdit={updateReward} children={children} />
                    <Button variant="ghost" size="icon" onClick={() => deleteReward(reward.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddChoreDialog({ onAdd, children }: { onAdd: any, children: User[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState('10');
  const [assignedTo, setAssignedTo] = useState(children[0]?.id || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);

  const handleSelectFromCatalog = (val: string) => {
    setTitle(val);
    setShowCatalog(false);
  };

  const handleSubmit = () => {
    if (!title.trim() || !assignedTo) return;
    onAdd({
      title,
      description: '',
      points: parseInt(points),
      assignedTo,
      frequency,
      daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined
    });
    setOpen(false);
    setTitle('');
    setDaysOfWeek([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
          <Plus size={18} className="mr-2" /> Add Chore
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Chore</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2 relative">
            <Label htmlFor="title">Chore Title</Label>
            <div className="relative">
              <Input 
                id="title" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                onFocus={() => setShowCatalog(true)}
                onBlur={() => setTimeout(() => setShowCatalog(false), 200)}
                placeholder="Type a chore or pick from catalog..." 
                className="pr-10"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowCatalog(!showCatalog)}
                className="absolute right-0 top-0 h-full px-3 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <ChevronDown size={18} className={`transition-transform ${showCatalog ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {showCatalog && CHORE_CATALOG.filter(item => 
              item.title.toLowerCase().includes(title.toLowerCase())
            ).length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                <div className="p-1">
                  {CHORE_CATALOG.filter(item => 
                    item.title.toLowerCase().includes(title.toLowerCase())
                  ).map(item => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => handleSelectFromCatalog(item.title)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-600 transition-colors text-left rounded-md"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input id="points" type="number" value={points} onChange={e => setPoints(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child">Assign To</Label>
              <select 
                id="child" 
                className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
              >
                {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={frequency === 'daily'} onChange={() => setFrequency('daily')} /> Daily
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={frequency === 'weekly'} onChange={() => setFrequency('weekly')} /> Weekly
              </label>
            </div>
          </div>
          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Days of the week</Label>
              <div className="flex gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDaysOfWeek(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${daysOfWeek.includes(i) ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!title.trim() || !assignedTo || children.length === 0} className="bg-orange-500 hover:bg-orange-600 text-white">
            {children.length === 0 ? 'Add a child first' : 'Create Quest'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddRewardDialog({ onAdd, children }: { onAdd: any, children: User[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState('100');
  const [assignedTo, setAssignedTo] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title, cost: parseInt(cost), assignedTo: assignedTo || undefined });
    setOpen(false);
    setTitle('');
    setAssignedTo('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-stone-200 text-stone-600 rounded-xl">
          <Plus size={18} className="mr-2" /> Add Reward
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Reward</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reward-title">Reward Name</Label>
            <Input id="reward-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Extra Dessert" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Point Cost</Label>
              <Input id="cost" type="number" value={cost} onChange={e => setCost(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reward-child">Assign To</Label>
              <select 
                id="reward-child" 
                className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
              >
                <option value="">All Kids</option>
                {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white">Add to Shop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddUserDialog({ onAdd, parentId }: { onAdd: any, parentId?: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'child' | 'pet'>('child');
  const [petSpecies, setPetSpecies] = useState('');
  
  // Virtual Pet states for Child
  const [virtualPetType, setVirtualPetType] = useState('Dog');
  const [virtualPetName, setVirtualPetName] = useState('Buddy');

  const handleSubmit = () => {
    onAdd({
      name,
      role,
      parentId: (role === 'child' || role === 'pet') ? parentId : undefined,
      points: 0,
      level: 1,
      gender: 'other',
      avatar: role === 'pet' 
        ? `https://api.dicebear.com/7.x/bottts/svg?seed=${name}` 
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      pet: role === 'pet' 
        ? { type: petSpecies, name: name, stage: 1, accessories: [] } 
        : role === 'child' 
          ? { type: virtualPetType, name: virtualPetName, stage: 1, accessories: [] } 
          : undefined
    });
    setOpen(false);
    setName('');
    setPetSpecies('');
    setVirtualPetType('Dog');
    setVirtualPetName('Buddy');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 border-none">
          <Users size={18} className="mr-2" /> Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{role === 'pet' ? 'Pet Name' : 'Name'}</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder={role === 'pet' ? 'e.g. Bella' : 'e.g. Leo'} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={role === 'child'} onChange={() => setRole('child')} /> Child
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={role === 'pet'} onChange={() => setRole('pet')} /> Family Pet
              </label>
            </div>
          </div>
          
          {role === 'pet' && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <Label htmlFor="petSpecies">Pet Species / Breed</Label>
              <Input id="petSpecies" value={petSpecies} onChange={e => setPetSpecies(e.target.value)} placeholder="e.g. Golden Retriever, Turtle, Iguana" />
            </div>
          )}

          {role === 'child' && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-100">
              <div className="space-y-2">
                <Label htmlFor="virtualPetType">Virtual Pet Type</Label>
                <select 
                  id="virtualPetType" 
                  className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm"
                  value={virtualPetType}
                  onChange={e => setVirtualPetType(e.target.value)}
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Dragon">Dragon</option>
                  <option value="Fox">Fox</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="virtualPetName">Virtual Pet Name</Label>
                <Input id="virtualPetName" value={virtualPetName} onChange={e => setVirtualPetName(e.target.value)} placeholder="e.g. Buddy" />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-stone-800 hover:bg-stone-900 text-white">Save Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InvitePartnerDialog() {
  const { currentUser } = useFamily();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await storageService.createInvite(email, currentUser?.name);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setEmail('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 border-none">
          <Mail size={18} className="mr-2" /> Invite Partner
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Partner to Family</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {success ? (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center font-medium">
              Invite sent! They can now sign up with that email to join your family.
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="partnerEmail">Partner's Email</Label>
                <Input 
                  id="partnerEmail" 
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="partner@example.com" 
                />
              </div>
            </>
          )}
        </div>
        {!success && (
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={loading || !email.trim()} className="bg-orange-500 hover:bg-orange-600 text-white">
              {loading ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ChildReportDialog({ child, chores }: { child: User, chores: Chore[] }) {
  const [open, setOpen] = useState(false);
  const childChores = chores.filter(c => c.assignedTo === child.id);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full text-stone-600">
          View Full Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{child.name}'s Chore Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {childChores.length === 0 ? (
            <p className="text-stone-500 text-center">No chores assigned yet.</p>
          ) : (
            childChores.map(c => (
              <div key={c.id} className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-stone-800">{c.title}</h4>
                    <p className="text-xs text-stone-500 capitalize">{c.frequency} • {c.points} pts</p>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {c.completedDates.length} total
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EditChoreDialog({ chore, onEdit, children }: { chore: Chore, onEdit: any, children: User[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(chore.title);
  const [points, setPoints] = useState(chore.points.toString());
  const [assignedTo, setAssignedTo] = useState(chore.assignedTo);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(chore.frequency);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(chore.daysOfWeek || []);

  const handleSubmit = () => {
    if (!title.trim() || !assignedTo) return;
    onEdit(chore.id, {
      title,
      points: parseInt(points),
      assignedTo,
      frequency,
      daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-stone-400 hover:text-stone-600">
          <Edit2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Chore</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Chore Title</Label>
            <Input 
              id="edit-title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-points">Points</Label>
              <Input id="edit-points" type="number" value={points} onChange={e => setPoints(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-child">Assign To</Label>
              <select 
                id="edit-child" 
                className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
              >
                {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={frequency === 'daily'} onChange={() => setFrequency('daily')} /> Daily
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={frequency === 'weekly'} onChange={() => setFrequency('weekly')} /> Weekly
              </label>
            </div>
          </div>
          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Days of the week</Label>
              <div className="flex gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDaysOfWeek(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${daysOfWeek.includes(i) ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!title.trim() || !assignedTo} className="bg-orange-500 hover:bg-orange-600 text-white">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditRewardDialog({ reward, onEdit, children }: { reward: Reward, onEdit: any, children: User[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(reward.title);
  const [cost, setCost] = useState(reward.cost.toString());
  const [assignedTo, setAssignedTo] = useState(reward.assignedTo || '');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onEdit(reward.id, { title, cost: parseInt(cost), assignedTo: assignedTo || undefined });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-stone-400 hover:text-stone-600 transition-colors">
          <Edit2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Reward</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-reward-title">Reward Name</Label>
            <Input id="edit-reward-title" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cost">Point Cost</Label>
              <Input id="edit-cost" type="number" value={cost} onChange={e => setCost(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reward-child">Assign To</Label>
              <select 
                id="edit-reward-child" 
                className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
              >
                <option value="">All Kids</option>
                {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
