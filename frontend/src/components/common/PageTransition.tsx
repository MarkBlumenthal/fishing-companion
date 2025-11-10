import React, { useState, useEffect } from 'react';
import './PageTransition.css';

const PageTransition: React.FC = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
    
    // Hide after animation completes (4 seconds now)
    const timer = setTimeout(() => {
      setShow(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="page-transition-animation">
      {/* Lure */}
      <div className="lure">
        <div className="lure-line"></div>
        <div className="lure-body"></div>
        <div className="lure-hook"></div>
      </div>
      
      {/* Fish */}
      <div className="fish">
        <div className="fish-body">
          <div className="fish-eye"></div>
          <div className="fish-mouth"></div>
          <div className="fish-fin"></div>
        </div>
        <div className="fish-tail"></div>
      </div>
      
      {/* Bubbles */}
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
    </div>
  );
};

export default PageTransition;