import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { ArrowLeft, FileText, Swords, Trophy, Users, AlertCircle } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-stone-200/50 border border-stone-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-stone-900 tracking-tight leading-tight">Terms of Service</h1>
              <p className="text-stone-500 font-medium">The family contract for your next big adventure.</p>
            </div>
          </div>

          <div className="prose prose-stone max-w-none space-y-10 text-stone-600 leading-relaxed">
            <section className="space-y-4">
              <p className="text-lg">
                Welcome to ChoreQuest! By using our app, you’re agreeing to these terms. We’ve kept them simple and clear so you can get back to what matters: crushing your family goals.
              </p>
              <p className="text-sm text-stone-400">Last Updated: May 1, 2026</p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Users className="text-orange-500" size={20} />
                <h2 className="text-xl font-bold text-stone-900 m-0">1. The Party Leader</h2>
              </div>
              <p>
                Every family quest needs a leader. The "Parent" who creates the account is the primary Party Leader. As the leader, you are responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Managing the profiles for your family members.</li>
                <li>Setting fair chores and exciting rewards.</li>
                <li>Keeping your account login and Parent PIN secure.</li>
              </ul>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Trophy className="text-yellow-500" size={20} />
                <h2 className="text-xl font-bold text-stone-900 m-0">2. The Loot (Rewards)</h2>
              </div>
              <p>
                ChoreQuest is a tool to track points and progress. While we provide the digital XP and levels, <strong>the fulfillment of real-world rewards is entirely up to the Party Leader.</strong> We don't provide the physical prizes or extra screen time—that’s where your family magic happens!
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Swords className="text-red-500" size={20} />
                <h2 className="text-xl font-bold text-stone-900 m-0">3. Fair Play</h2>
              </div>
              <p>
                To keep the adventure fun for everyone, you agree to use ChoreQuest for its intended purpose: family productivity. Please don’t use the app for anything illegal or attempt to "hack" the point system in a way that ruins the spirit of the game.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-stone-400" size={20} />
                <h2 className="text-xl font-bold text-stone-900 m-0">4. Adventure Disclaimer</h2>
              </div>
              <p>
                We work hard to keep ChoreQuest running 24/7, but sometimes technology has its own ideas. We provide the app "as is" and aren't responsible for any data loss or unexpected downtime. We recommend keeping a mental (or physical) note of your family’s most important milestones!
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-stone-900 m-0">5. Leaving the Quest</h2>
              <p>
                You can stop your adventure at any time. If you decide ChoreQuest isn't for you, you can request account deletion by emailing <span className="font-bold text-stone-900">chorequest.pro@gmail.com</span>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
