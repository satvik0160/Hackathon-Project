import React, { useState, useEffect } from 'react';
import { insforge } from '../../services/insforgeClient';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Play, Trophy, Code2, Check, X } from 'lucide-react';
import { TiltCard } from '../../components/common/TiltCard';
import toast from 'react-hot-toast';

const CHALLENGES = [
  {
    id: 1,
    title: 'Reverse a String',
    description: 'Write a function that takes a string and returns it reversed.',
    signature: 'function reverseString(str) {\n  // your code here\n  \n}',
    testCases: [
      { input: ['hello'], expected: 'olleh' },
      { input: ['world'], expected: 'dlrow' },
      { input: [''], expected: '' }
    ]
  },
  {
    id: 2,
    title: 'Find the Largest Number',
    description: 'Write a function that takes an array of numbers and returns the largest number.',
    signature: 'function findLargest(arr) {\n  \n}',
    testCases: [
      { input: [[1, 5, 3, 9, 2]], expected: 9 },
      { input: [[-1, -5, -3]], expected: -1 },
      { input: [[42]], expected: 42 }
    ]
  },
  {
    id: 3,
    title: 'Palindrome Check',
    description: 'Write a function that returns true if a given string is a palindrome, and false otherwise.',
    signature: 'function isPalindrome(str) {\n  \n}',
    testCases: [
      { input: ['racecar'], expected: true },
      { input: ['hello'], expected: false },
      { input: ['a'], expected: true }
    ]
  },
  {
    id: 4,
    title: 'FizzBuzz Array',
    description: 'Return an array of numbers from 1 to n, but for multiples of 3 put "Fizz", for 5 put "Buzz", and for both put "FizzBuzz".',
    signature: 'function fizzBuzz(n) {\n  \n}',
    testCases: [
      { input: [3], expected: [1, 2, 'Fizz'] },
      { input: [5], expected: [1, 2, 'Fizz', 4, 'Buzz'] },
      { input: [15], expected: [1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz'] }
    ]
  },
  {
    id: 5,
    title: 'Two Sum',
    description: 'Find indices of two numbers in an array that add up to a target sum.',
    signature: 'function twoSum(nums, target) {\n  \n}',
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] }
    ]
  }
];

const AlgorithmSpeedrun = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('not_started');
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [score, setScore] = useState(0);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'playing' && CHALLENGES[currentChallengeIndex]) {
      setUserCode(CHALLENGES[currentChallengeIndex].signature);
      setTestResults(null);
    }
  }, [currentChallengeIndex, gameState]);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(900);
    setScore(0);
    setCurrentChallengeIndex(0);
  };

  const endGame = () => {
    setGameState('completed');
    const bestScore = localStorage.getItem('algoSpeedrunBestScore') || 0;
    if (score > bestScore) {
      localStorage.setItem('algoSpeedrunBestScore', score);
      // Update backend XP for difference
      const diff = score - bestScore;
      insforge.rpc('add_arcade_xp', { p_xp_to_add: diff }).catch(e => console.error('Failed to add XP', e));
    }
  };

  const runCode = () => {
    const challenge = CHALLENGES[currentChallengeIndex];
    let results = [];
    let allPassed = true;

    try {
      // Create a wrapper function that extracts the user's defined function
      // Since they are defining a function, we evaluate it and then get it by name.
      // Alternatively, we can wrap their code in a block that returns the function.
      const functionName = challenge.signature.match(/function\s+(\w+)/)[1];
      const fnCode = `${userCode}\nreturn ${functionName};`;
      const fn = new Function(fnCode)();

      challenge.testCases.forEach((tc, idx) => {
        try {
          const result = fn(...tc.input);
          const passed = JSON.stringify(result) === JSON.stringify(tc.expected);
          results.push({ passed, result, expected: tc.expected, input: tc.input });
          if (!passed) allPassed = false;
        } catch (err) {
          results.push({ passed: false, error: err.message, expected: tc.expected, input: tc.input });
          allPassed = false;
        }
      });
    } catch (err) {
      toast.error('Syntax error in code: ' + err.message);
      return;
    }

    setTestResults(results);

    if (allPassed) {
      // Calculate score with time bonus
      const timeBonus = Math.floor(timeLeft / 10);
      const points = 160 + timeBonus;
      setScore((s) => s + points);
      toast.success(`All tests passed! +${points} XP`);
      
      setTimeout(() => {
        if (currentChallengeIndex < CHALLENGES.length - 1) {
          setCurrentChallengeIndex((i) => i + 1);
        } else {
          endGame();
        }
      }, 1500);
    } else {
      toast.error('Some tests failed. Check the results.');
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
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Algorithm Speedrun</h1>
            <p className="text-slate-400 mb-8">5 challenges, 15 minutes. Write fast, run fast. Up to 800 XP + Speed Bonus!</p>
            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Play className="w-6 h-6" />
              START SPEEDRUN
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
          <h2 className="text-3xl font-bold mb-2">Speedrun Complete!</h2>
          <p className="text-slate-400 mb-6">You earned {score} XP</p>
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="w-full py-3 bg-emerald-600 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
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

  const challenge = CHALLENGES[currentChallengeIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/arcade')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Quit
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 max-w-lg mx-8 flex gap-2">
          {CHALLENGES.map((c, i) => (
            <div key={c.id} className={`h-2 flex-1 rounded-full ${i < currentChallengeIndex ? 'bg-emerald-500' : i === currentChallengeIndex ? 'bg-yellow-400 animate-pulse' : 'bg-slate-800'}`} />
          ))}
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2 text-xl font-mono bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span className={timeLeft < 60 ? 'text-red-400' : 'text-emerald-400'}>{formatTime(timeLeft)}</span>
          </div>
          <div className="text-xl font-bold text-yellow-400">
            {score} XP
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Left Column: Challenge Info */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1">
            <h2 className="text-2xl font-bold mb-4">{challenge.title}</h2>
            <p className="text-slate-400 mb-6 text-lg">{challenge.description}</p>
            
            <h3 className="text-lg font-bold mb-3 text-slate-300">Test Cases</h3>
            <div className="space-y-3">
              {challenge.testCases.map((tc, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-sm">
                  <div className="text-slate-500 mb-1">Input: <span className="text-emerald-400">{JSON.stringify(tc.input)}</span></div>
                  <div className="text-slate-500">Expected: <span className="text-indigo-400">{JSON.stringify(tc.expected)}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Results */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Code2 className="w-5 h-5"/> Solution</h3>
              <button
                onClick={runCode}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4" /> Run Code
              </button>
            </div>
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-emerald-400 focus:outline-none focus:border-emerald-500 resize-none font-mono text-sm leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Test Results Area */}
          {testResults && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-h-60 overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Execution Results</h3>
              <div className="space-y-3">
                {testResults.map((res, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border flex items-start gap-3 ${res.passed ? 'bg-emerald-950/30 border-emerald-900' : 'bg-red-950/30 border-red-900'}`}>
                    {res.passed ? <Check className="w-5 h-5 text-emerald-500 mt-0.5"/> : <X className="w-5 h-5 text-red-500 mt-0.5"/>}
                    <div className="font-mono text-sm">
                      <div className="text-slate-400">Test {idx + 1}</div>
                      {!res.passed && res.error && <div className="text-red-400 mt-1">Error: {res.error}</div>}
                      {!res.passed && !res.error && (
                        <div className="mt-1">
                          <span className="text-red-400">Got: {JSON.stringify(res.result)}</span>
                          <span className="text-slate-500 mx-2">|</span>
                          <span className="text-emerald-400">Expected: {JSON.stringify(res.expected)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlgorithmSpeedrun;
