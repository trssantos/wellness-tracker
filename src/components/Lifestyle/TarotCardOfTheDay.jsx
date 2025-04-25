// src/components/Lifestyle/TarotCardOfTheDay.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Book, Star, FileText, RefreshCw } from 'lucide-react'; // Import RefreshCw icon
import { getDailyCard, interpretCard, generateJournalPrompt, shuffleArray } from '../../utils/tarotUtils'; // Import shuffleArray
import { majorArcana } from '../../utils/tarotData'; // Import majorArcana
import { getStorage, setStorage } from '../../utils/storage';
import './TarotCardOfTheDay.css'; // We'll use this CSS file for animation and layout

const TarotCardOfTheDay = ({ onBack }) => {
  const [dailyDraw, setDailyDraw] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cardsInPool, setCardsInPool] = useState([]); // State to hold cards shown facedown
  const [selectedCardId, setSelectedCardId] = useState(null); // State to track selected card

  useEffect(() => {
    // Fetch user data and daily card on component mount
    setIsLoading(true);
    try {
      const draw = getDailyCard(); // getDailyCard now just checks storage

      if (draw && draw.card) {
        // If a card was drawn today, set it and reveal immediately
        setDailyDraw(draw);
        setSelectedCardId(draw.card.id); // Set selected ID for consistent rendering
        setIsRevealed(true);
      } else {
        // If no card was drawn today, populate the pool with shuffled Major Arcana
        setCardsInPool(shuffleArray(majorArcana)); // Shuffle cards here
      }
    } catch (err) {
      console.error("Error fetching daily tarot card:", err);
      setError("Could not load the daily tarot card.");
    } finally {
      setIsLoading(false);
    }
    // Dependency array is empty to run only on mount
  }, []);


  // Effect to handle the animation timing after a card is selected
  useEffect(() => {
    if (selectedCardId && dailyDraw?.isNewDraw && !isRevealed) {
      // If a new card was just selected, wait a moment for the flip animation
      const revealTimer = setTimeout(() => {
        setIsRevealed(true);
      }, 800); // Adjust delay to match CSS transition duration

      return () => clearTimeout(revealTimer); // Cleanup the timer
    }
    // Dependencies: selectedCardId and isRevealed are state variables, dailyDraw is state/prop
  }, [selectedCardId, dailyDraw, isRevealed]);


  const handleCardSelection = (cardId) => {
    if (dailyDraw) {
      // If a card is already drawn for today, don't allow drawing again
      return;
    }

    setIsLoading(true); // Show loading while processing selection
    setSelectedCardId(cardId); // Mark the card as selected

    // Find the selected card data
    const selected = majorArcana.find(card => card.id === cardId);
    if (!selected) {
      setError("Selected card not found.");
      setIsLoading(false);
      return;
    }

     // Fetch user data again for interpretation logic
    const storage = getStorage();
    const birthDate = storage.lifestyle?.birthDate;
    const personalityProfile = {
      type: storage.lifestyle?.personalityResults?.type,
      zodiacSign: storage.lifestyle?.zodiacSign,
      enneagramResults: storage.lifestyle?.enneagramResults,
    };


    // Generate interpretation and prompt
    // Pass birthDate and personalityProfile to interpretCard/generateJournalPrompt
    const interpretation = interpretCard(selected, personalityProfile, birthDate);
    const journalPrompt = generateJournalPrompt(selected, interpretation);

    // Create the new daily draw object
    const newDailyDraw = {
      card: selected,
      interpretation,
      journalPrompt,
      isNewDraw: true, // Indicate this was a new draw
    };

    // Save the new draw to storage
    const today = new Date().toISOString();
    // Fetch storage again to ensure we have the latest version before saving
    const updatedStorage = getStorage();
    if (!updatedStorage.lifestyle) {
      updatedStorage.lifestyle = {};
    }
    updatedStorage.lifestyle.dailyTarotDraw = { // Use a consistent key
      date: today,
      cardId: selected.id,
      interpretation,
      journalPrompt,
    };
    setStorage(updatedStorage);

    // Update state to show the revealed card and content
    setDailyDraw(newDailyDraw);
    // isRevealed is set in the useEffect after a delay for animation
    setIsLoading(false);
  };

  const handleDrawAgain = () => {
    setIsLoading(true);
    setIsRevealed(false);
    setDailyDraw(null);
    setSelectedCardId(null);
    setCardsInPool(shuffleArray(majorArcana)); // Shuffle cards when drawing again

    // Clear the saved daily draw from storage
    const storage = getStorage();
    if (storage.lifestyle?.dailyTarotDraw) {
      delete storage.lifestyle.dailyTarotDraw;
      setStorage(storage);
    }

    setError(null);
    setIsLoading(false); // Finished resetting
  };


  if (isLoading) {
    return <div className="text-center text-slate-600 dark:text-slate-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 dark:text-red-400">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm transition-colors">
      <button
        onClick={onBack}
        className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 transition-colors">
        <Star className="text-amber-500 dark:text-amber-400" size={28} />
        Tarot Card of the Day
      </h1>

      {!dailyDraw && ( // Show card pool if no card is drawn yet
        <>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Choose a card from the pool below to receive your daily message.
          </p>
          <div className="tarot-card-pool">
            {cardsInPool.map(card => (
              <div
                key={card.id}
                className={`tarot-card-container ${selectedCardId === card.id ? 'is-selected' : ''}`}
                onClick={() => handleCardSelection(card.id)}
              >
                <div className="tarot-card">
                   {/* Card Front (Hidden initially in pool) */}
                  <div className="tarot-card-face tarot-card-front bg-cover bg-center rounded-lg shadow-lg"
                       style={{ backgroundImage: `url(${card.image})` }}>
                  </div>
                  {/* Card Back (Shown initially in pool) */}
                  <div className="tarot-card-face tarot-card-back rounded-lg shadow-lg">
                      {/* CSS background handled in CSS file */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {dailyDraw && ( // Show revealed card and content if a card is drawn
        <div className="space-y-6">
           <p className="text-slate-600 dark:text-slate-400 mb-6">
             Your card for today is:
           </p>
           <div className="flex justify-center items-center min-h-[350px]"> {/* Centering the single card */}
              <div
                className={`tarot-card-container ${isRevealed ? 'is-revealed' : ''}`}
                // No onClick needed on the single revealed card
              >
                <div className="tarot-card">
                   {/* Card Front (Revealed) */}
                  <div className="tarot-card-face tarot-card-front bg-cover bg-center rounded-lg shadow-lg"
                       style={{ backgroundImage: `url(${dailyDraw.card.image})` }}>
                  </div>
                   {/* Card Back (Hidden when revealed) */}
                  <div className="tarot-card-face tarot-card-back rounded-lg shadow-lg">
                       {/* CSS background handled in CSS file */}
                   </div>
                </div>
              </div>
           </div>

          {isRevealed && ( // Show interpretation and prompt only when revealed
            <div className="mt-8 space-y-6 animate-fadeIn">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-100 dark:border-amber-800/30 transition-colors">
                <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                  <Book size={24} />
                  The {dailyDraw.card.name}
                </h2>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{dailyDraw.interpretation}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30 transition-colors">
                 <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                   <FileText size={24} />
                   Journaling Prompt
                 </h2>
                 <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{dailyDraw.journalPrompt}</p>
              </div>

               <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                 This is your card for today. You can draw again tomorrow.
               </p>

               {/* Draw Again Button */}
               <div className="flex justify-center mt-6">
                   <button
                     onClick={handleDrawAgain}
                     className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium flex items-center gap-1"
                   >
                     <RefreshCw size={16} /> Draw Another Card
                   </button>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TarotCardOfTheDay;
