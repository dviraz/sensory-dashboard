import { create } from 'zustand';

export interface ChannelState {
  sound: string;
  volume: number;
  muted: boolean;
}

export interface Preset {
  id: string;
  name: string;
  channel1: ChannelState;
  channel2: ChannelState;
  channel3: ChannelState;
  visualizerEnabled: boolean;
  visualizerOpacity: number;
  createdAt: string;
}

interface AudioStore {
  // Channel states
  channel1: ChannelState;
  channel2: ChannelState;
  channel3: ChannelState;

  // Global controls
  masterVolume: number;
  isPlaying: boolean;

  // Visualizer
  visualizerEnabled: boolean;
  visualizerOpacity: number;

  // Timer
  timerDuration: number; // in seconds
  timerRemaining: number;
  timerActive: boolean;

  // Wizard
  wizardCompleted: boolean;
  preferredPresetId: string | null;

  // Actions for channels
  setChannelSound: (channel: 1 | 2 | 3, sound: string) => void;
  setChannelVolume: (channel: 1 | 2 | 3, volume: number) => void;
  toggleChannelMute: (channel: 1 | 2 | 3) => void;

  // Actions for global controls
  setMasterVolume: (volume: number) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;

  // Actions for visualizer
  toggleVisualizer: () => void;
  setVisualizerOpacity: (opacity: number) => void;

  // Actions for timer
  setTimerDuration: (duration: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;

  // Preset actions
  loadPreset: (preset: Preset) => void;
  getCurrentState: () => Preset;

  // Wizard actions
  setWizardCompleted: (completed: boolean) => void;
  setPreferredPreset: (presetId: string) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  // Initial channel states
  channel1: {
    sound: 'Brown Noise',
    volume: 70,
    muted: false,
  },
  channel2: {
    sound: 'None',
    volume: 50,
    muted: false,
  },
  channel3: {
    sound: 'None',
    volume: 30,
    muted: false,
  },

  // Initial global state
  masterVolume: 80,
  isPlaying: false,

  // Initial visualizer state
  visualizerEnabled: true,
  visualizerOpacity: 30,

  // Initial timer state
  timerDuration: 1500, // 25 minutes
  timerRemaining: 1500,
  timerActive: false,

  // Initial wizard state
  wizardCompleted: false,
  preferredPresetId: null,

  // Channel actions
  setChannelSound: (channel, sound) => {
    set((state) => ({
      [`channel${channel}`]: {
        ...state[`channel${channel}` as keyof AudioStore] as ChannelState,
        sound,
      },
    }));
  },

  setChannelVolume: (channel, volume) => {
    set((state) => ({
      [`channel${channel}`]: {
        ...state[`channel${channel}` as keyof AudioStore] as ChannelState,
        volume,
      },
    }));
  },

  toggleChannelMute: (channel) => {
    set((state) => {
      const channelState = state[`channel${channel}` as keyof AudioStore] as ChannelState;
      return {
        [`channel${channel}`]: {
          ...channelState,
          muted: !channelState.muted,
        },
      };
    });
  },

  // Global control actions
  setMasterVolume: (volume) => set({ masterVolume: volume }),

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),

  // Visualizer actions
  toggleVisualizer: () => set((state) => ({ visualizerEnabled: !state.visualizerEnabled })),

  setVisualizerOpacity: (opacity) => set({ visualizerOpacity: opacity }),

  // Timer actions
  setTimerDuration: (duration) => set({ timerDuration: duration, timerRemaining: duration }),

  startTimer: () => set({ timerActive: true }),

  pauseTimer: () => set({ timerActive: false }),

  resetTimer: () => set((state) => ({ timerRemaining: state.timerDuration, timerActive: false })),

  tickTimer: () => {
    set((state) => {
      if (state.timerRemaining > 0) {
        return { timerRemaining: state.timerRemaining - 1 };
      } else {
        return { timerActive: false };
      }
    });
  },

  // Preset actions
  loadPreset: (preset) => {
    set({
      channel1: preset.channel1,
      channel2: preset.channel2,
      channel3: preset.channel3,
      visualizerEnabled: preset.visualizerEnabled,
      visualizerOpacity: preset.visualizerOpacity,
    });
  },

  getCurrentState: () => {
    const state = get();
    return {
      id: '',
      name: '',
      channel1: state.channel1,
      channel2: state.channel2,
      channel3: state.channel3,
      visualizerEnabled: state.visualizerEnabled,
      visualizerOpacity: state.visualizerOpacity,
      createdAt: new Date().toISOString(),
    };
  },

  // Wizard actions
  setWizardCompleted: (completed) => set({ wizardCompleted: completed }),

  setPreferredPreset: (presetId) => set({ preferredPresetId: presetId }),
}));
