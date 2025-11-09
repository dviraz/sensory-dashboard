import {
  generateWhiteNoise,
  generatePinkNoise,
  generateBrownNoise,
  generateBinauralBeat,
  generateOceanWaves,
  generateRain,
  generateThunderstorm,
  generateCampfire,
} from './noise-generators';

export type SoundType =
  | 'Brown Noise'
  | 'Pink Noise'
  | 'White Noise'
  | 'Binaural Beat (Alpha)'
  | 'Binaural Beat (Theta)'
  | 'Ocean Waves'
  | 'Rain'
  | 'Thunderstorm'
  | 'Campfire'
  | 'None';

interface AudioChannel {
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  currentSound: SoundType;
  isPlaying: boolean;
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private channels: Map<number, AudioChannel> = new Map();
  private audioBuffers: Map<SoundType, AudioBuffer> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize the audio context and create audio graph
   * Must be called from a user interaction (click/touch) due to browser autoplay policies
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create audio context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create master gain node (controls overall volume)
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);
      this.masterGainNode.gain.value = 0.8;

      // Create 3 channels
      for (let i = 1; i <= 3; i++) {
        const gainNode = this.audioContext.createGain();
        gainNode.connect(this.masterGainNode);
        gainNode.gain.value = 0.7;

        this.channels.set(i, {
          source: null,
          gainNode,
          currentSound: 'None',
          isPlaying: false,
        });
      }

      // Pre-generate noise buffers
      await this.generateNoiseBuffers();

      this.initialized = true;
      console.log('Audio engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      throw error;
    }
  }

  /**
   * Pre-generate all procedural noise buffers
   */
  private async generateNoiseBuffers(): Promise<void> {
    if (!this.audioContext) return;

    console.log('Generating noise buffers...');

    this.audioBuffers.set('White Noise', generateWhiteNoise(this.audioContext, 30));
    this.audioBuffers.set('Pink Noise', generatePinkNoise(this.audioContext, 30));
    this.audioBuffers.set('Brown Noise', generateBrownNoise(this.audioContext, 30));
    this.audioBuffers.set('Binaural Beat (Alpha)', generateBinauralBeat(this.audioContext, 200, 10, 30));
    this.audioBuffers.set('Binaural Beat (Theta)', generateBinauralBeat(this.audioContext, 200, 6, 30));
    this.audioBuffers.set('Ocean Waves', generateOceanWaves(this.audioContext, 30));
    this.audioBuffers.set('Rain', generateRain(this.audioContext, 30));
    this.audioBuffers.set('Thunderstorm', generateThunderstorm(this.audioContext, 30));
    this.audioBuffers.set('Campfire', generateCampfire(this.audioContext, 30));

    console.log('Noise buffers generated');
  }

  /**
   * Resume audio context (required for some browsers)
   */
  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Load a sound into a specific channel
   */
  async loadSound(channelId: number, soundType: SoundType): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    const channel = this.channels.get(channelId);
    if (!channel || !this.audioContext) {
      console.error(`Channel ${channelId} not found`);
      return;
    }

    // Stop current sound if playing
    if (channel.source) {
      channel.source.stop();
      channel.source.disconnect();
      channel.source = null;
    }

    // Handle "None" sound type
    if (soundType === 'None') {
      channel.currentSound = 'None';
      channel.isPlaying = false;
      return;
    }

    // Get or generate buffer
    const buffer = this.audioBuffers.get(soundType);
    if (!buffer) {
      console.error(`Sound buffer for ${soundType} not found`);
      return;
    }

    // Create new source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(channel.gainNode);

    channel.source = source;
    channel.currentSound = soundType;

    // Start playing if we're in playing state
    if (channel.isPlaying) {
      source.start();
    }
  }

  /**
   * Play a specific channel
   */
  playChannel(channelId: number): void {
    const channel = this.channels.get(channelId);
    if (!channel || !this.audioContext) return;

    if (!channel.isPlaying && channel.source && channel.currentSound !== 'None') {
      // Resume audio context if suspended
      this.resume();

      // Can't restart the same source, need to create a new one
      const buffer = this.audioBuffers.get(channel.currentSound);
      if (buffer) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(channel.gainNode);
        source.start();
        channel.source = source;
        channel.isPlaying = true;
      }
    }
  }

  /**
   * Stop a specific channel
   */
  stopChannel(channelId: number): void {
    const channel = this.channels.get(channelId);
    if (!channel || !channel.source) return;

    if (channel.isPlaying) {
      channel.source.stop();
      channel.isPlaying = false;
    }
  }

  /**
   * Play all channels
   */
  playAll(): void {
    for (let i = 1; i <= 3; i++) {
      this.playChannel(i);
    }
  }

  /**
   * Stop all channels
   */
  stopAll(): void {
    for (let i = 1; i <= 3; i++) {
      this.stopChannel(i);
    }
  }

  /**
   * Set volume for a specific channel (0-100)
   */
  setChannelVolume(channelId: number, volume: number): void {
    const channel = this.channels.get(channelId);
    if (!channel) return;

    // Convert 0-100 to 0-1 and apply exponential curve for natural volume perception
    const normalizedVolume = volume / 100;
    const exponentialVolume = Math.pow(normalizedVolume, 2);
    channel.gainNode.gain.value = exponentialVolume;
  }

  /**
   * Mute/unmute a specific channel
   */
  setChannelMute(channelId: number, muted: boolean): void {
    const channel = this.channels.get(channelId);
    if (!channel) return;

    channel.gainNode.gain.value = muted ? 0 : 0.7;
  }

  /**
   * Set master volume (0-100)
   */
  setMasterVolume(volume: number): void {
    if (!this.masterGainNode) return;

    // Convert 0-100 to 0-1 and apply exponential curve
    const normalizedVolume = volume / 100;
    const exponentialVolume = Math.pow(normalizedVolume, 2);
    this.masterGainNode.gain.value = exponentialVolume;
  }

  /**
   * Gradually fade master volume (for timer completion)
   */
  async fadeOut(durationMs: number = 10000): Promise<void> {
    if (!this.masterGainNode || !this.audioContext) return;

    const startVolume = this.masterGainNode.gain.value;
    const startTime = this.audioContext.currentTime;
    const endTime = startTime + durationMs / 1000;

    // Use exponential ramp for smooth fade
    this.masterGainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

    // Wait for fade to complete
    await new Promise(resolve => setTimeout(resolve, durationMs));

    // Stop all channels
    this.stopAll();

    // Restore volume
    this.masterGainNode.gain.value = startVolume;
  }

  /**
   * Get available sound types
   */
  getAvailableSounds(): SoundType[] {
    return [
      'None',
      'Brown Noise',
      'Pink Noise',
      'White Noise',
      'Binaural Beat (Alpha)',
      'Binaural Beat (Theta)',
      'Ocean Waves',
      'Rain',
      'Thunderstorm',
      'Campfire',
    ];
  }

  /**
   * Cleanup and dispose of audio resources
   */
  dispose(): void {
    this.stopAll();

    this.channels.forEach(channel => {
      if (channel.source) {
        channel.source.disconnect();
      }
      channel.gainNode.disconnect();
    });

    if (this.masterGainNode) {
      this.masterGainNode.disconnect();
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.channels.clear();
    this.audioBuffers.clear();
    this.initialized = false;
  }
}

// Singleton instance
let audioEngineInstance: AudioEngine | null = null;

/**
 * Get the singleton audio engine instance
 */
export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}
