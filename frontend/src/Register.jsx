import { useState } from 'react';

function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false });

    if (formData.password !== formData.confirmPassword) {
      return setMessage({ text: "Passwords don't match!", isError: true });
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "Account created! Redirecting to login...", isError: false });
        setTimeout(() => onSwitchToLogin(), 2000); // Send them back to login after 2 seconds
      } else {
        setMessage({ text: data.message || "Registration failed", isError: true });
      }
    } catch (err) {
      setMessage({ text: "Server error. Is Spring Boot running?", isError: true });
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Join Elite Electronics ⚡</h2>
        {message.text && (
          <p style={{ color: message.isError ? '#e53e3e' : '#38a169', marginBottom: '1rem' }}>
            {message.text}
          </p>
        )}
        <div className="form-group">
          <input 
            type="text" placeholder="Choose Username" required
            onChange={(e) => setFormData({...formData, username: e.target.value})} 
          />
        </div>
        <div className="form-group">
          <input 
            type="password" placeholder="Password" required
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
        </div>
        <div className="form-group">
          <input 
            type="password" placeholder="Confirm Password" required
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
          />
        </div>
        <button type="submit" className="login-btn">Create Account</button>
        <p className="hint">Already have an account? <span onClick={onSwitchToLogin} style={{color: '#4a90e2', cursor: 'pointer', fontWeight: 'bold'}}>Login here</span></p>
      </form>
    </div>
  );
}

export default Register;