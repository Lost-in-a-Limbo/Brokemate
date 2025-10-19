import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        <a href="#" className={styles.logo}>Brokemate</a>
        <nav>
          <ul className={styles.navMenu}>
            <li>
              <a 
                href="#features" 
                onClick={(e) => smoothScroll(e, '#features')}
              >
                Features
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                onClick={(e) => smoothScroll(e, '#about')}
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                onClick={(e) => smoothScroll(e, '#contact')}
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
        <Link 
          to="/expenses" 
          className={styles.ctaButton}
        >
          Get Started
        </Link>
      </div>
    </header>
  );
};

export default Header;