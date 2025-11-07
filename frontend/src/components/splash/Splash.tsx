import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';
import fishingImage from '../../assets/fishing-splash.jpg';  // ADD THIS

const Splash: React.FC = () => {
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000);
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
          src={fishingImage}  // CHANGE THIS
          alt="Fishing" 
          className="splash-image"
        />
        <div className="splash-overlay"></div>
      </div>
      
      {showButton && !isExiting && (
        <button 
          className="enter-button"
          onClick={handleEnter}
        >
          Enter
        </button>
      )}
    </div>
  );
};

export default Splash;