"use client";

import Link from 'next/link';
import { showToast } from '../components/Toast';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Thank you for subscribing! 🎉', 'success');
  };

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/images/logo.png" alt="Padhega Logo" className="footer-logo-img dark-logo" />
            <img src="/images/logo1.jpg" alt="Padhega Logo" className="footer-logo-img light-logo" />
            <span className="footer-logo-text">PADHEGA</span>
          </div>
          <p className="footer-tagline">Level up your learning experience with AI-powered focus tools and collaborative study rooms.</p>
          <div className="social-links">
            <a href="https://www.instagram.com/ashishgarud_03/" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://x.com/Ashishgarud17" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://discord.com/channels/@me" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Join our Discord">
              <i className="fab fa-discord"></i>
            </a>
            <a href="#" className="social-link" onClick={(e) => e.preventDefault()} aria-label="Visit our YouTube channel">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>



        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/cookies">Cookie Policy</Link></li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h3>Newsletter</h3>
          <p>Get the latest study tips and updates.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <div className="input-wrapper">
              <input type="email" placeholder="Email address" required />
              <button type="submit">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </form>
        </div>
      </div>


    </footer>
  );
};

export default Footer;