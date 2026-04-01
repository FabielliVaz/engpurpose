import { describe, it, expect } from 'vitest'
import { shuffle } from '../../utils'

// Mock song data
const mockSong = {
  id: 4,
  title: 'Yellow',
  artist: 'Coldplay',
  theme: 'Love',
  emotion: 'Joy',
  genre: 'Pop',
  lyrics: 'Look at the stars, look how they shine for you'
}

// Function to generate quiz (extracted from component for testing)
function generateQuiz(song: typeof mockSong) {
  const possibleWords = ['Love', 'Dance', 'Sky', 'Run', 'Fly'];
  const wordsNotInLyrics = possibleWords.filter(word => !song.lyrics.toLowerCase().includes(word.toLowerCase()));
  const correctWord = wordsNotInLyrics.length > 0 ? wordsNotInLyrics[Math.floor(Math.random() * wordsNotInLyrics.length)] : 'Love';
  const otherOptions = possibleWords.filter(word => word !== correctWord).slice(0, 2);

  return [
    {
      question: 'What is the main theme of this song?',
      options: shuffle([song.theme, 'Adventure', 'Friendship']),
      correctAnswer: song.theme
    },
    {
      question: 'Which word appears in the title?',
      options: shuffle([song.title, 'Trees', 'Sun']),
      correctAnswer: song.title
    },
    {
      question: 'What emotion does the song primarily convey?',
      options: shuffle([song.emotion, 'Sadness', 'Excitement']),
      correctAnswer: song.emotion
    },
    {
      question: 'What is the genre of this song?',
      options: shuffle([song.genre, 'Rock', 'Pop']),
      correctAnswer: song.genre
    },
    {
      question: 'Which of these words is NOT in the lyrics?',
      options: shuffle([correctWord, ...otherOptions]),
      correctAnswer: correctWord
    }
  ];
}

describe('SongDetail Quiz Generation', () => {
  it('should generate 5 quiz questions', () => {
    const quiz = generateQuiz(mockSong);
    expect(quiz).toHaveLength(5);
  });

  it('should have correct structure for each question', () => {
    const quiz = generateQuiz(mockSong);
    quiz.forEach(question => {
      expect(question).toHaveProperty('question');
      expect(question).toHaveProperty('options');
      expect(question).toHaveProperty('correctAnswer');
      expect(question.options).toContain(question.correctAnswer);
      expect(question.options).toHaveLength(3);
    });
  });

  it('should generate correct answer for lyrics question', () => {
    const quiz = generateQuiz(mockSong);
    const lyricsQuestion = quiz.find(q => q.question.includes('NOT in the lyrics'));
    expect(lyricsQuestion).toBeDefined();

    const correctWord = lyricsQuestion!.correctAnswer;
    expect(mockSong.lyrics.toLowerCase()).not.toContain(correctWord.toLowerCase());
  });
})