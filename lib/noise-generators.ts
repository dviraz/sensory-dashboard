/**
 * Generates procedural audio noise (brown, pink, white)
 * These functions create AudioBuffers that can be looped seamlessly
 */

/**
 * Generate white noise - completely random values
 * Sounds like static or radio noise
 */
export function generateWhiteNoise(audioContext: AudioContext, duration: number = 30): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    // Random value between -1 and 1
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

/**
 * Generate pink noise - balanced frequency spectrum
 * Sounds softer than white noise, more natural
 */
export function generatePinkNoise(audioContext: AudioContext, duration: number = 30): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  // Pink noise uses multiple random generators with different update rates
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;

    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;

    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;

    data[i] = pink * 0.11; // Scale down to prevent clipping
  }

  return buffer;
}

/**
 * Generate brown noise - deeper, rumbling sound
 * Also called "red noise" or "Brownian noise"
 * Sounds like low rumble or distant waterfall
 */
export function generateBrownNoise(audioContext: AudioContext, duration: number = 30): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  let lastValue = 0;

  for (let i = 0; i < bufferSize; i++) {
    // Random walk algorithm
    const white = Math.random() * 2 - 1;
    lastValue = (lastValue + (0.02 * white)) / 1.02;
    data[i] = lastValue * 3.5; // Scale up for audibility
  }

  return buffer;
}

/**
 * Generate binaural beats - two slightly different frequencies
 * Creates a perceived "beat" when played in stereo
 * @param baseFreq - Base frequency (e.g., 200 Hz)
 * @param beatFreq - Beat frequency (e.g., 4 Hz creates 4 beats per second)
 */
export function generateBinauralBeat(
  audioContext: AudioContext,
  baseFreq: number = 200,
  beatFreq: number = 4,
  duration: number = 30
): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);

  const leftData = buffer.getChannelData(0);
  const rightData = buffer.getChannelData(1);

  const leftFreq = baseFreq;
  const rightFreq = baseFreq + beatFreq;

  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;

    // Left channel: base frequency
    leftData[i] = Math.sin(2 * Math.PI * leftFreq * t) * 0.3;

    // Right channel: base frequency + beat frequency
    rightData[i] = Math.sin(2 * Math.PI * rightFreq * t) * 0.3;
  }

  return buffer;
}

/**
 * Helper to create a looping noise source
 */
export function createLoopingNoiseSource(
  audioContext: AudioContext,
  buffer: AudioBuffer,
  gainNode: GainNode
): AudioBufferSourceNode {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(gainNode);
  return source;
}
