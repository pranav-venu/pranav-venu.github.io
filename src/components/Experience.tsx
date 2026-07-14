import { useState } from 'react';
import { Calendar, Briefcase, GraduationCap, ChevronRight } from 'lucide-react';
import './Experience.css';

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  type: 'work' | 'education';
  description: string[];
  tags: string[];
}

export default function Experience() {
  const [activeItem, setActiveItem] = useState<string | null>('kjsdc');

  const experiences: ExperienceItem[] = [
    {
      id: 'kjsdc',
      role: 'Software Development Engineer (SDE)',
      company: 'KJSDC',
      location: 'India',
      period: 'Jan 2025 — Present (1.5 Years)',
      type: 'work',
      description: [
        'Design, develop, and deploy scalable enterprise web applications, managing full-stack workflows from frontend UI to database tables.',
        'Build and maintain highly responsive user interfaces utilizing modern JavaScript, React, Angular, and Vanilla CSS.',
        'Architect, optimize, and integrate secure RESTful APIs and microservices using Java, Spring Boot, and Hibernate.',
        'Optimize relational database schemas and complex SQL queries, improving overall page load times and data retrieval performance.',
        'Refactor legacy modules to resolve technical debt, enhancing overall code quality and readability by adhering to clean-coding practices.'
      ],
      tags: ['Java', 'Spring Boot', 'React', 'Angular', 'SQL', 'Hibernate', 'REST APIs', 'Git']
    },
    {
      id: 'mca',
      role: 'Master of Computer Applications (MCA)',
      company: 'Kristu jayanti University',
      location: 'India',
      period: '2022 — 2024',
      type: 'education',
      description: [
        'Acquired advanced theoretical and practical knowledge in core computer science areas: Data Structures & Algorithms, Object-Oriented Analysis, and DBMS.',
        'Engineered full-stack capstone projects using Java, web technologies, and relational databases.',
        'Focused on database systems design, software engineering methodologies, and network communications.'
      ],
      tags: ['Data Structures', 'Algorithms', 'DBMS', 'Software Engineering', 'Java', 'Web Tech']
    },
    {
      id: 'computervalley',
      role: 'Software Development Intern',
      company: 'Computervalley',
      location: 'India',
      period: '2022 — 2023',
      type: 'work',
      description: [
        'Developed interactive and reusable frontend components using React.',
        'Collaborated on creating and refining wireframes and UI designs in Figma.',
        'Contributed to daily stand-ups and agile workflows to deliver web interfaces.'
      ],
      tags: ['React', 'Figma', 'UI/UX Design', 'Frontend Development', 'JavaScript', 'HTML & CSS']
    },
    {
      id: 'bca',
      role: 'Bachelor of Computer Applications (BCA)',
      company: 'Koshy Group of Management Studies',
      location: 'India',
      period: '2019 — 2022',
      type: 'education',
      description: [
        'Studied foundational concepts of software engineering, database management systems, and programming languages.',
        'Developed initial desktop and web projects as part of the academic curriculum.',
        'Built a strong ground in logic, object-oriented programming, and computer networks.'
      ],
      tags: ['Programming Foundations', 'C++', 'Java', 'DBMS', 'Software Engineering', 'Computer Networks']
    }
  ];

  return (
    <section id="experience" className="experience-section">
      <div className="container">
        <div className="section-header">
          <span className="section-number">02</span>
          <h2 className="section-title">My Journey</h2>
        </div>

        <div className="experience-timeline-container">
          {/* Left Side: Timeline Navigation */}
          <div className="timeline-nav">
            {experiences.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setActiveItem(exp.id)}
                className={`timeline-nav-btn ${activeItem === exp.id ? 'active' : ''}`}
              >
                <div className="nav-btn-icon-wrapper">
                  {exp.type === 'work' ? <Briefcase size={16} /> : <GraduationCap size={16} />}
                </div>
                <div className="nav-btn-text">
                  <span className="nav-btn-role">{exp.role}</span>
                  <span className="nav-btn-company">{exp.company}</span>
                </div>
                <ChevronRight size={16} className="nav-btn-arrow" />
              </button>
            ))}
          </div>

          {/* Right Side: Timeline Content Details */}
          <div className="timeline-details-wrapper">
            {experiences.map((exp) => {
              if (exp.id !== activeItem) return null;
              return (
                <div key={exp.id} className="timeline-details-card animate-fade-in">
                  <div className="timeline-card-header">
                    <div className="role-and-company">
                      <h3 className="card-role">{exp.role}</h3>
                      <span className="card-company">@ {exp.company}</span>
                    </div>
                    <div className="card-meta">
                      <span className="card-period">
                        <Calendar size={14} className="meta-icon" />
                        {exp.period}
                      </span>
                    </div>
                  </div>

                  <div className="card-body">
                    <ul className="details-list">
                      {exp.description.map((bullet, idx) => (
                        <li key={idx} className="details-list-item">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card-footer">
                    <span className="tags-label">Technologies / Concepts:</span>
                    <div className="tags-container">
                      {exp.tags.map((tag, idx) => (
                        <span key={idx} className="tech-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
