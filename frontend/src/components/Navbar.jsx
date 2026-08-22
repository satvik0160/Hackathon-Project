import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <BrainCircuit size={28} color="#4cc9f0" />
        SkillMaster Pro
      </Link>
      <div className="nav-links">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/assessments" className="nav-link">Assessments</Link>
        <Link to="/learning" className="nav-link">Learning</Link>
        <Link to="/jobs" className="nav-link">Jobs</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
      </div>
    </nav>
  );
};

export default Navbar;
