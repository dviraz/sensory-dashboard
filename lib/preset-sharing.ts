import { Preset } from './store';

/**
 * Encode a preset into a URL-safe string
 */
export function encodePresetToURL(preset: Preset): string {
  const data = {
    n: preset.name,
    c1: preset.channel1,
    c2: preset.channel2,
    c3: preset.channel3,
    ve: preset.visualizerEnabled,
    vo: preset.visualizerOpacity,
  };

  // Convert to JSON and base64 encode
  const json = JSON.stringify(data);
  const base64 = btoa(json);

  // Make it URL-safe
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decode a preset from a URL-safe string
 */
export function decodePresetFromURL(encoded: string): Preset | null {
  try {
    // Restore base64 padding and characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode base64 to JSON
    const json = atob(base64);
    const data = JSON.parse(json);

    // Reconstruct preset
    return {
      id: `shared-${Date.now()}`,
      name: data.n || 'Shared Preset',
      channel1: data.c1,
      channel2: data.c2,
      channel3: data.c3,
      visualizerEnabled: data.ve,
      visualizerOpacity: data.vo,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to decode preset from URL:', error);
    return null;
  }
}

/**
 * Get the current URL with preset encoded
 */
export function getShareableURL(preset: Preset): string {
  const encoded = encodePresetToURL(preset);
  const url = new URL(window.location.href);
  url.searchParams.set('preset', encoded);
  return url.toString();
}

/**
 * Extract preset from current URL if present
 */
export function getPresetFromURL(): Preset | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('preset');

  if (!encoded) return null;

  return decodePresetFromURL(encoded);
}

/**
 * Clear preset parameter from URL
 */
export function clearPresetFromURL(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.delete('preset');
  window.history.replaceState({}, '', url.toString());
}
