import React from 'react';
import styles from '../styles/Footer.module.css';

const Footer = ({ 
  companyName = "Brokemate",
  companyDescription = "Your trusted financial companion for building a secure and prosperous future. Empowering individuals to make smart financial decisions.",
  currentYear = new Date().getFullYear()
}) => {
  const features = [
    { name: "Budget Planning", link: "#" },
    { name: "Expense Tracking", link: "#" },
    { name: "Investment Advice", link: "#" },
    { name: "Financial Reports", link: "#" }
  ];

  const support = [
    { name: "Help Center", link: "#" },
    { name: "Contact Us", link: "#" },
    { name: "Privacy Policy", link: "#" },
    { name: "Terms of Service", link: "#" }
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>{companyName}</h4>
            <p>{companyDescription}</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Features</h4>
            {features.map((feature, index) => (
              <p key={index}>
                <a href={feature.link}>{feature.name}</a>
              </p>
            ))}
          </div>
          <div className={styles.footerSection}>
            <h4>Support</h4>
            {support.map((item, index) => (
              <p key={index}>
                <a href={item.link}>{item.name}</a>
              </p>
            ))}
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; {currentYear} {companyName}. All rights reserved. Built with ❤️ for your financial success.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;