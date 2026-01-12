import React, { useState, useEffect } from 'react';

interface GameState {
  word: string;
  hint: string;
  guesses: string[];
  score: number;
  gameOver: boolean;
  won: boolean;
  attemptsLeft: number;
}

const WordGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    word: '',
    hint: '',
    guesses: [],
    score: 0,
    gameOver: false,
    won: false,
    attemptsLeft: 6,
  });

  const [currentGuess, setCurrentGuess] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wordgame/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setGameState({
        word: data.word,
        hint: data.hint,
        guesses: [],
        score: gameState.score,
        gameOver: false,
        won: false,
        attemptsLeft: 6,
      });
      setMessage('');
      setCurrentGuess('');
    } catch (error) {
      setMessage('Failed to start game. Try again!');
    }
    setLoading(false);
  };

  const handleGuess = async () => {
    if (!currentGuess.trim() || gameState.gameOver) return;

    const guess = currentGuess.toLowerCase().trim();

    if (gameState.guesses.includes(guess)) {
      setMessage('You already guessed that word!');
      return;
    }

    try {
      const response = await fetch('/api/wordgame/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: gameState.word,
          guess: guess
        }),
      });

      const data = await response.json();
      const newGuesses = [...gameState.guesses, guess];
      const newAttemptsLeft = gameState.attemptsLeft - 1;

      if (data.correct) {
        setGameState({
          ...gameState,
          guesses: newGuesses,
          score: gameState.score + (newAttemptsLeft * 10),
          gameOver: true,
          won: true,
        });
        setMessage(`🎉 Genius! You found it: "${gameState.word.toUpperCase()}"! +${newAttemptsLeft * 10} points!`);
      } else {
        if (newAttemptsLeft === 0) {
          setGameState({
            ...gameState,
            guesses: newGuesses,
            attemptsLeft: 0,
            gameOver: true,
            won: false,
          });
          setMessage(`Game Over! The word was: "${gameState.word.toUpperCase()}"`);
        } else {
          setGameState({
            ...gameState,
            guesses: newGuesses,
            attemptsLeft: newAttemptsLeft,
          });
          setMessage(`Not quite! ${data.feedback || 'Try again!'} (${newAttemptsLeft} attempts left)`);
        }
      }
      setCurrentGuess('');
    } catch (error) {
      setMessage('Error checking guess. Try again!');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  const getLetterStatus = (letter: string): string => {
    const lowerLetter = letter.toLowerCase();
    const targetWord = gameState.word.toLowerCase();

    if (targetWord.includes(lowerLetter)) {
      return gameState.guesses.some(g => g.includes(lowerLetter)) ? 'found' : 'unknown';
    }
    return gameState.guesses.some(g => g.includes(lowerLetter)) ? 'wrong' : 'unknown';
  };

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🧠 Word Genius</h1>
        <p style={styles.subtitle}>Guess the word from the hint!</p>

        <div style={styles.scoreBoard}>
          <div style={styles.score}>Score: {gameState.score}</div>
          <div style={styles.attempts}>Attempts: {gameState.attemptsLeft}</div>
        </div>

        {!loading && (
          <>
            <div style={styles.hintBox}>
              <strong>💡 Hint:</strong> {gameState.hint}
            </div>

            <div style={styles.wordLength}>
              Word Length: {gameState.word.length} letters
            </div>

            <div style={styles.alphabetGrid}>
              {alphabet.map(letter => {
                const status = getLetterStatus(letter);
                return (
                  <div
                    key={letter}
                    style={{
                      ...styles.letterBox,
                      ...(status === 'found' ? styles.letterFound : {}),
                      ...(status === 'wrong' ? styles.letterWrong : {}),
                    }}
                  >
                    {letter.toUpperCase()}
                  </div>
                );
              })}
            </div>

            {!gameState.gameOver && (
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your guess..."
                  style={styles.input}
                  disabled={loading}
                />
                <button onClick={handleGuess} style={styles.button} disabled={loading}>
                  Guess
                </button>
              </div>
            )}

            {message && (
              <div style={{
                ...styles.message,
                ...(gameState.won ? styles.messageSuccess : {}),
                ...(gameState.gameOver && !gameState.won ? styles.messageError : {})
              }}>
                {message}
              </div>
            )}

            {gameState.guesses.length > 0 && (
              <div style={styles.guessHistory}>
                <h3>Your Guesses:</h3>
                <div style={styles.guessList}>
                  {gameState.guesses.map((guess, idx) => (
                    <span key={idx} style={styles.guessItem}>
                      {guess}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {gameState.gameOver && (
              <button onClick={startNewGame} style={styles.newGameButton}>
                🎮 New Game
              </button>
            )}
          </>
        )}

        {loading && <div style={styles.loading}>Loading new word...</div>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '42px',
    margin: '0 0 10px 0',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#666',
    marginBottom: '20px',
  },
  scoreBoard: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '10px',
  },
  score: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    color: '#667eea',
  },
  attempts: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    color: '#764ba2',
  },
  hintBox: {
    background: '#fff3cd',
    border: '2px solid #ffc107',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
    fontSize: '16px',
  },
  wordLength: {
    textAlign: 'center' as const,
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
  },
  alphabetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(13, 1fr)',
    gap: '5px',
    marginBottom: '20px',
  },
  letterBox: {
    padding: '8px 4px',
    textAlign: 'center' as const,
    fontSize: '12px',
    fontWeight: 'bold' as const,
    border: '2px solid #e0e0e0',
    borderRadius: '5px',
    background: '#fff',
  },
  letterFound: {
    background: '#4caf50',
    color: 'white',
    borderColor: '#4caf50',
  },
  letterWrong: {
    background: '#f44336',
    color: 'white',
    borderColor: '#f44336',
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '15px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '10px',
    outline: 'none',
  },
  button: {
    padding: '15px 30px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  message: {
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center' as const,
    fontSize: '16px',
    background: '#e3f2fd',
    border: '2px solid #2196f3',
  },
  messageSuccess: {
    background: '#e8f5e9',
    border: '2px solid #4caf50',
  },
  messageError: {
    background: '#ffebee',
    border: '2px solid #f44336',
  },
  guessHistory: {
    marginBottom: '20px',
  },
  guessList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
    marginTop: '10px',
  },
  guessItem: {
    padding: '8px 15px',
    background: '#f5f5f5',
    borderRadius: '20px',
    fontSize: '14px',
    border: '1px solid #ddd',
  },
  newGameButton: {
    width: '100%',
    padding: '15px',
    fontSize: '18px',
    fontWeight: 'bold' as const,
    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '18px',
    color: '#667eea',
  },
};

export default WordGame;
