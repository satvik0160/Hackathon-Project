import { insforge } from '../../services/insforgeClient';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Trophy, CheckCircle2, RotateCcw, Lightbulb } from 'lucide-react';
import { TiltCard } from '../../components/common/TiltCard';
import toast from 'react-hot-toast';

const LEVELS = [
  {
    id: 1,
    name: 'Match Numbers',
    description: 'Write a regex that matches all numbers in the text.',
    text: 'I have 3 apples and 15 oranges, but no 0 bananas.',
    targetMatches: ['3', '15', '0'],
    hint: 'Use \\d+ to match one or more digits',
    instruction: 'Match all numeric digits'
  },
  {
    id: 2,
    name: 'Match Email Addresses',
    description: 'Write a regex that matches all email addresses.',
    text: 'Contact us at john@example.com or jane@test.org for help.',
    targetMatches: ['john@example.com', 'jane@test.org'],
    hint: 'Use \\w+@\\w+\\.\\w+ to match simple emails',
    instruction: 'Match all email addresses'
  },
  {
    id: 3,
    name: 'Match Words Starting with A',
    description: 'Write a regex that matches all words starting with "a" (case-insensitive).',
    text: 'An apple a day keeps the doctor away. Amazing!',
    targetMatches: ['An', 'apple', 'a', 'away', 'Amazing'],
    hint: 'Use \\b[aA]\\w* to match words starting with a or A',
    instruction: 'Match words starting with "a" or "A"'
  },
  {
    id: 4,
    name: 'Match URLs',
    description: 'Write a regex that matches all http/https URLs.',
    text: 'Visit https://example.com or http://test.org for more info.',
    targetMatches: ['https://example.com', 'http://test.org'],
    hint: 'Use https?://\\w+\\.\\w+ to match http or https URLs',
    instruction: 'Match all URLs starting with http or https'
  },
  {
    id: 5,
    name: 'Match Dates',
    description: 'Write a regex that matches dates in MM/DD/YYYY format.',
    text: 'The deadline is 12/25/2024 and 01/01/2025.',
    targetMatches: ['12/25/2024', '01/01/2025'],
    hint: 'Use \\d{2}/\\d{2}/\\d{4} to match MM/DD/YYYY format',
    instruction: 'Match dates in MM/DD/YYYY format'
  },
  {
    id: 6,
    name: 'Match Phone Numbers',
    description: 'Write a regex that matches US phone numbers in (xxx) xxx-xxxx format.',
    text: 'Call us at (123) 456-7890 or (987) 654-3210.',
    targetMatches: ['(123) 456-7890', '(987) 654-3210'],
    hint: 'Use \\(\\d{3}\\) \\d{3}-\\d{4} to match phone numbers',
    instruction: 'Match phone numbers in (xxx) xxx-xxxx format'
  },
  {
    id: 7,
    name: 'Match Hashtags',
    description: 'Write a regex that matches all hashtags (words starting with #).',
    text: 'Join the #coding revolution! #javascript #webdev #react',
    targetMatches: ['#coding', '#javascript', '#webdev', '#react'],
    hint: 'Use #\\w+ to match hashtags',
    instruction: 'Match all hashtags'
  },
  {
    id: 8,
    name: 'Match Colors',
    description: 'Write a regex that matches hex color codes (# followed by 6 hex digits).',
    text: 'Use #FF5733 or #3498DB or #2ECC71 for colors.',
    targetMatches: ['#FF5733', '#3498DB', '#2ECC71'],
    hint: 'Use #[0-9A-Fa-f]{6} to match hex color codes',
    instruction: 'Match hex color codes (#XXXXXX)'
  },
  {
    id: 9,
    name: 'Match Credit Cards',
    description: 'Write a regex that matches credit card numbers (groups of 4 digits).',
    text: 'Card: 1234 5678 9012 3456 or 9876 5432 1098 7654.',
    targetMatches: ['1234 5678 9012 3456', '9876 5432 1098 7654'],
    hint: 'Use \\d{4} \\d{4} \\d{4} \\d{4} to match credit card format',
    instruction: 'Match credit card numbers (xxxx xxxx xxxx xxxx)'
  },
  {
    id: 10,
    name: 'Match IP Addresses',
    description: 'Write a regex that matches IPv4 addresses.',
    text: 'Server at 192.168.1.1 or 10.0.0.1.',
    targetMatches: ['192.168.1.1', '10.0.0.1'],
    hint: 'Use \\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3} to match IP addresses',
    instruction: 'Match IPv4 addresses (xxx.xxx.xxx.xxx)'
  }
];

