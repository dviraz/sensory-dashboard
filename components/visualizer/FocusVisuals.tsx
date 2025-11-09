'use client';

import { useState, useEffect } from 'react';
import BreathingCircle from './BreathingCircle';
import VisualTimer from './VisualTimer';
import SpectrumAnalyzer from './SpectrumAnalyzer';
import { useAudioStore } from '@/lib/store';

type VisualType = 'breathing' | 'timer' | 'spectrum' | 'none';

export default function FocusVisuals() {
  const [selectedVisual, setSelectedVisual] = useState<VisualType>('breathing');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isPlaying } = useAudioStore();

  // ESC key to close fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const visualOptions = [
    { id: 'breathing' as VisualType, label: 'Breathing Circle', icon: '🫁', description: 'Meditative breathing guide' },
    { id: 'timer' as VisualType, label: 'Visual Timer', icon: '⏱️', description: 'See time progress' },
    { id: 'spectrum' as VisualType, label: 'Spectrum Analyzer', icon: '🎵', description: 'Audio frequencies' },
    { id: 'none' as VisualType, label: 'None', icon: '✖️', description: 'Hide visuals' },
  ];

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const normalSize = 300;
  const fullscreenSize = typeof window !== 'undefined'
    ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8)
    : 600;

  return (
    <>
      {/* Normal View */}
      {!isFullscreen && (
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 backdrop-blur-md shadow-2xl">
            {/* Header with selector */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  Focus Visuals
                </h3>
              </div>

              {selectedVisual !== 'none' && (
                <button
                  onClick={handleFullscreenToggle}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Expand
                </button>
              )}
            </div>

            {/* Visual Type Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {visualOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedVisual(option.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedVisual === option.id
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-xs font-medium">{option.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{option.description}</div>
                </button>
              ))}
            </div>

            {/* Visual Display */}
            <div className="flex items-center justify-center min-h-[320px] bg-black/50 rounded-lg">
              {selectedVisual === 'breathing' && <BreathingCircle enabled={true} size={normalSize} />}
              {selectedVisual === 'timer' && <VisualTimer enabled={true} size={normalSize} />}
              {selectedVisual === 'spectrum' && <SpectrumAnalyzer enabled={isPlaying} />}
              {selectedVisual === 'none' && (
                <div className="text-zinc-500 text-sm">No visualization selected</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm">
          {/* Close Button */}
          <button
            onClick={handleFullscreenToggle}
            className="absolute top-6 right-6 p-3 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 rounded-full transition-colors border border-zinc-700"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Visual Type Switcher */}
          <div className="absolute top-6 left-6 flex gap-2">
            {visualOptions.filter(v => v.id !== 'none').map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedVisual(option.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedVisual === option.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 border border-zinc-700'
                }`}
                title={option.description}
              >
                <span className="text-xl mr-2">{option.icon}</span>
                <span className="text-sm hidden md:inline">{option.label}</span>
              </button>
            ))}
          </div>

          {/* Fullscreen Visual */}
          <div className="flex items-center justify-center">
            {selectedVisual === 'breathing' && <BreathingCircle enabled={true} size={fullscreenSize} breathDuration={8} />}
            {selectedVisual === 'timer' && <VisualTimer enabled={true} size={fullscreenSize} />}
            {selectedVisual === 'spectrum' && (
              <div className="scale-150">
                <SpectrumAnalyzer enabled={isPlaying} barCount={128} barWidth={4} barGap={2} height={200} />
              </div>
            )}
          </div>

          {/* Hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-500 text-sm">
            Press ESC or click close to exit fullscreen
          </div>
        </div>
      )}
    </>
  );
}
