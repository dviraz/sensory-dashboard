'use client';

import { useState, useEffect } from 'react';
import { useAudioStore, Preset } from '@/lib/store';
import { getPresets, savePreset, deletePreset, DEFAULT_PRESETS } from '@/lib/presets';

const WIZARD_STORAGE_KEY = 'sensory-dashboard-wizard-completed';

export default function PresetManager() {
  const { loadPreset, getCurrentState } = useAudioStore();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // Load presets on mount
  useEffect(() => {
    setPresets(getPresets());
  }, []);

  const handleLoadPreset = (preset: Preset) => {
    loadPreset(preset);
    setIsOpen(false);
  };

  const handleSaveNewPreset = () => {
    if (!newPresetName.trim()) return;

    try {
      const currentState = getCurrentState();
      savePreset({
        name: newPresetName.trim(),
        channel1: currentState.channel1,
        channel2: currentState.channel2,
        channel3: currentState.channel3,
        visualizerEnabled: currentState.visualizerEnabled,
        visualizerOpacity: currentState.visualizerOpacity,
      });

      setPresets(getPresets());
      setNewPresetName('');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Failed to save preset:', error);
      alert('Failed to save preset');
    }
  };

  const handleDeletePreset = (id: string) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      try {
        deletePreset(id);
        setPresets(getPresets());
      } catch (error) {
        console.error('Failed to delete preset:', error);
        alert('Cannot delete default presets');
      }
    }
  };

  const isDefaultPreset = (id: string) => {
    return DEFAULT_PRESETS.some((p) => p.id === id);
  };

  const handleRetakeWizard = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WIZARD_STORAGE_KEY);
      // Reload page to show wizard
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          {/* Preset Selector */}
          <div className="flex-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-left text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Load Preset
              </span>
              <svg className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute z-10 mt-2 w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-3 hover:bg-zinc-800 border-b border-zinc-800 last:border-b-0"
                    >
                      <button
                        onClick={() => handleLoadPreset(preset)}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium text-zinc-200">{preset.name}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {preset.channel1.sound} • {preset.channel2.sound} • {preset.channel3.sound}
                        </div>
                      </button>

                      {!isDefaultPreset(preset.id) && (
                        <button
                          onClick={() => handleDeletePreset(preset.id)}
                          className="ml-2 p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          aria-label="Delete preset"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleRetakeWizard}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              title="Find your perfect sound"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span className="hidden md:inline">Find My Sound</span>
            </button>

            <button
              onClick={() => setShowSaveDialog(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span className="hidden md:inline">Save Preset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Save Current Settings</h3>

            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Enter preset name..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveNewPreset();
                } else if (e.key === 'Escape') {
                  setShowSaveDialog(false);
                  setNewPresetName('');
                }
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewPresetName('');
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewPreset}
                disabled={!newPresetName.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
