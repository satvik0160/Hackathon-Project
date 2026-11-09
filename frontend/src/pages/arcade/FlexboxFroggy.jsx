import { insforge } from '../../services/insforgeClient';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Trophy, Leaf, CheckCircle2, RotateCcw } from 'lucide-react';
import { TiltCard } from '../../components/common/TiltCard';
import toast from 'react-hot-toast';

const LEVELS = [
  {
    id: 1,
    name: 'Justify Content',
    description: 'Move the frog to the right side of the pond using justifyContent.',
    instruction: 'Use justifyContent to move the frog to the right lilypad.',
    hint: 'Try: justifyContent: flex-end',
    initialCSS: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'row',
      flexWrap: 'nowrap'
    },
    targetCSS: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      flexDirection: 'row',
      flexWrap: 'nowrap'
    },
    frogs: [1]
  },
  {
    id: 2,
    name: 'Align Items',
    description: 'Move the frog to the bottom of the pond using alignItems.',
    instruction: 'Use alignItems to align the frog with the bottom lilypad.',
    hint: 'Try: alignItems: flex-end',
    initialCSS: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      flexDirection: 'column',
      flexWrap: 'nowrap'
    },
    targetCSS: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      flexDirection: 'column',
      flexWrap: 'nowrap'
    },
    frogs: [1]
  },
  {
    id: 3,
    name: 'Flex Direction Row',
    description: 'Arrange the frogs horizontally in a row from left to right.',
    instruction: 'Use flexDirection to align the frogs horizontally.',
    hint: 'Try: flexDirection: row',
    initialCSS: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexWrap: 'nowrap'
    },
    targetCSS: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexWrap: 'nowrap'
    },
    frogs: [1, 2]
  },
  {
    id: 4,
    name: 'Flex Direction Column',
    description: 'Arrange the frogs vertically in a column from top to bottom.',
    instruction: 'Use flexDirection to align the frogs vertically.',
    hint: 'Try: flexDirection: column',
    initialCSS: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexWrap: 'nowrap'
    },
    targetCSS: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexWrap: 'nowrap'
    },
    frogs: [1, 2]
  },
  {
    id: 5,
    name: 'Justify Center',
    description: 'Center the frog horizontally in the pond.',
    instruction: 'Use justifyContent to center the frog.',
    hint: 'Try: justifyContent: center',
    initialCSS: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'row',
      flexWrap: 'nowrap'
    },
    targetCSS: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      flexDirection: 'row',
      flexWrap: 'nowrap'
    },
    frogs: [1]
  },
  {
    id: 6,
    name: 'Align Center',
    description: 'Center the frog vertically in the pond.',
    instruction: 'Use alignItems to center the frog.',
    hint: 'Try: alignItems: center',
    initialCSS: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      flexDirection: 'column',
      flexWrap: 'nowrap'
    },
    targetCSS: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexDirection: 'column',
      flexWrap: 'nowrap'
    },
    frogs: [1]
  },
  {
    id: 7,
    name: 'Space Between',
    description: 'Distribute frogs evenly with space between them across the pond.',
    instruction: 'Use justifyContent: space-between to spread the frogs.',
    hint: 'Try: justifyContent: space-between',
    initialCSS: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'row',
      flexWrap: 'nowrap'
    },
    targetCSS: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexDirection: 'row',
      flexWrap: 'nowrap'
    },
    frogs: [1, 2, 3]
  },
  {
    id: 8,
    name: 'Space Around',
    description: 'Distribute frogs with equal spacing around each of them.',
    instruction: 'Use justifyContent: space-around to space the frogs.',
    hint: 'Try: justifyContent: space-around',
    initialCSS: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'row',
      flexWrap: 'nowrap'
    },
    targetCSS: {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'flex-start',
      flexDirection: 'row',
      flexWrap: 'nowrap'
    },
    frogs: [1, 2, 3]
  },
  {
    id: 9,
    name: 'Flex Wrap',
    description: 'Allow frogs to wrap onto multiple lines.',
    instruction: 'Use flexWrap: wrap so frogs gracefully wrap.',
    hint: 'Try: flexWrap: wrap',
    initialCSS: {
      display: 'flex',
      flexWrap: 'nowrap',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'row'
    },
    targetCSS: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'row'
    },
    frogs: [1, 2, 3, 4]
  },
  {
    id: 10,
    name: 'Pond Champion',
    description: 'Arrange frogs in a column aligned at the bottom right corner of the pond!',
    instruction: 'Set flexDirection: column, justifyContent: flex-end, and alignItems: flex-end',
    hint: 'Try: flexDirection: column, justifyContent: flex-end, and alignItems: flex-end',
    initialCSS: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexWrap: 'nowrap'
    },
    targetCSS: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      flexWrap: 'nowrap'
    },
    frogs: [1, 2]
  }
];

