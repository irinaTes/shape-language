'use client'
import { FC, useEffect, useState } from "react";

const SHAPES = ['square', 'circle', 'triangle', 'square', 'circle', 'triangle', 'logo'] as const;
type Shape = 'square' | 'circle' | 'triangle' | 'logo';

const LogoSVG = () => (
  <svg viewBox="0 0 341.78 271.58" width="200" height="200" fill="white">
    <rect x="200.47" y="63.21" width="9.37" height="48.3" rx="4.68" ry="4.68"/>
    <path d="M280.21,64.44c-2.59,0-4.68,2.1-4.68,4.7v38.91c0,2.59,2.1,4.7,4.68,4.7s4.68-2.1,4.68-4.7v-38.91c0-2.59-2.1-4.7-4.68-4.7Z"/>
    <path d="M287.43,212.93c-2.6.02-4.73-2.1-4.73-4.7v-17.23c0-2.57,2.07-4.97,4.63-4.99h29.21c2.57-.03,4.64-2.12,4.65-4.69,0-2.59-2.11-4.69-4.7-4.69h-29.19c-2.59,0-4.68-2.1-4.68-4.68v-18.17c0-2.59,2.1-4.68,4.68-4.68h14.02c10.95,0,19.84-8.88,19.85-19.83l.07-82.87c0-10.41-8.43-18.85-18.84-18.85h-162.94c-2.59,0-4.7-2.1-4.7-4.7v-5.38h0v-4.26h0v-.52h-.05c-.26-2.34-2.22-4.16-4.63-4.16s-4.37,1.82-4.63,4.16h-.05v10.11c0,2.59-2.1,4.7-4.7,4.7h-27.53c-2.59,0-4.68,2.1-4.68,4.68v87.29c0,5.5,4.46,9.96,9.96,9.96h11.17c12.2,0,17.43,5.69,17.43,18.14v47.22c0,12.24-5.45,17.7-17.43,17.7h-28.43c-12.21,0-22.11-9.93-22.11-22.18v-17.27c0-2.59,2.1-4.7,4.7-4.7h20.03c2.59,0,4.68,2.1,4.68,4.68v5.28c0,2.59,2.1,4.68,4.68,4.68h0c2.59,0,4.68-2.1,4.68-4.68v-14.68c0-2.59-2.1-4.68-4.68-4.68h-11.99c-12.21,0-22.11-9.93-22.11-22.18V16.15h0V0h-8.51C22.64,0,0,20.78,0,46.42v178.74c0,25.64,22.64,46.42,50.57,46.42h240.98c25.99,0,47.4-18.02,50.24-58.98l-54.36.33ZM163.96,207.8c0,2.59-2.1,4.7-4.68,4.7h-19.83c-2.59,0-4.68-2.1-4.68-4.7v-101c0-2.59-2.1-4.7-4.68-4.7s-4.68,2.1-4.68,4.7v10.9c0,2.59-2.1,4.7-4.68,4.7h-20.05c-2.59,0-4.68-2.1-4.68-4.7V38.4c0-2.59,2.1-4.7,4.68-4.7h20.05c2.59,0,4.68,2.1,4.68,4.7v29.51c0,2.59,2.1,4.7,4.68,4.7s4.68-2.1,4.68-4.7v-29.51c0-2.59,2.1-4.7,4.68-4.7h19.83c2.59,0,4.68,2.1,4.68,4.7v169.41ZM239.03,207.8c0,2.59-2.1,4.7-4.68,4.7h-19.83c-2.59,0-4.68-2.1-4.68-4.7v-62.31c0-2.59-2.1-4.7-4.68-4.7h0c-2.59,0-4.68,2.1-4.68,4.7v62.31c0,2.59-2.1,4.7-4.68,4.7h-20.05c-2.59,0-4.68-2.1-4.68-4.7V52.28c0-12.9,5.23-18.58,17.43-18.58h33.11c12.2,0,17.43,5.68,17.43,18.8v155.3ZM275.53,146.73v61.08c0,2.59-2.1,4.7-4.68,4.7h-20.05c-2.59,0-4.68-2.1-4.68-4.7V39.63c0-2.59,2.1-4.7,4.68-4.7h45.86c12.2,0,17.43,5.68,17.43,18.14v71.25c0,12.24-5.45,17.7-17.43,17.7h-16.45c-2.59,0-4.68,2.1-4.68,4.7Z"/>
  </svg>
);

const glow = 'drop-shadow(0 0 10px rgba(255,255,255,0.6)) drop-shadow(0 0 30px rgba(255,255,255,0.2))';
const boxGlow = '0 0 10px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.2)';

const ShapeDisplay: FC<{ shape: Shape }> = ({ shape }) => {
  if (shape === 'square') {
    return <div style={{ width: 200, height: 200, backgroundColor: 'white', boxShadow: boxGlow }} />;
  }
  if (shape === 'circle') {
    return <div style={{ width: 200, height: 200, backgroundColor: 'white', borderRadius: '50%', boxShadow: boxGlow }} />;
  }
  if (shape === 'triangle') {
    return (
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ filter: glow }}>
        <polygon points="100,10 190,190 10,190" fill="white" />
      </svg>
    );
  }
  return <div style={{ filter: glow }}><LogoSVG /></div>;
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
          <ShapeDisplay shape={currentShape} />
        </div>
      )}
    </>
  );
};

export default LoadingScreen;
