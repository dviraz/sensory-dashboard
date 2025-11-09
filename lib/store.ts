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

export interface FocusSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  completed: boolean;
  type: 'work' | 'break';
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
  pomodoroEnabled: boolean;
  pomodoroMode: 'work' | 'break';
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
  completedPomodoros: number;

  // Session History
  sessions: FocusSession[];
  currentSessionId: string | null;

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
  togglePomodoro: () => void;
  setWorkDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  startPomodoroSession: () => void;
  completeSession: () => void;

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
  pomodoroEnabled: false,
  pomodoroMode: 'work',
  workDuration: 1500, // 25 minutes
  breakDuration: 300, // 5 minutes
  completedPomodoros: 0,

  // Initial session history
  sessions: [],
  currentSessionId: null,

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
        // Timer completed
        if (state.pomodoroEnabled) {
          // Switch between work and break
          const newMode = state.pomodoroMode === 'work' ? 'break' : 'work';
          const newDuration = newMode === 'work' ? state.workDuration : state.breakDuration;
          const newCompletedPomodoros = newMode === 'break' ? state.completedPomodoros + 1 : state.completedPomodoros;

          return {
            timerRemaining: newDuration,
            timerDuration: newDuration,
            pomodoroMode: newMode,
            completedPomodoros: newCompletedPomodoros,
            timerActive: false, // Stop after each session
          };
        } else {
          return { timerActive: false };
        }
      }
    });
  },

  togglePomodoro: () => set((state) => {
    const enabled = !state.pomodoroEnabled;
    return {
      pomodoroEnabled: enabled,
      timerDuration: enabled ? state.workDuration : 1500,
      timerRemaining: enabled ? state.workDuration : 1500,
      pomodoroMode: 'work',
    };
  }),

  setWorkDuration: (duration) => set({ workDuration: duration }),

  setBreakDuration: (duration) => set({ breakDuration: duration }),

  startPomodoroSession: () => {
    const sessionId = `session-${Date.now()}`;
    set(() => ({
      currentSessionId: sessionId,
      timerActive: true,
    }));
  },

  completeSession: () => {
    set((state) => {
      if (!state.currentSessionId) return {};

      const session: FocusSession = {
        id: state.currentSessionId,
        startTime: new Date(parseInt(state.currentSessionId.split('-')[1])).toISOString(),
        endTime: new Date().toISOString(),
        duration: state.timerDuration - state.timerRemaining,
        completed: true,
        type: state.pomodoroMode,
      };

      return {
        sessions: [...state.sessions, session],
        currentSessionId: null,
      };
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
