'use client';

import { useEffect, useState } from 'react';
import { useAudioStore } from '@/lib/store';
import { getAudioEngine, SoundType } from '@/lib/audio-engine';
import AudioChannel from './AudioChannel';

export default function AudioMixer() {
  const {
    channel1,
    channel2,
    channel3,
    masterVolume,
    isPlaying,
    setChannelSound,
    setChannelVolume,
    toggleChannelMute,
    setMasterVolume,
    togglePlayPause,
  } = useAudioStore();

  const [audioEngine] = useState(() => getAudioEngine());
  const [availableSounds, setAvailableSounds] = useState<SoundType[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize audio engine on first user interaction
  useEffect(() => {
    const initAudio = async () => {
      if (!initialized) {
        try {
          await audioEngine.initialize();
          setAvailableSounds(audioEngine.getAvailableSounds());
          setInitialized(true);
        } catch (error) {
          console.error('Failed to initialize audio:', error);
        }
      }
    };

    // Call on mount (will work if user has already interacted)
    initAudio();
  }, [audioEngine, initialized]);

  // Sync channel sounds with audio engine
  useEffect(() => {
    if (initialized) {
      audioEngine.loadSound(1, channel1.sound as SoundType);
    }
  }, [audioEngine, channel1.sound, initialized]);

  useEffect(() => {
    if (initialized) {
      audioEngine.loadSound(2, channel2.sound as SoundType);
    }
  }, [audioEngine, channel2.sound, initialized]);

  useEffect(() => {
    if (initialized) {
      audioEngine.loadSound(3, channel3.sound as SoundType);
    }
  }, [audioEngine, channel3.sound, initialized]);

  // Sync channel volumes
  useEffect(() => {
    if (initialized) {
      audioEngine.setChannelVolume(1, channel1.volume);
    }
  }, [audioEngine, channel1.volume, initialized]);

  useEffect(() => {
    if (initialized) {
      audioEngine.setChannelVolume(2, channel2.volume);
    }
  }, [audioEngine, channel2.volume, initialized]);

  useEffect(() => {
    if (initialized) {
      audioEngine.setChannelVolume(3, channel3.volume);
    }
  }, [audioEngine, channel3.volume, initialized]);

  // Sync mute states
  useEffect(() => {
    if (initialized) {
      audioEngine.setChannelMute(1, channel1.muted);
    }
  }, [audioEngine, channel1.muted, initialized]);

  useEffect(() => {
    if (initialized) {
      audioEngine.setChannelMute(2, channel2.muted);
    }
  }, [audioEngine, channel2.muted, initialized]);

  useEffect(() => {
    if (initialized) {
      audioEngine.setChannelMute(3, channel3.muted);
    }
  }, [audioEngine, channel3.muted, initialized]);

  // Sync master volume
  useEffect(() => {
    if (initialized) {
      audioEngine.setMasterVolume(masterVolume);
    }
  }, [audioEngine, masterVolume, initialized]);

  // Sync play/pause state
  useEffect(() => {
    if (initialized) {
      if (isPlaying) {
        audioEngine.playAll();
      } else {
        audioEngine.stopAll();
      }
    }
  }, [audioEngine, isPlaying, initialized]);

  const handlePlayPause = async () => {
    if (!initialized) {
      // Initialize on first interaction
      try {
        await audioEngine.initialize();
        setAvailableSounds(audioEngine.getAvailableSounds());
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        return;
      }
    }

    togglePlayPause();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 backdrop-blur-md shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Focus Mixer</h2>
          <p className="text-sm text-zinc-500">
            Layer ambient sounds to create your perfect focus environment
          </p>
        </div>

        {/* Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <AudioChannel
            channelId={1}
            title="Noise Floor"
            sound={channel1.sound as SoundType}
            volume={channel1.volume}
            muted={channel1.muted}
            availableSounds={availableSounds}
            onSoundChange={(sound) => setChannelSound(1, sound)}
            onVolumeChange={(volume) => setChannelVolume(1, volume)}
            onMuteToggle={() => toggleChannelMute(1)}
          />

          <AudioChannel
            channelId={2}
            title="Ambient Layer"
            sound={channel2.sound as SoundType}
            volume={channel2.volume}
            muted={channel2.muted}
            availableSounds={availableSounds}
            onSoundChange={(sound) => setChannelSound(2, sound)}
            onVolumeChange={(volume) => setChannelVolume(2, volume)}
            onMuteToggle={() => toggleChannelMute(2)}
          />

          <AudioChannel
            channelId={3}
            title="Rhythmic Layer"
            sound={channel3.sound as SoundType}
            volume={channel3.volume}
            muted={channel3.muted}
            availableSounds={availableSounds}
            onSoundChange={(sound) => setChannelSound(3, sound)}
            onVolumeChange={(volume) => setChannelVolume(3, volume)}
            onMuteToggle={() => toggleChannelMute(3)}
          />
        </div>

        {/* Master Controls */}
        <div className="border-t border-zinc-800 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Master Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-400">Master Volume</label>
                <span className="text-sm text-zinc-400 font-mono">{masterVolume}%</span>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:bg-blue-500
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:hover:bg-blue-400
                    [&::-webkit-slider-thumb]:transition-colors
                    [&::-moz-range-thumb]:w-5
                    [&::-moz-range-thumb]:h-5
                    [&::-moz-range-thumb]:bg-blue-500
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:hover:bg-blue-400
                    [&::-moz-range-thumb]:transition-colors"
                />

                <div
                  className="absolute top-0 left-0 h-3 bg-blue-500/30 rounded-lg pointer-events-none"
                  style={{ width: `${masterVolume}%` }}
                />
              </div>
            </div>

            {/* Play/Pause Controls */}
            <div className="flex items-end justify-center md:justify-end gap-3">
              <button
                onClick={handlePlayPause}
                className={`px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Play
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {!initialized && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400 text-center">
              Click Play to initialize audio
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
