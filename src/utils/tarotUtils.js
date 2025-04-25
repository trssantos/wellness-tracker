// src/utils/tarotUtils.js
import { majorArcana } from './tarotData';
import { getStorage, setStorage } from './storage'; // Assuming you have a storage utility

const TAROT_STORAGE_KEY = 'dailyTarotDraw';

// Helper function to check if a date is today
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.getDate() === today.getDate() &&
         checkDate.getMonth() === today.getMonth() &&
         checkDate.getFullYear() === today.getFullYear();
};

// Calculate simple biorhythms (Physical, Emotional, Intellectual)
// This is a simplified version; a full implementation would be more complex.
// Requires birthDate in 'YYYY-MM-DD' format.
const calculateBiorhythms = (birthDate) => {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  const today = new Date();
  const diffTime = today - birth;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Difference in days

  if (diffDays < 0) return null; // Birth date is in the future

  const physicalCycle = 23;
  const emotionalCycle = 28;
  const intellectualCycle = 33;

  const physical = Math.sin((2 * Math.PI * diffDays) / physicalCycle);
  const emotional = Math.sin((2 * Math.PI * diffDays) / emotionalCycle);
  const intellectual = Math.sin((2 * Math.PI * diffDays) / intellectualCycle);

  // Return values normalized between 0 and 1 (or -1 to 1 if preferred)
  // Here we return -1 to 1
  return {
    physical,
    emotional,
    intellectual,
  };
};

// Fisher-Yates (Knuth) Shuffle algorithm
export const shuffleArray = (array) => {
  const shuffledArray = [...array]; // Create a copy to avoid mutating the original array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
  }
  return shuffledArray;
};


// Draw a random card from the Major Arcana (now using shuffled array)
// This function is less needed now that we select from a shuffled pool in the component
// export const drawRandomCard = () => {
//   const randomIndex = Math.floor(Math.random() * majorArcana.length);
//   return majorArcana[randomIndex];
// };

// Get the daily card from storage or indicate no card drawn today
export const getDailyCard = () => { // Simplified, drawing logic is in component now
  const storage = getStorage();
  const dailyDraw = storage.lifestyle?.[TAROT_STORAGE_KEY];

  // Check if a card was already drawn today
  if (dailyDraw && dailyDraw.date && isToday(dailyDraw.date)) {
    // Find the card data based on the saved ID
    const card = majorArcana.find(c => c.id === dailyDraw.cardId);
    if (card) {
       // If the card exists and was drawn today, return it with saved interpretation/prompt
       return {
         card,
         interpretation: dailyDraw.interpretation,
         journalPrompt: dailyDraw.journalPrompt,
         isNewDraw: false, // Indicate it's not a new draw
       };
    }
  }

  // No card drawn today, return null
  return null;
};

// Interpret the card based on personality and biorhythms
// This is a placeholder function - you would add complex logic here
// Now accepts birthDate to calculate biorhythms internally
export const interpretCard = (card, personalityProfile, birthDate) => {
  let interpretation = `The ${card.name} card appears today. It generally signifies ${card.description.toLowerCase()}.`;

  // Calculate biorhythms here
  const biorhythms = calculateBiorhythms(birthDate);


  // Example of integrating personality (MBTI)
  if (personalityProfile?.type) {
    interpretation += `\n\nConsidering your ${personalityProfile.type} personality type, this card might relate to... [Add interpretation based on MBTI type]`;
    // Example: If card is The Hermit and type is Extraverted, maybe it suggests needing alone time.
    // If card is The Chariot and type is Judging, maybe it reinforces focus and direction.
  }

   // Example of integrating personality (Zodiac)
  if (personalityProfile?.zodiacSign?.signData) {
     interpretation += `\n\nGiven your ${personalityProfile.zodiacSign.signData.name} sign, the energy of The ${card.name} could highlight... [Add interpretation based on Zodiac sign]`;
     // Example: If card is The Sun and sign is Leo, maybe it emphasizes natural vitality and leadership.
     // If card is The Moon and sign is Cancer, maybe it speaks to emotional depth and intuition.
  }

   // Example of integrating personality (Enneagram)
   if (personalityProfile?.enneagramResults?.primaryType) {
      interpretation += `\n\nFrom your Enneagram Type ${personalityProfile.enneagramResults.primaryType} perspective, this card may be prompting you to consider... [Add interpretation based on Enneagram type]`;
      // Example: If card is The Tower and type is Nine, maybe it relates to avoiding conflict or sudden change.
      // If card is Strength and type is Eight, maybe it highlights channeling power with compassion.
   }


  // Example of integrating biorhythms - SAFELY ACCESS PROPERTIES
  if (biorhythms) {
    interpretation += `\n\nLooking at your biorhythms today (Physical: ${biorhythms.physical.toFixed(2)}, Emotional: ${biorhythms.emotional.toFixed(2)}, Intellectual: ${biorhythms.intellectual.toFixed(2)}), this card's message might resonate with... [Add interpretation based on biorhythm levels]`;
    // Example: If card is The Chariot and Physical biorhythm is high, maybe it suggests a good day for taking action.
    // If card is The Moon and Emotional biorhythm is low, maybe it advises caution with emotions.
  } else {
      interpretation += `\n\nTo get an interpretation based on your biorhythms, please set your birth date in the Biorhythm Tracker or Zodiac section.`;
  }


  interpretation += `\n\nReflect on how the core meaning (${card.keywords.join(', ')}) applies to your current situation.`;


  return interpretation;
};

// Generate journaling prompts based on the card and interpretation
// This is a placeholder function - expand with more specific prompts
export const generateJournalPrompt = (card, interpretation) => {
  let prompt = `Journaling Prompt for The ${card.name}:\n\n`;

  prompt += `How does the core message of "${card.description}" relate to something happening in your life today?`;

   if (interpretation.includes('Considering your')) { // Check if personality interpretation was added
      prompt += `\n\nGiven your personality traits, how might you approach the energy of this card?`;
   }

   if (interpretation.includes('Looking at your biorhythms')) { // Check if biorhythm interpretation was added
       prompt += `\n\nHow do your current biorhythm levels influence your understanding or experience of this card's message?`;
   }

  prompt += `\n\nWhat action or reflection does this card inspire in you today?`;

  return prompt;
};
