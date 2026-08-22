import { Link } from 'react-router-dom';
import { Target, BookOpen, Briefcase } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Master Your Skills. Shape Your Career.</h1>
        <p className="page-subtitle" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          The AI-driven platform that assesses your abilities, tailors your learning, and connects you with dream jobs.
        </p>
        <Link to="/dashboard" className="btn" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
          Get Started
        </Link>
      </div>
      
      <div className="grid-3" style={{ marginTop: '3rem' }}>
        <div className="glass-panel card-hover" style={{ textAlign: 'center' }}>
          <Target size={48} color="#4cc9f0" style={{ margin: '0 auto 1rem' }} />
          <h3>Skill Assessment</h3>
          <p className="page-subtitle" style={{ marginTop: '0.5rem' }}>Prove your expertise with our rigorous, adaptive coding challenges and quizzes.</p>
        </div>
        <div className="glass-panel card-hover" style={{ textAlign: 'center' }}>
          <BookOpen size={48} color="#9d4edd" style={{ margin: '0 auto 1rem' }} />
          <h3>Personalized Learning</h3>
          <p className="page-subtitle" style={{ marginTop: '0.5rem' }}>Get curated learning paths based on your assessment results to bridge skill gaps.</p>
        </div>
        <div className="glass-panel card-hover" style={{ textAlign: 'center' }}>
          <Briefcase size={48} color="#06d6a0" style={{ margin: '0 auto 1rem' }} />
          <h3>Job Matching</h3>
          <p className="page-subtitle" style={{ marginTop: '0.5rem' }}>Land jobs that perfectly align with your verified skill profile.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
