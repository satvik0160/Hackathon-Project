import { MapPin, DollarSign, Briefcase } from 'lucide-react';

const Jobs = () => {
  const jobs = [
    { id: 1, title: 'Frontend Developer', company: 'InnovateTech', location: 'San Francisco, CA (Hybrid)', tags: ['React', 'TypeScript', 'CSS'], salary: '$110k - $140k', match: 95 },
    { id: 2, title: 'React UI Engineer', company: 'DesignSystem Inc.', location: 'Remote', tags: ['React', 'Figma', 'Storybook'], salary: '$100k - $130k', match: 88 },
    { id: 3, title: 'Fullstack Engineer', company: 'StartupX', location: 'New York, NY', tags: ['React', 'Node.js', 'PostgreSQL'], salary: '$120k - $160k', match: 75 },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Job Board</h1>
        <p className="page-subtitle">Curated opportunities matching your verified skill profile.</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <select className="glass-panel" style={{ padding: '0.5rem', flex: 1, minWidth: '150px', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
          <option>All Job Types</option>
          <option>Full-time</option>
          <option>Contract</option>
          <option>Internship</option>
        </select>
        <select className="glass-panel" style={{ padding: '0.5rem', flex: 1, minWidth: '150px', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
          <option>Any Location</option>
          <option>Remote Only</option>
          <option>On-site</option>
        </select>
        <button className="btn" style={{ padding: '0.5rem 1.5rem' }}>Filter</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {jobs.map(job => (
          <div key={job.id} className="glass-panel card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                {job.company[0]}
              </div>
              <div>
                <h3>{job.title}</h3>
                <p className="page-subtitle" style={{ margin: '0.2rem 0 0.8rem 0' }}>{job.company}</p>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><MapPin size={16}/> {job.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><DollarSign size={16}/> {job.salary}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Briefcase size={16}/> Full-time</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                  {job.tags.map(t => <span key={t} className="badge badge-primary">{t}</span>)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
              <span className="badge badge-success" style={{ fontSize: '1rem' }}>{job.match}% Match</span>
              <button className="btn">Easy Apply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
