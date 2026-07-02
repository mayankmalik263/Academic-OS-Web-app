import { useState, useEffect } from 'react';

// Keep audio context outside React component lifecycle to avoid re-creation
let audioCtx: AudioContext | null = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
}

export function useAudio() {
  const [muted, setMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('zeroToModernAI_audio_muted');
    return saved ? saved === 'true' : true; // Default to muted
  });

  useEffect(() => {
    localStorage.setItem('zeroToModernAI_audio_muted', String(muted));
  }, [muted]);

  const playSound = (type: 'click' | 'success' | 'fanfare' | 'locked') => {
    if (muted) return;
    
    try {
      initAudio();
      if (!audioCtx) return;

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;

      if (type === 'click') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'success') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const duration = 0.1;
        notes.forEach((freq, i) => {
          if (!audioCtx) return;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * duration);
          gain.gain.setValueAtTime(0.12, now + i * duration);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * duration + 0.2);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * duration);
          osc.stop(now + i * duration + 0.25);
        });
      } else if (type === 'fanfare') {
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 1046.50];
        const times = [0, 0.08, 0.16, 0.24, 0.32, 0.40];
        notes.forEach((freq, i) => {
          if (!audioCtx) return;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + times[i]);
          gain.gain.setValueAtTime(0.08, now + times[i]);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + times[i] + 0.4);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + times[i]);
          osc.stop(now + times[i] + 0.45);
        });
      } else if (type === 'locked') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(120, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch (error) {
      console.warn('Failed to play sound due to AudioContext restrictions:', error);
    }
  };

  const toggleMute = () => {
    setMuted(prev => !prev);
  };

  return { muted, toggleMute, playSound };
}
