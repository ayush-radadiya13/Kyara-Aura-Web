"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothScrollProvider({ children }) {
  return (
    <ReactLenis
      root
      options={{
        anchors: true,
        autoRaf: true,
        lerp: 0.08,
        smoothWheel: true,
        syncTouch: true,
        touchMultiplier: 1.15,
        wheelMultiplier: 0.9,
      }}
    >
      {children}
    </ReactLenis>
  );
}
