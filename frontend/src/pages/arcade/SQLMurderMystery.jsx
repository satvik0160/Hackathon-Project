import { insforge } from '../../services/insforgeClient';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Terminal, Database, ShieldAlert, Trophy, Play } from 'lucide-react';
import { TiltCard } from '../../components/common/TiltCard';
import toast from 'react-hot-toast';

// In-memory Database Simulation
const DB = {
  crime_scene_report: [
    { date: '2024-01-15', type: 'murder', description: 'Life is just a game...', city: 'DevCity' },
    { date: '2024-01-15', type: 'robbery', description: 'Stolen laptop from cafe', city: 'DevCity' },
    { date: '2024-01-16', type: 'murder', description: 'Found in alleyway', city: 'BugTown' }
  ],
  person: [
    { id: 101, name: 'Annabel Miller', address_street: 'Franklin Ave', address_number: 113, license_id: 11111 },
    { id: 102, name: 'Morty Schapiro', address_street: 'Northwestern Dr', address_number: 4919, license_id: 22222 },
    { id: 103, name: 'Jeremy Bowers', address_street: 'Washington St', address_number: 99, license_id: 33333 },
    { id: 104, name: 'John Doe', address_street: 'Franklin Ave', address_number: 14, license_id: 44444 }
  ],
  interview: [
    { person_id: 101, transcript: 'I saw a man with a "Get Swole" gym bag running away.' },
    { person_id: 102, transcript: 'I heard a gunshot around midnight.' }
  ],
  get_fit_now_member: [
    { id: '48Z7A', person_id: 103, name: 'Jeremy Bowers', status: 'gold' },
    { id: '48Z55', person_id: 101, name: 'Annabel Miller', status: 'regular' },
    { id: '90081', person_id: 104, name: 'John Doe', status: 'gold' }
  ],
  drivers_license: [
    { id: 11111, age: 28, height: 65, eye_color: 'blue', gender: 'female', plate_number: 'H42W' },
    { id: 22222, age: 45, height: 70, eye_color: 'brown', gender: 'male', plate_number: '0H42W' },
    { id: 33333, age: 30, height: 72, eye_color: 'green', gender: 'male', plate_number: '0H42W' },
    { id: 44444, age: 25, height: 68, eye_color: 'brown', gender: 'male', plate_number: 'XYZ1' }
  ]
};

const STAGES = [
  {
    id: 1,
    title: 'Stage 1: The Crime Scene',
    story: 'A murder was reported on 2024-01-15 in DevCity. You need to read the crime scene report to find clues. Check the `crime_scene_report` table.',
    hint: 'SELECT * FROM crime_scene_report WHERE date = \'2024-01-15\' AND city = \'DevCity\'',
    check: (query, results) => query.toLowerCase().includes('crime_scene_report') && results.some(r => r.type === 'murder')
  },
  {
    id: 2,
    title: 'Stage 2: Finding the Witnesses',
    story: 'The report says the murder happened in DevCity. We need to find witnesses. Annabel lives on Franklin Ave. Let\'s find her `person_id` in the `person` table.',
    hint: 'SELECT * FROM person WHERE name LIKE \'%Annabel%\'',
    check: (query, results) => query.toLowerCase().includes('person') && results.some(r => r.name.includes('Annabel'))
  },
  {
    id: 3,
    title: 'Stage 3: The Interview',
    story: 'Now that you have Annabel\'s person_id (101), check her interview transcript in the `interview` table.',
    hint: 'SELECT * FROM interview WHERE person_id = 101',
    check: (query, results) => query.toLowerCase().includes('interview') && results.some(r => r.person_id == 101)
  },
  {
    id: 4,
    title: 'Stage 4: The Gym Bag Clue',
    story: 'The transcript mentions a "Get Swole" gym bag. Let\'s check the `get_fit_now_member` table for gold members (they get the bag).',
    hint: 'SELECT * FROM get_fit_now_member WHERE status = \'gold\'',
    check: (query, results) => query.toLowerCase().includes('get_fit_now_member') && results.some(r => r.status === 'gold')
  },
  {
    id: 5,
    title: 'Stage 5: The Final Match',
    story: 'We have two suspects: Jeremy and John. The killer has plate number 0H42W. Check the `drivers_license` table to find the killer.',
    hint: 'SELECT * FROM drivers_license WHERE plate_number = \'0H42W\'',
    check: (query, results) => query.toLowerCase().includes('drivers_license') && results.some(r => r.plate_number === '0H42W')
  }
];

