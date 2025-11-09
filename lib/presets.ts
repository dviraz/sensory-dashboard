import { Preset } from './store';

const STORAGE_KEY = 'sensory-dashboard-presets';

/**
 * Default presets that come with the app
 */
export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'deep-work',
    name: 'Deep Work',
    channel1: { sound: 'Brown Noise', volume: 80, muted: false },
    channel2: { sound: 'None', volume: 20, muted: false },
    channel3: { sound: 'None', volume: 0, muted: true },
    visualizerEnabled: true,
    visualizerOpacity: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'calm-focus',
    name: 'Calm Focus',
    channel1: { sound: 'Pink Noise', volume: 40, muted: false },
    channel2: { sound: 'Binaural Beat (Alpha)', volume: 50, muted: false },
    channel3: { sound: 'None', volume: 0, muted: true },
    visualizerEnabled: true,
    visualizerOpacity: 20,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'meditation',
    name: 'Meditation',
    channel1: { sound: 'Pink Noise', volume: 30, muted: false },
    channel2: { sound: 'Binaural Beat (Theta)', volume: 60, muted: false },
    channel3: { sound: 'None', volume: 0, muted: true },
    visualizerEnabled: true,
    visualizerOpacity: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'energy-boost',
    name: 'Energy Boost',
    channel1: { sound: 'White Noise', volume: 50, muted: false },
    channel2: { sound: 'Binaural Beat (Alpha)', volume: 70, muted: false },
    channel3: { sound: 'None', volume: 0, muted: true },
    visualizerEnabled: true,
    visualizerOpacity: 40,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Get all presets (default + user-created)
 */
export function getPresets(): Preset[] {
  if (typeof window === 'undefined') {
    return DEFAULT_PRESETS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PRESETS;
    }

    const userPresets = JSON.parse(stored) as Preset[];
    return [...DEFAULT_PRESETS, ...userPresets];
  } catch (error) {
    console.error('Failed to load presets:', error);
    return DEFAULT_PRESETS;
  }
}

/**
 * Get a specific preset by ID
 */
export function getPreset(id: string): Preset | null {
  const presets = getPresets();
  return presets.find((p) => p.id === id) || null;
}

/**
 * Save a new preset
 */
export function savePreset(preset: Omit<Preset, 'id' | 'createdAt'>): Preset {
  if (typeof window === 'undefined') {
    throw new Error('Cannot save presets on server');
  }

  const newPreset: Preset = {
    ...preset,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const userPresets = stored ? JSON.parse(stored) : [];
    userPresets.push(newPreset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userPresets));
    return newPreset;
  } catch (error) {
    console.error('Failed to save preset:', error);
    throw error;
  }
}

/**
 * Update an existing preset
 */
export function updatePreset(id: string, updates: Partial<Preset>): boolean {
  if (typeof window === 'undefined') {
    throw new Error('Cannot update presets on server');
  }

  // Don't allow updating default presets
  const defaultIds = DEFAULT_PRESETS.map((p) => p.id);
  if (defaultIds.includes(id)) {
    throw new Error('Cannot update default presets');
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    const userPresets = JSON.parse(stored) as Preset[];
    const index = userPresets.findIndex((p) => p.id === id);

    if (index === -1) return false;

    userPresets[index] = { ...userPresets[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userPresets));
    return true;
  } catch (error) {
    console.error('Failed to update preset:', error);
    return false;
  }
}

/**
 * Delete a preset
 */
export function deletePreset(id: string): boolean {
  if (typeof window === 'undefined') {
    throw new Error('Cannot delete presets on server');
  }

  // Don't allow deleting default presets
  const defaultIds = DEFAULT_PRESETS.map((p) => p.id);
  if (defaultIds.includes(id)) {
    throw new Error('Cannot delete default presets');
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    const userPresets = JSON.parse(stored) as Preset[];
    const filtered = userPresets.filter((p) => p.id !== id);

    if (filtered.length === userPresets.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete preset:', error);
    return false;
  }
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export all user presets as JSON
 */
export function exportPresets(): string {
  if (typeof window === 'undefined') {
    throw new Error('Cannot export presets on server');
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  const userPresets = stored ? JSON.parse(stored) : [];
  return JSON.stringify(userPresets, null, 2);
}

/**
 * Import presets from JSON
 */
export function importPresets(json: string): number {
  if (typeof window === 'undefined') {
    throw new Error('Cannot import presets on server');
  }

  try {
    const imported = JSON.parse(json) as Preset[];
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing = stored ? JSON.parse(stored) : [];

    // Merge, avoiding duplicates by name
    const merged = [...existing];
    let importedCount = 0;

    for (const preset of imported) {
      const exists = merged.some((p) => p.name === preset.name);
      if (!exists) {
        merged.push({
          ...preset,
          id: generateId(),
          createdAt: new Date().toISOString(),
        });
        importedCount++;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return importedCount;
  } catch (error) {
    console.error('Failed to import presets:', error);
    throw error;
  }
}
