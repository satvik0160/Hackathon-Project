import { User, Mail, Award, Github, Linkedin } from 'lucide-react';

const Profile = () => {
  return (
    <div>
      <div className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-light), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={64} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Alex Developer</h1>
          <p className="page-subtitle" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Frontend Engineer passionate about UI/UX and React.</p>
          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={18}/> alex@example.com</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Github size={18}/> alexdev</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Linkedin size={18}/> in/alexdev</span>
          </div>
        </div>
        <button className="btn btn-outline">Edit Profile</button>
      </div>

      <div className="grid-2">
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="#ffd166" /> Verified Skills
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {['React (Expert)', 'JavaScript (Advanced)', 'CSS (Advanced)', 'Node.js (Intermediate)', 'TypeScript (Intermediate)'].map(s => (
              <span key={s} className="badge badge-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>{s}</span>
            ))}
            <button className="badge badge-accent" style={{ background: 'transparent', border: '1px dashed var(--accent)', cursor: 'pointer', padding: '0.5rem 1rem' }}>+ Take Assessment</button>
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Assessments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
              <div>
                <h4 style={{ marginBottom: '0.2rem' }}>React Fundamentals</h4>
                <p className="page-subtitle" style={{ fontSize: '0.8rem' }}>Taken on Aug 20, 2026</p>
              </div>
              <span className="badge badge-success">85% - Passed</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
              <div>
                <h4 style={{ marginBottom: '0.2rem' }}>Advanced CSS</h4>
                <p className="page-subtitle" style={{ fontSize: '0.8rem' }}>Taken on Aug 15, 2026</p>
              </div>
              <span className="badge badge-success">92% - Passed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
