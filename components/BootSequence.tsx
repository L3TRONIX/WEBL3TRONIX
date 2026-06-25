"use client";
import { useEffect, useRef } from "react";
import { useUser } from "../lib/supabase/useUser";
import PCBBackground from "./PCBBackground";

const LOGO_FRAMES = 75;
const SPINNER_FRAMES = 75;
const LOGO_FPS = 60;
const SPINNER_FPS = 30;

export default function BootSequence() {
  const { tier } = useUser();
  const eyesCanvas = useRef<HTMLCanvasElement>(null);
  const spinnerCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const imgs = Array.from({ length: LOGO_FRAMES }, (_, i) => {
      const img = new Image();
      img.src = (tier === 500 ? "/boot-hivemag/eyes-" : "/boot/eyes-") + i + ".png";
      return img;
    });
    let frame = 0;
    let dir = 1;
    let last = 0;
    let raf: number;
    const interval = 1000 / LOGO_FPS;
    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      if (ts - last < interval) return;
      last = ts;
      const canvas = eyesCanvas.current;
      if (!canvas) return;
      const img = imgs[frame];
      if (!img.complete) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      frame += dir;
      if (frame >= LOGO_FRAMES - 1) { dir = -1; frame = LOGO_FRAMES - 1; }
      if (frame <= 0) { dir = 1; frame = 0; }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tier]);

  useEffect(() => {
    const imgs = Array.from({ length: SPINNER_FRAMES }, (_, i) => {
      const img = new Image();
      img.src = (tier === 500 ? "/boot-hivemag-spinner/progress-" : "/boot/progress-") + i + ".png";
      return img;
    });
    let frame = 0;
    let last = 0;
    let raf: number;
    const interval = 1000 / SPINNER_FPS;
    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      if (ts - last < interval) return;
      last = ts;
      const canvas = spinnerCanvas.current;
      if (!canvas) return;
      const img = imgs[frame];
      if (!img.complete) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      frame = (frame + 1) % SPINNER_FRAMES;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tier]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 9999, overflow: "hidden" }}>
      <PCBBackground />
      <img
        src={tier === 500 ? "/L3OS-gifneo.png" : "/L3OS.png"}
        alt="L3OS"
        style={{
          position: "absolute",
          top: "54%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "32%",
          zIndex: 0,
          pointerEvents: "none",
          animation: tier === 500 ? "logoPulse 2s ease-in-out infinite, logoGlitch 5s infinite" : undefined,
        }}
      />
      <canvas
        ref={eyesCanvas}
        width={1920}
        height={1080}
        style={{
          position: "absolute",
          top: "-25%",
          left: "50%",
          transform: "translateX(-50%) scaleX(1.3)",
          width: "100%",
          height: "100%",
          mixBlendMode: "screen",
        }}
      />
      <canvas
        ref={spinnerCanvas}
        width={320}
        height={320}
        style={{
          position: "absolute",
          bottom: "-5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "34vw", minWidth: "200px", maxWidth: "640px",
        }}
      />
      <style>{`
        @keyframes logoPulse {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 5px var(--color-accent)); }
          50% { opacity: 0.85; filter: drop-shadow(0 0 1px var(--color-accent)); }
        }
        @keyframes logoGlitch {
          0%,80%,100% { transform: translate(-50%,-50%) skewX(0deg); filter: drop-shadow(0 0 10px var(--color-accent)); }
          82% { transform: translate(calc(-50% - 3px), calc(-50% + 1px)) skewX(-4deg); filter: drop-shadow(-2px 0 var(--color-accent)) drop-shadow(2px 0 var(--color-primary)); }
          84% { transform: translate(calc(-50% + 2px), calc(-50% - 1px)) skewX(2deg); filter: none; }
          86% { transform: translate(calc(-50% - 1px), calc(-50% + 2px)) skewX(-1deg); filter: drop-shadow(2px 0 var(--color-accent)); }
          88% { transform: translate(-50%,-50%) skewX(0deg); filter: drop-shadow(0 0 10px var(--color-accent)); }
        }
      `}</style>
    </div>
  );
}
