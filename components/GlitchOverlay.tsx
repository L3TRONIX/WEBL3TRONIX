"use client";

import { useEffect, useState } from "react";

export default function GlitchOverlay() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setActive(true);
      setTimeout(() => setActive(false), 300);
    }, 15000);
    return () => clearInterval(id);
  }, []);

  if (!active) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      pointerEvents: "none",
      animation: "glitchBurst 0.3s steps(1) forwards",
    }}>
      <style>{`
        @keyframes glitchBurst {
          0%   { opacity:1; transform: translate(0,0) skewX(0deg); background: transparent; }
          10%  { transform: translate(-4px, 2px) skewX(-3deg); background: rgba(0,255,204,0.04); }
          20%  { transform: translate(4px, -2px) skewX(3deg);  background: rgba(204,34,0,0.04); }
          30%  { transform: translate(-6px, 0px) skewX(0deg);  background: transparent; }
          40%  { transform: translate(3px, 3px) skewX(-2deg);  background: rgba(0,255,153,0.03); }
          50%  { transform: translate(0,0) skewX(0deg); background: rgba(255,204,0,0.02); }
          60%  { transform: translate(-3px,-3px) skewX(2deg);  background: rgba(204,34,0,0.05); }
          70%  { transform: translate(5px, 1px) skewX(-1deg);  background: transparent; }
          80%  { transform: translate(-2px, 4px) skewX(1deg);  background: rgba(0,255,204,0.03); }
          90%  { transform: translate(2px,-1px) skewX(0deg);   background: transparent; }
          100% { opacity:0; transform: translate(0,0) skewX(0deg); }
        }
      `}</style>
      <div style={{
        position:"absolute", inset:0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,153,0.03) 3px, rgba(0,255,153,0.03) 4px)",
      }} />
    </div>
  );
}
