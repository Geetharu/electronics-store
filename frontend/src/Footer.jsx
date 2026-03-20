import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1a202c', color: '#e2e8f0', padding: '4rem 2rem 2rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
        
        {/* Brand Section */}
        <div>
          <h2 style={{ color: 'white', margin: '0 0 1rem 0', fontSize: '1.8rem' }}>Elite Electronics ⚡</h2>
          <p style={{ color: '#a0aec0', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Delivering excellence in every device. Premium electronics, unbeatable prices, and customer service that actually cares.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a href="#" style={{ color: '#a0aec0', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#3182ce'} onMouseLeave={e => e.target.style.color = '#a0aec0'}><Facebook size={24} /></a>
            <a href="#" style={{ color: '#a0aec0', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#63b3ed'} onMouseLeave={e => e.target.style.color = '#a0aec0'}><Twitter size={24} /></a>
            <a href="#" style={{ color: '#a0aec0', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#d53f8c'} onMouseLeave={e => e.target.style.color = '#a0aec0'}><Instagram size={24} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{ color: 'white', margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/about" style={{ color: '#a0aec0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#a0aec0'}>About Us</Link></li>
            <li><Link to="/products" style={{ color: '#a0aec0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#a0aec0'}>Shop All Products</Link></li>
            <li><Link to="/faq" style={{ color: '#a0aec0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#a0aec0'}>FAQ & Support</Link></li>
            <li><Link to="/terms" style={{ color: '#a0aec0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#a0aec0'}>Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 style={{ color: 'white', margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>Contact Us</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a0aec0' }}>
              <MapPin size={20} color="#3182ce" /> 123 Tech Avenue, Silicon Valley, CA 90210
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a0aec0' }}>
              <Phone size={20} color="#3182ce" /> +1 (800) 555-0199
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a0aec0' }}>
              <Mail size={20} color="#3182ce" /> support@eliteelectronics.com
            </li>
          </ul>
        </div>

      </div>

      <div style={{ maxWidth: '1200px', margin: '3rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid #2d3748', textAlign: 'center', color: '#718096', fontSize: '0.9rem' }}>
        <p>&copy; {new Date().getFullYear()} Elite Electronics. All rights reserved.</p>
      </div>
    </footer>
  );
}