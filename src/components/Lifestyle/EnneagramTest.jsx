// src/components/Lifestyle/EnneagramTest.jsx
import React, { useState, useEffect } from 'react';
import { Type, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';

const EnneagramTest = ({ onComplete, onCancel }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Update progress bar
  useEffect(() => {
    if (questions.length > 0) {
      setProgress((Object.keys(answers).length / questions.length) * 100);
    }
  }, [answers]);

  // Check if all questions are answered
  useEffect(() => {
    setIsComplete(Object.keys(answers).length === questions.length);
  }, [answers]);

  // Handle answer selection
  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Auto-advance to next question if not on the last one
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300); // Small delay for better UX
    }
  };

  // Navigate to the next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to the previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Calculate results
  const calculateResults = () => {
    setIsCalculating(true);
    
    // Initialize counters for each type
    const scores = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 
      6: 0, 7: 0, 8: 0, 9: 0
    };

    // Process all answers
    Object.entries(answers).forEach(([questionId, value]) => {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      // Calculate scores for each type based on answers
      for (const [type, weight] of Object.entries(question.typeWeights)) {
        // For questions where higher value means more like the type
        if (question.valueDirection === 'positive') {
          scores[type] += (value / 5) * weight;
        } 
        // For questions where lower value means more like the type
        else {
          scores[type] += ((6 - value) / 5) * weight;
        }
      }
    });

    // Find primary and secondary types
    let primaryType = '1';
    let secondaryType = '1';
    let highestScore = 0;
    let secondHighestScore = 0;

    for (const [type, score] of Object.entries(scores)) {
      if (score > highestScore) {
        secondHighestScore = highestScore;
        secondaryType = primaryType;
        highestScore = score;
        primaryType = type;
      } else if (score > secondHighestScore) {
        secondHighestScore = score;
        secondaryType = type;
      }
    }

    // Determine the wing
    const wing = determineWing(primaryType, scores);

    // Calculate percentage match for each type
    const maxPossibleScore = questions.reduce((sum, q) => {
      const typeWeight = q.typeWeights[primaryType] || 0;
      return sum + typeWeight;
    }, 0);

    const percentages = {};
    for (const type in scores) {
      const maxForType = questions.reduce((sum, q) => {
        const typeWeight = q.typeWeights[type] || 0;
        return sum + typeWeight;
      }, 0);
      percentages[type] = Math.round((scores[type] / maxForType) * 100);
    }

    // Create results object
    const results = {
      primaryType,
      wing,
      typeName: enneagramTypes[primaryType].name,
      typeDescription: enneagramTypes[primaryType].description,
      wingName: enneagramTypes[wing].name,
      wingInfluence: `Your ${enneagramTypes[wing].name} wing adds ${enneagramTypes[wing].wingInfluence}`,
      scores: percentages,
      timestamp: new Date().toISOString()
    };

    // Simulate a calculation delay for better UX
    setTimeout(() => {
      setIsCalculating(false);
      
      // Save to storage
      const storage = getStorage();
      if (!storage.lifestyle) {
        storage.lifestyle = {};
      }
      storage.lifestyle.enneagramResults = results;
      setStorage(storage);
      
      onComplete(results);
    }, 1500);
  };

  // Determine the wing based on the primary type and scores
  const determineWing = (primaryType, scores) => {
    const typeNum = parseInt(primaryType);
    
    // Potential wings are adjacent numbers (with wrapping for 1 and 9)
    const potentialWings = [
      typeNum === 1 ? 9 : typeNum - 1,
      typeNum === 9 ? 1 : typeNum + 1
    ];
    
    // Return the higher scoring wing
    return String(scores[potentialWings[0]] > scores[potentialWings[1]] ? 
                 potentialWings[0] : potentialWings[1]);
  };

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors max-w-3xl mx-auto">
      {/* Quiz header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
          <Type className="text-indigo-500 dark:text-indigo-400" size={24} />
          Enneagram Personality Test
        </h2>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mb-6">
        <div 
          className="bg-indigo-500 dark:bg-indigo-400 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question count */}
      <div className="text-center mb-6">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Current question */}
      <div className="mb-10 text-center">
        <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-10">
          {currentQuestion.text}
        </h3>

        {/* Answer options - Scale */}
        <div className="flex flex-col items-center">
          <div className="flex justify-between items-center w-full my-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleAnswer(currentQuestion.id, value)}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${
                  answers[currentQuestion.id] === value
                    ? 'bg-indigo-100 border-indigo-500 dark:bg-indigo-900/30 dark:border-indigo-400'
                    : 'border-indigo-300 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                }`}
              >
                {answers[currentQuestion.id] === value && (
                  <div className="w-6 h-6 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-between w-full mt-2 px-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="text-left text-sm font-medium">Strongly Disagree</span>
            <span className="text-right text-sm font-medium">Strongly Agree</span>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-12">
        <button
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-4 py-2 rounded-lg flex items-center ${
            currentQuestionIndex === 0
              ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <ChevronLeft size={20} className="mr-1" />
          Previous
        </button>

        {isComplete ? (
          <button
            onClick={calculateResults}
            disabled={isCalculating}
            className={`px-6 py-2 rounded-lg font-medium ${
              isCalculating
                ? 'bg-indigo-300 dark:bg-indigo-800 text-indigo-100 cursor-not-allowed'
                : 'bg-indigo-500 dark:bg-indigo-600 text-white hover:bg-indigo-600 dark:hover:bg-indigo-700'
            }`}
          >
            {isCalculating ? 'Calculating...' : 'See Your Results'}
          </button>
        ) : (
          <button
            onClick={goToNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1 && !answers[currentQuestion.id]}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentQuestionIndex === questions.length - 1 && !answers[currentQuestion.id]
                ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Next
            <ChevronRight size={20} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

// Enneagram types information
const enneagramTypes = {
  '1': {
    name: "The Perfectionist",
    description: "Ethical, dedicated and reliable, they are motivated by a desire to live the right way, improve the world, and avoid fault and blame.",
    wingInfluence: "elements of creativity and emotional awareness to your perfectionistic tendencies.",
    strengths: "Honest, responsible, improvement-oriented, ethical, fair",
    weaknesses: "Critical, perfectionistic, judgmental, tense, controlling",
    compatibleWith: ["2", "7", "9"]
  },
  '2': {
    name: "The Helper",
    description: "Warm, caring and generous, they are motivated by a need to be loved and needed, and to avoid acknowledging their own needs.",
    wingInfluence: "a mix of supportiveness with either organization or self-expression.",
    strengths: "Caring, interpersonal, warm, supporting, giving",
    weaknesses: "People-pleasing, possessive, manipulative, emotional",
    compatibleWith: ["1", "4", "8"]
  },
  '3': {
    name: "The Achiever",
    description: "Success-oriented, image-conscious and wired for productivity, they are motivated by a need to be successful and to avoid failure.",
    wingInfluence: "either emotional depth or reflective inquiry to your achievement orientation.",
    strengths: "Efficient, practical, ambitious, inspiring, competent",
    weaknesses: "Image-conscious, competitive, narcissistic, workaholic",
    compatibleWith: ["6", "9", "1"]
  },
  '4': {
    name: "The Individualist",
    description: "Creative, sensitive and moody, they are motivated by a need to be understood, experience their oversized feelings and avoid being ordinary.",
    wingInfluence: "either a helping attitude or analytical thinking to your emotional depth.",
    strengths: "Creative, authentic, emotional depth, inspiration, compassion",
    weaknesses: "Moody, self-absorbed, melancholic, withdrawn, envious",
    compatibleWith: ["2", "9", "5"]
  },
  '5': {
    name: "The Investigator",
    description: "Analytical, detached and private, they are motivated by a need to gain knowledge, conserve energy and avoid relying on others.",
    wingInfluence: "either artistic sensitivity or methodical conscientiousness to your analytical nature.",
    strengths: "Analytical, thoughtful, innovative, objective, perceptive",
    weaknesses: "Detached, isolated, overthinking, provocative, stingy",
    compatibleWith: ["1", "7", "9"]
  },
  '6': {
    name: "The Loyalist",
    description: "Committed, practical and witty, they are motivated by fear and the need for security.",
    wingInfluence: "either adventurousness or methodical thinking to your loyalty-focused perspective.",
    strengths: "Loyal, responsible, committed, practical, problem-solving",
    weaknesses: "Anxious, doubtful, fearful, suspicious, indecisive",
    compatibleWith: ["3", "8", "9"]
  },
  '7': {
    name: "The Enthusiast",
    description: "Fun, spontaneous and versatile, they are motivated by a need to be happy, plan stimulating experiences and avoid pain.",
    wingInfluence: "either strategic thinking or responsible diligence to your enthusiastic outlook.",
    strengths: "Optimistic, enthusiastic, productive, versatile, adventurous",
    weaknesses: "Scattered, impulsive, escapist, undisciplined, excessive",
    compatibleWith: ["3", "5", "9"]
  },
  '8': {
    name: "The Challenger",
    description: "Commanding, intense and confrontational, they are motivated by a need to be strong and avoid feeling weak or vulnerable.",
    wingInfluence: "either adventure-seeking or purpose-driven loyalty to your powerful presence.",
    strengths: "Strong, assertive, protective, decisive, resilient",
    weaknesses: "Controlling, domineering, confrontational, aggressive",
    compatibleWith: ["2", "4", "6"]
  },
  '9': {
    name: "The Peacemaker",
    description: "Pleasant, laid back and accommodating, they are motivated by a need to keep the peace, merge with others and avoid conflict.",
    wingInfluence: "either assertiveness or perfectionism to your harmonious nature.",
    strengths: "Harmonious, accepting, stable, supportive, optimistic",
    weaknesses: "Complacent, conflict-avoidant, stubborn, disengaged",
    compatibleWith: ["1", "3", "5"]
  }
};

// Test questions
const questions = [
  {
    id: 'q1',
    text: "I tend to be critical of myself and others when standards aren't met.",
    typeWeights: { '1': 1.0, '3': 0.3 },
    valueDirection: 'positive'
  },
  {
    id: 'q2',
    text: "I often put others' needs ahead of my own.",
    typeWeights: { '2': 1.0, '9': 0.4 },
    valueDirection: 'positive'
  },
  {
    id: 'q3',
    text: "Being successful and recognized for my achievements is very important to me.",
    typeWeights: { '3': 1.0, '7': 0.3 },
    valueDirection: 'positive'
  },
  {
    id: 'q4',
    text: "I often feel that something significant is missing from my life.",
    typeWeights: { '4': 1.0, '7': 0.2 },
    valueDirection: 'positive'
  },
  {
    id: 'q5',
    text: "I prefer to observe situations before getting involved.",
    typeWeights: { '5': 1.0, '9': 0.3 },
    valueDirection: 'positive'
  },
  {
    id: 'q6',
    text: "I tend to worry about what could go wrong in various situations.",
    typeWeights: { '6': 1.0, '1': 0.4 },
    valueDirection: 'positive'
  },
  {
    id: 'q7',
    text: "I seek out new experiences and opportunities for adventure.",
    typeWeights: { '7': 1.0, '3': 0.2 },
    valueDirection: 'positive'
  },
  {
    id: 'q8',
    text: "I naturally take charge in most situations.",
    typeWeights: { '8': 1.0, '3': 0.3 },
    valueDirection: 'positive'
  },
  {
    id: 'q9',
    text: "I avoid conflict and try to keep everyone getting along.",
    typeWeights: { '9': 1.0, '2': 0.3 },
    valueDirection: 'positive'
  },
  {
    id: 'q10',
    text: "I have strong opinions about what's right and wrong.",
    typeWeights: { '1': 1.0, '8': 0.4 },
    valueDirection: 'positive'
  },
  {
    id: 'q11',
    text: "I'm very aware of other people's feelings and emotional needs.",
    typeWeights: { '2': 1.0, '4': 0.4 },
    valueDirection: 'positive'
  },
  {
    id: 'q12',
    text: "I care about how I present myself and the image I project.",
    typeWeights: { '3': 1.0, '4': 0.2 },
    valueDirection: 'positive'
  },
  {
    id: 'q13',
    text: "I often feel misunderstood or different from others.",
    typeWeights: { '4': 1.0, '5': 0.2 },
    valueDirection: 'positive'
  },
  {
    id: 'q14',
    text: "I need time alone to recharge my energy.",
    typeWeights: { '5': 1.0, '4': 0.2 },
    valueDirection: 'positive'
  },
  {
    id: 'q15',
    text: "I value loyalty and tend to be skeptical of new people until they prove trustworthy.",
    typeWeights: { '6': 1.0, '8': 0.3 },
    valueDirection: 'positive'
  },
  {
    id: 'q16',
    text: "I get bored easily and look for new possibilities.",
    typeWeights: { '7': 1.0, '3': 0.2 },
    valueDirection: 'positive'
  },
  {
    id: 'q17',
    text: "I stand up for myself and others when needed.",
    typeWeights: { '8': 1.0, '2': 0.2 },
    valueDirection: 'positive'
  },
  {
    id: 'q18',
    text: "I tend to go with the flow and avoid making waves.",
    typeWeights: { '9': 1.0, '5': 0.2 },
    valueDirection: 'positive'
  },
  {
    id: 'q19',
    text: "I notice mistakes and inefficiencies that others miss.",
    typeWeights: { '1': 1.0, '5': 0.3 },
    valueDirection: 'positive'
  },
  {
    id: 'q20',
    text: "It's important to me that people like me.",
    typeWeights: { '2': 1.0, '3': 0.4 },
    valueDirection: 'positive'
  },
  {
    id: 'q21',
    text: "I adapt easily to meet expectations or goals.",
    typeWeights: { '3': 1.0, '9': 0.2 },
    valueDirection: 'positive'
  },
  {
    id: 'q22',
    text: "I'm drawn to what's absent or missing in my life.",
    typeWeights: { '4': 1.0, '6': 0.2 },
    valueDirection: 'positive'
  },
  {
    id: 'q23',
    text: "I prefer to maintain emotional distance from others.",
    typeWeights: { '5': 1.0, '3': 0.2 },
    valueDirection: 'positive'
  },
  {
    id: 'q24',
    text: "I'm sensitive to hidden agendas and others' motivations.",
    typeWeights: { '6': 1.0, '8': 0.3 },
    valueDirection: 'positive'
  },
  {
    id: 'q25',
    text: "I focus on possibilities and options rather than problems.",
    typeWeights: { '7': 1.0, '9': 0.3 },
    valueDirection: 'positive'
  },
  {
    id: 'q26',
    text: "I can be intimidating when I need to be.",
    typeWeights: { '8': 1.0, '1': 0.2 },
    valueDirection: 'positive'
  },
  {
    id: 'q27',
    text: "I often see multiple perspectives and have trouble taking sides.",
    typeWeights: { '9': 1.0, '6': 0.2 },
    valueDirection: 'positive'
  }
];

export default EnneagramTest;