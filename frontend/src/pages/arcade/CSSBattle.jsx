import { insforge } from '../../services/insforgeClient';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, Play, Trophy, Lightbulb } from 'lucide-react';
import { TiltCard } from '../../components/common/TiltCard';
import toast from 'react-hot-toast';

const LEVELS = [
  {
    id: 1,
    name: 'Simple Box',
    description: 'Match the background color and dimensions of the box.',
    targetCSS: 'width: 100px; height: 100px; background-color: rgb(239, 68, 68);',
    propertiesToMatch: ['width', 'height', 'background-color'],
    hint: 'Set width: 100px; height: 100px; background-color: rgb(239, 68, 68); (or #ef4444)'
  },
  {
    id: 2,
    name: 'Rounded Button',
    description: 'Create a rounded button with a blue background and white text.',
    targetCSS: 'width: 150px; height: 50px; background-color: rgb(59, 130, 246); border-radius: 25px; color: rgb(255, 255, 255);',
    propertiesToMatch: ['width', 'height', 'background-color', 'border-radius'],
    hint: 'Use width: 150px; height: 50px; background-color: rgb(59, 130, 246); border-radius: 25px;'
  },
  {
    id: 3,
    name: 'Card with Shadow',
    description: 'Create a card with a border and shadow.',
    targetCSS: 'width: 200px; height: 150px; background-color: rgb(255, 255, 255); border-width: 2px; border-style: solid; border-color: rgb(209, 213, 219); border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px;',
    propertiesToMatch: ['width', 'height', 'background-color', 'border-top-width', 'border-radius', 'box-shadow'],
    hint: 'Add width: 200px; height: 150px; background-color: white; border: 2px solid rgb(209, 213, 219); border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px;'
  },
  {
    id: 4,
    name: 'Circle Ring',
    description: 'Create a circle with a thick border (ring).',
    targetCSS: 'width: 120px; height: 120px; border-radius: 50%; background-color: transparent; border-width: 10px; border-style: solid; border-color: rgb(16, 185, 129);',
    propertiesToMatch: ['width', 'height', 'border-radius', 'background-color', 'border-top-width', 'border-top-color'],
    hint: 'Use width: 120px; height: 120px; border-radius: 50%; border: 10px solid rgb(16, 185, 129); background-color: transparent;'
  },
  {
    id: 5,
    name: 'Flex Layout',
    description: 'Create a container with flex layout aligning items centrally.',
    targetCSS: 'width: 200px; height: 200px; display: flex; justify-content: center; align-items: center; background-color: rgb(243, 244, 246);',
    propertiesToMatch: ['width', 'height', 'display', 'justify-content', 'align-items', 'background-color'],
    hint: 'Use width: 200px; height: 200px; display: flex; justify-content: center; align-items: center; background-color: rgb(243, 244, 246);'
  },
  {
    id: 6,
    name: 'Gradient Background',
    description: 'Create a box with a gradient background.',
    targetCSS: 'width: 150px; height: 100px; background-image: linear-gradient(to right, rgb(236, 72, 153), rgb(139, 92, 246));',
    propertiesToMatch: ['width', 'height', 'background-image'],
    hint: 'Use width: 150px; height: 100px; background-image: linear-gradient(to right, rgb(236, 72, 153), rgb(139, 92, 246));'
  },
  {
    id: 7,
    name: 'Transform Scale',
    description: 'Create a box that is scaled up.',
    targetCSS: 'width: 100px; height: 100px; background-color: rgb(34, 197, 94); transform: scale(1.5);',
    propertiesToMatch: ['width', 'height', 'background-color', 'transform'],
    hint: 'Use width: 100px; height: 100px; background-color: rgb(34, 197, 94); transform: scale(1.5);'
  },
  {
    id: 8,
    name: 'Position Absolute',
    description: 'Position a box absolutely within a container.',
    targetCSS: 'width: 80px; height: 80px; background-color: rgb(249, 115, 22); position: absolute; top: 20px; right: 20px;',
    propertiesToMatch: ['width', 'height', 'background-color', 'position', 'top', 'right'],
    hint: 'Use width: 80px; height: 80px; background-color: rgb(249, 115, 22); position: absolute; top: 20px; right: 20px;'
  },
  {
    id: 9,
    name: 'Text Styling',
    description: 'Style text with font properties.',
    content: 'DevAstra Arcade',
    targetCSS: 'font-size: 24px; font-weight: 700; color: rgb(234, 179, 8); text-align: center;',
    propertiesToMatch: ['font-size', 'font-weight', 'color', 'text-align'],
    hint: 'Use font-size: 24px; font-weight: 700; color: rgb(234, 179, 8); text-align: center;'
  },
  {
    id: 10,
    name: 'Complete Card',
    description: 'Create a complete card with all styling properties.',
    targetCSS: 'width: 240px; height: 160px; background-color: rgb(255, 255, 255); border-radius: 12px; box-shadow: rgba(0, 0, 0, 0.15) 0px 10px 15px -3px; padding-top: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center;',
    propertiesToMatch: ['width', 'height', 'background-color', 'border-radius', 'box-shadow', 'padding-top', 'display', 'flex-direction', 'align-items', 'justify-content'],
    hint: 'Combine width: 240px; height: 160px; background-color: rgb(255, 255, 255); border-radius: 12px; box-shadow: rgba(0, 0, 0, 0.15) 0px 10px 15px -3px; padding-top: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center;'
  }
];

