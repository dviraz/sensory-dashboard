'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudioStore } from '@/lib/store';
import { getAudioEngine } from '@/lib/audio-engine';
import { DEFAULT_PRESETS, getPreset } from '@/lib/presets';

const WIZARD_STORAGE_KEY = 'sensory-dashboard-wizard-completed';
const TEST_DURATION = 25; // seconds to test each preset

type WizardStep = 'welcome' | 'testing' | 'results';
type PresetRating = 'like' | 'dislike' | 'skip';

interface PresetTestResult {
  presetId: string;
  rating: PresetRating;
}

export default function PreferenceWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION);
  const [testResults, setTestResults] = useState<PresetTestResult[]>([]);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const { loadPreset, play, pause, setWizardCompleted, setPreferredPreset } = useAudioStore();
  const audioEngine = getAudioEngine();
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Check if wizard should be shown on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(WIZARD_STORAGE_KEY);
      if (!completed) {
        setIsOpen(true);
      }
    }
  }, []);

  const initializeAudio = async () => {
    if (!audioInitialized) {
      try {
        await audioEngine.initialize();
        setAudioInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    }
  };

  const handleStart = async () => {
    await initializeAudio();
    setCurrentStep('testing');
    setCurrentPresetIndex(0);
    setTestResults([]);
  };

  const recordRating = (rating: PresetRating) => {
    const preset = DEFAULT_PRESETS[currentPresetIndex];
    setTestResults([...testResults, { presetId: preset.id, rating }]);
  };

  const handleLike = () => {
    recordRating('like');
    advanceToNext();
  };

  const handleDislike = () => {
    recordRating('dislike');
    advanceToNext();
  };

  const advanceToNext = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    audioEngine.stopAll();

    if (currentPresetIndex < DEFAULT_PRESETS.length - 1) {
      setCurrentPresetIndex(currentPresetIndex + 1);
    } else {
      setCurrentStep('results');

      // Calculate best preset
      const likedPresets = testResults.filter(r => r.rating === 'like');
      let recommendedPresetId: string;

      if (likedPresets.length > 0) {
        recommendedPresetId = likedPresets[0].presetId;
      } else {
        const nonDisliked = testResults.find(r => r.rating === 'skip');
        recommendedPresetId = nonDisliked?.presetId || 'deep-work';
      }

      setPreferredPreset(recommendedPresetId);

      const recommended = getPreset(recommendedPresetId);
      if (recommended) {
        loadPreset(recommended);
      }
    }
  }, [audioEngine, currentPresetIndex, testResults, setPreferredPreset, loadPreset]);

  const handleSkip = useCallback(() => {
    const preset = DEFAULT_PRESETS[currentPresetIndex];
    setTestResults(prev => [...prev, { presetId: preset.id, rating: 'skip' }]);
    advanceToNext();
  }, [currentPresetIndex, advanceToNext]);

  // Auto-play timer for preset testing
  useEffect(() => {
    if (currentStep === 'testing' && audioInitialized) {
      const preset = DEFAULT_PRESETS[currentPresetIndex];
      if (preset) {
        loadPreset(preset);

        // Start playing
        setTimeout(() => {
          audioEngine.playAll();
        }, 100);

        // Countdown timer
        setTimeRemaining(TEST_DURATION);
        timerRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              handleSkip(); // Auto-advance when time runs out
              return TEST_DURATION;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentStep, currentPresetIndex, audioInitialized, loadPreset, audioEngine, handleSkip]);

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WIZARD_STORAGE_KEY, 'true');
    }
    setWizardCompleted(true);
    setIsOpen(false);

    // Start playing the recommended preset
    setTimeout(() => {
      audioEngine.playAll();
      play(); // Update store state to show playing
    }, 100);
  };

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    audioEngine.stopAll();
    pause();
    setIsOpen(false);
  };

  const currentPreset = DEFAULT_PRESETS[currentPresetIndex];
  const likedCount = testResults.filter(r => r.rating === 'like').length;
  const recommendedPreset = testResults.filter(r => r.rating === 'like')[0];
  const finalPreset = recommendedPreset ? getPreset(recommendedPreset.presetId) : getPreset('deep-work');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-zinc-100 mb-3">
                Find Your Perfect Focus Sound
              </h2>
              <p className="text-zinc-400 text-lg">
                Let&apos;s discover which soundscape helps you focus best
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <h3 className="font-semibold text-zinc-200 mb-2">How it works:</h3>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    We&apos;ll play 4 different sound presets
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Each plays for 25 seconds
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Rate each one: Like, Dislike, or Skip
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    We&apos;ll recommend the best match for you
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
              >
                Skip for Now
              </button>
              <button
                onClick={handleStart}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
              >
                Let&apos;s Begin
              </button>
            </div>
          </div>
        )}

        {/* Testing Step */}
        {currentStep === 'testing' && currentPreset && (
          <div className="p-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                <span>Preset {currentPresetIndex + 1} of {DEFAULT_PRESETS.length}</span>
                <span>{timeRemaining}s remaining</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${((TEST_DURATION - timeRemaining) / TEST_DURATION) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Preset Info */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-zinc-100 mb-3">
                {currentPreset.name}
              </h2>
              <p className="text-zinc-400 mb-6">
                Listen carefully... How does this make you feel?
              </p>

              {/* Sound Details */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-6">
                <h3 className="text-sm font-semibold text-zinc-400 mb-4">Currently Playing:</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-zinc-500 mb-1">Channel 1</div>
                    <div className="text-zinc-200 font-medium">{currentPreset.channel1.sound}</div>
                    <div className="text-xs text-zinc-500">{currentPreset.channel1.volume}%</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 mb-1">Channel 2</div>
                    <div className="text-zinc-200 font-medium">{currentPreset.channel2.sound}</div>
                    <div className="text-xs text-zinc-500">{currentPreset.channel2.volume}%</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 mb-1">Channel 3</div>
                    <div className="text-zinc-200 font-medium">{currentPreset.channel3.sound}</div>
                    <div className="text-xs text-zinc-500">{currentPreset.channel3.volume}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleDislike}
                className="px-6 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg transition-colors flex flex-col items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
                <span className="font-semibold">Dislike</span>
              </button>

              <button
                onClick={handleSkip}
                className="px-6 py-4 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors flex flex-col items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                <span className="font-semibold">Skip</span>
              </button>

              <button
                onClick={handleLike}
                className="px-6 py-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-lg transition-colors flex flex-col items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span className="font-semibold">Like</span>
              </button>
            </div>
          </div>
        )}

        {/* Results Step */}
        {currentStep === 'results' && finalPreset && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-zinc-100 mb-3">
                We Found Your Match!
              </h2>
              <p className="text-zinc-400">
                Based on your preferences, we recommend:
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-zinc-100 mb-4 text-center">
                {finalPreset.name}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div className="text-center">
                  <div className="text-zinc-500 mb-1">Channel 1</div>
                  <div className="text-zinc-200 font-medium">{finalPreset.channel1.sound}</div>
                </div>
                <div className="text-center">
                  <div className="text-zinc-500 mb-1">Channel 2</div>
                  <div className="text-zinc-200 font-medium">{finalPreset.channel2.sound}</div>
                </div>
                <div className="text-center">
                  <div className="text-zinc-500 mb-1">Channel 3</div>
                  <div className="text-zinc-200 font-medium">{finalPreset.channel3.sound}</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-zinc-300 mb-2">Your Results:</h4>
              <div className="flex gap-4 text-sm text-zinc-400">
                <span>👍 {likedCount} liked</span>
                <span>👎 {testResults.filter(r => r.rating === 'dislike').length} disliked</span>
                <span>⏭️ {testResults.filter(r => r.rating === 'skip').length} skipped</span>
              </div>
            </div>

            <p className="text-sm text-zinc-500 text-center mb-6">
              This preset is now loaded and ready to play. You can always change it later or try the wizard again!
            </p>

            <button
              onClick={handleComplete}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
            >
              Start Focusing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
