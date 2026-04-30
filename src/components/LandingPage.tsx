import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, Star, ShieldCheck, Heart, Sparkles, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200">
            CQ
          </div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">ChoreQuest</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-stone-600 hover:text-stone-900 font-semibold" onClick={onGetStarted}>
            Log In
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-200" onClick={onGetStarted}>
            Get Started Free
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-24 px-6 text-center max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 mb-6 px-4 py-1 text-sm rounded-full inline-flex items-center gap-2">
            <Sparkles size={16} /> Gamify your household chores
          </Badge>
          <h2 className="text-5xl md:text-7xl font-black text-stone-900 tracking-tighter leading-tight mb-6">
            Turn Family Chores into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Fun Adventure.</span>
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-10">
            ChoreQuest transforms daily tasks into an interactive game. Kids earn points, level up, and unlock real-world rewards, while parents get a cleaner house without the nagging.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl h-14 px-8 text-lg w-full sm:w-auto" onClick={onGetStarted}>
              Start Your Quest <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="border-stone-200 bg-white text-stone-800 font-bold rounded-2xl h-14 px-8 text-lg w-full sm:w-auto" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Video Demo Section */}
      <section id="demo" className="py-16 px-6 bg-stone-100 border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 space-y-4">
            <h3 className="text-3xl font-black tracking-tight">See ChoreQuest in Action</h3>
            <p className="text-stone-500">Watch how easy it is to manage your family's daily tasks.</p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }}
            className="aspect-video bg-stone-900 rounded-3xl overflow-hidden relative shadow-2xl ring-4 ring-white"
          >
            {/* Using a placeholder open source video for the demo */}
            <video 
              className="w-full h-full object-cover" 
              controls 
              poster="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=1200"
            >
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              Your browser does not support HTML video.
            </video>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h3 className="text-4xl font-black tracking-tight">How to play</h3>
          <p className="text-xl text-stone-500 max-w-2xl mx-auto">Three simple steps to build better habits.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-none shadow-lg bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <CardContent className="p-8 pt-12 space-y-4 relative z-10">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm">
                1
              </div>
              <h4 className="text-2xl font-bold text-stone-900">Build Your Party</h4>
              <p className="text-stone-600 leading-relaxed">
                Create profiles for the whole family—Parents, Kids, and even the Family Pets! Kids get to pick a Virtual Pet character that grows with them.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <CardContent className="p-8 pt-12 space-y-4 relative z-10">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm">
                2
              </div>
              <h4 className="text-2xl font-bold text-stone-900">Assign Quests & Loot</h4>
              <p className="text-stone-600 leading-relaxed">
                Parents assign daily or weekly chores (like "Clean your room") and set up real-world rewards (like "Extra Screen Time") with a point cost.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <CardContent className="p-8 pt-12 space-y-4 relative z-10">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm">
                3
              </div>
              <h4 className="text-2xl font-bold text-stone-900">Level Up!</h4>
              <p className="text-stone-600 leading-relaxed">
                Kids log in, complete their quests, and watch their points and levels go up. Once they have enough points, they claim their hard-earned rewards!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h3 className="text-4xl font-black tracking-tight leading-tight">
              Why families love ChoreQuest
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0">
                  <Star className="text-yellow-500" />
                </div>
                <div>
                  <h5 className="text-xl font-bold mb-2">Feels like a video game</h5>
                  <p className="text-stone-400">Clear goals, immediate feedback, and fun progression keep kids motivated to do their chores without being asked.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="text-green-500" />
                </div>
                <div>
                  <h5 className="text-xl font-bold mb-2">Builds lasting responsibility</h5>
                  <p className="text-stone-400">By managing their own tasks and earning their own rewards, kids learn the value of hard work and independence.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center flex-shrink-0">
                  <Heart className="text-pink-500" />
                </div>
                <div>
                  <h5 className="text-xl font-bold mb-2">Peace of mind for parents</h5>
                  <p className="text-stone-400">Complete visibility into who is doing what, automated tracking, and absolutely no more arguments about chores.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-stone-800 rounded-3xl p-8 relative overflow-hidden border border-stone-700">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 blur-[100px] opacity-20" />
            <div className="space-y-6 relative z-10">
              <div className="bg-stone-900 rounded-2xl p-4 border border-stone-700 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-green-500">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-sm text-stone-400">Daily Quest Completed</p>
                  <p className="font-bold">Clean Bedroom (+20 pts)</p>
                </div>
              </div>
              <div className="bg-stone-900 rounded-2xl p-4 border border-stone-700 flex items-center gap-4 ml-8">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-yellow-500">
                  <Star size={24} />
                </div>
                <div>
                  <p className="text-sm text-stone-400">Level Up!</p>
                  <p className="font-bold">Leo reached Level 4</p>
                </div>
              </div>
              <div className="bg-stone-900 rounded-2xl p-4 border border-stone-700 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-orange-500">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-sm text-stone-400">Reward Claimed</p>
                  <p className="font-bold">Extra Screen Time (-100 pts)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-24 px-6 text-center bg-orange-500 text-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-black">Ready to start your adventure?</h2>
          <p className="text-xl text-orange-100">Join families everywhere who have turned chore time into game time.</p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-stone-100 font-bold rounded-2xl h-14 px-10 text-lg" onClick={onGetStarted}>
            Create Your Family Profile
          </Button>
        </div>
      </footer>
    </div>
  );
}
