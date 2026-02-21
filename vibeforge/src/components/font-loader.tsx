"use client";

import { useEffect } from "react";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Noto+Serif:wght@400;700&family=Space+Mono:wght@400;700&family=VT323&family=Playfair+Display:wght@400;700&family=Fira+Code:wght@400;700&family=Quicksand:wght@400;700&family=Orbitron:wght@400;700&family=Inter:wght@400;500;600;700&display=swap";

export function FontLoader() {
  useEffect(() => {
    const existing = document.querySelector(`link[href="${GOOGLE_FONTS_URL}"]`);
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_URL;
    document.head.appendChild(link);
  }, []);

  return null;
}
