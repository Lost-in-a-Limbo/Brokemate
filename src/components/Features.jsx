import React, { useEffect, useRef } from 'react';
import styles from '../styles/Features.module.css';

const FeatureCard = ({ icon, title, description, index }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className={styles.featureCard}
      style={{
        opacity: 0,
        transform: 'translateY(30px)',
        transition: `all 0.8s ease-out ${index * 0.2}s`
      }}
    >
      <div className={styles.featureIcon}>
        <i className={icon}></i>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const Features = ({ 
  title = "Powerful Features for Smart Financial Management",
  subtitle = "Everything you need to take control of your finances and build a secure financial future",
  features = [
    {
      icon: "fas fa-user-tie",
      title: "Tailored Financial Assistance",
      description: "Personalized guidance to manage finances according to each user's unique goals and situation, helping you make informed decisions."
    },
    {
      icon: "fas fa-calendar-alt",
      title: "Monthly Budget Consideration",
      description: "Budget-aware recommendations that align with your financial capabilities and help with future planning and goal achievement."
    },
    {
      icon: "fas fa-chart-line",
      title: "Comprehensive Expense Tracking",
      description: "Robust tools to log and analyze expenses, ensuring you remain within budget and understand your spending patterns."
    },
    {
      icon: "fas fa-coins",
      title: "Personalized Investment Suggestions",
      description: "Investment opportunities tailored to your preferences and objectives, enhancing your financial journey and wealth building."
    }
  ]
}) => {
  return (
    <section className={styles.features} id="features">
      <div className={styles.featuresContainer}>
        <div className={styles.sectionTitle}>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;