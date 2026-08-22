import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const AssessmentQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);

  // Mock quiz data
  const questions = [
    { q: "What is the primary purpose of React's Virtual DOM?", opts: ["Direct DOM manipulation", "Performance optimization", "State management", "Routing"] },
    { q: "Which hook is used for side effects in React?", opts: ["useState", "useContext", "useEffect", "useMemo"] },
    { q: "What does JSX stand for?", opts: ["JavaScript XML", "Java Syntax Extension", "JSON X", "JavaScript X-node"] }
  ];

  useEffect(() => {
    if (!finished && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(l => l - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timeLeft, finished]);

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelectedOpt(null);
    } else {
      setFinished(true);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (finished) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
        <CheckCircle size={64} color="#06d6a0" style={{ margin: '0 auto 1rem' }} />
        <h2>Assessment Complete!</h2>
        <div style={{ margin: '2rem 0' }}>
          <h1 style={{ fontSize: '4rem', color: 'var(--accent)' }}>85%</h1>
          <p className="page-subtitle">You scored 17/20 points.</p>
        </div>
        <p style={{ marginBottom: '2rem' }}>Great job! We have updated your skill profile and generated a personalized learning path to help you master the remaining topics.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={() => navigate('/assessments')}>Back to Assessments</button>
          <button className="btn" onClick={() => navigate('/learning')}>View Learning Path</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Question {currentQ + 1} of {questions.length}</h3>
        <span className="badge badge-danger" style={{ fontSize: '1rem' }}>{formatTime(timeLeft)}</span>
      </div>
      
      <div className="progress-container" style={{ marginBottom: '2rem' }}>
        <div className="progress-bar" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>{questions[currentQ].q}</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions[currentQ].opts.map((opt, i) => (
            <div 
              key={i}
              onClick={() => setSelectedOpt(i)}
              className="glass-panel"
              style={{ 
                cursor: 'pointer',
                border: selectedOpt === i ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                background: selectedOpt === i ? 'rgba(76, 201, 240, 0.1)' : 'var(--card-bg)',
                padding: '1rem'
              }}
            >
              {opt}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button 
            className="btn btn-outline" 
            disabled={currentQ === 0}
            onClick={() => setCurrentQ(c => c - 1)}
          >
            Previous
          </button>
          <button 
            className="btn" 
            disabled={selectedOpt === null}
            onClick={handleNext}
          >
            {currentQ === questions.length - 1 ? 'Submit' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuiz;
