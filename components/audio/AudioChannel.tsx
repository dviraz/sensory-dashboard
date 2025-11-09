'use client';

import { SoundType } from '@/lib/audio-engine';

interface AudioChannelProps {
  channelId: 1 | 2 | 3;
  title: string;
  sound: SoundType;
  volume: number;
  muted: boolean;
  availableSounds: SoundType[];
  onSoundChange: (sound: SoundType) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

export default function AudioChannel({
  channelId,
  title,
  sound,
  volume,
  muted,
  availableSounds,
  onSoundChange,
  onVolumeChange,
  onMuteToggle,
}: AudioChannelProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 backdrop-blur-sm">
      {/* Channel Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-xs text-zinc-600 mt-0.5">Channel {channelId}</p>
        </div>

        {/* Mute Button */}
        <button
          onClick={onMuteToggle}
          className={`p-2 rounded-md transition-colors ${
            muted
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>

      {/* Sound Selector */}
      <div className="mb-4">
        <label className="block text-xs text-zinc-500 mb-2">Sound</label>
        <select
          value={sound}
          onChange={(e) => onSoundChange(e.target.value as SoundType)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
        >
          {availableSounds.map((soundOption) => (
            <option key={soundOption} value={soundOption}>
              {soundOption}
            </option>
          ))}
        </select>
      </div>

      {/* Volume Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs text-zinc-500">Volume</label>
          <span className="text-xs text-zinc-400 font-mono">{volume}%</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={muted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            disabled={muted}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:bg-blue-500
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:hover:bg-blue-400
              [&::-webkit-slider-thumb]:transition-colors
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:bg-blue-500
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:hover:bg-blue-400
              [&::-moz-range-thumb]:transition-colors"
          />

          {/* Volume Level Indicator */}
          <div
            className="absolute top-0 left-0 h-2 bg-blue-500/30 rounded-lg pointer-events-none"
            style={{ width: `${muted ? 0 : volume}%` }}
          />
        </div>
      </div>
    </div>
  );
}
