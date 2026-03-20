import React from 'react';
import { Shield, MapPin, Headphones, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageContainer = ({ title, children }) => (
  <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem', minHeight: '60vh' }}>
    <h1 style={{ color: '#2d3748', fontSize: '2.5rem', marginBottom: '2rem', borderBottom: '2px solid #edf2f7', paddingBottom: '1rem' }}>{title}</h1>
    <div style={{ color: '#4a5568', lineHeight: '1.8', fontSize: '1.1rem' }}>
      {children}
    </div>
  </div>
);

export const AboutUs = () => (
  <PageContainer title="About Elite Electronics">
    <p>Founded in 2024, Elite Electronics was built on a simple premise: technology should be accessible, reliable, and cutting-edge. We bridge the gap between premium manufacturers and tech enthusiasts worldwide.</p>
    <p>Our team of dedicated hardware experts rigorously tests every product before it hits our digital shelves. Whether you are building a custom gaming rig, upgrading your home office, or searching for the perfect gift, we guarantee quality and performance.</p>
    <h3 style={{ color: '#2d3748', marginTop: '2rem' }}>Our Mission</h3>
    <p>To empower creators, professionals, and gamers with top-tier electronics backed by unparalleled customer support.</p>
  </PageContainer>
);

export const FAQ = () => (
  <PageContainer title="Frequently Asked Questions">
    <div style={{ marginBottom: '1.5rem' }}>
      <h4 style={{ color: '#2b6cb0', marginBottom: '0.5rem' }}>How long does shipping take?</h4>
      <p>Standard shipping typically takes 3-5 business days. Expedited shipping options are available at checkout.</p>
    </div>
    <div style={{ marginBottom: '1.5rem' }}>
      <h4 style={{ color: '#2b6cb0', marginBottom: '0.5rem' }}>What is your return policy?</h4>
      <p>We offer a 30-day money-back guarantee on all unopened items. If your device is defective, we provide free return shipping for a replacement.</p>
    </div>
    <div style={{ marginBottom: '1.5rem' }}>
      <h4 style={{ color: '#2b6cb0', marginBottom: '0.5rem' }}>Do you price match?</h4>
      <p>Yes! If you find a lower price from an authorized retailer within 14 days of purchase, contact support and we will refund the difference.</p>
    </div>
  </PageContainer>
);

export const Terms = () => (
  <PageContainer title="Terms & Conditions">
    <p>Welcome to Elite Electronics. By accessing our website, you agree to be bound by these terms and conditions.</p>
    <h4 style={{ color: '#2d3748', marginTop: '1.5rem' }}>1. Use of the Site</h4>
    <p>You must be at least 18 years of age to make a purchase. You agree to provide current, complete, and accurate purchase and account information.</p>
    <h4 style={{ color: '#2d3748', marginTop: '1.5rem' }}>2. Product Availability</h4>
    <p>All products are subject to availability. We reserve the right to discontinue any product at any time for any reason. Prices for all products are subject to change.</p>
  </PageContainer>
);

export const ContactSupport = () => (
  <PageContainer title="Help & Support">
    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
      <Headphones size={64} color="#3182ce" style={{ marginBottom: '1rem' }} />
      <h2 style={{ margin: 0, color: '#2d3748' }}>How can we help you today?</h2>
      <p>Our technical support team is standing by.</p>
    </div>
    <div style={{ backgroundColor: '#f7fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><strong><MapPin size={20}/> Headquarters:</strong> 123 Tech Avenue, Silicon Valley, CA 90210</p>
      <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><strong>Email:</strong> support@eliteelectronics.com</p>
      <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><strong>Phone:</strong> +1 (800) 555-0199 (Mon-Fri, 9AM-6PM EST)</p>
    </div>
  </PageContainer>
);

export const AccountSecurity = () => {
  const navigate = useNavigate();
  return (
    <PageContainer title="Account Security">
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontWeight: 'bold', marginBottom: '2rem', padding: 0 }}>← Back</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem', backgroundColor: '#fffaf0', padding: '1rem', borderLeft: '4px solid #dd6b20', borderRadius: '4px' }}>
        <Shield size={32} color="#dd6b20" />
        <div>
          <h4 style={{ margin: '0 0 5px 0', color: '#9c4221' }}>Security Notice</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#dd6b20' }}>For your protection, password changes require email verification.</p>
        </div>
      </div>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Change Password</h3>
        <input type="password" placeholder="Current Password" style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
        <input type="password" placeholder="New Password" style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
        <button style={{ backgroundColor: '#2b6cb0', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Update Security Settings</button>
      </div>
    </PageContainer>
  );
};

export const SavedAddresses = () => {
  const navigate = useNavigate();
  return (
    <PageContainer title="Saved Addresses">
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontWeight: 'bold', marginBottom: '2rem', padding: 0 }}>← Back</button>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => navigate('/profile')}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} color="#3182ce"/> Default Shipping Address</h3>
          <p style={{ margin: 0, color: '#718096' }}>Manage your street, city, and postal code for faster checkout.</p>
        </div>
        <ChevronRight size={24} color="#a0aec0" />
      </div>
    </PageContainer>
  );
};