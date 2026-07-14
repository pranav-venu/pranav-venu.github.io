import { useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const [emailCopied, setEmailCopied] = useState(false);
  const emailAddress = 'pranv.venu.official@gmail.com';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email: ', err);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="contact-centered">
          <div className="section-header text-center">
            <span className="section-number">05</span>
            <h2 className="section-title">Get In Touch</h2>
          </div>

          <div className="contact-content text-center">
            <h3 className="contact-heading">
              Let's create something <span className="serif-font">extraordinary</span> together.
            </h3>
            
            <p className="contact-intro">
              Whether you have a project idea, want to collaborate on a full-stack system, or just want to chat about software engineering—my inbox is always open.
            </p>

            <div className="info-details-centered">
              <div className="info-item email-item" onClick={handleCopyEmail}>
                <div className="info-icon-wrapper">
                  <Mail size={18} />
                </div>
                <div className="info-text">
                  <span className="info-label">Email Me</span>
                  <span className="info-value">{emailAddress}</span>
                </div>
                <button 
                  className="copy-btn" 
                  aria-label="Copy email address"
                  title="Copy to clipboard"
                >
                  {emailCopied ? <Check size={16} className="copied-icon" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
