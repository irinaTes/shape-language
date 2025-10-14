'use client'

import { FC, useEffect, useRef } from "react";

// Vector class for 2D vector operations
class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(vector: Vector): Vector {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  sub(vector: Vector): Vector {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  addTo(vector: Vector): void {
    this.x += vector.x;
    this.y += vector.y;
  }

  getLength(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  setLength(length: number): void {
    const currentLength = this.getLength();
    if (currentLength > 0) {
      this.x = (this.x / currentLength) * length;
      this.y = (this.y / currentLength) * length;
    }
  }
}

const config = {
  texts: ["SHAPE", "LANGUAGE"],
  smallScreenTexts: ["SH", "APE", "LAN", "GUA", "GE"],
  widthToSpikeLengthRatio: 0.054
};

const colorConfig = {
  particleOpacity: 0.2,
  baseHue: 350,
  hueRange: 9,
  hueSpeed: 0.04,
  colorSaturation: 100,
};

class Planet {
  pos: Vector;
  vel: Vector;
  g: number;
  maxSpeed: number;

  constructor(x: number, y: number, g: number) {
    this.pos = new Vector(x, y);
    this.vel = new Vector((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    this.g = g;
    this.maxSpeed = 8;
  }

  update(w: number, h: number) {
    // Check if mobile screen
    const isMobile = w < 640;
    const speedMultiplier = isMobile ? 0.3 : 1;

    // Add random force (slower on mobile)
    const randomForce = new Vector(
      (Math.random() - 0.5) * 1.2 * speedMultiplier,
      (Math.random() - 0.5) * 1.2 * speedMultiplier
    );
    this.vel.addTo(randomForce);

    // Limit speed (slower on mobile)
    const currentMaxSpeed = this.maxSpeed * speedMultiplier;
    if (this.vel.getLength() > currentMaxSpeed) {
      this.vel.setLength(currentMaxSpeed);
    }

    // Update position
    this.pos.addTo(this.vel);

    // Bounce off edges
    if (this.pos.x < 50 || this.pos.x > w - 50) {
      this.vel.x *= -0.8;
      this.pos.x = Math.max(50, Math.min(w - 50, this.pos.x));
    }
    if (this.pos.y < 50 || this.pos.y > h - 50) {
      this.vel.y *= -0.8;
      this.pos.y = Math.max(50, Math.min(h - 50, this.pos.y));
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#AAA";
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Particle {
  pos: Vector;
  vel: Vector;

  constructor(x: number, y: number, spikeLength: number) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, spikeLength);
  }

  move(force: Vector | null, spikeLength: number) {
    if(force) {
      this.vel.addTo(force);
    }
    if(this.vel.getLength() > spikeLength) {
      this.vel.setLength(spikeLength);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y);
    let p2 = this.pos.add(this.vel);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
}

interface VectoryAnimationProps {
  className?: string;
}

const VectoryAnimation: FC<VectoryAnimationProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(null);
  const particlesRef = useRef<Particle[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const hueRef = useRef(colorConfig.baseHue);
  const tickRef = useRef(0);
  const spikeLengthRef = useRef(0);
  const dimensionsRef = useRef({ w: 0, h: 0, A: 0, B: 0, a: 0, b: 0 });

  const setup = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    tickRef.current = 0;
    planetsRef.current = [];

    const len = Math.round(Math.random() * 3 + 3);
    for(let i = 0; i < len; i++) {
      let p = new Planet(50 + i * 100, 340, i ? 1000 : 4000);
      planetsRef.current.push(p);
    }

    reset();
  };

  const reset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    hueRef.current = colorConfig.baseHue;

    // Get the actual container size instead of window size
    const containerWidth = canvas.offsetWidth || window.innerWidth;
    const containerHeight = Math.min(window.innerHeight * 0.6, 600); // Max height of 600px

    const w = canvas.width = containerWidth;
    const h = canvas.height = containerHeight;
    spikeLengthRef.current = w * config.widthToSpikeLengthRatio;

    dimensionsRef.current = {
      w,
      h,
      A: w / 2.2,
      B: h / 2.2,
      a: Math.round(Math.random() + 2),
      b: Math.round(Math.random() + 2)
    };

    drawText();
  };

  const drawText = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = dimensionsRef.current;

    ctx.save();
    // Determine if we should use small screen layout
    const isSmallScreen = w < 640; // Mobile breakpoint (more specifically mobile)
    const textsToUse = isSmallScreen ? config.smallScreenTexts : config.texts;

    // Responsive font size calculation
    const baseFontSize = Math.min(w * (isSmallScreen ? 0.7 : 0.135), w / 3);
    let defaultFontSize = Math.max(baseFontSize, isSmallScreen ? 128 : 24);

    ctx.textAlign = "left";
    ctx.textBaseline = "middle"
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";

    // Calculate layout with default font size
    const lineHeight = defaultFontSize * (isSmallScreen ? 0.8 : 1.1);
    const totalHeight = lineHeight * (textsToUse.length - 1);
    const topPadding = h * 0.02; // Add 10% of height as top padding
    const startY = (h/2 - totalHeight/2) + topPadding;
    const leftMargin = Math.max(20, w * 0.05);

    textsToUse.forEach((text, index) => {
      const yPos = startY + (index * lineHeight);
      const isShapeWord = text === "SHAPE" || (isSmallScreen && ["SH", "APE"].includes(text));

      // Set font size - bigger for SHAPE word
      const fontSize = isShapeWord ? defaultFontSize * 1.2 : defaultFontSize;
      ctx.font = "bold " + fontSize + "px Arial, Helvetica, sans-serif";

      if (isSmallScreen) {
        // On mobile: center text with letter spacing
        const letters = text.split('');
        const letterSpacing = fontSize * (isShapeWord ? 0.15 : 0.1); // Increased letter spacing only for SHAPE
        const totalTextWidth = letters.reduce((width, letter) => width + ctx.measureText(letter).width, 0) + (letterSpacing * (letters.length - 1));

        let currentX = (w - totalTextWidth) / 2;
        letters.forEach((letter) => {
          ctx.strokeText(letter, currentX, yPos);
          currentX += ctx.measureText(letter).width + letterSpacing;
        });
      } else {
        // On larger screens: stretch text across width with letter spacing
        const availableWidth = w - (leftMargin * 2);
        const letters = text.split('');
        const letterWidth = ctx.measureText('M').width;
        const totalLettersWidth = letters.length * letterWidth;
        const baseLetterSpacing = letters.length > 1 ? (availableWidth - totalLettersWidth) / (letters.length - 1) : 0;
        const letterSpacing = Math.max(baseLetterSpacing, fontSize * (isShapeWord ? 0.2 : 0.05)); // Increased spacing only for SHAPE

        let currentX = leftMargin;
        letters.forEach((letter) => {
          ctx.strokeText(letter, currentX, yPos);
          currentX += letterWidth + letterSpacing;
        });
      }
    });

    ctx.restore();

    let imageData = ctx.getImageData(0, 0, w, h);
    particlesRef.current = [];

    for(let x = 0; x < w; x++) {
      for(let y = 0; y < h; y++) {
        let i = (x + w*y)*4;
        let average = (imageData.data[i] +
                       imageData.data[i + 1] +
                       imageData.data[i + 2] +
                       imageData.data[i + 3]) / 4;
        if(average > 200) {
          let particle = new Particle(x, y, spikeLengthRef.current);
          particlesRef.current.push(particle);
        }
      }
    }
    clear();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = dimensionsRef.current;
    ctx.clearRect(0, 0, w, h);
  };

  const updatePlanets = (ctx: CanvasRenderingContext2D) => {
    const planets = planetsRef.current;
    const { w, h } = dimensionsRef.current;

    for(let i = 1; i < planets.length; i++) {
      let p = planets[i];
      p.update(w, h);
      p.draw(ctx);
    }
  };

  const updateParticles = (ctx: CanvasRenderingContext2D) => {
    hueRef.current += colorConfig.hueSpeed;
    let h = Math.sin(hueRef.current) * colorConfig.hueRange + colorConfig.baseHue;
    ctx.strokeStyle = `hsla(${h}, ${colorConfig.colorSaturation}%, 50%, ${colorConfig.particleOpacity})`;

    particlesRef.current.forEach(p => {
      planetsRef.current.forEach(planet => {
        let d = p.pos.sub(planet.pos);
        let length = d.getLength();
        let g = planet.g / length;
        if(g > 40) {
          g = 40;
        }
        d.setLength(g);
        p.move(d, spikeLengthRef.current);
      });
      p.draw(ctx);
    });
  };

  const draw = (now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    clear();
    updateParticles(ctx);
    updatePlanets(ctx);
    tickRef.current = now / 50;

    animationIdRef.current = requestAnimationFrame(draw);
  };

  const handleMouseMove = (event: MouseEvent) => {
    const planets = planetsRef.current;
    if (planets.length > 0) {
      planets[0].pos.x = event.clientX;
      planets[0].pos.y = event.clientY;
    }
  };

  const handleResize = () => {
    reset();
  };

  useEffect(() => {
    setup();

    const canvas = canvasRef.current;
    if (!canvas) return;

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);

    animationIdRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas?.removeEventListener("mousemove", handleMouseMove);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        cursor: 'crosshair',
        width: '100%'
      }}
    />
  );
};

export default VectoryAnimation;