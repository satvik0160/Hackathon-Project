import { insforge } from '../../services/insforgeClient';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, Play, Trophy } from 'lucide-react';
import { TiltCard } from '../../components/common/TiltCard';
import toast from 'react-hot-toast';

const LEVELS = [
  {
    id: 1,
    name: 'Simple Box',
    description: 'Match the background color and dimensions of the box.',
    targetCSS: 'width: 100px; height: 100px; background-color: rgb(239, 68, 68);',
    propertiesToMatch: ['width', 'height', 'background-color']
  },
  {
    id: 2,
    name: 'Rounded Button',
    description: 'Create a rounded button with a blue background and white text.',
    targetCSS: 'width: 150px; height: 50px; background-color: rgb(59, 130, 246); border-radius: 25px; color: rgb(255, 255, 255);',
    propertiesToMatch: ['width', 'height', 'background-color', 'border-radius']
  },
  {
    id: 3,
    name: 'Card with Shadow',
    description: 'Create a card with a border and shadow.',
    targetCSS: 'width: 200px; height: 150px; background-color: rgb(255, 255, 255); border: 2px solid rgb(209, 213, 219); border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px;',
    propertiesToMatch: ['width', 'height', 'background-color', 'border-width', 'border-radius', 'box-shadow']
  },
  {
    id: 4,
    name: 'Circle Ring',
    description: 'Create a circle with a thick border (ring).',
    targetCSS: 'width: 120px; height: 120px; border-radius: 50%; background-color: transparent; border: 10px solid rgb(16, 185, 129);',
    propertiesToMatch: ['width', 'height', 'border-radius', 'background-color', 'border-width']
  },
  {
    id: 5,
    name: 'Flex Layout',
    description: 'Create a container with flex layout aligning items centrally.',
    targetCSS: 'width: 200px; height: 200px; display: flex; justify-content: center; align-items: center; background-color: rgb(243, 244, 246); gap: 10px;',
    propertiesToMatch: ['width', 'height', 'display', 'justify-content', 'align-items', 'background-color']
  }
];

const CSSBattle = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('not_started'); // not_started, playing, completed
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [userCSS, setUserCSS] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [score, setScore] = useState(0);
  
  const targetRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(600);
    setScore(0);
    setCurrentLevelIndex(0);
    setUserCSS('');
  };

  const endGame = () => {
    setGameState('completed');
    const bestScore = localStorage.getItem('cssBattleBestScore') || 0;
    if (score > bestScore) {
      localStorage.setItem('cssBattleBestScore', score);
      // Update backend XP for difference
      const diff = score - bestScore;
      insforge.rpc('add_arcade_xp', { p_xp_to_add: diff }).catch(e => console.error('Failed to add XP', e));
    }
  };

  const checkMatch = () => {
    const level = LEVELS[currentLevelIndex];
    if (!targetRef.current || !previewRef.current) return;

    const targetStyles = window.getComputedStyle(targetRef.current);
    const previewStyles = window.getComputedStyle(previewRef.current);

    let matchCount = 0;
    level.propertiesToMatch.forEach((prop) => {
      // Very simple string matching for computed styles
      if (targetStyles.getPropertyValue(prop) === previewStyles.getPropertyValue(prop)) {
        matchCount++;
      }
    });

    const matchPercentage = matchCount / level.propertiesToMatch.length;
    
    if (matchPercentage === 1) {
      toast.success('Perfect match! +100 XP');
      setScore((s) => s + 100);
      if (currentLevelIndex < LEVELS.length - 1) {
        setCurrentLevelIndex((i) => i + 1);
        setUserCSS('');
      } else {
        endGame();
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
            <p className="text-slate-400 mb-8">Match the target designs using CSS. 5 levels, 10 minutes. Up to 500 XP!</p>
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
            Level {currentLevelIndex + 1}/5
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
            <div className="flex-1 bg-slate-800 rounded-xl flex items-center justify-center p-4 overflow-hidden relative checkerboard-bg">
              {/* Checkerboard style via inline css for visibility of transparent backgrounds */}
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
                style={{ cssText: level.targetCSS }} 
                className="relative z-10"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col">
            <h3 className="text-lg font-bold mb-4">Your Result</h3>
            <div className="flex-1 bg-slate-800 rounded-xl flex items-center justify-center p-4 overflow-hidden relative">
              <div
                style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%)',
                  backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  opacity: 0.5, zIndex: 0
                }}
              />
              <style>{`.preview-div { ${userCSS} }`}</style>
              <div 
                ref={previewRef}
                className="preview-div relative z-10" 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">CSS Editor</h3>
            <button
              onClick={checkMatch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" /> Check Solution
            </button>
          </div>
          <div className="flex-1 relative font-mono text-sm">
            <div className="absolute top-4 left-4 text-slate-500 select-none">
              .element {'{'}
            </div>
            <textarea
              value={userCSS}
              onChange={(e) => setUserCSS(e.target.value)}
              className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl p-4 pt-10 pb-10 pl-8 text-green-400 focus:outline-none focus:border-indigo-500 resize-none font-mono leading-relaxed"
              placeholder="  /* write your css here */&#10;  background-color: red;&#10;  width: 100px;&#10;  ..."
              spellCheck={false}
            />
            <div className="absolute bottom-4 left-4 text-slate-500 select-none">
              {'}'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSSBattle;