const FlexboxFroggy = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('not_started');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentCSS, setCurrentCSS] = useState({});
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (gameState === 'playing' && LEVELS[currentLevelIndex]) {
      setCurrentCSS({ ...LEVELS[currentLevelIndex].initialCSS });
      setShowHint(false);
    }
  }, [currentLevelIndex, gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCurrentLevelIndex(0);
  };

  const endGame = (finalScore = score) => {
    setGameState('completed');
    const bestScore = Number(localStorage.getItem('flexboxFroggyBestScore') || 0);
    if (finalScore > bestScore) {
      localStorage.setItem('flexboxFroggyBestScore', String(finalScore));
      const diff = finalScore - bestScore;
      insforge.rpc('add_arcade_xp', { p_xp_to_add: diff }).catch(e => console.error('Failed to add XP', e));
    }
  };

  const updateCSS = (property, value) => {
    setCurrentCSS(prev => ({ ...prev, [property]: value }));
  };

  const checkSolution = () => {
    const level = LEVELS[currentLevelIndex];
    const target = level.targetCSS;
    
    // Check if current CSS matches target CSS for key flexbox properties
    const keysToCheck = ['display', 'flexDirection', 'justifyContent', 'alignItems', 'flexWrap'];
    const matches = keysToCheck.every(key => {
      if (!target[key]) return true;
      return currentCSS[key] === target[key];
    });

    if (matches) {
      toast.success('Perfect! Frogs are on their lilypads! +100 XP');
      const newScore = score + 100;
      setScore(newScore);
      
      setTimeout(() => {
        if (currentLevelIndex < LEVELS.length - 1) {
          setCurrentLevelIndex(i => i + 1);
        } else {
          endGame(newScore);
        }
      }, 1500);
    } else {
      toast.error('Not quite right. Try adjusting the flexbox properties!');
    }
  };

  const resetLevel = () => {
    setCurrentCSS({ ...LEVELS[currentLevelIndex].initialCSS });
  };

  if (gameState === 'not_started') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white p-8 flex flex-col items-center justify-center">
        <TiltCard>
          <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 p-8 rounded-3xl max-w-md w-full text-center">
            <Leaf className="w-20 h-20 text-green-400 mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">Flexbox Froggy</h1>
            <p className="text-green-200/80 mb-8 text-lg">Help frogs reach their lilypads by mastering CSS Flexbox! 10 levels of pond-hopping fun. Up to 1000 XP!</p>
            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-black text-lg hover:from-green-400 hover:to-emerald-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 cursor-pointer"
            >
              <Play className="w-6 h-6" />
              START HOPPING
            </button>
            <button
              onClick={() => navigate('/arcade')}
              className="mt-4 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white p-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black/40 backdrop-blur-xl border border-green-500/30 p-8 rounded-3xl max-w-md w-full text-center"
        >
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-4xl font-black mb-2">Pond Master!</h2>
          <p className="text-green-200/80 mb-6 text-lg">All frogs reached their lilypads! You earned {score} XP</p>
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-black hover:from-green-400 hover:to-emerald-500 transition-all cursor-pointer"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('/arcade')}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-colors cursor-pointer"
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white p-4 sm:p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/arcade')}
          className="flex items-center gap-2 text-green-200/80 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> Exit Pond
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
        
        {/* Left Panel: Pond (Game Area) */}
        <div className="lg:w-2/3 bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 flex flex-col">
          <h2 className="text-2xl font-bold mb-2 text-green-300">{level.name}</h2>
          <p className="text-green-200/70 mb-4">{level.description}</p>
          
          {/* The Pond */}
          <div className="flex-1 bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 rounded-2xl border-4 border-green-600/50 p-6 relative overflow-hidden min-h-[350px]">
            {/* Water ripples background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_2px_at_10%_20%,rgba(255,255,255,0.4)_1px,transparent_0)] bg-[length:40px_40px]" />
            </div>

            {/* Target Lilypads Layer */}
            <div 
              className="absolute inset-6 pointer-events-none transition-all duration-300"
              style={{ ...level.targetCSS, gap: '1.25rem' }}
            >
              {level.frogs.map((_, idx) => (
                <div 
                  key={`pad-${idx}`} 
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-dashed border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                  title="Target Lilypad"
                >
                  <span className="text-3xl select-none">🪷</span>
                </div>
              ))}
            </div>

            {/* Moving Frogs Layer */}
            <div 
              className="absolute inset-6 transition-all duration-300"
              style={{ ...currentCSS, gap: '1.25rem' }}
            >
              {level.frogs.map((_, idx) => (
                <motion.div 
                  key={`frog-${idx}`}
                  layout
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="w-16 h-16 rounded-full bg-green-500/90 border-2 border-green-300 flex items-center justify-center shadow-xl shadow-green-500/40 select-none hover:scale-110"
                >
                  <span className="text-3xl filter drop-shadow">🐸</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Controls */}
        <div className="lg:w-1/3 bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 flex flex-col overflow-y-auto">
          <h3 className="text-xl font-bold mb-2 text-green-300">Flexbox Controls</h3>
          <p className="text-green-200/70 mb-4 text-sm">{level.instruction}</p>
          
          <div className="space-y-4 flex-1">
            {/* Display */}
            <div className="bg-black/40 rounded-xl p-4">
              <label className="block text-sm font-medium text-green-300 mb-2">display</label>
              <select
                value={currentCSS.display || 'flex'}
                onChange={(e) => updateCSS('display', e.target.value)}
                className="w-full bg-slate-800 border border-green-600/50 rounded-lg p-2 text-white focus:outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="flex">flex</option>
                <option value="block">block</option>
                <option value="inline-flex">inline-flex</option>
              </select>
            </div>

            {/* Flex Direction */}
            <div className="bg-black/40 rounded-xl p-4">
              <label className="block text-sm font-medium text-green-300 mb-2">flexDirection</label>
              <select
                value={currentCSS.flexDirection || 'row'}
                onChange={(e) => updateCSS('flexDirection', e.target.value)}
                className="w-full bg-slate-800 border border-green-600/50 rounded-lg p-2 text-white focus:outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="row">row</option>
                <option value="column">column</option>
                <option value="row-reverse">row-reverse</option>
                <option value="column-reverse">column-reverse</option>
              </select>
            </div>

            {/* Justify Content */}
            <div className="bg-black/40 rounded-xl p-4">
              <label className="block text-sm font-medium text-green-300 mb-2">justifyContent</label>
              <select
                value={currentCSS.justifyContent || 'flex-start'}
                onChange={(e) => updateCSS('justifyContent', e.target.value)}
                className="w-full bg-slate-800 border border-green-600/50 rounded-lg p-2 text-white focus:outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="flex-start">flex-start</option>
                <option value="flex-end">flex-end</option>
                <option value="center">center</option>
                <option value="space-between">space-between</option>
                <option value="space-around">space-around</option>
                <option value="space-evenly">space-evenly</option>
              </select>
            </div>

            {/* Align Items */}
            <div className="bg-black/40 rounded-xl p-4">
              <label className="block text-sm font-medium text-green-300 mb-2">alignItems</label>
              <select
                value={currentCSS.alignItems || 'stretch'}
                onChange={(e) => updateCSS('alignItems', e.target.value)}
                className="w-full bg-slate-800 border border-green-600/50 rounded-lg p-2 text-white focus:outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="stretch">stretch</option>
                <option value="flex-start">flex-start</option>
                <option value="flex-end">flex-end</option>
                <option value="center">center</option>
                <option value="baseline">baseline</option>
              </select>
            </div>

            {/* Flex Wrap */}
            <div className="bg-black/40 rounded-xl p-4">
              <label className="block text-sm font-medium text-green-300 mb-2">flexWrap</label>
              <select
                value={currentCSS.flexWrap || 'nowrap'}
                onChange={(e) => updateCSS('flexWrap', e.target.value)}
                className="w-full bg-slate-800 border border-green-600/50 rounded-lg p-2 text-white focus:outline-none focus:border-green-400 cursor-pointer"
              >
                <option value="nowrap">nowrap</option>
                <option value="wrap">wrap</option>
                <option value="wrap-reverse">wrap-reverse</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={checkSolution}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold hover:from-green-400 hover:to-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-green-600/30"
            >
              <CheckCircle2 className="w-5 h-5" />
              Check Solution
            </button>
            <button
              onClick={resetLevel}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              Reset Level
            </button>
            <button
              onClick={() => setShowHint(!showHint)}
              className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl font-bold text-yellow-300 transition-colors cursor-pointer"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            {showHint && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-yellow-200 text-sm font-mono break-all">
                💡 {level.hint}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexboxFroggy;