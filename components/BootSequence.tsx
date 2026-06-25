"use client";
import { useEffect, useRef } from "react";
import PCBBackground from "./PCBBackground";

const LOGO_FRAMES = 75;
const SPINNER_FRAMES = 75;
const LOGO_FPS = 60;
const SPINNER_FPS = 30;

export default function BootSequence() {
  const eyesCanvas = useRef<HTMLCanvasElement>(null);
  const spinnerCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const imgs = Array.from({ length: LOGO_FRAMES }, (_, i) => {
      const img = new Image();
      img.src = "/boot/eyes-" + i + ".png";
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
  }, []);

  useEffect(() => {
    const imgs = Array.from({ length: SPINNER_FRAMES }, (_, i) => {
      const img = new Image();
      img.src = "/boot/progress-" + i + ".png";
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
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 9999, overflow: "hidden" }}>
      <PCBBackground />
      <img
        src="/L3OS.png"
        alt="L3OS"
        style={{
          position: "absolute",
          top: "62%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "32%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <canvas
        ref={eyesCanvas}
        width={1920}
        height={1080}
        style={{
          position: "absolute",
          top: "-15%",
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
          bottom: "4%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "320px",
        }}
      />
    </div>
  );
}
