'use client';

import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/lib/store';

interface BreathingCircleProps {
  enabled: boolean;
  size?: number;
  breathDuration?: number; // seconds for one breath cycle
}

export default function BreathingCircle({
  enabled,
  size = 300,
  breathDuration = 8, // 4 seconds in, 4 seconds out
}: BreathingCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const { isPlaying } = useAudioStore();

  useEffect(() => {
    if (!enabled) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const minRadius = size * 0.15;
    const maxRadius = size * 0.4;

    const startTime = Date.now();

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000; // in seconds

      // Calculate breath cycle (0 to 1)
      const cycle = (elapsed % breathDuration) / breathDuration;

      // Smooth easing: expand in first half, contract in second half
      let scale;
      let phase;
      if (cycle < 0.5) {
        // Inhale (0 to 0.5)
        phase = 'inhale';
        scale = easeInOut(cycle * 2); // 0 to 1
      } else {
        // Exhale (0.5 to 1)
        phase = 'exhale';
        scale = 1 - easeInOut((cycle - 0.5) * 2); // 1 to 0
      }

      const radius = minRadius + (maxRadius - minRadius) * scale;

      // Clear canvas with slight fade for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, size, size);

      // Draw outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.5);

      if (phase === 'inhale') {
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)'); // blue
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)'); // purple
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw main circle
      const mainGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      if (phase === 'inhale') {
        mainGradient.addColorStop(0, 'rgba(96, 165, 250, 0.9)'); // lighter blue
        mainGradient.addColorStop(1, 'rgba(59, 130, 246, 0.7)'); // blue
      } else {
        mainGradient.addColorStop(0, 'rgba(167, 139, 250, 0.9)'); // lighter purple
        mainGradient.addColorStop(1, 'rgba(139, 92, 246, 0.7)'); // purple
      }

      ctx.fillStyle = mainGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw text instruction
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = `${size * 0.08}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(phase === 'inhale' ? 'Breathe In' : 'Breathe Out', centerX, centerY);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, size, breathDuration, isPlaying]);

  // Easing function for smooth breathing
  const easeInOut = (t: number): number => {
    return t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
  };

  if (!enabled) return null;

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="rounded-lg"
      />
    </div>
  );
}
