import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './user.css';
import GoogalLogo from './img/glogo.png';
import { initParticles } from '../../utils/particleAnimation';

function UserLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [appear, setAppear] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [inputFocus, setInputFocus] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved theme preference in localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Apply dark mode class if needed
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    setAppear(true);

    if (canvasRef.current) {
      initParticles(canvasRef.current, savedDarkMode);
    }

    const handleResize = () => {
      if (canvasRef.current) {
        initParticles(canvasRef.current, savedDarkMode);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInputFocus = (field, value) => {
    setInputFocus({ ...inputFocus, [field]: value });
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.body.classList.toggle('dark-mode');
    
    // Re-initialize particles with new theme
    if (canvasRef.current) {
      initParticles(canvasRef.current, newDarkMode);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Login attempt:', formData);
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userID', data.id);

        setTimeout(() => {
          navigate('/allPost');
        }, 800);
      } else if (response.status === 401) {
        alert('Invalid credentials!');
      } else {
        alert('Failed to login!');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${darkMode ? 'dark-mode' : ''}`}>
      <canvas ref={canvasRef} className="particles-background"></canvas>

      <div className="theme-toggle" onClick={toggleDarkMode} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
        <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        <span className="theme-toggle-tooltip">{darkMode ? "Light Mode" : "Dark Mode"}</span>
      </div>

      <div className={`auth-inner-container centered-form ${appear ? 'appear' : ''}`}>
        <div className="auth-content form-side full-width">
          <div className="login-content">
            <h1 className="auth-heading">Welcome Back</h1>
            <p className="auth-subheading">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <div className={`floating-label-group ${inputFocus.email || formData.email ? 'active' : ''}`}>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus('email', true)}
                  onBlur={() => handleInputFocus('email', false)}
                  required
                  className="auth-input"
                />
                <label htmlFor="email" className="floating-label">
                  <i className="input-icon fas fa-envelope"></i>
                  Email Address
                </label>
                <span className="input-highlight"></span>
              </div>
            </div>

            <div className="auth-form-group">
              <div className={`floating-label-group ${inputFocus.password || formData.password ? 'active' : ''}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus('password', true)}
                  onBlur={() => handleInputFocus('password', false)}
                  required
                  className="auth-input"
                />
                <label htmlFor="password" className="floating-label">
                  <i className="input-icon fas fa-lock"></i>
                  Password
                </label>
                <span className="input-highlight"></span>
                <span className="password-toggle" onClick={togglePasswordVisibility}>
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </span>
              </div>
              <div className="forgot-password">
                <span className="ripple-effect">Forgot Password?</span>
              </div>
            </div>

            <button 
              type="submit" 
              className={`auth-button ripple-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <span className="button-content">
                {loading ? 
                  <>
                    <span className="spinner"></span>
                    <span>Signing in...</span>
                  </> : 
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Sign In</span>
                  </>
                }
              </span>
            </button>
            
            <div className="auth-separator">
              <span>OR</span>
            </div>
            
            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
              className="google-button ripple-button"
            >
              <span className="button-content">
                <img src={GoogalLogo} alt='Google logo' className='glogo' />
                <span>Sign in with Google</span>
              </span>
            </button>
            
            <p className="auth-signup-prompt">
              Don't have an account? <span onClick={() => (window.location.href = '/register')} className="auth-signup-link ripple-effect">Sign up</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
