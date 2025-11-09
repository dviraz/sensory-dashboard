import { useEffect } from 'react';
import { useAudioStore } from './store';
import { getPresets } from './presets';

export function useKeyboardShortcuts() {
  const {
    isPlaying,
    masterVolume,
    togglePlayPause,
    setMasterVolume,
    loadPreset,
    timerActive,
    startTimer,
    pauseTimer,
  } = useAudioStore();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          // Space: Play/pause
          event.preventDefault();
          togglePlayPause();
          break;

        case '1':
        case '2':
        case '3':
        case '4':
          // 1-4: Quick preset loading
          event.preventDefault();
          const presets = getPresets();
          const presetIndex = parseInt(event.key) - 1;
          if (presets[presetIndex]) {
            loadPreset(presets[presetIndex]);
          }
          break;

        case 'm':
          // M: Mute/unmute master (toggle between 0 and last volume)
          event.preventDefault();
          if (masterVolume === 0) {
            setMasterVolume(80);
          } else {
            setMasterVolume(0);
          }
          break;

        case 'arrowup':
          // Arrow Up: Increase master volume by 5
          event.preventDefault();
          setMasterVolume(Math.min(100, masterVolume + 5));
          break;

        case 'arrowdown':
          // Arrow Down: Decrease master volume by 5
          event.preventDefault();
          setMasterVolume(Math.max(0, masterVolume - 5));
          break;

        case 't':
          // T: Toggle timer
          event.preventDefault();
          if (timerActive) {
            pauseTimer();
          } else {
            startTimer();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPlaying, masterVolume, timerActive, togglePlayPause, setMasterVolume, loadPreset, startTimer, pauseTimer]);
}
