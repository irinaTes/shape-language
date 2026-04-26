'use client'
import { FC, useEffect, useState } from "react";

const SHAPES = ['square', 'circle', 'triangle', 'square', 'circle', 'triangle'] as const;
type Shape = 'square' | 'circle' | 'triangle';


const glow = 'drop-shadow(0 0 10px rgba(0,245,255,0.8)) drop-shadow(0 0 30px rgba(0,245,255,0.4))';
const boxGlow = '0 0 10px rgba(0,245,255,0.8), 0 0 40px rgba(0,245,255,0.3)';

const ShapeDisplay: FC<{ shape: Shape }> = ({ shape }) => {
  if (shape === 'square') {
    return <div style={{ width: 70, height: 70, backgroundColor: 'white', boxShadow: boxGlow }} />;
  }
  if (shape === 'circle') {
    return <div style={{ width: 70, height: 70, backgroundColor: 'white', borderRadius: '50%', boxShadow: boxGlow }} />;
  }
  if (shape === 'triangle') {
    return (
      <svg width="70" height="70" viewBox="0 0 100 100" style={{ filter: glow }}>
        <polygon points="50,0 100,100 0,100" fill="white" />
      </svg>
    );
  }
  return (
    <svg width="70" height="70" viewBox="0 0 100 100" style={{ filter: glow }}>
      <polygon points="50,0 100,100 0,100" fill="white" />
    </svg>
  );
};

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen: FC<LoadingScreenProps> = ({ isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHAPES.length);
    }, 200);
    return () => clearInterval(interval);
  }, [isLoading]);

  const currentShape = SHAPES[currentIndex];

  return (
    <>
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="flicker">
            <ShapeDisplay shape={currentShape} />
          </div>
        </div>
      )}
    </>
  );
};

export default LoadingScreen;
