import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        
        // Base64 decode JWT payload to get user ID
        const payload = JSON.parse(atob(res.data.token.split('.')[1]));
        localStorage.setItem('userId', payload.userId);
        
        window.location.href = '/dashboard'; // Force refresh to load auth state
      } else {
        const res = await api.post('/auth/signup', { name, email, password });
        localStorage.setItem('token', res.data.token);
        
        const payload = JSON.parse(atob(res.data.token.split('.')[1]));
        localStorage.setItem('userId', payload.userId);
        
        // Also create a default profile so the user can immediately use the app
        await api.post('/profile', {
            sports: ['football', 'badminton'],
            preferredLocation: [-122.4194, 37.7749], // Dummy default: SF coordinates
            availability: [{ day: 'sat', startTime: '10:00', endTime: '12:00' }]
        });
        
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="glass-card animate-fade-in">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {isLogin ? 'Welcome Back' : 'Join the Game'}
      </h2>
      
      {error && (
        <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        <button type="submit">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span 
          style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </span>
      </p>
    </div>
  );
}

export default Login;
