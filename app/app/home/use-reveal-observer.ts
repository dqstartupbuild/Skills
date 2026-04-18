"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RevealRefCallback } from "@/app/home/types";

export function useRevealObserver(): RevealRefCallback {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    revealRefs.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  return useCallback((element: HTMLElement | null) => {
    if (element && !revealRefs.current.includes(element)) {
      revealRefs.current.push(element);
      observerRef.current?.observe(element);
    }
  }, []);
}
