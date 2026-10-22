'use client';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import { preloadFont } from 'troika-three-text';

type Mode = 'inside-logo' | 'tablet';

interface WordmarkTextProps {
  mode: Mode;
  opacity?: number;
}

const INK = '#E6EAF2';
const INK_DIM = '#6E7785';
const FONT_GROTESK       = '/assets/fonts/SpaceGrotesk-Regular.ttf';
const FONT_GROTESK_LIGHT = '/assets/fonts/SpaceGrotesk-Light.ttf';
const FONT_MONO          = '/assets/fonts/SpaceMono-Regular.ttf';

// Warm troika's font cache at module load so <Text> doesn't start fetching
// fonts only after the logo's GLB and textures have resolved.
if (typeof window !== 'undefined') {
  [FONT_GROTESK, FONT_GROTESK_LIGHT, FONT_MONO].forEach((font) =>
    preloadFont({ font }, () => {}),
  );
}

const Z_TEXT = -22;
const DIST = 12 - Z_TEXT; // camera at z=12
const HALF_ANGLE_RAD = (50 / 2) * (Math.PI / 180);

const noTone = { 'material-toneMapped': false } as const;

export default function WordmarkText({ mode, opacity = 0.88 }: WordmarkTextProps) {
  const { size } = useThree();
  const [debouncedSize, setDebouncedSize] = useState(size);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSize(size), 150);
    return () => clearTimeout(t);
  }, [size]);

  const { halfH, halfW } = useMemo(() => {
    const halfH = Math.tan(HALF_ANGLE_RAD) * DIST;
    const halfW = halfH * (debouncedSize.width / Math.max(debouncedSize.height, 1));
    return { halfH, halfW };
  }, [debouncedSize]);

  const mX = halfW * 0.06;
  const mY = halfH * 0.06;
  const L = -halfW + mX;
  const R =  halfW - mX;
  const T =  halfH - mY;
  const B = -halfH + mY;

  const isTablet = mode === 'tablet';
  const s = isTablet ? 0.78 : 1;

  const fsH  = halfH * 0.28 * s;
  const fsSm = halfH * 0.035 * s;
  const fsLd = halfH * 0.037 * s;
  const lh   = fsH * 0.98;

  const eyebrowY     = T - halfH * 0.06;
  const headlineTopY = eyebrowY - halfH * 0.12;
  const ledeY        = headlineTopY - lh * 4 - halfH * 0.05;

  return (
    <group position={[0, -2, Z_TEXT]}>
      {/* Eyebrow — Space Mono */}
      <Text
        {...noTone}
        font={FONT_MONO}
        fontSize={fsSm}
        color={INK_DIM}
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.18}
        fillOpacity={opacity * 0.75}
        position={[L, eyebrowY, 0]}
      >
        A film & design practice
      </Text>

      {/* Headline line 1 — Space Grotesk */}
      <Text
        {...noTone}
        font={FONT_GROTESK}
        fontSize={fsH}
        color={INK}
        anchorX="left"
        anchorY="top"
        letterSpacing={-0.035}
        fillOpacity={opacity}
        position={[L, headlineTopY, 0]}
      >
        Shape
      </Text>

      {/* Headline line 2 — Space Grotesk Light, dimmed */}
      <Text
        {...noTone}
        font={FONT_GROTESK_LIGHT}
        fontSize={fsH}
        color={INK_DIM}
        anchorX="left"
        anchorY="top"
        letterSpacing={-0.03}
        fillOpacity={opacity * 0.72}
        position={[L, headlineTopY - lh, 0]}
      >
        language,
      </Text>

      {/* Headline line 3 — Space Grotesk */}
      <Text
        {...noTone}
        font={FONT_GROTESK}
        fontSize={fsH}
        color={INK}
        anchorX="left"
        anchorY="top"
        letterSpacing={-0.035}
        fillOpacity={opacity}
        position={[L, headlineTopY - lh * 2, 0]}
      >
        shape reality.
      </Text>

      {/* Lede — Space Grotesk Light, desktop only */}
      {!isTablet && (
        <Text
          {...noTone}
          font={FONT_GROTESK_LIGHT}
          fontSize={fsLd}
          color={INK}
          anchorX="left"
          anchorY="top"
          letterSpacing={-0.01}
          lineHeight={1.5}
          fillOpacity={opacity * 0.55}
          maxWidth={halfW * 0.80}
          position={[L, ledeY, 0]}
        >
          {`We make work that is built like film —\ndeliberate, unhurried, composed frame by frame.`}
        </Text>
      )}

      {/* Meta stack — Space Mono, bottom right */}
      {[
        ['Est.', 'MMXXI'],
        ['Discipline:', 'Film · Identity'],
        ['Status:', 'Open for 2026'],
      ].map(([k, v], i) => (
        <Text
          key={k}
          {...noTone}
          font={FONT_MONO}
          fontSize={fsSm}
          color={INK_DIM}
          anchorX="right"
          anchorY="bottom"
          letterSpacing={0.05}
          fillOpacity={opacity * 0.65}
          position={[R, B + fsSm * (7.3 - i) * 2, 0]}
        >
          {`${k}  ${v}`}
        </Text>
      ))}
    </group>
  );
}
