import { useState } from 'react';
import './Skills.css';

interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'tools';
  level: string; // e.g. "Advanced", "Intermediate"
}

export default function Skills() {
  const [filter, setFilter] = useState<'all' | 'frontend' | 'backend' | 'tools'>('all');

  const skills: Skill[] = [
    // Frontend
    { name: 'React', category: 'frontend', level: 'Advanced' },
    { name: 'Angular', category: 'frontend', level: 'Intermediate' },
    { name: 'TypeScript', category: 'frontend', level: 'Intermediate' },
    { name: 'HTML5 & CSS3', category: 'frontend', level: 'Advanced' },
    { name: 'Vanilla CSS', category: 'frontend', level: 'Advanced' },
    { name: 'Web Design', category: 'frontend', level: 'Advanced' },
    
    // Backend
    { name: 'Java', category: 'backend', level: 'Advanced' },
    { name: 'RESTful APIs', category: 'backend', level: 'Advanced' },
    { name: 'Microservices', category: 'backend', level: 'Intermediate' },
    
    // Tools & Databases
    { name: 'Git & GitHub', category: 'tools', level: 'Advanced' },
    { name: 'Postman', category: 'tools', level: 'Advanced' },
    { name: 'Figma', category: 'tools', level: 'Advanced' }
  ];

  const filteredSkills = filter === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === filter);

  return (
    <section id="skills" className="skills-section">
      <div className="container">
        <div className="section-header">
          <span className="section-number">03</span>
          <h2 className="section-title">My Tech Stack</h2>
        </div>

        {/* Filter Navigation */}
        <div className="skills-filter-nav">
          {(['all', 'frontend', 'backend', 'tools'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
            >
              {cat === 'tools' ? 'Tools & Databases' : cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="skills-display-grid">
          {filteredSkills.map((skill, idx) => (
            <div key={idx} className="skill-chip-wrapper animate-fade-in">
              <div className="skill-chip">
                <span className="skill-dot">✦</span>
                <span className="skill-name">{skill.name}</span>
                <span className="skill-level">{skill.level}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
