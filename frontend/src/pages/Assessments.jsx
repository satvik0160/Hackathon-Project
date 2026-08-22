import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Database, Brain, Palette, Shield, Cloud, Clock, BarChart3, ChevronRight } from 'lucide-react';

const assessmentCategories = [
  {
    id: 1,
    name: 'Frontend Development',
    icon: <Palette size={24} />,
    color: '#a855f7',
    assessments: [
      { id: 1, title: 'React Fundamentals', difficulty: 'Medium', time: 30, questions: 20, description: 'Test your React hooks, state management, and component lifecycle knowledge.' },
      { id: 2, title: 'CSS & Responsive Design', difficulty: 'Easy', time: 20, questions: 15, description: 'Flexbox, Grid, media queries, and modern CSS techniques.' },
      { id: 3, title: 'JavaScript ES6+', difficulty: 'Hard', time: 45, questions: 30, description: 'Advanced JS concepts: closures, promises, async/await, and more.' },
    ],
  },
  {
    id: 2,
    name: 'Backend Development',
    icon: <Database size={24} />,
    color: '#3b82f6',
    assessments: [
      { id: 4, title: 'Python & Django', difficulty: 'Medium', time: 35, questions: 25, description: 'Django models, views, REST APIs, and ORM mastery.' },
      { id: 5, title: 'Node.js & Express', difficulty: 'Medium', time: 30, questions: 20, description: 'Server-side JavaScript, middleware, routing, and authentication.' },
      { id: 6, title: 'Database Design', difficulty: 'Hard', time: 40, questions: 20, description: 'SQL, NoSQL, normalization, indexing, and query optimization.' },
    ],
  },
  {
    id: 3,
    name: 'Data Science & AI',
    icon: <Brain size={24} />,
    color: '#10b981',
    assessments: [
      { id: 7, title: 'Machine Learning Basics', difficulty: 'Medium', time: 35, questions: 20, description: 'Supervised/unsupervised learning, model evaluation, and feature engineering.' },
      { id: 8, title: 'Python for Data Science', difficulty: 'Easy', time: 25, questions: 15, description: 'NumPy, Pandas, Matplotlib, and data manipulation fundamentals.' },
    ],
  },
  {
    id: 4,
    name: 'DevOps & Cloud',
    icon: <Cloud size={24} />,
    color: '#f59e0b',
    assessments: [
      { id: 9, title: 'Docker & Kubernetes', difficulty: 'Hard', time: 40, questions: 20, description: 'Containerization, orchestration, and cloud-native deployment.' },
      { id: 10, title: 'CI/CD Pipelines', difficulty: 'Medium', time: 30, questions: 15, description: 'Automated testing, deployment strategies, and pipeline configuration.' },
    ],
  },
  {
    id: 5,
    name: 'Cybersecurity',
    icon: <Shield size={24} />,
    color: '#ef4444',
    assessments: [
      { id: 11, title: 'Web Security Fundamentals', difficulty: 'Medium', time: 30, questions: 20, description: 'OWASP Top 10, XSS, CSRF, SQL injection, and secure coding practices.' },
    ],
  },
];

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy': return '#10b981';
    case 'Medium': return '#f59e0b';
    case 'Hard': return '#ef4444';
    default: return '#6b7280';
  }
};

function Assessments() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredCategories = selectedCategory
    ? assessmentCategories.filter((c) => c.id === selectedCategory)
    : assessmentCategories;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Skill Assessments</h1>
        <p>Test your knowledge across various domains and discover your strengths</p>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '50px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            background: selectedCategory === null ? 'linear-gradient(135deg, #a855f7, #3b82f6)' : 'rgba(255,255,255,0.08)',
            color: '#fff',
            transition: 'all 0.3s ease',
          }}
        >
          All Categories
        </button>
        {assessmentCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '50px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              background: selectedCategory === cat.id ? `linear-gradient(135deg, ${cat.color}, ${cat.color}88)` : 'rgba(255,255,255,0.08)',
              color: '#fff',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Assessment Cards */}
      {filteredCategories.map((category) => (
        <div key={category.id} style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: category.color }}>
            {category.icon} {category.name}
          </h2>
          <div className="card-grid">
            {category.assessments.map((assessment) => (
              <div key={assessment.id} className="glass-card" style={{ cursor: 'pointer', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                onClick={() => navigate(`/assessments/${assessment.id}/quiz`)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${category.color}33`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#fff', margin: 0 }}>{assessment.title}</h3>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: `${getDifficultyColor(assessment.difficulty)}22`,
                    color: getDifficultyColor(assessment.difficulty),
                    border: `1px solid ${getDifficultyColor(assessment.difficulty)}44`,
                  }}>
                    {assessment.difficulty}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                  {assessment.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                      <Clock size={14} /> {assessment.time} min
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                      <BarChart3 size={14} /> {assessment.questions} questions
                    </span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: category.color, fontSize: '0.9rem', fontWeight: '500' }}>
                    Start <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Assessments;
