import { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // 🌟 CRITICAL: Save the username so App.jsx can see it
        localStorage.setItem('username', username); 
        onLoginSuccess(data.token, username);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Could not connect to the server. Is Spring Boot running?');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Elite Electronics ⚡</h2>
        <p>Please log in to continue</p>
        {error && <p className="error-msg">{error}</p>}
        <div className="form-group">
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="login-btn">Login</button>
        <p className="hint">Try: <strong>admin</strong> / <strong>password123</strong></p>
      </form>
    </div>
  );
}

export default Login;