function executeQuery(query, tables) {
  try {
    const match = query.trim().match(/^SELECT\s+\*\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
    if (!match) return { error: 'Invalid query syntax. Use: SELECT * FROM table WHERE condition' };
    
    const tableName = match[1].toLowerCase();
    const table = tables[tableName];
    
    if (!table) return { error: `Table '${tableName}' not found.` };
    
    if (!match[2]) return { data: table };
    
    const conditions = match[2].split(/\s+AND\s+/i);
    let filtered = [...table];
    
    for (const cond of conditions) {
      const condMatch = cond.trim().match(/(\w+)\s*(=|LIKE|>|<)\s*['"]?([^'"]+)['"]?/i);
      if (!condMatch) return { error: `Invalid condition: ${cond}` };
      
      const [, col, op, val] = condMatch;
      
      filtered = filtered.filter(row => {
        const cellVal = String(row[col] || '').toLowerCase();
        const matchVal = val.toLowerCase();
        
        if (op === '=') return cellVal === matchVal;
        if (op.toUpperCase() === 'LIKE') return cellVal.includes(matchVal.replace(/%/g, ''));
        if (op === '>') return Number(cellVal) > Number(matchVal);
        if (op === '<') return Number(cellVal) < Number(matchVal);
        return false;
      });
    }
    
    return { data: filtered };
  } catch (err) {
    return { error: 'Query parser error: ' + err.message };
  }
}

const SQLMurderMystery = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('not_started');
  const [currentStage, setCurrentStage] = useState(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [score, setScore] = useState(0);
  
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, results, error]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCurrentStage(0);
    setHistory([{ type: 'system', text: 'Terminal initialized. Connection to Police Database established.' }]);
    setQuery('');
    setResults(null);
    setError(null);
  };

  const endGame = () => {
    setGameState('completed');
    const bestScore = localStorage.getItem('sqlMysteryBestScore') || 0;
    if (score > bestScore) {
      localStorage.setItem('sqlMysteryBestScore', score);
      // Update backend XP for difference
      const diff = score - bestScore;
      insforge.rpc('add_arcade_xp', { p_xp_to_add: diff }).catch(e => console.error('Failed to add XP', e));
    }
  };

  const handleQuery = (e) => {
    if (e.key === 'Enter') {
      runQuery();
    }
  };

  const runQuery = () => {
    if (!query.trim()) return;

    const currentQuery = query;
    setQuery('');
    setHistory(h => [...h, { type: 'user', text: currentQuery }]);
    
    const result = executeQuery(currentQuery, DB);
    
    if (result.error) {
      setError(result.error);
      setResults(null);
      setHistory(h => [...h, { type: 'error', text: result.error }]);
    } else {
      setError(null);
      setResults(result.data);
      setHistory(h => [...h, { type: 'result', data: result.data }]);
      
      // Check stage progression
      if (STAGES[currentStage].check(currentQuery, result.data)) {
        setTimeout(() => advanceStage(), 1500);
      }
    }
  };

  const advanceStage = () => {
    toast.success('Stage Complete! +240 XP');
    setScore(s => s + 240);
    
    if (currentStage < STAGES.length - 1) {
      setCurrentStage(s => s + 1);
      setHistory(h => [...h, { type: 'system', text: `--- STAGE ${currentStage + 2} UNLOCKED ---` }]);
      setResults(null);
    } else {
      setTimeout(() => endGame(), 2000);
    }
  };

  if (gameState === 'not_started') {
    return (
      <div className="min-h-screen bg-black text-green-500 p-8 flex flex-col items-center justify-center font-mono">
        <TiltCard>
          <div className="bg-slate-900/80 border border-green-900/50 p-8 rounded-2xl max-w-md w-full text-center">
            <ShieldAlert className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4 text-green-400">SQL Murder Mystery</h1>
            <p className="text-green-600/80 mb-8">You are the lead detective. Use SQL queries to navigate the police database and find the killer. Up to 1200 XP.</p>
            <button
              onClick={startGame}
              className="w-full py-4 bg-green-900/40 hover:bg-green-800/60 border border-green-500/50 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Terminal className="w-5 h-5" />
              ACCESS TERMINAL
            </button>
            <button
              onClick={() => navigate('/arcade')}
              className="mt-4 w-full py-4 bg-transparent hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-400 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Abort Mission
            </button>
          </div>
        </TiltCard>
      </div>
    );
  }

  if (gameState === 'completed') {
    return (
      <div className="min-h-screen bg-black text-green-500 p-8 flex flex-col items-center justify-center font-mono">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900/80 border border-green-500 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_30px_rgba(34,197,94,0.2)]"
        >
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-2">Case Closed</h2>
          <p className="text-green-400 mb-6">Murderer apprehended. You earned {score} XP.</p>
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="w-full py-3 bg-green-900/40 hover:bg-green-800/60 border border-green-500/50 rounded-xl font-bold transition-colors"
            >
              Start New Case
            </button>
            <button
              onClick={() => navigate('/arcade')}
              className="w-full py-3 bg-transparent hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-400 transition-colors"
            >
              Back to Arcade
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const stage = STAGES[currentStage];

  return (
    <div className="min-h-screen bg-black text-green-500 p-4 sm:p-6 flex flex-col font-mono selection:bg-green-900 selection:text-green-100">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-green-900/50">
        <button
          onClick={() => navigate('/arcade')}
          className="flex items-center gap-2 text-green-700 hover:text-green-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Log Out
        </button>
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2 text-sm bg-green-950/30 px-3 py-1 rounded border border-green-900/50">
            <Database className="w-4 h-4" /> PoliceDB v1.0
          </div>
          <div className="text-yellow-500 font-bold">
            {score} XP
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-100px)] overflow-hidden">
        
        {/* Left Panel: Briefing */}
        <div className="lg:w-1/3 bg-gray-900/50 border border-green-900/30 rounded-lg p-6 flex flex-col overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-green-400">{stage.title}</h2>
          <div className="prose prose-invert prose-p:text-green-600/80 mb-6">
            <p>{stage.story}</p>
          </div>
          <div className="mt-auto bg-black/50 p-4 rounded border border-green-900/30 text-sm">
            <span className="text-green-700 block mb-1">HINT:</span>
            <span className="text-green-600 opacity-70 hover:opacity-100 transition-opacity cursor-help">{stage.hint}</span>
          </div>
          
          <div className="mt-6">
            <h3 className="text-green-700 text-sm mb-2">Available Tables:</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.keys(DB).map(table => (
                <span key={table} className="px-2 py-1 bg-green-950/30 border border-green-900/50 rounded">{table}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Terminal */}
        <div className="lg:w-2/3 bg-black border border-green-900/50 rounded-lg flex flex-col relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          
          {/* Terminal History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {history.map((entry, idx) => (
              <div key={idx} className="text-sm">
                {entry.type === 'user' && (
                  <div><span className="text-green-700">detective@police-db:~$</span> <span className="text-green-300">{entry.text}</span></div>
                )}
                {entry.type === 'system' && (
                  <div className="text-green-600/70 italic">{entry.text}</div>
                )}
                {entry.type === 'error' && (
                  <div className="text-red-500">Error: {entry.text}</div>
                )}
                {entry.type === 'result' && entry.data && (
                  <div className="mt-2 mb-4 overflow-x-auto">
                    {entry.data.length === 0 ? (
                      <div className="text-green-600/50">0 rows returned.</div>
                    ) : (
                      <table className="w-full text-left border-collapse border border-green-900/30">
                        <thead>
                          <tr className="bg-green-950/30">
                            {Object.keys(entry.data[0]).map(k => (
                              <th key={k} className="p-2 border border-green-900/30 text-green-700 font-normal">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {entry.data.map((row, i) => (
                            <tr key={i} className="hover:bg-green-900/10">
                              {Object.values(row).map((val, j) => (
                                <td key={j} className="p-2 border border-green-900/30 text-green-400">{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <div className="text-green-700 mt-1">{entry.data.length} row(s) returned.</div>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Terminal Input */}
          <div className="p-4 bg-green-950/10 border-t border-green-900/50 flex items-center gap-2">
            <span className="text-green-700">detective@police-db:~$</span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleQuery}
              className="flex-1 bg-transparent border-none outline-none text-green-300 font-mono"
              placeholder="SELECT * FROM crime_scene_report..."
              spellCheck={false}
              autoFocus
            />
            <button
              onClick={runQuery}
              className="text-green-600 hover:text-green-400 p-1"
            >
              <Play className="w-4 h-4" />
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default SQLMurderMystery;
