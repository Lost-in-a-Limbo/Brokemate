import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Login submitted:', formData);
      setIsLoading(false);
      // Here you would typically handle the actual login logic
    }, 1500);
  };

  return (
    <div className={styles.loginContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <Link to="/" className={styles.logo}>Brokemate</Link>
          <Link to="/" className={styles.backLink}>
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <main className={styles.loginMain}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1>Welcome Back</h1>
            <p>Sign in to your Brokemate account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className={styles.formOptions}>
              <label className={styles.checkboxContainer}>
                <input type="checkbox" />
                <span className={styles.checkmark}></span>
                Remember me
              </label>
              <a href="#" className={styles.forgotPassword}>Forgot password?</a>
            </div>

            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.socialLogin}>
            <button className={styles.socialButton}>
              <i className="fab fa-google"></i>
              Continue with Google
            </button>
            <button className={styles.socialButton}>
              <i className="fab fa-github"></i>
              Continue with GitHub
            </button>
          </div>

          <div className={styles.signupPrompt}>
            <p>Don't have an account? <a href="#" className={styles.signupLink}>Sign up for free</a></p>
          </div>
        </div>

        {/* Features Preview */}
        <div className={styles.featuresPreview}>
          <h3>Why Choose Brokemate?</h3>
          <ul>
            <li>
              <i className="fas fa-shield-alt"></i>
              Bank-level security for your financial data
            </li>
            <li>
              <i className="fas fa-chart-line"></i>
              AI-powered investment recommendations
            </li>
            <li>
              <i className="fas fa-mobile-alt"></i>
              Track expenses on-the-go
            </li>
            <li>
              <i className="fas fa-users"></i>
              Join 10K+ satisfied users
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Login;