import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Hero.module.css';

const Hero = ({ 
  title = "Brokemate", 
  tagline = "Your Financial Companion",
  description = "A comprehensive financial assistance platform designed to help you manage your personal finances effectively. Get tailored investment suggestions, budget-aware recommendations, and comprehensive expense tracking.",
  primaryButtonText = "Start Your Journey",
  secondaryButtonText = "Learn More"
}) => {
  const smoothScroll = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>{title}</h1>
        <p className={styles.tagline}>{tagline}</p>
        <p className={styles.description}>{description}</p>
        <div className={styles.heroButtons}>
          <Link 
            to="/expenses"
            className={styles.btnPrimary}
          >
            {primaryButtonText}
          </Link>
          <a 
            href="#features" 
            className={styles.btnSecondary}
            onClick={(e) => smoothScroll(e, '#features')}
          >
            {secondaryButtonText}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;