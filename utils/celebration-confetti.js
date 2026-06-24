import confetti from 'canvas-confetti';

const CELEBRATION_COLORS = ['#1a1a1a', '#2a2a2a', '#3d3d3d', '#B8860B', '#C9A227', '#D4AF37', '#F5E6C8', '#FFD700'];

/**
 * Fires a short confetti burst when a scratch card reward is revealed.
 * @param {{ originY?: number }} [options]
 */
export function fireCelebrationConfetti({ originY = 0.72 } = {}) {
  if (typeof window === 'undefined') return;

  const count = 120;
  const defaults = {
    origin: { y: originY },
    zIndex: 120,
    colors: CELEBRATION_COLORS,
    disableForReducedMotion: true,
  };

  const fire = (particleRatio, opts) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  };

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}
