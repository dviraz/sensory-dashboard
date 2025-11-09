'use client';

import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/lib/store';
import { getAudioEngine } from '@/lib/audio-engine';

export default function Timer() {
  const {
    timerDuration,
    timerRemaining,
    timerActive,
    setTimerDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    tickTimer,
  } = useAudioStore();

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const audioEngine = getAudioEngine();

  // Timer countdown effect
  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerActive, tickTimer]);

  // Auto-fade when timer completes
  useEffect(() => {
    if (timerRemaining === 0 && timerActive) {
      pauseTimer();
      audioEngine.fadeOut(10000); // 10 second fade

      // Optional: Show notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Focus Timer Complete', {
            body: 'Time for a break!',
            icon: '/icon.png',
          });
        }
      }
    }
  }, [timerRemaining, timerActive, audioEngine, pauseTimer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const presetDurations = [
    { label: '15 min', seconds: 15 * 60 },
    { label: '25 min', seconds: 25 * 60 },
    { label: '45 min', seconds: 45 * 60 },
    { label: '60 min', seconds: 60 * 60 },
  ];

  const handleSetDuration = (seconds: number) => {
    setTimerDuration(seconds);
    pauseTimer();
  };

  const progress = timerDuration > 0 ? ((timerDuration - timerRemaining) / timerDuration) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Timer Display */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Focus Timer
            </h3>

            <div className="text-6xl font-bold text-zinc-100 font-mono mb-2">
              {formatTime(timerRemaining)}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            {timerRemaining === 0 && !timerActive && timerDuration > 0 && (
              <p className="text-sm text-green-400 mt-2">Session complete!</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3">
            {/* Start/Pause/Reset Buttons */}
            <div className="flex gap-2">
              {!timerActive ? (
                <button
                  onClick={startTimer}
                  disabled={timerRemaining === 0}
                  className="px-6 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pause
                </button>
              )}

              <button
                onClick={resetTimer}
                className="px-6 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>

            {/* Duration Presets */}
            <div className="grid grid-cols-4 gap-2">
              {presetDurations.map((preset) => (
                <button
                  key={preset.seconds}
                  onClick={() => handleSetDuration(preset.seconds)}
                  disabled={timerActive}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    timerDuration === preset.seconds && !timerActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
