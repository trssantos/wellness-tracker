import React from 'react';
import { Brain, Dumbbell, MessageCircle, Layout, Timer, Music, Heart, Book, Wind, Zap, Users, Sliders, ListChecks, FileText, Star, CalendarClock } from 'lucide-react';

export const MeditationSection = () => {
  // Features for meditation section
  const features = [
    { icon: <Timer size={18} />, title: "Guided Sessions", description: "Follow along with timed breathing exercises and guided meditations" },
    { icon: <Music size={18} />, title: "Ambient Sounds", description: "Relaxing background sounds to enhance your meditation experience" },
    { icon: <Heart size={18} />, title: "Mindfulness Tips", description: "Daily mindfulness reminders and mental wellness practices" },
    { icon: <Book size={18} />, title: "Inspirational Quotes", description: "Discover wisdom from philosophers and meditation teachers" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 transition-colors">
          <Brain className="text-purple-500 dark:text-purple-400" size={24} />
          Meditation
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-purple-50 dark:bg-purple-900/30 p-8 rounded-xl mb-4 flex items-center justify-center flex-shrink-0">
            <Brain className="text-purple-500 dark:text-purple-400" size={80} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors">
              Coming Soon
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 transition-colors">
              Find your center with guided meditation sessions, breathing exercises, 
              and mindfulness practices designed to reduce stress and improve focus.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Breathing exercise preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <Wind className="text-purple-500 dark:text-purple-400" size={20} />
          Breathing Exercise Preview
        </h3>
        
        <div className="flex items-center justify-center py-6">
          <div className="relative">
            <div className="w-32 h-32 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-purple-200 dark:bg-purple-800/60 rounded-full flex items-center justify-center animate-pulse">
                <Heart size={30} className="text-purple-500 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-center mt-4 text-purple-600 dark:text-purple-400 font-medium">Coming in the next update</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WorkoutSection = () => {
  // Features for workout section
  const features = [
    { icon: <Timer size={18} />, title: "Interval Timer", description: "Customizable HIIT and circuit training timers" },
    { icon: <Music size={18} />, title: "80s Workout Mix", description: "YouTube integration for the ultimate retro workout experience" },
    { icon: <Zap size={18} />, title: "Quick Routines", description: "Pre-built workouts for when you're short on time" },
    { icon: <Sliders size={18} />, title: "Progress Tracking", description: "Monitor your improvements and personal records" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 transition-colors">
          <Dumbbell className="text-green-500 dark:text-green-400" size={24} />
          Workout
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-green-50 dark:bg-green-900/30 p-8 rounded-xl mb-4 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="text-green-500 dark:text-green-400" size={80} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors">
              Coming Soon
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 transition-colors">
              Take your fitness routine to the next level with our 80s-themed workout
              companion. Track your progress, follow guided workouts, and stay motivated
              with energizing music.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg text-green-600 dark:text-green-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 80s Themed Player Preview */}
      <div className="bg-slate-900 rounded-xl shadow-sm p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-pink-500 flex items-center gap-2">
            <Music className="text-cyan-400" size={20} />
            <span className="bg-gradient-to-r from-pink-500 to-cyan-400 text-transparent bg-clip-text">80s Workout Player</span>
          </h3>
          <p className="text-cyan-400 text-xs font-mono">COMING SOON</p>
        </div>
        
        <div className="border-2 border-pink-500 bg-slate-800 rounded-lg p-4 mb-4">
          <div className="h-16 flex items-center justify-center">
            <div className="w-4 h-8 bg-pink-500 rounded-sm mx-1 animate-pulse"></div>
            <div className="w-4 h-12 bg-cyan-400 rounded-sm mx-1 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-10 bg-pink-500 rounded-sm mx-1 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-16 bg-cyan-400 rounded-sm mx-1 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-4 h-8 bg-pink-500 rounded-sm mx-1 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <div className="w-4 h-4 bg-cyan-400 rounded-sm mx-1 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-4 h-10 bg-pink-500 rounded-sm mx-1 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button className="bg-pink-500 text-white p-2 rounded-lg text-sm font-bold">▶ PLAY</button>
          <button className="bg-cyan-400 text-slate-900 p-2 rounded-lg text-sm font-bold">⏸ PAUSE</button>
          <button className="border border-pink-500 text-pink-500 p-2 rounded-lg text-sm font-bold">⏭ NEXT</button>
        </div>
      </div>
    </div>
  );
};

export const DayCoachSection = () => {
  // Features for coach section
  const features = [
    { icon: <Star size={18} />, title: "Personalized Guidance", description: "Tailored advice based on your habits and preferences" },
    { icon: <Users size={18} />, title: "Supportive Chat", description: "Encouraging conversations to keep you motivated" },
    { icon: <ListChecks size={18} />, title: "Smart Task Suggestions", description: "AI-powered recommendations for your daily routine" },
    { icon: <CalendarClock size={18} />, title: "Scheduling Assistant", description: "Help with planning and time management" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 transition-colors">
          <MessageCircle className="text-blue-500 dark:text-blue-400" size={24} />
          Day Coach
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-8 rounded-xl mb-4 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="text-blue-500 dark:text-blue-400" size={80} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors">
              Coming Soon
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 transition-colors">
              Your personal AI coach provides encouragement, breaks down complex tasks,
              suggests activities based on your patterns, and offers support to help you 
              achieve your goals.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <MessageCircle className="text-blue-500 dark:text-blue-400" size={20} />
          Chat Preview
        </h3>
        
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-700 p-3 border-b border-slate-200 dark:border-slate-600">
            <h4 className="font-medium text-slate-700 dark:text-slate-200">Day Coach</h4>
          </div>
          
          <div className="p-4 h-60 overflow-y-auto flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                <MessageCircle size={16} className="text-blue-500 dark:text-blue-400" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg max-w-xs">
                <p className="text-sm text-slate-700 dark:text-slate-200">Hey there! How's your day going so far?</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 self-end">
              <div className="bg-blue-500 p-3 rounded-lg max-w-xs">
                <p className="text-sm text-white">I'm feeling a bit stressed about my presentation tomorrow.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                <MessageCircle size={16} className="text-blue-500 dark:text-blue-400" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg max-w-xs">
                <p className="text-sm text-slate-700 dark:text-slate-200">I understand. Let's break down your preparation into smaller steps so it feels more manageable.</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center my-2">
              <span className="text-xs text-slate-400 dark:text-slate-500">Coming soon...</span>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Type a message..."
              disabled
              className="flex-1 bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-slate-400 dark:text-slate-500 cursor-not-allowed"
            />
            <button className="bg-blue-500 dark:bg-blue-600 text-white p-2 rounded-lg opacity-50 cursor-not-allowed">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TemplatesSection = () => {
  // Features for templates section
  const features = [
    { icon: <FileText size={18} />, title: "Reusable Templates", description: "Create task templates for recurring activities" },
    { icon: <Layout size={18} />, title: "Custom Categories", description: "Organize tasks into personalized categories" },
    { icon: <Zap size={18} />, title: "Quick Apply", description: "Apply templates with one click to save time" },
    { icon: <ListChecks size={18} />, title: "Mix & Match", description: "Combine multiple templates for comprehensive plans" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 transition-colors">
          <Layout className="text-teal-500 dark:text-teal-400" size={24} />
          Templates
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-teal-50 dark:bg-teal-900/30 p-8 rounded-xl mb-4 flex items-center justify-center flex-shrink-0">
            <Layout className="text-teal-500 dark:text-teal-400" size={80} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors">
              Coming Soon
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 transition-colors">
              Create reusable task templates for recurring activities like house cleaning, 
              work projects, or study sessions. Combine multiple templates for a custom 
              daily plan and save time on task management.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-teal-100 dark:bg-teal-900/50 p-2 rounded-lg text-teal-600 dark:text-teal-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Template Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <FileText className="text-teal-500 dark:text-teal-400" size={20} />
          Sample Templates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-teal-50 dark:bg-teal-900/30 p-3 border-b border-slate-200 dark:border-slate-700">
              <h4 className="font-medium text-slate-700 dark:text-slate-200">Morning Routine</h4>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Drink water</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">5 min stretching</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Plan daily tasks</p>
              </div>
            </div>
          </div>
          
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-teal-50 dark:bg-teal-900/30 p-3 border-b border-slate-200 dark:border-slate-700">
              <h4 className="font-medium text-slate-700 dark:text-slate-200">Work Focus</h4>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Clear inbox</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Priority task #1</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Team check-in</p>
              </div>
            </div>
          </div>
          
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-teal-50 dark:bg-teal-900/30 p-3 border-b border-slate-200 dark:border-slate-700">
              <h4 className="font-medium text-slate-700 dark:text-slate-200">Evening Unwind</h4>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Review accomplishments</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">10 min reading</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Prepare for tomorrow</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <button className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-lg text-sm font-medium opacity-60 cursor-not-allowed">
            Coming soon...
          </button>
        </div>
      </div>
    </div>
  );
};