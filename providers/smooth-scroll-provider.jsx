"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothScrollProvider({ children }) {
  return (
    <ReactLenis
      root
      options={{
        anchors: true,
        autoResize: true,
        autoRaf: true,
        allowNestedScroll: true,
        lerp: 0.08,
        overscroll: false,
        prevent: (node) => node.closest?.("[data-lenis-prevent]") !== null,
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1.15,
        wheelMultiplier: 0.9,
      }}
    >
      {children}
    </ReactLenis>
  );
}
