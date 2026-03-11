import { useState } from 'react';

export default function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_USER');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      if (response.ok) {
        setMessage({ text: 'Registration successful! 🎉 You can now log in.', type: 'success' });
        setTimeout(() => onSwitchToLogin(), 2000); // Auto-switch after 2 seconds
      } else {
        const errText = await response.text();
        setMessage({ text: `Registration failed: ${errText} ❌`, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Server connection failed. Please try again later.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f7f6', padding: '20px' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', color: '#1a202c' }}>Create Account 🚀</h2>
          <p style={{ margin: 0, color: '#718096', fontSize: '0.95rem' }}>Join Elite Electronics today</p>
        </div>

        {message.text && (
          <div style={{ backgroundColor: message.type === 'success' ? '#f0fff4' : '#fff5f5', color: message.type === 'success' ? '#2f855a' : '#c53030', padding: '10px', borderRadius: '6px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: `1px solid ${message.type === 'success' ? '#c6f6d5' : '#fed7d7'}` }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '600', fontSize: '0.9rem' }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '600', fontSize: '0.9rem' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
              placeholder="Create a password"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontWeight: '600', fontSize: '0.9rem' }}>Account Type</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}
            >
              <option value="ROLE_USER">Customer</option>
              <option value="ROLE_ADMIN">Store Admin</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ width: '100%', padding: '14px', backgroundColor: isLoading ? '#a0aec0' : '#38a169', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'background-color 0.2s' }}
          >
            {isLoading ? 'Creating Account... ⏳' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #edf2f7', paddingTop: '1.5rem' }}>
          <p style={{ margin: 0, color: '#718096', fontSize: '0.95rem' }}>
            Already have an account?{' '}
            <button 
              onClick={onSwitchToLogin} 
              style={{ background: 'none', border: 'none', color: '#3182ce', fontWeight: 'bold', cursor: 'pointer', padding: 0, fontSize: '0.95rem', textDecoration: 'underline' }}
            >
              Log in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}