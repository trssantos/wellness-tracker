import React, { useState, useEffect } from 'react';
import { Brain, ChevronLeft, ChevronRight, X } from 'lucide-react';

const PersonalityQuiz = ({ onComplete, onCancel }) => {
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

  // Calculate personality type
  const calculateResults = () => {
    setIsCalculating(true);
    
    // Initialize counters for each dimension
    let e = 0, i = 0; // Extraversion vs. Introversion
    let s = 0, n = 0; // Sensing vs. Intuition
    let t = 0, f = 0; // Thinking vs. Feeling
    let j = 0, p = 0; // Judging vs. Perceiving

    // Process all answers
    Object.entries(answers).forEach(([questionId, value]) => {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      // Map the 1-7 scale to the appropriate counters
      // Values 1-3 favor the first preference, 5-7 favor the second, 4 is neutral
      if (question.dimension === 'EI') {
        value < 4 ? e += (4 - value) : i += (value - 4);
      } else if (question.dimension === 'SN') {
        value < 4 ? s += (4 - value) : n += (value - 4);
      } else if (question.dimension === 'TF') {
        value < 4 ? t += (4 - value) : f += (value - 4);
      } else if (question.dimension === 'JP') {
        value < 4 ? j += (4 - value) : p += (value - 4);
      }
    });

    // Determine the personality type
    const personalityType = {
      letter1: e >= i ? 'E' : 'I',
      letter2: s >= n ? 'S' : 'N',
      letter3: t >= f ? 'T' : 'F',
      letter4: j >= p ? 'J' : 'P',
      scores: {
        E: e, I: i,
        S: s, N: n,
        T: t, F: f,
        J: j, P: p
      }
    };

    // Create the full type code
    const typeCode = personalityType.letter1 + personalityType.letter2 + personalityType.letter3 + personalityType.letter4;
    
    // Get details for this personality type
    const typeDetails = personalityTypes[typeCode];
    
    const results = {
      type: typeCode,
      name: typeDetails.name,
      description: typeDetails.description,
      details: typeDetails.details,
      scores: personalityType.scores,
      timestamp: new Date().toISOString()
    };

    // Simulate a calculation delay
    setTimeout(() => {
      setIsCalculating(false);
      onComplete(results);
    }, 1500);
  };

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors max-w-3xl mx-auto">
      {/* Quiz header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
          <Brain className="text-purple-500 dark:text-purple-400" size={24} />
          16 Personalities Quiz
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
          className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full transition-all"
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

        {/* Answer options - Horizontal spectrum */}
        <div className="flex flex-col items-center">
          
          
          <div className="flex justify-between items-center w-full my-4">
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <button
                key={value}
                onClick={() => handleAnswer(currentQuestion.id, value)}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${
                  answers[currentQuestion.id] === value
                    ? value <= 3
                      ? 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-400'
                      : value >= 5
                        ? 'bg-purple-100 border-purple-500 dark:bg-purple-900/30 dark:border-purple-400'
                        : 'bg-gray-100 border-gray-500 dark:bg-gray-900/30 dark:border-gray-400'
                    : value <= 3
                      ? 'border-green-400 dark:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10'
                      : value >= 5
                        ? 'border-purple-400 dark:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                }`}
              >
                {answers[currentQuestion.id] === value && (
                  <div className={`w-6 h-6 rounded-full ${
                    value <= 3
                      ? 'bg-green-500 dark:bg-green-400'
                      : value >= 5
                        ? 'bg-purple-500 dark:bg-purple-400'
                        : 'bg-gray-500 dark:bg-gray-400'
                  }`}></div>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between w-full mt-2 px-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="text-left text-sm font-medium text-green-600 dark:text-green-400">{currentQuestion.optionA}</span>
            <div className="text-center md:w-1/3 mx-4">Neutral</div>
            <span className="text-right text-sm font-medium text-purple-600 dark:text-purple-400">{currentQuestion.optionB}</span>
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
                ? 'bg-purple-300 dark:bg-purple-800 text-purple-100 cursor-not-allowed'
                : 'bg-purple-500 dark:bg-purple-600 text-white hover:bg-purple-600 dark:hover:bg-purple-700'
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

// Question data
const questions = [
  {
    id: 'q1',
    dimension: 'EI',
    text: "How do you typically recharge?",
    optionA: "I get energy from being around people",
    optionB: "I need alone time to recharge"
  },
  {
    id: 'q2',
    dimension: 'EI',
    text: "You regularly make new friends.",
    optionA: "I easily make new connections",
    optionB: "I'm selective about new friendships"
  },
  {
    id: 'q3',
    dimension: 'EI',
    text: "At parties and social gatherings:",
    optionA: "I talk to many different people",
    optionB: "I prefer to stick with people I know"
  },
  {
    id: 'q4',
    dimension: 'EI',
    text: "Which work environment do you prefer?",
    optionA: "Collaborative and interactive",
    optionB: "Quiet and focused"
  },
  {
    id: 'q5',
    dimension: 'SN',
    text: "When solving problems, do you tend to:",
    optionA: "Rely on proven methods",
    optionB: "Look for creative new approaches"
  },
  {
    id: 'q6',
    dimension: 'SN',
    text: "You often think about the deeper meaning of things.",
    optionA: "I focus on practical details",
    optionB: "I focus on patterns and possibilities"
  },
  {
    id: 'q7',
    dimension: 'SN',
    text: "When reading, do you prefer:",
    optionA: "Real events and practical information",
    optionB: "Imaginative concepts and theories"
  },
  {
    id: 'q8',
    dimension: 'SN',
    text: "When planning a project, do you:",
    optionA: "Create detailed step-by-step plans",
    optionB: "Outline a general direction and adjust as you go"
  },
  {
    id: 'q9',
    dimension: 'TF',
    text: "When making important decisions, do you value more:",
    optionA: "Logic and objective analysis",
    optionB: "Harmony and others' feelings"
  },
  {
    id: 'q10',
    dimension: 'TF',
    text: "In a heated discussion, you stay objective and fact-focused.",
    optionA: "Facts and logic matter most",
    optionB: "People's feelings matter most"
  },
  {
    id: 'q11',
    dimension: 'TF',
    text: "When giving feedback, I prefer to be:",
    optionA: "Direct and straightforward",
    optionB: "Tactful and supportive"
  },
  {
    id: 'q12',
    dimension: 'TF',
    text: "I'm more likely to trust:",
    optionA: "Data and logical reasoning",
    optionB: "My personal values and intuition"
  },
  {
    id: 'q13',
    dimension: 'JP',
    text: "How do you prefer to approach deadlines?",
    optionA: "Plan ahead and finish early",
    optionB: "Work in bursts closer to the deadline"
  },
  {
    id: 'q14',
    dimension: 'JP',
    text: "You prefer having a detailed daily plan.",
    optionA: "Structure and schedules are important",
    optionB: "Flexibility and spontaneity are important"
  },
  {
    id: 'q15',
    dimension: 'JP',
    text: "What bothers you more?",
    optionA: "Disorganization and uncertainty",
    optionB: "Too many rules and constraints"
  },
  {
    id: 'q16',
    dimension: 'JP',
    text: "How do you prefer your workspace?",
    optionA: "Neat and everything in its place",
    optionB: "Creative with room for adjustment"
  },
];

// Personality type details
const personalityTypes = {
  "ISTJ": {
    name: "The Inspector",
    description: "Responsible, organized, and detail-oriented, ISTJs are dependable and practical. They value tradition, loyalty, and security.",
    details: {
      strengths: "Organized, honest, dedicated, dignified, traditional",
      weaknesses: "Stubborn, insensitive to others' needs, judgmental, resistance to change",
      careers: "Accounting, administration, law enforcement, military, engineering",
      hobbies: "Chess, woodworking, gardening, collecting, DIY projects",
      relationships: "Loyal and committed, sometimes struggle with emotional expression",
      compatibility: "Often compatible with ESFP and ESTP types who balance their serious nature"
    }
  },
  "ISFJ": {
    name: "The Protector",
    description: "Warm, considerate, and eager to help, ISFJs are focused on meeting the practical needs of others with extraordinary attention to detail.",
    details: {
      strengths: "Supportive, reliable, observant, patient, detail-oriented",
      weaknesses: "Overly self-sacrificing, reluctant to change, avoiding conflict",
      careers: "Nursing, teaching, counseling, social work, administrative support",
      hobbies: "Cooking, gardening, crafting, volunteering, photography",
      relationships: "Deeply caring and loyal, prefer stable and harmonious relationships",
      compatibility: "Often connect well with ESFP and ESTP who appreciate their supportive nature"
    }
  },
  "INFJ": {
    name: "The Counselor",
    description: "Idealistic, principled, and complex, INFJs seek meaning and connection in all things with a deep desire to help others realize their potential.",
    details: {
      strengths: "Insightful, principled, creative, altruistic, determined",
      weaknesses: "Perfectionistic, burnout-prone, private to a fault, highly sensitive",
      careers: "Counseling, psychology, writing, teaching, human resources",
      hobbies: "Creative writing, art, philosophy, psychology, spiritual pursuits",
      relationships: "Deep and meaningful connections, selective about close relationships",
      compatibility: "Often drawn to ENFP and ENTP types who share their intuitive perspective"
    }
  },
  "INTJ": {
    name: "The Architect",
    description: "Strategic, innovative, and independent, INTJs are driven by their own original ideas and the desire to improve systems and processes.",
    details: {
      strengths: "Strategic thinking, independent, insightful, determined, knowledgeable",
      weaknesses: "Overly critical, dismissive of emotions, arrogant, excessively private",
      careers: "Scientific research, systems design, strategic planning, engineering, academia",
      hobbies: "Strategy games, reading, research, theoretical discussions, solo projects",
      relationships: "Selective and intellectually stimulating relationships",
      compatibility: "Often connect well with ENFP and ENTP who appreciate their depth"
    }
  },
  "ISTP": {
    name: "The Craftsman",
    description: "Bold, practical problem solvers who excel at understanding how mechanical things work, ISTPs value efficiency and hands-on experience.",
    details: {
      strengths: "Adaptable, practical, logical, hands-on problem solving, observant",
      weaknesses: "Detached, prone to risk-taking, difficulty with commitment, reserved",
      careers: "Engineering, mechanics, emergency services, computer programming, construction",
      hobbies: "Building things, extreme sports, martial arts, working with tools, gaming",
      relationships: "Value personal space, practical rather than emotional approach",
      compatibility: "Often work well with ESFJ and ESTJ types who complement their reserved nature"
    }
  },
  "ISFP": {
    name: "The Composer",
    description: "Gentle, sensitive artists who live in the moment, ISFPs are experimental and aesthetically inclined with a strong sense of personal values.",
    details: {
      strengths: "Creative, sensitive, caring, artistic, living in the present",
      weaknesses: "Conflict avoidant, overly private, unpredictable, difficulty with planning",
      careers: "Art, design, music, healthcare, personal care services, craftsmanship",
      hobbies: "Music, visual arts, cooking, outdoor activities, fashion",
      relationships: "Deeply caring but may struggle with verbal expression of feelings",
      compatibility: "Often drawn to ESFJ and ESTJ types who provide structure and stability"
    }
  },
  "INFP": {
    name: "The Healer",
    description: "Idealistic, empathetic, and authentic, INFPs are guided by their core values and seek to make the world a better place.",
    details: {
      strengths: "Idealistic, empathetic, open-minded, creative, passionate",
      weaknesses: "Unrealistic, self-isolating, emotionally vulnerable, impractical",
      careers: "Writing, counseling, teaching, arts, non-profit work",
      hobbies: "Creative writing, reading, art, music, cause-oriented activities",
      relationships: "Deeply devoted, seek authentic connections based on shared values",
      compatibility: "Often connect well with ENFJ and ENTJ who appreciate their depth"
    }
  },
  "INTP": {
    name: "The Logician",
    description: "Innovative, logical, and curious, INTPs explore ideas and theoretical systems with an analytical approach to understanding the world.",
    details: {
      strengths: "Analytical, original thinking, open-minded, intellectual, objective",
      weaknesses: "Disconnected from others, overthinking, neglecting practical matters",
      careers: "Scientific research, philosophy, computer programming, mathematics, academia",
      hobbies: "Scientific pursuits, debate, reading, theoretical discussions, strategy games",
      relationships: "Value intellectual connection above all else",
      compatibility: "Often work well with ENFJ and ENTJ who bring structure to their ideas"
    }
  },
  "ESTP": {
    name: "The Dynamo",
    description: "Energetic, pragmatic, and spontaneous, ESTPs live in the moment and bring a playful approach to solving practical problems.",
    details: {
      strengths: "Energetic, perceptive, bold, practical, rational",
      weaknesses: "Impatient, risk-prone, unstructured, blunt, attention-seeking",
      careers: "Sales, entrepreneurship, emergency services, sports, entertainment",
      hobbies: "Competitive sports, outdoor adventures, social activities, racing, gaming",
      relationships: "Fun-loving and exciting but may struggle with long-term commitment",
      compatibility: "Often pair well with ISFJ and ISTJ who appreciate their energetic approach"
    }
  },
  "ESFP": {
    name: "The Performer",
    description: "Spontaneous, enthusiastic, and fun-loving, ESFPs bring joy to others and embrace life with contagious excitement.",
    details: {
      strengths: "Enthusiastic, practical, observant, friendly, present-focused",
      weaknesses: "Easily bored, dislike theory, sensitive to criticism, avoid conflict",
      careers: "Entertainment, sales, teaching, coaching, hospitality",
      hobbies: "Performing arts, social events, fashion, travel, team sports",
      relationships: "Warm and fun, focus on creating enjoyable experiences together",
      compatibility: "Often connect well with ISFJ and ISTJ who provide stability"
    }
  },
  "ENFP": {
    name: "The Champion",
    description: "Enthusiastic, creative, and sociable, ENFPs are motivated by possibilities and what could be, with a contagious enthusiasm for new ideas and projects.",
    details: {
      strengths: "Enthusiastic, creative, empathetic, spontaneous, independent",
      weaknesses: "Unfocused, disorganized, overly optimistic, approval-seeking",
      careers: "Counseling, teaching, arts, marketing, entrepreneurship",
      hobbies: "Creative activities, humanitarian causes, improvisational activities",
      relationships: "Deeply caring, value authentic connection and growth",
      compatibility: "Often drawn to INTJ and INFJ who appreciate their enthusiasm"
    }
  },
  "ENTP": {
    name: "The Visionary",
    description: "Quick, ingenious, and outspoken, ENTPs enjoy mental challenges and are driven by possibilities for innovation and improvement.",
    details: {
      strengths: "Innovative, knowledgeable, excellent brainstorming, energetic, adaptable",
      weaknesses: "Argumentative, insensitive, difficulty following through",
      careers: "Entrepreneurship, law, engineering, creative fields, consulting",
      hobbies: "Debate, complex games, theoretical discussions, improv comedy",
      relationships: "Value mental stimulation and dislike routine",
      compatibility: "Often connect well with INTJ and INFJ who can match their intellectual depth"
    }
  },
  "ESTJ": {
    name: "The Supervisor",
    description: "Practical, direct, and structured, ESTJs excel at organizing people and processes to get things done efficiently and according to established rules.",
    details: {
      strengths: "Organized, dedicated, practical, direct, dependable",
      weaknesses: "Inflexible, judging, difficulty with the abstract, stubborn",
      careers: "Business management, administration, military, law, finance",
      hobbies: "Community service, sports, collecting, traditional pastimes",
      relationships: "Clear expectations and roles, value stability and tradition",
      compatibility: "Often work well with ISFP and ISTP who benefit from their organization"
    }
  },
  "ESFJ": {
    name: "The Provider",
    description: "Warm-hearted, conscientious, and cooperative, ESFJs are focused on creating harmony and meeting others' needs in a structured way.",
    details: {
      strengths: "Supportive, reliable, warm, organized, practical",
      weaknesses: "Needing approval, sensitive to criticism, inflexible, avoiding the unconventional",
      careers: "Healthcare, education, religious work, community service, hospitality",
      hobbies: "Group activities, volunteering, family traditions, social events",
      relationships: "Caring and loyal, focused on maintaining harmony",
      compatibility: "Often pair well with ISFP and ISTP who appreciate their warmth"
    }
  },
  "ENFJ": {
    name: "The Teacher",
    description: "Charismatic, empathetic, and inspiring, ENFJs are natural leaders who bring out the best in others and work toward the greater good.",
    details: {
      strengths: "Charismatic, empathetic, natural leaders, altruistic, reliable",
      weaknesses: "Approval-seeking, overextending themselves, idealistic, controlling",
      careers: "Teaching, counseling, human resources, ministry, non-profit leadership",
      hobbies: "Group activities, personal development, volunteering, creative pursuits",
      relationships: "Deeply invested in others' growth and happiness",
      compatibility: "Often connect well with INFP and INTP who value their supportive nature"
    }
  },
  "ENTJ": {
    name: "The Commander",
    description: "Strategic, ambitious, and energetic, ENTJs are natural leaders who quickly see illogical and inefficient procedures and develop innovative solutions.",
    details: {
      strengths: "Strategic thinking, confident, efficient, strong-willed, rational",
      weaknesses: "Impatient, arrogant, intolerant, poor handling of emotions",
      careers: "Executive leadership, entrepreneurship, law, consulting, politics",
      hobbies: "Strategy games, competitive activities, learning new skills, debate",
      relationships: "Value intellectual connection and shared goals",
      compatibility: "Often work well with INFP and INTP who appreciate their direction"
    }
  }
};

export default PersonalityQuiz;