const RegexGolf = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('not_started');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [regex, setRegex] = useState('');
  const [matches, setMatches] = useState([]);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [flags, setFlags] = useState('');

  useEffect(() => {
    if (gameState === 'playing' && LEVELS[currentLevelIndex]) {
      setRegex('');
      setMatches([]);
      setShowHint(false);
      setFlags('g');
    }
  }, [currentLevelIndex, gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCurrentLevelIndex(0);
  };

  const endGame = () => {
    setGameState('completed');
    const bestScore = localStorage.getItem('regexGolfBestScore') || 0;
    if (score > bestScore) {
      localStorage.setItem('regexGolfBestScore', score);
      const diff = score - bestScore;
      insforge.rpc('add_arcade_xp', { p_xp_to_add: diff }).catch(e => console.error('Failed to add XP', e));
    }
  };

  const testRegex = () => {
    const level = LEVELS[currentLevelIndex];
    
    try {
      const flagsArray = flags.split('');
      const regexObj = new RegExp(regex, flagsArray.join(''));
      const foundMatches = level.text.match(regexObj) || [];
      setMatches(foundMatches);

      // Check if all target matches are found
      const allMatched = level.targetMatches.every(target => 
        foundMatches.some(match => match === target)
      );

      // Check if no extra matches
      const extraMatches = foundMatches.filter(match => 
        !level.targetMatches.includes(match)
      );

      if (allMatched && extraMatches.length === 0) {
        toast.success('Perfect match! +100 XP');
        setScore(s => s + 100);
        
        setTimeout(() => {
          if (currentLevelIndex < LEVELS.length - 1) {
            setCurrentLevelIndex(i => i + 1);
          } else {
            endGame();
          }
        }, 1500);
      } else if (allMatched && extraMatches.length > 0) {
        toast.warning(`Correct matches, but ${extraMatches.length} extra match(es) found`);
      } else {
        toast.error('Not all target matches found. Try again!');
      }
    } catch (err) {
      toast.error('Invalid regex: ' + err.message);
    }
  };

  const resetLevel = () => {
    setRegex('');
    setMatches([]);
  };

  if (gameState === 'not_started') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-violet-900 text-white p-8 flex flex-col items-center justify-center">
        <TiltCard>
          <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 p-8 rounded-3xl max-w-md w-full text-center">
            <Lightbulb className="w-20 h-20 text-purple-400 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">Regex Golf</h1>
            <p className="text-purple-200/80 mb-8 text-lg">Master regular expressions by matching patterns! 10 levels of pattern-matching challenges. Up to 1000 XP!</p>
            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl font-black text-lg hover:from-purple-400 hover:to-indigo-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
            >
              <Play className="w-6 h-6" />
              START MATCHING
            </button>
            <button
              onClick={() => navigate('/arcade')}
              className="mt-4 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Arcade
            </button>
          </div>
        </TiltCard>
      </div>
    );
  }

  if (gameState === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-violet-900 text-white p-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black/40 backdrop-blur-xl border border-purple-500/30 p-8 rounded-3xl max-w-md w-full text-center"
        >
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-4xl font-black mb-2">Pattern Master!</h2>
          <p className="text-purple-200/80 mb-6 text-lg">All patterns matched perfectly! You earned {score} XP</p>
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl font-black hover:from-purple-400 hover:to-indigo-500 transition-all"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('/arcade')}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-colors"
            >
              Back to Arcade
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const level = LEVELS[currentLevelIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-violet-900 text-white p-4 sm:p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/arcade')}
          className="flex items-center gap-2 text-purple-200/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Exit
        </button>
        <div className="flex gap-6 items-center">
          <div className="text-lg font-bold text-yellow-300">
            Level {currentLevelIndex + 1}/10
          </div>
          <div className="text-xl font-bold text-yellow-300">
            {score} XP
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-100px)] overflow-hidden">
        
        {/* Left Panel: Level Info */}
        <div className="lg:w-1/3 bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 flex flex-col overflow-y-auto">
          <h2 className="text-2xl font-bold mb-2 text-purple-300">{level.name}</h2>
          <p className="text-purple-200/70 mb-6">{level.description}</p>
          
          <div className="bg-black/40 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold mb-3 text-purple-300">Target Text</h3>
            <p className="text-purple-100 font-mono text-sm leading-relaxed bg-purple-950/50 p-4 rounded-lg border border-purple-700/30">
              {level.text}
            </p>
          </div>

          <div className="bg-black/40 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold mb-3 text-purple-300">Target Matches</h3>
            <div className="space-y-2">
              {level.targetMatches.map((match, idx) => (
                <div key={idx} className="text-purple-100 font-mono text-sm bg-purple-950/50 p-2 rounded border border-purple-700/30">
                  {match}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => setShowHint(!showHint)}
              className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl font-bold text-yellow-300 transition-colors flex items-center justify-center gap-2"
            >
              <Lightbulb className="w-5 h-5" />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            {showHint && (
              <div className="mt-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-yellow-200 text-sm">
                💡 {level.hint}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Regex Editor */}
        <div className="lg:w-2/3 bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 flex flex-col">
          <h3 className="text-xl font-bold mb-4 text-purple-300">Regex Editor</h3>
          <p className="text-purple-200/70 mb-6 text-sm">{level.instruction}</p>
          
          <div className="space-y-4 flex-1">
            {/* Regex Input */}
            <div className="bg-black/40 rounded-xl p-4">
              <label className="block text-sm font-medium text-purple-300 mb-2">Pattern</label>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-mono text-xl">/</span>
                <input
                  type="text"
                  value={regex}
                  onChange={(e) => setRegex(e.target.value)}
                  className="flex-1 bg-slate-800 border border-purple-600/50 rounded-lg p-3 text-white font-mono focus:outline-none focus:border-purple-400"
                  placeholder="Enter your regex pattern..."
                />
                <span className="text-purple-400 font-mono text-xl">/</span>
                <input
                  type="text"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  className="w-20 bg-slate-800 border border-purple-600/50 rounded-lg p-3 text-white font-mono focus:outline-none focus:border-purple-400 text-center"
                  placeholder="gim"
                />
              </div>
            </div>

            {/* Test Button */}
            <button
              onClick={testRegex}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl font-bold hover:from-purple-400 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Test Regex
            </button>

            {/* Reset Button */}
            <button
              onClick={resetLevel}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>

            {/* Results */}
            {matches.length > 0 && (
              <div className="bg-black/40 rounded-xl p-4">
                <h3 className="text-lg font-bold mb-3 text-purple-300">Found Matches ({matches.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {matches.map((match, idx) => (
                    <div key={idx} className="text-purple-100 font-mono text-sm bg-purple-950/50 p-2 rounded border border-purple-700/30">
                      {match}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexGolf;
