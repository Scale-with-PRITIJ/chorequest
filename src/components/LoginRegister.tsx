import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';

interface LoginRegisterProps {
  onSuccess: () => void;
}

export function LoginRegister({ onSuccess }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('other');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (name.trim()) {
          localStorage.setItem('chorequest_signup_name', name.trim());
          localStorage.setItem('chorequest_signup_gender', gender);
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-orange-200 mb-4">
            CQ
          </div>
          <CardTitle className="text-2xl font-black text-stone-900">
            {isLogin ? 'Welcome Back!' : 'Create Family Account'}
          </CardTitle>
          <p className="text-stone-500">
            {isLogin ? 'Log in to manage your family quests.' : 'Register to start gamifying your chores.'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                {error}
              </div>
            )}
            
            {!isLogin && (
              <>
                <div className="space-y-2 text-left">
                  <Label htmlFor="name">Your Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Mom, Dad, or your first name" 
                    required={!isLogin} 
                  />
                </div>

                <div className="space-y-2 text-left">
                  <Label htmlFor="gender">Your Gender (for Avatar)</Label>
                  <select 
                    id="gender" 
                    className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm"
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                  >
                    <option value="other">Surprise Me</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </>
            )}
            
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="parent@example.com" 
                required 
              />
            </div>
            
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-xl"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Log In' : 'Sign Up')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="font-bold text-orange-600 hover:underline"
            >
              {isLogin ? 'Register here' : 'Log in here'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
