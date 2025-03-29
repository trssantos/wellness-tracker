// src/utils/sentimentAnalysis.js

// Dictionaries for positive and negative words in English and Portuguese
export const sentimentDictionaries = {
    positive: {
      english: [
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific',
        'happy', 'joy', 'joyful', 'pleased', 'delighted', 'cheerful', 'content',
        'excited', 'thrilled', 'elated', 'ecstatic', 'satisfied', 'grateful',
        'thankful', 'proud', 'confident', 'positive', 'optimistic', 'hopeful',
        'motivated', 'inspired', 'energetic', 'lively', 'vibrant', 'refreshed',
        'relaxed', 'calm', 'peaceful', 'tranquil', 'serene', 'comfortable',
        'love', 'loved', 'adore', 'enjoy', 'fun', 'interested', 'fascinated',
        'accomplished', 'achievement', 'success', 'successful', 'win', 'winning',
        'improve', 'improved', 'better', 'best', 'perfect', 'awesome',
        'beautiful', 'pretty', 'lovely', 'nice', 'pleasant', 'favorable',
        'bright', 'brilliant', 'smart', 'clever', 'wise', 'insightful',
        'laugh', 'smile', 'grin', 'giggle', 'chuckle'
      ],
      portuguese: [
        'bom', 'boa', 'ótimo', 'ótima', 'excelente', 'incrível', 'maravilhoso', 'maravilhosa',
        'fantástico', 'fantástica', 'feliz', 'alegria', 'alegre', 'contente', 'satisfeito',
        'satisfeita', 'empolgado', 'empolgada', 'animado', 'animada', 'entusiasmado',
        'entusiasmada', 'grato', 'grata', 'agradecido', 'agradecida', 'orgulhoso',
        'orgulhosa', 'confiante', 'positivo', 'positiva', 'otimista', 'esperançoso',
        'esperançosa', 'motivado', 'motivada', 'inspirado', 'inspirada', 'energético',
        'energética', 'revigorado', 'revigorada', 'relaxado', 'relaxada', 'calmo', 'calma',
        'tranquilo', 'tranquila', 'sereno', 'serena', 'confortável', 'amor', 'amado',
        'amada', 'adorar', 'adorável', 'divertido', 'divertida', 'interessado', 'interessada',
        'fascinado', 'fascinada', 'realizado', 'realizada', 'conquista', 'sucesso',
        'bem-sucedido', 'bem-sucedida', 'vencer', 'vitória', 'melhorar', 'melhorado',
        'melhorada', 'melhor', 'perfeito', 'perfeita', 'lindo', 'linda', 'bonito',
        'bonita', 'agradável', 'favorável', 'brilhante', 'inteligente', 'esperto',
        'esperta', 'sábio', 'sábia', 'perspicaz', 'rir', 'sorrir', 'sorriso', 'gargalhada'
      ]
    },
    negative: {
      english: [
        'bad', 'terrible', 'horrible', 'awful', 'miserable', 'dreadful',
        'sad', 'unhappy', 'depressed', 'gloomy', 'downcast', 'melancholy',
        'disappointed', 'upset', 'distressed', 'troubled', 'worried', 'anxious',
        'stressed', 'tense', 'nervous', 'afraid', 'fearful', 'scared',
        'angry', 'furious', 'mad', 'annoyed', 'irritated', 'frustrated',
        'tired', 'exhausted', 'fatigued', 'weary', 'drained', 'burnt out',
        'lonely', 'alone', 'isolated', 'abandoned', 'rejected', 'unwanted',
        'hurt', 'pain', 'ache', 'sore', 'suffering', 'agony',
        'confused', 'perplexed', 'bewildered', 'lost', 'unsure', 'uncertain',
        'overwhelmed', 'burdened', 'overloaded', 'swamped', 'buried',
        'failure', 'failed', 'lose', 'losing', 'lost', 'defeat',
        'difficult', 'hard', 'challenging', 'impossible', 'struggle',
        'hate', 'dislike', 'despise', 'loathe', 'detest', 'resent',
        'regret', 'remorse', 'guilt', 'ashamed', 'embarrassed', 'humiliated',
        'sick', 'ill', 'unwell', 'diseased', 'infected', 'weak'
      ],
      portuguese: [
        'mau', 'má', 'ruim', 'terrível', 'horrível', 'péssimo', 'péssima',
        'miserável', 'triste', 'infeliz', 'deprimido', 'deprimida', 'melancólico',
        'melancólica', 'decepcionado', 'decepcionada', 'chateado', 'chateada',
        'angustiado', 'angustiada', 'preocupado', 'preocupada', 'ansioso', 'ansiosa',
        'estressado', 'estressada', 'tenso', 'tensa', 'nervoso', 'nervosa',
        'amedrontado', 'amedrontada', 'assustado', 'assustada', 'com medo',
        'bravo', 'brava', 'furioso', 'furiosa', 'irritado', 'irritada',
        'frustrado', 'frustrada', 'cansado', 'cansada', 'exausto', 'exausta',
        'fatigado', 'fatigada', 'esgotado', 'esgotada', 'solitário', 'solitária',
        'sozinho', 'sozinha', 'isolado', 'isolada', 'abandonado', 'abandonada',
        'rejeitado', 'rejeitada', 'indesejado', 'indesejada', 'machucado', 'machucada',
        'dor', 'sofrimento', 'agonia', 'confuso', 'confusa', 'perplexo', 'perplexa',
        'perdido', 'perdida', 'inseguro', 'insegura', 'incerto', 'incerta',
        'sobrecarregado', 'sobrecarregada', 'saturado', 'saturada', 'fracasso',
        'falhar', 'falhou', 'perder', 'perdeu', 'derrota', 'difícil',
        'duro', 'dura', 'desafiador', 'desafiadora', 'impossível', 'luta',
        'ódio', 'odiar', 'detesto', 'detesta', 'ressentido', 'ressentida',
        'arrependido', 'arrependida', 'remorso', 'culpa', 'envergonhado', 'envergonhada',
        'doente', 'enfermo', 'enferma', 'mal', 'fraco', 'fraca'
      ]
    }
  };
  
  // Function to analyze sentiment in text
  export const analyzeSentiment = (text) => {
    if (!text || typeof text !== 'string') return { score: 0, positive: 0, negative: 0 };
    
    const lowercaseText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Check English positive words
    sentimentDictionaries.positive.english.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowercaseText.match(regex);
      if (matches) {
        positiveCount += matches.length;
      }
    });
    
    // Check Portuguese positive words
    sentimentDictionaries.positive.portuguese.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowercaseText.match(regex);
      if (matches) {
        positiveCount += matches.length;
      }
    });
    
    // Check English negative words
    sentimentDictionaries.negative.english.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowercaseText.match(regex);
      if (matches) {
        negativeCount += matches.length;
      }
    });
    
    // Check Portuguese negative words
    sentimentDictionaries.negative.portuguese.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowercaseText.match(regex);
      if (matches) {
        negativeCount += matches.length;
      }
    });
    
    // Calculate the sentiment score from -100 to 100
    const total = positiveCount + negativeCount;
    let score = 0;
    
    if (total > 0) {
      score = Math.round((positiveCount - negativeCount) / total * 100);
    }
    
    return {
      score,
      positive: positiveCount,
      negative: negativeCount,
      total
    };
  };