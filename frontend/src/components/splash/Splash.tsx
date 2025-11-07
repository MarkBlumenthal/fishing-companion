import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';
import fishingImage from '../../assets/fishing-splash.jpg';

const Splash: React.FC = () => {
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className={`splash-screen ${isExiting ? 'exiting' : ''}`}>
      <div className="splash-image-container">
        <img 
          src={fishingImage}
          alt="Fishing" 
          className="splash-image"
        />
        <div className="splash-overlay"></div>
      </div>
      
      {showButton && !isExiting && (
        <div className="splash-content">
          <h1 className="splash-title">Fishing Companion</h1>
          <button 
            className="enter-button"
            onClick={handleEnter}
          >
            Enter
          </button>
        </div>
      )}
    </div>
  );
};

export default Splash;