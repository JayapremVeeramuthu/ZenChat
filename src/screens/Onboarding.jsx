import React, { useState } from 'react';
import { useChat, LANGUAGES } from '../context/ChatContext';
import { ArrowRight, Globe, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const OnboardingScreen = () => {
  const { setUser, setOnboardingStep } = useChat();
  const [name, setName] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setUser({ name });
      setOnboardingStep(2);
    }
  };

  return (
    <div className="onboarding-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="onboarding-card glass"
      >
        <div className="app-logo-section">
          <div className="logo-icon">
            <Globe size={40} color="var(--primary)" />
          </div>
          <h1>LinguoSync</h1>
          <p>Seamless communication, transcending borders.</p>
        </div>

        <form onSubmit={handleContinue} className="onboarding-form">
          <div className="input-group">
            <label>What's your name?</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="primary-btn" disabled={!name.trim()}>
            Continue <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>

    </div>
  );
};

export const LanguageSelectionScreen = () => {
  const { setSelectedLanguage, setOnboardingStep, selectedLanguage } = useChat();

  const handleComplete = () => {
    if (selectedLanguage) {
      setOnboardingStep(3);
    }
  };

  return (
    <div className="language-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="language-header"
      >
        <h1>Choose Your Language</h1>
        <p>Messages will be automatically translated for others.</p>
      </motion.div>

      <div className="language-grid">
        {LANGUAGES.map((lang, index) => (
          <motion.div
            key={lang.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`lang-card ${selectedLanguage?.id === lang.id ? 'active' : ''}`}
            onClick={() => setSelectedLanguage(lang)}
          >
            <div className="lang-icon">
              {selectedLanguage?.id === lang.id ? <Check size={20} /> : <Globe size={20} />}
            </div>
            <div className="lang-info">
              <span className="lang-native">{lang.native}</span>
              <span className="lang-name">{lang.name}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: selectedLanguage ? 1 : 0 }}
        className="action-bar"
      >
        <button className="primary-btn" onClick={handleComplete}>
          Set Language & Continue <ArrowRight size={18} />
        </button>
      </motion.div>

    </div>
  );
};
