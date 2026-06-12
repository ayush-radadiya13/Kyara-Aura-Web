"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";

let activeLocks = 0;
let previousBodyOverflow = "";
let previousDocumentOverflow = "";

export function useScrollLock(locked) {
  const lenis = useLenis();

  useEffect(() => {
    if (!locked) return undefined;

    const { body, documentElement } = document;

    if (activeLocks === 0) {
      previousBodyOverflow = body.style.overflow;
      previousDocumentOverflow = documentElement.style.overflow;
      body.style.overflow = "hidden";
      documentElement.style.overflow = "hidden";
      lenis?.stop();
    }

    activeLocks += 1;

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);

      if (activeLocks === 0) {
        body.style.overflow = previousBodyOverflow;
        documentElement.style.overflow = previousDocumentOverflow;
        lenis?.resize();
        lenis?.start();
      }
    };
  }, [lenis, locked]);
}
