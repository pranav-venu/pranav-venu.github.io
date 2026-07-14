import './About.css';

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="section-header">
          <span className="section-number">01</span>
          <h2 className="section-title">About Me</h2>
        </div>

        <div className="about-grid">
          {/* Left Column: Core statement */}
          <div className="about-statement-wrapper">
            <h3 className="about-statement">
              I believe in writing <span className="serif-font">clean, scalable code</span> that solves real-world problems and creates <span className="serif-font">delightful digital experiences</span>.
            </h3>
          </div>

          {/* Right Column: Detailed narrative */}
          <div className="about-narrative">
            <p className="narrative-paragraph">
              Hello! I am Pranav, a Software Development Engineer (SDE) focused on designing and building interactive, responsive, and robust web applications.
            </p>
            
            <p className="narrative-paragraph">
              With an MCA degree and over 1.5 years of experience at KJSDC, I specialize in full-stack development. I build modular interfaces, design clean APIs, and optimize databases, bridging the gap between aesthetics and functionality.
            </p>

            {/* Core Values grid */}
            <div className="about-values">
              <div className="value-item">
                <span className="value-label">01 / Engineering</span>
                <p className="value-desc">Focusing on scalability, testability, and clean architecture.</p>
              </div>
              <div className="value-item">
                <span className="value-label">02 / Design-Driven</span>
                <p className="value-desc">Bridging UI design aesthetics with responsive execution.</p>
              </div>
              <div className="value-item">
                <span className="value-label">03 / Communication</span>
                <p className="value-desc">Collaborative mindset with a focus on delivering value.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
