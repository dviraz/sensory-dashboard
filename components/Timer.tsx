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
    pomodoroEnabled,
    pomodoroMode,
    workDuration,
    breakDuration,
    completedPomodoros,
    togglePomodoro,
    setWorkDuration,
    setBreakDuration,
  } = useAudioStore();

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const audioEngine = getAudioEngine();

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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

      // Show notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        if (pomodoroEnabled) {
          if (pomodoroMode === 'work') {
            new Notification('🍅 Work Session Complete!', {
              body: 'Great job! Time for a break.',
              icon: '/icon.png',
            });
          } else {
            new Notification('☕ Break Complete!', {
              body: 'Ready to focus again?',
              icon: '/icon.png',
            });
          }
        } else {
          new Notification('⏰ Focus Timer Complete', {
            body: 'Session finished!',
            icon: '/icon.png',
          });
        }
      }
    }
  }, [timerRemaining, timerActive, audioEngine, pauseTimer, pomodoroEnabled, pomodoroMode]);

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
        {/* Pomodoro Toggle and Info */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Focus Timer
            </h3>
            {pomodoroEnabled && (
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  pomodoroMode === 'work'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                }`}>
                  {pomodoroMode === 'work' ? '🍅 Work' : '☕ Break'}
                </div>
                <div className="text-xs text-zinc-500">
                  {completedPomodoros} completed
                </div>
              </div>
            )}
          </div>

          <button
            onClick={togglePomodoro}
            disabled={timerActive}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              pomodoroEnabled
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pomodoroEnabled ? 'Pomodoro ON' : 'Pomodoro OFF'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Timer Display */}
          <div className="flex-1 text-center md:text-left">
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

            {/* Duration Presets or Pomodoro Settings */}
            {pomodoroEnabled ? (
              <div className="space-y-3">
                <div className="text-xs text-zinc-400 uppercase tracking-wider">Pomodoro Settings</div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Work Duration */}
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Work (min)</label>
                    <select
                      value={workDuration / 60}
                      onChange={(e) => setWorkDuration(parseInt(e.target.value) * 60)}
                      disabled={timerActive}
                      className="w-full bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="15">15 min</option>
                      <option value="20">20 min</option>
                      <option value="25">25 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="50">50 min</option>
                    </select>
                  </div>
                  {/* Break Duration */}
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Break (min)</label>
                    <select
                      value={breakDuration / 60}
                      onChange={(e) => setBreakDuration(parseInt(e.target.value) * 60)}
                      disabled={timerActive}
                      className="w-full bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="3">3 min</option>
                      <option value="5">5 min</option>
                      <option value="10">10 min</option>
                      <option value="15">15 min</option>
                      <option value="20">20 min</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
