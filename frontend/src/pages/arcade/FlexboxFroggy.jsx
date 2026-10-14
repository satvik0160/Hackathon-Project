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
    description: 'Move the frog to the right side of the pond using justify-content.',
    instruction: 'Use justify-content to move the frog to the right.',
    hint: 'Try: justify-content: flex-end',
    initialCSS: {
      display: 'flex',
      'justify-content': 'flex-start'
    },
    targetCSS: {
      display: 'flex',
      'justify-content': 'flex-end'
    },
    frogs: [{ position: 0 }],
    lilypads: [{ position: 100 }]
  },
  {
    id: 2,
    name: 'Align Items',
    description: 'Move the frog to the bottom of the pond using align-items.',
    instruction: 'Use align-items to move the frog to the bottom.',
    hint: 'Try: align-items: flex-end',
    initialCSS: {
      display: 'flex',
      'align-items': 'flex-start',
      'flex-direction': 'column'
    },
    targetCSS: {
      display: 'flex',
      'align-items': 'flex-end',
      'flex-direction': 'column'
    },
    frogs: [{ position: 0 }],
    lilypads: [{ position: 100 }]
  },
  {
    id: 3,
    name: 'Flex Direction Row',
    description: 'Arrange the frogs in a row from left to right.',
    instruction: 'Use flex-direction to arrange frogs horizontally.',
    hint: 'Try: flex-direction: row',
    initialCSS: {
      display: 'flex',
      'flex-direction': 'column'
    },
    targetCSS: {
      display: 'flex',
      'flex-direction': 'row'
    },
    frogs: [{ position: 0 }, { position: 0 }],
    lilypads: [{ position: 0 }, { position: 100 }]
  },
  {
    id: 4,
    name: 'Flex Direction Column',
    description: 'Arrange the frogs in a column from top to bottom.',
    instruction: 'Use flex-direction to arrange frogs vertically.',
    hint: 'Try: flex-direction: column',
    initialCSS: {
      display: 'flex',
      'flex-direction': 'row'
    },
    targetCSS: {
      display: 'flex',
      'flex-direction': 'column'
    },
    frogs: [{ position: 0 }, { position: 0 }],
    lilypads: [{ position: 0 }, { position: 100 }]
  },
  {
    id: 5,
    name: 'Justify Center',
    description: 'Center the frog horizontally in the pond.',
    instruction: 'Use justify-content to center the frog.',
    hint: 'Try: justify-content: center',
    initialCSS: {
      display: 'flex',
      'justify-content': 'flex-start'
    },
    targetCSS: {
      display: 'flex',
      'justify-content': 'center'
    },
    frogs: [{ position: 0 }],
    lilypads: [{ position: 50 }]
  },
  {
    id: 6,
    name: 'Align Center',
    description: 'Center the frog vertically in the pond.',
    instruction: 'Use align-items to center the frog.',
    hint: 'Try: align-items: center',
    initialCSS: {
      display: 'flex',
      'align-items': 'flex-start',
      'flex-direction': 'column'
    },
    targetCSS: {
      display: 'flex',
      'align-items': 'center',
      'flex-direction': 'column'
    },
    frogs: [{ position: 0 }],
    lilypads: [{ position: 50 }]
  },
  {
    id: 7,
    name: 'Space Between',
    description: 'Distribute frogs evenly with space between them.',
    instruction: 'Use justify-content: space-between to distribute frogs.',
    hint: 'Try: justify-content: space-between',
    initialCSS: {
      display: 'flex',
      'justify-content': 'flex-start'
    },
    targetCSS: {
      display: 'flex',
      'justify-content': 'space-between'
    },
    frogs: [{ position: 0 }, { position: 0 }, { position: 0 }],
    lilypads: [{ position: 0 }, { position: 50 }, { position: 100 }]
  },
  {
    id: 8,
    name: 'Space Around',
    description: 'Distribute frogs with equal space around each.',
    instruction: 'Use justify-content: space-around to distribute frogs.',
    hint: 'Try: justify-content: space-around',
    initialCSS: {
      display: 'flex',
      'justify-content': 'flex-start'
    },
    targetCSS: {
      display: 'flex',
      'justify-content': 'space-around'
    },
    frogs: [{ position: 0 }, { position: 0 }, { position: 0 }],
    lilypads: [{ position: 0 }, { position: 50 }, { position: 100 }]
  },
  {
    id: 9,
    name: 'Flex Wrap',
    description: 'Allow frogs to wrap to multiple lines if needed.',
    instruction: 'Use flex-wrap to allow wrapping.',
    hint: 'Try: flex-wrap: wrap',
    initialCSS: {
      display: 'flex',
      'flex-wrap': 'nowrap'
    },
    targetCSS: {
      display: 'flex',
      'flex-wrap': 'wrap'
    },
    frogs: [{ position: 0 }, { position: 0 }, { position: 0 }, { position: 0 }],
    lilypads: [{ position: 0 }, { position: 33 }, { position: 66 }, { position: 100 }]
  },
  {
    id: 10,
    name: 'Flex Grow',
    description: 'Make the first frog grow to fill available space.',
    instruction: 'Use flex-grow on the first frog.',
    hint: 'Try: flex-grow: 1 on the first frog',
    initialCSS: {
      display: 'flex'
    },
    targetCSS: {
      display: 'flex'
    },
    frogs: [{ position: 0, flexGrow: 1 }, { position: 0, flexGrow: 0 }],
    lilypads: [{ position: 50 }, { position: 100 }]
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

  const endGame = () => {
    setGameState('completed');
    const bestScore = localStorage.getItem('flexboxFroggyBestScore') || 0;
    if (score > bestScore) {
      localStorage.setItem('flexboxFroggyBestScore', score);
      const diff = score - bestScore;
      insforge.rpc('add_arcade_xp', { p_xp_to_add: diff }).catch(e => console.error('Failed to add XP', e));
    }
  };

  const updateCSS = (property, value) => {
    setCurrentCSS(prev => ({ ...prev, [property]: value }));
  };

  const checkSolution = () => {
    const level = LEVELS[currentLevelIndex];
    const target = level.targetCSS;
    
    // Check if current CSS matches target CSS
    const matches = Object.keys(target).every(key => {
      return currentCSS[key] === target[key];
    });

    if (matches) {
      toast.success('Perfect! Frogs are on their lilypads! +100 XP');
      setScore(s => s + 100);
      
      setTimeout(() => {
        if (currentLevelIndex < LEVELS.length - 1) {
          setCurrentLevelIndex(i => i + 1);
        } else {
          endGame();
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
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-black text-lg hover:from-green-400 hover:to-emerald-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
            >
              <Play className="w-6 h-6" />
              START HOPPING
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
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-black hover:from-green-400 hover:to-emerald-500 transition-all"
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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white p-4 sm:p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/arcade')}
          className="flex items-center gap-2 text-green-200/80 hover:text-white transition-colors"
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
          <p className="text-green-200/70 mb-6">{level.description}</p>
          
          {/* The Pond */}
          <div className="flex-1 bg-gradient-to-br from-blue-600/40 to-blue-800/40 rounded-2xl border-4 border-green-600/50 flex items-center justify-center p-8 relative overflow-hidden" style={currentCSS}>
            {/* Water ripples effect */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_2px_at_10%_20%,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:40px_40px]" />
            </div>
            
            {/* Frogs and Lilypads */}
            <div className="flex gap-4 relative z-10">
              {level.frogs.map((frog, idx) => (
                <div key={idx} className="relative">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-green-700 transform hover:scale-110 transition-transform">
                    <span className="text-2xl">🐸</span>
                  </div>
                  {frog.flexGrow && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-green-900/80 px-2 py-1 rounded">
                      flex-grow: {frog.flexGrow}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Controls */}
        <div className="lg:w-1/3 bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 flex flex-col overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 text-green-300">Flexbox Controls</h3>
          <p className="text-green-200/70 mb-6 text-sm">{level.instruction}</p>
          
          <div className="space-y-4 flex-1">
            {/* Display */}
            <div className="bg-black/40 rounded-xl p-4">
              <label className="block text-sm font-medium text-green-300 mb-2">display</label>
              <select
                value={currentCSS.display || 'flex'}
                onChange={(e) => updateCSS('display', e.target.value)}
                className="w-full bg-slate-800 border border-green-600/50 rounded-lg p-2 text-white focus:outline-none focus:border-green-400"
              >
                <option value="flex">flex</option>
                <option value="block">block</option>
                <option value="inline-flex">inline-flex</option>
              </select>
            </div>

            {/* Flex Direction */}
            <div className="bg-black/40 rounded-xl p-4">
              <label className="block text-sm font-medium text-green-300 mb-2">flex-direction</label>
              <select
                value={currentCSS['flex-direction'] || 'row'}
                onChange={(e) => updateCSS('flex-direction', e.target.value)}
                className="w-full bg-slate-800 border border-green-600/50 rounded-lg p-2 text-white focus:outline-none focus:border-green-400"
              >
                <option value="row">row</option>
                <option value="column">column</option>
                <option value="row-reverse">row-reverse</option>
                <option value="column-reverse">column-reverse</option>
              </select>
            </div>

            {/* Justify Content */}
            <div className="bg-black/40 rounded-xl p-4">
              <label className="block text-sm font-medium text-green-300 mb-2">justify-content</label>
              <select
                value={currentCSS['justify-content'] || 'flex-start'}
                onChange={(e) => updateCSS('justify-content', e.target.value)}
                className="w-full bg-slate-800 border border-green-600/50 rounded-lg p-2 text-white focus:outline-none focus:border-green-400"
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
              <label className="block text-sm font-medium text-green-300 mb-2">align-items</label>
              <select
                value={currentCSS['align-items'] || 'stretch'}
                onChange={(e) => updateCSS('align-items', e.target.value)}
                className="w-full bg-slate-800 border border-green-600/50 rounded-lg p-2 text-white focus:outline-none focus:border-green-400"
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
              <label className="block text-sm font-medium text-green-300 mb-2">flex-wrap</label>
              <select
                value={currentCSS['flex-wrap'] || 'nowrap'}
                onChange={(e) => updateCSS('flex-wrap', e.target.value)}
                className="w-full bg-slate-800 border border-green-600/50 rounded-lg p-2 text-white focus:outline-none focus:border-green-400"
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
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold hover:from-green-400 hover:to-emerald-500 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Check Solution
            </button>
            <button
              onClick={resetLevel}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset Level
            </button>
            <button
              onClick={() => setShowHint(!showHint)}
              className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl font-bold text-yellow-300 transition-colors"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            {showHint && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-yellow-200 text-sm">
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
