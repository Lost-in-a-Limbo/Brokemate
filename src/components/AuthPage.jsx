import React, { useState } from 'react';
import { Wallet, X } from 'lucide-react';
import { apiFetch } from './ExpenseComponents';

const API_BASE_URL = 'http://127.0.0.1:8000';

const AuthPage = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const clearMessages = () => { setError(''); setSuccessMessage(''); };
  const switchView = (isLogin) => { setIsLoginView(isLogin); clearMessages(); };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); clearMessages();
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed.');
      }
      const data = await response.json();
      onLoginSuccess(data.access_token);
    } catch (err) {
      setError(err instanceof TypeError ? 'Could not connect to the server. Please ensure the backend is running.' : err.message);
    }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); clearMessages();
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed.');
      }
      setSuccessMessage('Registration successful! Please log in.');
      setIsLoginView(true); setPassword('');
    } catch (err) { 
      const errorMessage = err instanceof TypeError 
        ? 'Could not connect to the server. Please ensure the backend is running.' 
        : (err.message || String(err));
      setError(errorMessage);
    }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%',
    background: 'white',
    border: '1px solid var(--neutral-gray-300)',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    color: 'var(--neutral-gray-800)',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const focusStyle = {
    borderColor: 'var(--primary-teal)',
    boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.15)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-primary)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem', justifyContent: 'center' }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '1rem', 
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            <Wallet size={56} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              color: 'white', 
              margin: 0,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>Brokemate</h1>
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'rgba(255, 255, 255, 0.9)', 
              margin: 0,
              fontWeight: '300',
              letterSpacing: '0.5px'
            }}>Your Personal Finance Companion</p>
          </div>
        </div>
        <div style={{
          background: 'var(--neutral-white)',
          padding: '2rem',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(26, 54, 93, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--neutral-gray-200)', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => switchView(true)} 
              style={{
                flex: 1,
                padding: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isLoginView ? 'var(--primary-teal)' : 'var(--neutral-gray-500)',
                borderBottom: isLoginView ? '3px solid var(--primary-teal)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Login
            </button>
            <button 
              onClick={() => switchView(false)} 
              style={{
                flex: 1,
                padding: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: !isLoginView ? 'var(--primary-teal)' : 'var(--neutral-gray-500)',
                borderBottom: !isLoginView ? '3px solid var(--primary-teal)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Register
            </button>
          </div>
          
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '0.5rem',
              position: 'relative',
              margin: '1rem 0'
            }}>
              <strong>Error: </strong>{error}
              <span 
                style={{ position: 'absolute', top: '0.75rem', right: '1rem', cursor: 'pointer' }}
                onClick={clearMessages}
              >
                <X size={18} />
              </span>
            </div>
          )}
          
          {successMessage && (
            <div style={{
              background: 'rgba(8, 145, 178, 0.1)',
              border: '1px solid var(--primary-teal)',
              color: 'var(--primary-navy)',
              padding: '1rem',
              borderRadius: '0.5rem',
              margin: '1rem 0',
              fontWeight: '500'
            }}>
              {successMessage}
            </div>
          )}
          
          <form onSubmit={isLoginView ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--neutral-gray-700)', marginBottom: '0.5rem' }}>
                Email (Username)
              </label>
              <input 
                type="email" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--neutral-gray-300)', boxShadow: 'none' })}
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--neutral-gray-700)', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--neutral-gray-300)', boxShadow: 'none' })}
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              style={{
                width: '100%',
                background: loading ? 'var(--neutral-gray-500)' : 'var(--gradient-secondary)',
                color: 'white',
                fontWeight: 'bold',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                }
              }}
            >
              {loading ? 'Processing...' : (isLoginView ? 'Login' : 'Register')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;