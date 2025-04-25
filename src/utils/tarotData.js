// src/utils/tarotData.js

// Basic data for Major Arcana cards with public domain Rider-Waite-Smith image URLs
// Source: Wikimedia Commons (Public Domain)
// You would expand this with Minor Arcana and potentially reversed meanings
export const majorArcana = [
    {
      id: 'the-fool',
      name: 'The Fool',
      image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg',
      keywords: ['beginnings', 'innocence', 'spontaneity', 'a free spirit'],
      description: 'Represents new beginnings, a leap of faith, and the start of an adventure.',
    },
    {
      id: 'the-magician',
      name: 'The Magician',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg',
      keywords: ['power', 'skill', 'concentration', 'resourcefulness'],
      description: 'Symbolizes having the tools, resources, and power needed to manifest desires.',
    },
    {
      id: 'the-high-priestess',
      name: 'The High Priestess',
      image: 'https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg',
      keywords: ['intuition', 'sacred knowledge', 'mystery', 'subconscious'],
      description: 'Represents intuition, mystery, and connecting with your inner wisdom.',
    },
    {
      id: 'the-empress',
      name: 'The Empress',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg',
      keywords: ['femininity', 'beauty', 'nature', 'nurturing', 'abundance'],
      description: 'Symbolizes femininity, nurturing, abundance, and connection to nature.',
    },
    {
      id: 'the-emperor',
      name: 'The Emperor',
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg',
      keywords: ['authority', 'structure', 'control', 'father figure'],
      description: 'Represents authority, structure, control, and a stable foundation.',
    },
    {
      id: 'the-hierophant',
      name: 'The Hierophant',
      image: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg',
      keywords: ['tradition', 'conformity', 'morality', 'ethics', 'values'],
      description: 'Symbolizes tradition, conventional values, and spiritual guidance.',
    },
    {
      id: 'the-lovers',
      name: 'The Lovers',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_06_Lovers.jpg',
      keywords: ['love', 'relationships', 'values', 'alignment', 'choices'],
      description: 'Represents love, relationships, choices, and alignment of values.',
    },
    {
      id: 'the-chariot',
      name: 'The Chariot',
      image: 'https://upload.wikimedia.org/wikipedia/commons/7/70/RWS_Tarot_07_Chariot.jpg',
      keywords: ['control', 'willpower', 'victory', 'direction', 'determination'],
      description: 'Symbolizes control, willpower, determination, and moving forward successfully.',
    },
    {
      id: 'strength',
      name: 'Strength',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg', // RWS typically has Strength as VIII
      keywords: ['strength', 'courage', 'patience', 'control', 'compassion'],
      description: 'Represents inner strength, courage, compassion, and self-control.',
    },
    {
      id: 'the-hermit',
      name: 'The Hermit',
      image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg',
      keywords: ['soul-searching', 'introspection', 'being alone', 'inner guidance'],
      description: 'Symbolizes introspection, soul-searching, solitude, and seeking inner guidance.',
    },
    {
      id: 'wheel-of-fortune',
      name: 'Wheel of Fortune',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg',
      keywords: ['good luck', 'karma', 'life cycles', 'destiny', 'a turning point'],
      description: 'Represents cycles, destiny, turning points, and the ebb and flow of life.',
    },
    {
      id: 'justice',
      name: 'Justice',
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg', // RWS typically has Justice as XI
      keywords: ['justice', 'fairness', 'truth', 'cause and effect', 'law'],
      description: 'Symbolizes justice, fairness, truth, and the consequences of actions.',
    },
    {
      id: 'the-hanged-man',
      name: 'The Hanged Man',
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg',
      keywords: ['pause', 'release', 'surrender', 'new perspectives'],
      description: 'Represents surrender, new perspectives, letting go, and seeing things differently.',
    },
    {
      id: 'death',
      name: 'Death',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg',
      keywords: ['endings', 'beginnings', 'change', 'transformation', 'transition'],
      description: 'Symbolizes endings, transformation, transition, and making space for new beginnings.',
    },
    {
      id: 'temperance',
      name: 'Temperance',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg',
      keywords: ['balance', 'moderation', 'patience', 'purpose', 'meaning'],
      description: 'Represents balance, moderation, patience, and finding harmony.',
    },
    {
      id: 'the-devil',
      name: 'The Devil',
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/RWS_Tarot_15_Devil.jpg',
      keywords: ['bondage', 'addiction', 'sexuality', 'materialism', 'shadow self'],
      description: 'Represents bondage, addiction, materialism, and the shadow self.',
    },
    {
      id: 'the-tower',
      name: 'The Tower',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/RWS_Tarot_16_Tower.jpg',
      keywords: ['disaster', 'upheaval', 'sudden change', 'revelation', 'chaos'],
      description: 'Represents sudden change, upheaval, revelation, and breaking down old structures.',
    },
    {
      id: 'the-star',
      name: 'The Star',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/da/RWS_Tarot_17_Star.jpg',
      keywords: ['hope', 'faith', 'rejuvenation', 'serenity', 'spirituality'],
      description: 'Symbolizes hope, faith, healing, inspiration, and serenity.',
    },
    {
      id: 'the-moon',
      name: 'The Moon',
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_18_Moon.jpg',
      keywords: ['illusion', 'fear', 'anxiety', 'subconscious', 'intuition'],
      description: 'Represents intuition, illusion, subconscious fears, and hidden truths.',
    },
    {
      id: 'the-sun',
      name: 'The Sun',
      image: 'https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg',
      keywords: ['joy', 'success', 'celebration', 'positivity', 'vitality'],
      description: 'Symbolizes joy, success, vitality, optimism, and radiant energy.',
    },
    {
      id: 'judgement',
      name: 'Judgement',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg',
      keywords: ['judgement', 'rebirth', 'inner calling', 'absolution'],
      description: 'Represents judgment, rebirth, awakening, and answering a higher calling.',
    },
    {
      id: 'the-world',
      name: 'The World',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg',
      keywords: ['completion', 'integration', 'accomplishment', 'travel'],
      description: 'Symbolizes completion, integration, accomplishment, and fulfillment.',
    },
  ];
  
  // Removed facedownCardImage URL export as we'll use CSS for the back
  // export const facedownCardImage = '...';
  