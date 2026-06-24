const SCRATCH_FOIL_COLOR = '#2a2a2a';
const SCRATCH_CHARCOAL_DARK = '#1a1a1a';
const SCRATCH_CHARCOAL_MID = '#2a2a2a';
const SCRATCH_CHARCOAL_LIGHT = '#3d3d3d';
const SCRATCH_GOLD = '#D4AF37';
const SCRATCH_GOLD_LIGHT = '#F5E6C8';

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function buildScratchSurfaceSvgFallback(size) {
  const radius = Math.round(size * 0.1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${SCRATCH_FOIL_COLOR}"/>
  <text x="50%" y="46%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(12, Math.round(size * 0.052))}" font-weight="800" fill="${SCRATCH_GOLD}">SCRATCH HERE</text>
  <text x="50%" y="58%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(10, Math.round(size * 0.038))}" font-weight="700" fill="${SCRATCH_GOLD_LIGHT}" opacity="0.92">Reveal your reward</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Renders the scratch foil as a PNG data URL. Canvas rasterization is far more
 * reliable than drawing gradient-heavy SVGs onto a scratch canvas on older mobile
 * WebViews (a common source of missing foil/background color).
 */
export function buildScratchSurfaceImage(size) {
  if (typeof document === 'undefined' || size <= 0) {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return buildScratchSurfaceSvgFallback(size);
  }

  const radius = Math.round(size * 0.1);

  ctx.save();
  roundRect(ctx, 0, 0, size, size, radius);
  ctx.clip();

  const foil = ctx.createLinearGradient(0, 0, size, size);
  foil.addColorStop(0, SCRATCH_CHARCOAL_DARK);
  foil.addColorStop(0.35, SCRATCH_CHARCOAL_MID);
  foil.addColorStop(0.68, '#333333');
  foil.addColorStop(1, SCRATCH_CHARCOAL_LIGHT);
  ctx.fillStyle = foil;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = 'rgba(212, 175, 55, 0.14)';
  const dotSpacing = 14;
  for (let x = 2; x < size; x += dotSpacing) {
    for (let y = 2; y < size; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const inset = Math.round(size * 0.07);
  const innerRadius = Math.round(size * 0.08);
  roundRect(ctx, inset, inset, size - inset * 2, size - inset * 2, innerRadius);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((-18 * Math.PI) / 180);
  const shine = ctx.createLinearGradient(-size, 0, size, 0);
  shine.addColorStop(0, 'rgba(212, 175, 55, 0)');
  shine.addColorStop(0.48, 'rgba(245, 230, 200, 0.38)');
  shine.addColorStop(1, 'rgba(212, 175, 55, 0)');
  ctx.fillStyle = shine;
  ctx.fillRect(-size / 2 - 20, size * 0.28 - size / 2, size + 40, size * 0.18);
  ctx.restore();

  ctx.fillStyle = SCRATCH_GOLD;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${Math.max(12, Math.round(size * 0.052))}px Arial, sans-serif`;
  ctx.fillText('SCRATCH HERE', size / 2, size * 0.46);
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = SCRATCH_GOLD_LIGHT;
  ctx.font = `700 ${Math.max(10, Math.round(size * 0.038))}px Arial, sans-serif`;
  ctx.fillText('Reveal your reward', size / 2, size * 0.58);
  ctx.globalAlpha = 1;

  ctx.restore();

  try {
    return canvas.toDataURL('image/png');
  } catch {
    return buildScratchSurfaceSvgFallback(size);
  }
}

export {
  SCRATCH_FOIL_COLOR,
  SCRATCH_CHARCOAL_DARK,
  SCRATCH_CHARCOAL_MID,
  SCRATCH_CHARCOAL_LIGHT,
  SCRATCH_GOLD,
  SCRATCH_GOLD_LIGHT,
};
