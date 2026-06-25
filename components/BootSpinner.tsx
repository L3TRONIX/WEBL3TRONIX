"use client";

import { useEffect, useState } from "react";

const TOTAL = 75;
const FPS = 30;

export default function BootSpinner() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrame(f => (f + 1) % TOTAL);
    }, 1000 / FPS);
    return () => clearInterval(id);
  }, []);

  return (
    <img
      src={`/boot/progress-${frame}.png`}
      alt="Loading"
      style={{
        width: "clamp(280px, 40vw, 560px)",
        height: "auto",
        imageRendering: "auto",
        pointerEvents: "none",
      marginTop: "40px",
      }}
    />
  );
}
