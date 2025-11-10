import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './CornerPop.css';

type CornerPopProps = {
  /** Path to the image, e.g. "/images/corner-fish.png" (from public/) */
  imgSrc: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Width in pixels; height auto */
  size?: number;
  /** Optional: add a slight drop shadow */
  shadow?: boolean;
};

const CornerPop: React.FC<CornerPopProps> = ({
  imgSrc,
  alt = 'Page mascot',
  size = 120,
  shadow = true,
}) => {
  const location = useLocation();
  // Changing the key forces a remount, which retriggers the CSS animation cleanly
  const [popKey, setPopKey] = useState(0);

  useEffect(() => {
    setPopKey(k => k + 1);
  }, [location.pathname]);

  return (
    <div className={`corner-pop ${shadow ? 'corner-pop--shadow' : ''}`}>
      <img
        key={popKey}
        src={imgSrc}
        alt={alt}
        width={size}
        height={size}
        className="corner-pop__img corner-pop__img--animate"
        draggable={false}
      />
    </div>
  );
};

export default CornerPop;
