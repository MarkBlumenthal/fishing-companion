import React, { useMemo } from 'react';
import './BubbleBackground.css';

type Props = {
  /** How many bubbles to render */
  count?: number;
  /** Min / max bubble size in px */
  minSize?: number;
  maxSize?: number;
};

const BubbleBackground: React.FC<Props> = ({ count = 24, minSize = 8, maxSize = 38 }) => {
  const bubbles = useMemo(() => {
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.round(rand(minSize, maxSize));
      const left = Math.round(rand(0, 100));           // percentage across screen
      const delay = rand(0, 6);                        // staggered starts
      const duration = rand(8, 20);                    // seconds to rise
      const drift = rand(-20, 20);                     // horizontal drift in px
      const opacity = rand(0.25, 0.65);
      return { id: i, size, left, delay, duration, drift, opacity };
    });
  }, [count, minSize, maxSize]);

  return (
    <div className="bubble-bg" aria-hidden="true">
      {bubbles.map(b => (
        <span
          key={b.id}
          className="bubble"
          style={
            {
              // CSS variables exposed to the stylesheet
              ['--size' as any]: `${b.size}px`,
              ['--left' as any]: `${b.left}%`,
              ['--delay' as any]: `${b.delay}s`,
              ['--duration' as any]: `${b.duration}s`,
              ['--drift' as any]: `${b.drift}px`,
              ['--opacity' as any]: b.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default BubbleBackground;
