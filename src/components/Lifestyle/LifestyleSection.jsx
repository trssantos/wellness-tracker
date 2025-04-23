import React, { useState } from 'react';
import { Heart, Book, UserCheck, Info, Award, Copy, Share2, Bookmark, Brain, Briefcase, Users, Coffee, ThumbsUp, ThumbsDown, HeartHandshake, RefreshCw } from 'lucide-react';
import PersonalityQuiz from './PersonalityQuiz';
import PersonalityResults from './PersonalityResults';
import { getStorage, setStorage } from '../../utils/storage';

const LifestyleSection = () => {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [savedResults, setSavedResults] = useState(getSavedResults());

  // Get saved personality results from storage
  function getSavedResults() {
    const storage = getStorage();
    if (!storage.lifestyle) {
      storage.lifestyle = { personalityResults: null };
      setStorage(storage);
    }
    return storage.lifestyle.personalityResults;
  }

  // Save personality results to storage
  function saveResults(results) {
    const storage = getStorage();
    if (!storage.lifestyle) {
      storage.lifestyle = {};
    }
    storage.lifestyle.personalityResults = results;
    setStorage(storage);
    setSavedResults(results);
  }

  // Handle completing a quiz
  const handleQuizComplete = (results) => {
    setQuizResults(results);
    saveResults(results);
    setActiveQuiz(null);
  };

  // Reset quiz and results
  const resetQuiz = () => {
    setQuizResults(null);
    setActiveQuiz(null);
  };

  // Reset saved results
  const clearSavedResults = () => {
    saveResults(null);
    setQuizResults(null);
  };

  // Available quizzes
  const quizzes = [
    {
      id: 'personality',
      title: '16 Personalities',
      description: 'Discover your personality type based on the Myers-Briggs Type Indicator (MBTI)',
      icon: <Brain className="text-purple-500 dark:text-purple-400" size={40} />,
      color: 'purple',
    },
    // Future quizzes can be added here
  ];

  return (
    <div className="space-y-6">
      {/* Active quiz */}
      {activeQuiz === 'personality' && (
        <PersonalityQuiz 
          onComplete={handleQuizComplete} 
          onCancel={() => setActiveQuiz(null)}
        />
      )}

      {/* Quiz results */}
      {(quizResults || savedResults) && !activeQuiz && (
        <PersonalityResults 
          results={quizResults || savedResults} 
          onReset={clearSavedResults}
          onRetake={() => setActiveQuiz('personality')}
        />
      )}

      {/* Quiz selection */}
      {!activeQuiz && !quizResults && !savedResults && (
        <>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 transition-colors">
              <Heart className="text-red-500 dark:text-red-400" size={28} />
              Lifestyle
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6 transition-colors">
              Discover more about yourself through our selection of personality and lifestyle quizzes. 
              Gain insights into your personality type, work preferences, and more.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <div 
                  key={quiz.id}
                  className={`bg-${quiz.color}-50 dark:bg-${quiz.color}-900/30 border border-${quiz.color}-200 dark:border-${quiz.color}-800/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md`}
                  onClick={() => setActiveQuiz(quiz.id)}
                >
                  <div className="flex items-center mb-4">
                    {quiz.icon}
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 ml-3">
                      {quiz.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {quiz.description}
                  </p>
                  <button className="px-4 py-2 bg-white dark:bg-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    Start Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 transition-colors">
              <Info className="text-blue-500 dark:text-blue-400" size={24} />
              Why Take Personality Quizzes?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">
                    Self-awareness
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Understand your personality traits, strengths, and areas for growth
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg text-green-600 dark:text-green-400">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">
                    Career insights
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Discover careers and work environments where you might thrive
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">
                    Better relationships
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Learn how to better communicate and connect with different personality types
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                  <Book size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">
                    Personal growth
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Find personalized strategies for development based on your unique traits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LifestyleSection;