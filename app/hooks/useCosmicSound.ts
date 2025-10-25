"use client";
import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'hover' | 'click' | 'success' | 'error' | 'ambient' | 'teleport' | 'scan';

export const useCosmicSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientOscillatorRef = useRef<OscillatorNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  // Initialize AudioContext
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      stopAmbient();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play a cosmic sound effect
  const playSound = useCallback((type: SoundType) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    switch (type) {
      case 'hover':
        // Short beep on hover
        const hoverOsc = ctx.createOscillator();
        const hoverGain = ctx.createGain();

        hoverOsc.type = 'sine';
        hoverOsc.frequency.setValueAtTime(800, now);
        hoverOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

        hoverGain.gain.setValueAtTime(0.1, now);
        hoverGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        hoverOsc.connect(hoverGain);
        hoverGain.connect(ctx.destination);

        hoverOsc.start(now);
        hoverOsc.stop(now + 0.05);
        break;

      case 'click':
        // Punchy click sound
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();

        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(200, now);
        clickOsc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

        clickGain.gain.setValueAtTime(0.2, now);
        clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);

        clickOsc.start(now);
        clickOsc.stop(now + 0.1);
        break;

      case 'success':
        // Upward success chime
        const successOsc = ctx.createOscillator();
        const successGain = ctx.createGain();

        successOsc.type = 'triangle';
        successOsc.frequency.setValueAtTime(523.25, now); // C5
        successOsc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        successOsc.frequency.setValueAtTime(783.99, now + 0.2); // G5

        successGain.gain.setValueAtTime(0.15, now);
        successGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        successOsc.connect(successGain);
        successGain.connect(ctx.destination);

        successOsc.start(now);
        successOsc.stop(now + 0.4);
        break;

      case 'error':
        // Downward error buzz
        const errorOsc = ctx.createOscillator();
        const errorGain = ctx.createGain();

        errorOsc.type = 'sawtooth';
        errorOsc.frequency.setValueAtTime(400, now);
        errorOsc.frequency.exponentialRampToValueAtTime(100, now + 0.3);

        errorGain.gain.setValueAtTime(0.15, now);
        errorGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        errorOsc.connect(errorGain);
        errorGain.connect(ctx.destination);

        errorOsc.start(now);
        errorOsc.stop(now + 0.3);
        break;

      case 'teleport':
        // Whoosh teleport sound
        const teleportOsc1 = ctx.createOscillator();
        const teleportOsc2 = ctx.createOscillator();
        const teleportGain = ctx.createGain();

        teleportOsc1.type = 'sine';
        teleportOsc1.frequency.setValueAtTime(1000, now);
        teleportOsc1.frequency.exponentialRampToValueAtTime(200, now + 0.5);

        teleportOsc2.type = 'sawtooth';
        teleportOsc2.frequency.setValueAtTime(1500, now);
        teleportOsc2.frequency.exponentialRampToValueAtTime(300, now + 0.5);

        teleportGain.gain.setValueAtTime(0.2, now);
        teleportGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        teleportOsc1.connect(teleportGain);
        teleportOsc2.connect(teleportGain);
        teleportGain.connect(ctx.destination);

        teleportOsc1.start(now);
        teleportOsc2.start(now);
        teleportOsc1.stop(now + 0.5);
        teleportOsc2.stop(now + 0.5);
        break;

      case 'scan':
        // Scanning beep
        const scanOsc = ctx.createOscillator();
        const scanGain = ctx.createGain();

        scanOsc.type = 'sine';
        scanOsc.frequency.setValueAtTime(600, now);
        scanOsc.frequency.linearRampToValueAtTime(1200, now + 0.1);
        scanOsc.frequency.linearRampToValueAtTime(600, now + 0.2);

        scanGain.gain.setValueAtTime(0.1, now);
        scanGain.gain.setValueAtTime(0.1, now + 0.2);
        scanGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        scanOsc.connect(scanGain);
        scanGain.connect(ctx.destination);

        scanOsc.start(now);
        scanOsc.stop(now + 0.3);
        break;
    }
  }, []);

  // Start ambient background sound
  const startAmbient = useCallback(() => {
    if (!audioContextRef.current || ambientOscillatorRef.current) return;

    const ctx = audioContextRef.current;

    // Create low-frequency ambient drone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(40, ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(40.5, ctx.currentTime); // Slight detune for beating effect

    gainNode.gain.setValueAtTime(0.02, ctx.currentTime); // Very quiet ambient

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();

    ambientOscillatorRef.current = osc1;
    ambientGainRef.current = gainNode;
  }, []);

  // Stop ambient background sound
  const stopAmbient = useCallback(() => {
    if (ambientOscillatorRef.current && audioContextRef.current) {
      ambientGainRef.current?.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 1);
      setTimeout(() => {
        ambientOscillatorRef.current?.stop();
        ambientOscillatorRef.current = null;
        ambientGainRef.current = null;
      }, 1000);
    }
  }, []);

  return {
    playSound,
    startAmbient,
    stopAmbient,
  };
};
