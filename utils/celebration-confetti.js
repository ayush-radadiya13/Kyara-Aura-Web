import confetti from 'canvas-confetti';

const CELEBRATION_COLORS = ['#3C2415', '#5C4033', '#8B4513', '#A0522D', '#D2691E', '#FFD700', '#FFF8DC'];

/**
 * Fires a short confetti burst for scratch card / gift card openings.
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