const CSSBattle = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('not_started'); // not_started, playing, completed
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [userCSS, setUserCSS] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  const targetRef = useRef(null);
  const previewRef = useRef(null);

  // Sync inline CSS to DOM nodes natively
  useEffect(() => {
    if (gameState === 'playing' && LEVELS[currentLevelIndex]) {
      if (targetRef.current) {
        targetRef.current.style.cssText = LEVELS[currentLevelIndex].targetCSS;
      }
      if (previewRef.current) {
        previewRef.current.style.cssText = userCSS;
      }
    }
  }, [currentLevelIndex, gameState, userCSS]);

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame(score);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score]);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(600);
    setScore(0);
    setCurrentLevelIndex(0);
    setUserCSS('');
    setShowHint(false);
  };

  const endGame = (finalScore = score) => {
    setGameState('completed');
    const bestScore = Number(localStorage.getItem('cssBattleBestScore') || 0);
    if (finalScore > bestScore) {
      localStorage.setItem('cssBattleBestScore', String(finalScore));
      // Update backend XP for difference
      const diff = finalScore - bestScore;
      insforge.rpc('add_arcade_xp', { p_xp_to_add: diff }).catch(e => console.error('Failed to add XP', e));
    }
  };

  const checkMatch = () => {
    const level = LEVELS[currentLevelIndex];
    if (!targetRef.current || !previewRef.current) return;

    // Apply fresh styles before computing
    targetRef.current.style.cssText = level.targetCSS;
    previewRef.current.style.cssText = userCSS;

    const targetStyles = window.getComputedStyle(targetRef.current);
    const previewStyles = window.getComputedStyle(previewRef.current);

    let matchCount = 0;
    level.propertiesToMatch.forEach((prop) => {
      const targetVal = targetStyles.getPropertyValue(prop);
      const previewVal = previewStyles.getPropertyValue(prop);
      if (targetVal && targetVal === previewVal) {
        matchCount++;
      }
    });

    const matchPercentage = matchCount / level.propertiesToMatch.length;
    
    if (matchPercentage === 1) {
      const newScore = score + 100;
      setScore(newScore);
      toast.success('Perfect match! +100 XP');
      if (currentLevelIndex < LEVELS.length - 1) {
        setCurrentLevelIndex((i) => i + 1);
        setUserCSS('');
        setShowHint(false);
      } else {
        endGame(newScore);
      }
    } else {
      toast.error(`Not quite there. ${Math.round(matchPercentage * 100)}% match.`);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (gameState === 'not_started') {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center">
        <TiltCard>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">CSS Battle Royale</h1>
            <p className="text-slate-400 mb-8">Match the target designs using CSS. 10 levels, 10 minutes. Up to 1000 XP!</p>
            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Play className="w-6 h-6" />
              START BATTLE
            </button>
            <button
              onClick={() => navigate('/arcade')}
              className="mt-4 w-full py-4 bg-slate-800 rounded-xl font-bold text-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
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
      <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center"
        >
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-2">Battle Complete!</h2>
          <p className="text-slate-400 mb-6">You earned {score} XP</p>
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="w-full py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('/arcade')}
              className="w-full py-3 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 transition-colors"
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
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/arcade')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2 text-xl font-mono bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span className={timeLeft < 60 ? 'text-red-400' : 'text-indigo-400'}>{formatTime(timeLeft)}</span>
          </div>
          <div className="text-xl font-bold">
            Level {currentLevelIndex + 1}/10
          </div>
          <div className="text-xl font-bold text-yellow-400">
            {score} XP
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Left Column: Target & Preview */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col">
            <h3 className="text-lg font-bold mb-2">Target Design</h3>
            <p className="text-slate-400 text-sm mb-4">{level.description}</p>
            <div className="flex-1 bg-slate-800 rounded-xl flex items-center justify-center p-4 overflow-hidden relative checkerboard-bg min-h-[220px]">
              <div
                style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%)',
                  backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  opacity: 0.5, zIndex: 0
                }}
              />
              <div 
                ref={targetRef}
                className="relative z-10 flex items-center justify-center transition-all duration-200"
              >
                {level.content || ''}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col">
            <h3 className="text-lg font-bold mb-4">Your Result</h3>
            <div className="flex-1 bg-slate-800 rounded-xl flex items-center justify-center p-4 overflow-hidden relative min-h-[220px]">
              <div
                style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%)',
                  backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  opacity: 0.5, zIndex: 0
                }}
              />
              <div 
                ref={previewRef}
                className="relative z-10 flex items-center justify-center transition-all duration-200" 
              >
                {level.content || ''}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">CSS Editor</h3>
            <button
              onClick={checkMatch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" /> Check Solution
            </button>
          </div>
          <div className="flex-1 relative font-mono text-sm min-h-[280px]">
            <div className="absolute top-4 left-4 text-slate-500 select-none z-10">
              .element {'{'}
            </div>
            <textarea
              value={userCSS}
              onChange={(e) => setUserCSS(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  checkMatch();
                }
              }}
              className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl p-4 pt-10 pb-10 pl-8 text-green-400 focus:outline-none focus:border-indigo-500 resize-none font-mono leading-relaxed"
              placeholder="  /* write your CSS properties here (Ctrl+Enter to check) */&#10;  width: 100px;&#10;  height: 100px;&#10;  background-color: rgb(239, 68, 68);"
              spellCheck={false}
            />
            <div className="absolute bottom-4 left-4 text-slate-500 select-none z-10">
              {'}'}
            </div>
          </div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="mt-4 w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg font-bold text-yellow-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lightbulb className="w-4 h-4" />
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          {showHint && (
            <div className="mt-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-yellow-200 text-sm font-mono break-all">
              💡 {level.hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSSBattle;
