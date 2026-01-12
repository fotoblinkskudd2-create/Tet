import { Router, Request, Response } from 'express';

const router = Router();

interface WordData {
  word: string;
  hint: string;
}

// Fun word database with creative hints
const wordDatabase: WordData[] = [
  { word: 'genius', hint: 'Someone with exceptional intellectual ability' },
  { word: 'rainbow', hint: 'Colorful arc in the sky after rain' },
  { word: 'adventure', hint: 'An exciting or unusual experience' },
  { word: 'butterfly', hint: 'Beautiful insect with colorful wings' },
  { word: 'treasure', hint: 'Valuable collection of precious things' },
  { word: 'mystery', hint: 'Something difficult to understand or explain' },
  { word: 'wisdom', hint: 'Knowledge gained through experience' },
  { word: 'harmony', hint: 'Pleasant combination of different elements' },
  { word: 'courage', hint: 'Bravery in the face of danger' },
  { word: 'freedom', hint: 'The power to act without restraint' },
  { word: 'symphony', hint: 'Large orchestral composition' },
  { word: 'universe', hint: 'All of space and everything in it' },
  { word: 'champion', hint: 'Winner of a competition' },
  { word: 'sparkle', hint: 'Shine with small flashes of light' },
  { word: 'mountain', hint: 'Very large natural elevation' },
  { word: 'laughter', hint: 'The sound of joy and amusement' },
  { word: 'journey', hint: 'An act of traveling from one place to another' },
  { word: 'wonder', hint: 'A feeling of amazement and admiration' },
  { word: 'thunder', hint: 'Loud sound following lightning' },
  { word: 'crystal', hint: 'Clear transparent mineral' },
  { word: 'cascade', hint: 'Small waterfall or series of them' },
  { word: 'phoenix', hint: 'Mythical bird that rises from ashes' },
  { word: 'serenity', hint: 'State of being calm and peaceful' },
  { word: 'velocity', hint: 'The speed of something in a direction' },
  { word: 'euphoria', hint: 'Intense feeling of happiness' },
  { word: 'kaleidoscope', hint: 'Tube with mirrors showing colorful patterns' },
  { word: 'magnificent', hint: 'Extremely beautiful or impressive' },
  { word: 'spectacular', hint: 'Beautiful in a dramatic way' },
  { word: 'imagination', hint: 'The ability to form new ideas or images' },
  { word: 'celebration', hint: 'Joyful gathering for a special occasion' },
];

// Route to start a new game
router.post('/new', (req: Request, res: Response) => {
  try {
    // Pick a random word from the database
    const randomIndex = Math.floor(Math.random() * wordDatabase.length);
    const selectedWord = wordDatabase[randomIndex];

    res.json({
      word: selectedWord.word,
      hint: selectedWord.hint,
      length: selectedWord.word.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start new game' });
  }
});

// Route to check a guess
router.post('/guess', (req: Request, res: Response) => {
  try {
    const { word, guess } = req.body;

    if (!word || !guess) {
      return res.status(400).json({ error: 'Missing word or guess' });
    }

    const targetWord = word.toLowerCase().trim();
    const userGuess = guess.toLowerCase().trim();

    // Check if guess is correct
    if (targetWord === userGuess) {
      return res.json({
        correct: true,
        feedback: 'Perfect! You got it!',
      });
    }

    // Provide helpful feedback
    let feedback = '';

    // Check if it starts with the same letter
    if (targetWord[0] === userGuess[0]) {
      feedback = 'Good start! Same first letter!';
    } else if (Math.abs(targetWord.length - userGuess.length) <= 2) {
      feedback = 'Close length!';
    } else if (targetWord.includes(userGuess[0])) {
      feedback = 'That letter is in the word!';
    } else {
      feedback = 'Not quite, keep trying!';
    }

    res.json({
      correct: false,
      feedback,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check guess' });
  }
});

// Route to get a hint
router.post('/hint', (req: Request, res: Response) => {
  try {
    const { word } = req.body;

    if (!word) {
      return res.status(400).json({ error: 'Missing word' });
    }

    const targetWord = word.toLowerCase();

    // Reveal a random letter position
    const randomPosition = Math.floor(Math.random() * targetWord.length);
    const hint = {
      position: randomPosition,
      letter: targetWord[randomPosition],
      message: `Letter ${randomPosition + 1} is: ${targetWord[randomPosition].toUpperCase()}`,
    };

    res.json(hint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get hint' });
  }
});

export default router;
