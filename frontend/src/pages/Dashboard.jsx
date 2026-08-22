import { Link } from 'react-router-dom';
import { Activity, Star, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back, Alex!</h1>
        <p className="page-subtitle">Here is your skill progression overview.</p>
      </div>

      <div className="grid-2">
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#4cc9f0" /> Skill Radar
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>React</span>
                <span>85%</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Node.js</span>
                <span>70%</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Python</span>
                <span>60%</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#9d4edd" /> Active Learning Paths
          </h3>
          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', marginBottom: '1rem' }}>
            <h4>Advanced React Patterns</h4>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: '45%' }}></div>
            </div>
            <p className="page-subtitle" style={{ fontSize: '0.8rem' }}>45% Complete</p>
          </div>
          <Link to="/learning" className="btn btn-outline" style={{ width: '100%' }}>Continue Learning</Link>
        </div>
      </div>

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Star size={20} color="#ffd166" /> Recommended Jobs
      </h3>
      <div className="grid-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel card-hover">
            <span className="badge badge-accent" style={{ float: 'right' }}>90% Match</span>
            <h4>Senior Frontend Engineer</h4>
            <p className="page-subtitle">TechCorp Inc. • Remote</p>
            <p style={{ margin: '1rem 0', color: '#06d6a0' }}>$120k - $150k</p>
            <Link to="/jobs" className="btn" style={{ width: '100%', padding: '0.5rem' }}>View Job</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
