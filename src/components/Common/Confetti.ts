import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {
    console.warn('Confetti animation failed to trigger:', e);
  }
};
