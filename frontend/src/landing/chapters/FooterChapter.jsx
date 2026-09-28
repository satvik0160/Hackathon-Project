/**
 * Footer. Links, wording and destinations are unchanged from the previous
 * landing page; the only addition is a hover response on the brand mark, using
 * the supplied logo asset rather than inventing a new one.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

import { FOOTER, GITHUB_REPO_URL } from '../content.js';

export default function FooterChapter() {
  return (
    <footer className="landing-footer dv-footer">
      <div className="landing-container">
        <div className="dv-footer-grid">
          <div className="dv-footer-brand">
            <Link to="/" className="dv-footer-logo" aria-label="DevAstra home">
              <span className="landing-brand-badge">
                <img src="/devlogo.jpg" alt="" />
              </span>
              <span className="landing-wordmark">DevAstra</span>
              <span className="dv-footer-ripple" aria-hidden="true" />
            </Link>
            <p className="dv-footer-brand-text">{FOOTER.brand}</p>
          </div>

          <nav className="dv-footer-col" aria-label="Explore DevAstra">
            <span className="dv-footer-col-title">EXPLORE</span>
            {FOOTER.exploreLinks.map((link) => (
              <a key={link.href} className="landing-footer-link" href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <nav className="dv-footer-col" aria-label="Get started with DevAstra">
            <span className="dv-footer-col-title">GET STARTED</span>
            {FOOTER.getStartedLinks.map((link) => (
              <Link key={link.to} className="landing-footer-link" to={link.to}>
                {link.label}
              </Link>
            ))}
            <a
              className="landing-footer-link"
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-4 h-4" aria-hidden="true" />
              GitHub repository
            </a>
          </nav>
        </div>

        <div className="dv-footer-bottom">
          <p className="landing-mock-meta">© {new Date().getFullYear()} DevAstra</p>
          <p className="landing-mock-meta">{FOOTER.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
