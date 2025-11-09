'use client';

import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/lib/store';

interface VisualTimerProps {
  enabled: boolean;
  size?: number;
}

export default function VisualTimer({
  enabled,
  size = 300,
}: VisualTimerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const { timerDuration, timerRemaining, timerActive, pomodoroEnabled, pomodoroMode } = useAudioStore();

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
    const radius = size * 0.35;
    const lineWidth = size * 0.08;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Calculate progress
      const progress = timerDuration > 0 ? (timerDuration - timerRemaining) / timerDuration : 0;

      // Background circle
      ctx.strokeStyle = 'rgba(63, 63, 70, 0.5)'; // zinc-700
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Progress arc
      const startAngle = -Math.PI / 2; // Start at top
      const endAngle = startAngle + (Math.PI * 2 * progress);

      // Color based on mode
      let progressColor;
      if (pomodoroEnabled) {
        progressColor = pomodoroMode === 'work'
          ? 'rgba(168, 85, 247, 0.9)' // purple for work
          : 'rgba(251, 146, 60, 0.9)'; // orange for break
      } else {
        progressColor = 'rgba(59, 130, 246, 0.9)'; // blue
      }

      // Draw progress arc
      ctx.strokeStyle = progressColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.stroke();

      // Draw glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = progressColor;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Display time remaining in center
      const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = `bold ${size * 0.12}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatTime(timerRemaining), centerX, centerY);

      // Mode label
      if (pomodoroEnabled) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `${size * 0.05}px sans-serif`;
        ctx.fillText(
          pomodoroMode === 'work' ? '🍅 WORK' : '☕ BREAK',
          centerX,
          centerY + size * 0.12
        );
      }

      // Pulse effect when active
      if (timerActive) {
        const pulseScale = 1 + Math.sin(Date.now() / 500) * 0.02;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(pulseScale, pulseScale);
        ctx.translate(-centerX, -centerY);
        ctx.restore();
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, size, timerDuration, timerRemaining, timerActive, pomodoroEnabled, pomodoroMode]);

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
