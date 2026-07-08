'use client';

import { useCallback, useEffect, useRef } from 'react';
import { SCRATCH_FOIL_COLOR } from '@/utils/scratch-surface-image';

function getPointerPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const point = event.touches?.[0] ?? event.changedTouches?.[0] ?? event;

  return {
    x: point.clientX - rect.left,
    y: point.clientY - rect.top,
  };
}

function paintFoilFallback(ctx, width, height) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = SCRATCH_FOIL_COLOR;
  ctx.fillRect(0, 0, width, height);
}

function loadScratchSurface(ctx, image, width, height, onReady) {
  if (!image) {
    paintFoilFallback(ctx, width, height);
    onReady();
    return undefined;
  }

  const backgroundImage = new Image();
  const isDataUrl = image.startsWith('data:');

  if (!isDataUrl) {
    backgroundImage.crossOrigin = 'anonymous';
  }

  const handleReady = () => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(backgroundImage, 0, 0, width, height);
    onReady();
  };

  const handleError = () => {
    paintFoilFallback(ctx, width, height);
    onReady();
  };

  backgroundImage.addEventListener('load', handleReady);
  backgroundImage.addEventListener('error', handleError);
  backgroundImage.src = image;

  if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
    handleReady();
  }

  return () => {
    backgroundImage.removeEventListener('load', handleReady);
    backgroundImage.removeEventListener('error', handleError);
  };
}

/**
 * Drop-in replacement for next-scratchcard with fixes for older mobile browsers:
 * - Skips crossOrigin on data URLs (can block foil image load in legacy WebKit)
 * - Paints a solid foil fallback when the surface image fails to load
 * - Keeps reward content mounted under the canvas at all times
 */
export function CompatibleScratchCard({
  width = 300,
  height = 150,
  image = '',
  finishPercent = 60,
  onComplete = () => {},
  brushSize = 30,
  revealed = false,
  children,
}) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const autoRevealedRef = useRef(revealed);

  const checkReveal = useCallback(
    (ctx) => {
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      let transparentPixels = 0;

      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index + 3] === 0) transparentPixels += 1;
      }

      const totalPixels = width * height;
      const currentPercentage = (transparentPixels / totalPixels) * 100;

      if (currentPercentage >= finishPercent && !autoRevealedRef.current) {
        autoRevealedRef.current = true;
        ctx.clearRect(0, 0, width, height);
        onComplete();
      }
    },
    [finishPercent, height, onComplete, width],
  );

  const draw = useCallback(
    (event) => {
      if (revealed || autoRevealedRef.current || !isDrawingRef.current || !canvasRef.current) return;

      event.preventDefault();

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const newPosition = getPointerPosition(canvasRef.current, event);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPositionRef.current.x, lastPositionRef.current.y);
      ctx.lineTo(newPosition.x, newPosition.y);
      ctx.stroke();

      lastPositionRef.current = newPosition;
      checkReveal(ctx);
    },
    [brushSize, checkReveal, revealed],
  );

  const startDrawing = useCallback((event) => {
    if (revealed || !canvasRef.current) return;

    event.preventDefault();
    isDrawingRef.current = true;
    lastPositionRef.current = getPointerPosition(canvasRef.current, event);
  }, [revealed]);

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let cleanupImage;

    if (revealed) {
      ctx.clearRect(0, 0, width, height);
      autoRevealedRef.current = true;
    } else {
      autoRevealedRef.current = false;
      cleanupImage = loadScratchSurface(ctx, image, width, height, () => {});
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      cleanupImage?.();
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [draw, image, height, revealed, startDrawing, stopDrawing, width]);

  return (
    <div className="relative" style={{ width, height }}>
      <div className="absolute inset-0 z-0 overflow-hidden" style={{ width, height }}>
        {children}
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[1] touch-none"
        style={{ width, height }}
      />
    </div>
  );
}
