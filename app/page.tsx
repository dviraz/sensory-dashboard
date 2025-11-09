'use client';

import { useState } from 'react';
import Visualizer from '@/components/visualizer/Visualizer';
import AudioMixer from '@/components/audio/AudioMixer';
import PresetManager from '@/components/PresetManager';
import Timer from '@/components/Timer';
import PreferenceWizard from '@/components/PreferenceWizard';
import { useAudioStore } from '@/lib/store';

export default function Home() {
  const [hideControls, setHideControls] = useState(false);
  const { visualizerEnabled, visualizerOpacity, toggleVisualizer, setVisualizerOpacity } = useAudioStore();

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Preference Wizard */}
      <PreferenceWizard />

      {/* Background Visualizer */}
      <Visualizer />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 text-center">
          <h1 className="text-5xl font-bold text-zinc-100 mb-2 drop-shadow-lg">
            Sensory Dashboard
          </h1>
          <p className="text-zinc-400 drop-shadow">
            Create your perfect focus environment
          </p>
        </header>

        {/* Controls Container */}
        <div className={`flex-1 flex flex-col items-center justify-start p-6 pt-2 transition-opacity duration-500 ${hideControls ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="w-full space-y-6 max-w-5xl">
            {/* Preset Manager */}
            <PresetManager />

            {/* Timer */}
            <Timer />

            {/* Audio Mixer */}
            <AudioMixer />

            {/* Visualizer Controls */}
            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visualizerEnabled}
                        onChange={toggleVisualizer}
                        className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-blue-500 focus:ring-blue-500/50 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-zinc-400">Enable Visualizer</span>
                    </label>

                    <div className="flex items-center gap-3 flex-1">
                      <label className="text-sm text-zinc-500 whitespace-nowrap">Opacity</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={visualizerOpacity}
                        onChange={(e) => setVisualizerOpacity(Number(e.target.value))}
                        disabled={!visualizerEnabled}
                        className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-4
                          [&::-webkit-slider-thumb]:h-4
                          [&::-webkit-slider-thumb]:bg-purple-500
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:cursor-pointer
                          [&::-moz-range-thumb]:w-4
                          [&::-moz-range-thumb]:h-4
                          [&::-moz-range-thumb]:bg-purple-500
                          [&::-moz-range-thumb]:border-0
                          [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:cursor-pointer"
                      />
                      <span className="text-sm text-zinc-500 font-mono w-12 text-right">
                        {visualizerOpacity}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hide Controls Toggle */}
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={() => setHideControls(!hideControls)}
            className="bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg backdrop-blur-sm shadow-lg transition-all flex items-center gap-2"
            title={hideControls ? 'Show Controls' : 'Hide Controls'}
          >
            {hideControls ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Show
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                Hide
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <footer className="p-4 text-center">
          <p className="text-xs text-zinc-600">
            Press Space to play/pause • Adjust layers to create your perfect soundscape
          </p>
        </footer>
      </div>
    </main>
  );
}
