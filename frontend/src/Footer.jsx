import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github, Mail, Phone, MapPin, Cpu } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        {/* Brand Section */}
        <div className="footer-section brand-info">
          <div className="footer-logo" onClick={() => handleNavigation('/')}>
            <Cpu size={32} color="#63b3ed" />
            <span>Elite Electronics ⚡</span>
          </div>
          <p className="footer-description">
            Your destination for premium tech, high-performance hardware, and the future of digital excellence.
          </p>
          <div className="social-links">
            <a href="#"><Facebook size={20} /></a>
            <a href="#"><Twitter size={20} /></a>
            <a href="#"><Instagram size={20} /></a>
            <a href="#"><Github size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Shop & Explore</h4>
          <ul>
            <li onClick={() => handleNavigation('/')}>All Products</li>
            <li onClick={() => handleNavigation('/')}>Featured Deals</li>
            <li onClick={() => handleNavigation('/wishlist')}>My Wishlist</li>
            <li onClick={() => handleNavigation('/cart')}>Shopping Cart</li>
          </ul>
        </div>

        {/* Support Links */}
        <div className="footer-section">
          <h4>Customer Support</h4>
          <ul>
            <li onClick={() => handleNavigation('/contact')}>Help Center</li>
            <li onClick={() => handleNavigation('/faq')}>FAQs</li>
            <li onClick={() => handleNavigation('/about')}>About Us</li>
            <li onClick={() => handleNavigation('/terms')}>Terms of Service</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section contact-info">
          <h4>Get In Touch</h4>
          <div className="contact-item">
            <Mail size={18} />
            <span>support@eliteelectronics.com</span>
          </div>
          <div className="contact-item">
            <Phone size={18} />
            <span>+1 (800) 555-0199</span>
          </div>
          <div className="contact-item">
            <MapPin size={18} />
            <span>123 Tech Ave, Silicon Valley, CA</span>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {currentYear} Elite Electronics Inc. All rights reserved.</p>
          <div className="footer-legal">
            <span onClick={() => handleNavigation('/terms')}>Privacy Policy</span>
            <span onClick={() => handleNavigation('/terms')}>Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
}