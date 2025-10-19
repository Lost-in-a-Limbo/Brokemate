import React, { useEffect, useRef } from 'react';
import styles from '../styles/Stats.module.css';

const StatItem = ({ value, label, index }) => {
  const statRef = useRef(null);

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

    if (statRef.current) {
      observer.observe(statRef.current);
    }

    return () => {
      if (statRef.current) {
        observer.unobserve(statRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={statRef}
      className={styles.statItem}
      style={{
        opacity: 0,
        transform: 'translateY(30px)',
        transition: `all 0.8s ease-out ${index * 0.1}s`
      }}
    >
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  );
};

const Stats = ({ 
  stats = [
    { value: "10K+", label: "Happy Users" },
    { value: "$50M+", label: "Money Managed" },
    { value: "95%", label: "Success Rate" },
    { value: "24/7", label: "Support Available" }
  ]
}) => {
  return (
    <section className={styles.stats}>
      <div className={styles.statsContainer}>
        {stats.map((stat, index) => (
          <StatItem
            key={index}
            value={stat.value}
            label={stat.label}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};

export default Stats;