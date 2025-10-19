import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/CTA.module.css';

const CTA = ({ 
  title = "Ready to Transform Your Financial Future?",
  description = "Join thousands of users who have already taken control of their finances with Brokemate. Start your journey today and experience the difference personalized financial guidance can make.",
  buttonText = "Get Started Now",
  buttonLink = "/expenses"
}) => {
  return (
    <section className={styles.ctaSection} id="get-started">
      <div className={styles.ctaContent}>
        <h2>{title}</h2>
        <p>{description}</p>
        <Link to={buttonLink} className={styles.btnPrimary}>
          {buttonText}
        </Link>
      </div>
    </section>
  );
};

export default CTA;