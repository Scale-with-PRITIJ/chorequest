import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { ArrowLeft, Shield, Heart, Sparkles, Lock } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-stone-900 tracking-tight leading-tight">Privacy Policy</h1>
              <p className="text-stone-500 font-medium">Clear, simple, and protective of your family.</p>
            </div>
          </div>

          <div className="prose prose-stone max-w-none space-y-10 text-stone-600 leading-relaxed">
            <section className="space-y-4">
              <p className="text-lg">
                At ChoreQuest, we’re on a mission to turn daily tasks into a fun family adventure. To do that, we collect a small amount of information to keep your quest running smoothly and your family’s progress safe.
              </p>
              <p className="text-sm text-stone-400">Last Updated: May 1, 2026</p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="text-blue-500" size={20} />
                <h2 className="text-xl font-bold text-stone-900 m-0">1. Information we collect</h2>
              </div>
              <div className="grid gap-4">
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                  <h3 className="font-bold text-stone-900 mb-1">Account Basics</h3>
                  <p className="text-sm">We collect your email address to create your family account and the names or nicknames you choose for each family member’s profile.</p>
                </div>
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                  <h3 className="font-bold text-stone-900 mb-1">Activity & Progress</h3>
                  <p className="text-sm">We store the chores you create and your family’s completion history. This allows us to track your XP, levels, and earned rewards so your hard work is never lost.</p>
                </div>
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                  <h3 className="font-bold text-stone-900 mb-1">Technical Data</h3>
                  <p className="text-sm">Like most apps, we collect basic technical information (such as your browser type and app version) to ensure ChoreQuest runs perfectly on all your devices.</p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Heart className="text-pink-500" size={20} />
                <h2 className="text-xl font-bold text-stone-900 m-0">2. How we use your data</h2>
              </div>
              <p>We use your information strictly to provide the best experience for your family:</p>
              <ul className="list-disc pl-5 space-y-3">
                <li>To keep the ChoreQuest world running and your progress synced.</li>
                <li>To show you helpful summaries of your family’s achievements.</li>
                <li>To keep your family safe with secure profile access.</li>
                <li>To fix bugs and make the app even better for everyone.</li>
              </ul>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Lock className="text-green-500" size={20} />
                <h2 className="text-xl font-bold text-stone-900 m-0">3. Sharing and Security</h2>
              </div>
              <p>
                <strong>We do not sell your data to anyone.</strong> We only share information with a few trusted service providers (like Google Firebase) that help us host the app and keep it secure. Your family's data is private to you.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-stone-900 m-0">4. Your Control</h2>
              <p>
                You are always in the driver’s seat. If you ever want to delete your family account and all associated data, just reach out to us at <span className="font-bold text-stone-900">chorequest.pro@gmail.com</span>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
