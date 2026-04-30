/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { FamilyProvider, useFamily } from './lib/FamilyContext';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { ChildDashboard } from './components/ChildDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { LandingPage } from './components/LandingPage';
import { LoginRegister } from './components/LoginRegister';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, ChevronDown, RefreshCcw, User as UserIcon } from 'lucide-react';

function AppContent() {
  const { currentUser, setCurrentUser, isAuthenticated, logout } = useFamily();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => console.log('Backend health check:', data))
      .catch(err => console.error('Backend fetch error:', err));
  }, []);

  // Not logged in and hasn't clicked "Get Started" → show landing page
  if (!isAuthenticated && !showAuth) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  // Clicked "Get Started" but not yet authenticated → show login/register
  if (!isAuthenticated && showAuth) {
    return <LoginRegister onSuccess={() => setShowAuth(false)} />;
  }

  // Authenticated but no profile selected → show profile switcher
  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="min-h-screen bg-stone-50 flex items-center justify-center p-4"
      >
        <ProfileSwitcher onSelect={setCurrentUser} />
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200">
              CQ
            </div>
            <h1 className="text-xl font-bold text-stone-800 hidden sm:block">ChoreQuest</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser.role === 'parent' ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-1 pr-3 hover:bg-stone-50 rounded-full transition-colors border border-transparent hover:border-stone-100"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 bg-stone-100">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-stone-800 leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] text-stone-500 uppercase font-black tracking-tighter leading-tight">Parent</p>
                  </div>
                  <ChevronDown size={14} className={`text-stone-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-20" 
                        onClick={() => setShowUserMenu(false)} 
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl z-30 py-1 overflow-hidden"
                      >
                        <button 
                          onClick={() => {
                            setCurrentUser(null);
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors border-b border-stone-50"
                        >
                          <RefreshCcw size={16} className="text-stone-400" />
                          <span>Switch Profile</span>
                        </button>
                        <button 
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} className="text-red-400" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-stone-800">{currentUser.name}</p>
                  <p className="text-xs text-stone-500 capitalize">{currentUser.role}</p>
                </div>
                <button 
                  onClick={() => setCurrentUser(null)}
                  className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
                >
                  Switch Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {currentUser.role === 'child' ? (
            <motion.div
              key="child"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ChildDashboard user={currentUser} />
            </motion.div>
          ) : (
            <motion.div
              key="parent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ParentDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <FamilyProvider>
      <AppContent />
    </FamilyProvider>
  );
}

