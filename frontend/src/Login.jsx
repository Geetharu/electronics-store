import { useState } from 'react';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        onLoginSuccess(data);
      } else {
        setError('Invalid username or password ❌');
      }
    } catch (err) {
      setError('Server connection failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f7f6', padding: '20px' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#1a202c' }}>Elite Electronics ⚡</h1>
          <p style={{ margin: 0, color: '#718096', fontSize: '1rem' }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fff5f5', color: '#c53030', padding: '10px', borderRadius: '6px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid #fed7d7' }}>
            {error}
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
              placeholder="Enter your username"
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
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ width: '100%', padding: '14px', backgroundColor: isLoading ? '#a0aec0' : '#2b6cb0', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'background-color 0.2s' }}
          >
            {isLoading ? 'Signing in... ⏳' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #edf2f7', paddingTop: '1.5rem' }}>
          <p style={{ margin: 0, color: '#718096', fontSize: '0.95rem' }}>
            Don't have an account?{' '}
            <button 
              onClick={onSwitchToRegister} 
              style={{ background: 'none', border: 'none', color: '#3182ce', fontWeight: 'bold', cursor: 'pointer', padding: 0, fontSize: '0.95rem', textDecoration: 'underline' }}
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}