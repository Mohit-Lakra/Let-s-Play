import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Trophy, Users } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="logo">
          <Trophy className="icon" />
          <span>Let's Play</span>
        </div>
        <div className="nav-actions">
          <button className="btn-secondary" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" onClick={() => navigate('/login')}>Sign Up</button>
        </div>
      </nav>

      <main className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="gradient-text hero-title">Find Your Perfect Match</h1>
          <p className="hero-subtitle">
            AI-powered sports matchmaking. Find reliable players near you, organized by skill level, reliability, and real-time availability.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary large" onClick={() => navigate('/login')}>
              Start Playing Now
            </button>
          </div>
        </motion.div>

        <div className="features-grid">
          <motion.div 
            className="feature-card glass-card"
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="feature-icon-wrapper blue"><Users /></div>
            <h3>Smart Matchmaking</h3>
            <p>Our PyTorch Deep Learning model predicts player reliability and skill compatibility to ensure great games.</p>
          </motion.div>
          
          <motion.div 
            className="feature-card glass-card"
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="feature-icon-wrapper green"><MapPin /></div>
            <h3>Location Based</h3>
            <p>Find matches instantly in your neighborhood. Our interactive map shows exactly who is ready to play nearby.</p>
          </motion.div>
          
          <motion.div 
            className="feature-card glass-card"
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="feature-icon-wrapper purple"><Trophy /></div>
            <h3>AI Scouting Reports</h3>
            <p>Mistral GenAI summarizes peer reviews into comprehensive scouting reports before you even step on the court.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
