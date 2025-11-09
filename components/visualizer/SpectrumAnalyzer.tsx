'use client';

import { useEffect, useRef } from 'react';
import { getAudioEngine } from '@/lib/audio-engine';

interface SpectrumAnalyzerProps {
  enabled: boolean;
  barCount?: number;
  barWidth?: number;
  barGap?: number;
  height?: number;
}

export default function SpectrumAnalyzer({
  enabled,
  barCount = 64,
  barWidth = 3,
  barGap = 1,
  height = 120,
}: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const audioEngine = getAudioEngine();

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

    const analyser = audioEngine.getAnalyser();
    if (!analyser) return;

    // Calculate canvas dimensions
    const width = (barWidth + barGap) * barCount - barGap;
    canvas.width = width;
    canvas.height = height;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, width, height);

      // Draw bars
      const step = Math.floor(dataArray.length / barCount);

      for (let i = 0; i < barCount; i++) {
        // Get average for this bar's frequency range
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        const average = sum / step;

        // Calculate bar height (0-255 -> 0-height)
        const barHeight = (average / 255) * height;
        const x = i * (barWidth + barGap);
        const y = height - barHeight;

        // Create gradient from green to red (classic Winamp style)
        const gradient = ctx.createLinearGradient(0, height, 0, 0);

        if (barHeight < height * 0.33) {
          // Low - green
          gradient.addColorStop(0, '#00ff00');
          gradient.addColorStop(1, '#00ff00');
        } else if (barHeight < height * 0.66) {
          // Medium - yellow
          gradient.addColorStop(0, '#00ff00');
          gradient.addColorStop(1, '#ffff00');
        } else {
          // High - red
          gradient.addColorStop(0, '#ffff00');
          gradient.addColorStop(1, '#ff0000');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Add peak indicator (classic Winamp feature)
        if (barHeight > 5) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y - 2, barWidth, 2);
        }
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, audioEngine, barCount, barWidth, barGap, height]);

  if (!enabled) return null;

  return (
    <div className="flex items-center justify-center p-4 bg-black/80 rounded-lg border border-zinc-700">
      <canvas
        ref={canvasRef}
        className="rounded"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
