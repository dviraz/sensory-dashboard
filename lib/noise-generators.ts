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
 * Generate ocean waves - rolling wave-like pattern
 * Simulates the ebb and flow of ocean waves
 */
export function generateOceanWaves(audioContext: AudioContext, duration: number = 30): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let brownValue = 0;

    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;

      // Low frequency wave pattern (0.1-0.3 Hz)
      const wave1 = Math.sin(2 * Math.PI * 0.15 * t);
      const wave2 = Math.sin(2 * Math.PI * 0.22 * t + (channel * 0.5));

      // Add brown noise for texture
      const white = Math.random() * 2 - 1;
      brownValue = (brownValue + (0.01 * white)) / 1.01;

      // Combine waves with noise, modulated by wave envelope
      const envelope = (wave1 + wave2) * 0.3 + 0.7;
      data[i] = (brownValue * envelope + wave1 * 0.2) * 0.4;
    }
  }

  return buffer;
}

/**
 * Generate rain sound - filtered noise with varying intensity
 * Simulates steady rainfall
 */
export function generateRain(audioContext: AudioContext, duration: number = 30): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    const pinkState = [0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;

      // Generate pink noise for rain texture
      const white = Math.random() * 2 - 1;

      pinkState[0] = 0.99886 * pinkState[0] + white * 0.0555179;
      pinkState[1] = 0.99332 * pinkState[1] + white * 0.0750759;
      pinkState[2] = 0.96900 * pinkState[2] + white * 0.1538520;
      pinkState[3] = 0.86650 * pinkState[3] + white * 0.3104856;
      pinkState[4] = 0.55000 * pinkState[4] + white * 0.5329522;
      pinkState[5] = -0.7616 * pinkState[5] - white * 0.0168980;

      const pink = pinkState.reduce((sum, val) => sum + val, 0) + white * 0.5362;

      // Slight intensity variation
      const intensity = 0.8 + Math.sin(2 * Math.PI * 0.05 * t) * 0.2;

      data[i] = pink * intensity * 0.15;
    }
  }

  return buffer;
}

/**
 * Generate thunderstorm - rain with occasional thunder rumbles
 * Combines rain with low-frequency rumbles
 */
export function generateThunderstorm(audioContext: AudioContext, duration: number = 30): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);

  // Generate thunder times (random but not too frequent)
  const thunderTimes: number[] = [];
  for (let t = 5; t < duration; t += 8 + Math.random() * 10) {
    thunderTimes.push(t);
  }

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    const pinkState = [0, 0, 0, 0, 0, 0, 0];
    let brownValue = 0;

    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;

      // Base rain sound (pink noise)
      const white = Math.random() * 2 - 1;
      pinkState[0] = 0.99886 * pinkState[0] + white * 0.0555179;
      pinkState[1] = 0.99332 * pinkState[1] + white * 0.0750759;
      pinkState[2] = 0.96900 * pinkState[2] + white * 0.1538520;
      pinkState[3] = 0.86650 * pinkState[3] + white * 0.3104856;
      pinkState[4] = 0.55000 * pinkState[4] + white * 0.5329522;
      pinkState[5] = -0.7616 * pinkState[5] - white * 0.0168980;

      const rain = pinkState.reduce((sum, val) => sum + val, 0) + white * 0.5362;

      // Thunder rumble (low frequency brown noise)
      brownValue = (brownValue + (0.02 * white)) / 1.02;

      let thunder = 0;
      for (const thunderTime of thunderTimes) {
        const timeSinceThunder = t - thunderTime;
        if (timeSinceThunder > 0 && timeSinceThunder < 3) {
          // Exponential decay envelope
          const envelope = Math.exp(-timeSinceThunder * 1.5);
          thunder += brownValue * envelope;
        }
      }

      data[i] = (rain * 0.12 + thunder * 0.3) * 1.2;
    }
  }

  return buffer;
}

/**
 * Generate campfire - crackling fire sound
 * Simulates the popping and crackling of burning wood
 */
export function generateCampfire(audioContext: AudioContext, duration: number = 30): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let brownValue = 0;

    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;

      // Base crackle (brown noise)
      const white = Math.random() * 2 - 1;
      brownValue = (brownValue + (0.03 * white)) / 1.03;

      // Random pops (occasional bursts)
      let pop = 0;
      if (Math.random() < 0.003) {
        pop = (Math.random() - 0.5) * 2;
      }

      // Low frequency rumble for the fire
      const rumble = Math.sin(2 * Math.PI * 30 * t + Math.random()) * 0.1;

      // Flickering intensity
      const flicker = 0.7 + Math.sin(2 * Math.PI * 2 * t + channel) * 0.3;

      data[i] = (brownValue * 0.3 + pop * 0.5 + rumble) * flicker * 0.25;
    }
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
