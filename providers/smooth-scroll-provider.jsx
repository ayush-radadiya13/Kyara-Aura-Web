"use client";

import { useEffect, useMemo, useState } from "react";
import { ReactLenis } from "lenis/react";

export default function SmoothScrollProvider({ children }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  const options = useMemo(
    () => ({
      anchors: {
        offset: -104,
        duration: 1.1,
      },
      autoResize: true,
      autoRaf: true,
      lerp: prefersReducedMotion ? 1 : 0.12,
      overscroll: false,
      prevent: (node) =>
        node.closest?.(
          "[data-lenis-prevent], [data-lenis-prevent-wheel], [data-lenis-prevent-touch], textarea, select, [contenteditable='true']",
        ) !== null,
      smoothWheel: !prefersReducedMotion,
      stopInertiaOnNavigate: true,
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 1,
    }),
    [prefersReducedMotion],
  );

  return (
    <ReactLenis
      root
      options={options}
    >
      {children}
    </ReactLenis>
  );
}
