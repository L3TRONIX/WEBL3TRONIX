"use client";

import { useEffect, useRef } from "react";

export default function TierBadgeSpinner({ tier, size = 38 }: { tier: number; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    cancelAnimationFrame(rafRef.current);

    if (tier === 200) {
      const FRAMES = 75, FPS = 30;
      const imgs = Array.from({ length: FRAMES }, (_, i) => {
        const img = new Image(); img.src = "/boot/progress-" + i + ".png"; return img;
      });
      let frame = 0, last = 0;
      const interval = 1000 / FPS;
      const tick = (ts: number) => {
        rafRef.current = requestAnimationFrame(tick);
        if (ts - last < interval) return;
        last = ts;
        const ctx = canvas.getContext("2d");
        if (!ctx || !imgs[frame].complete) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgs[frame], 0, 0, canvas.width, canvas.height);
        frame = (frame + 1) % FRAMES;
      };
      rafRef.current = requestAnimationFrame(tick);
    } else if (tier === 500) {
      const FRAMES = 75, FPS = 60;
      const imgs = Array.from({ length: FRAMES }, (_, i) => {
        const img = new Image(); img.src = "/boot-gifneo/eyes-" + i + ".png"; return img;
      });
      let frame = 0, dir = 1, last = 0;
      const interval = 1000 / FPS;
      const tick = (ts: number) => {
        rafRef.current = requestAnimationFrame(tick);
        if (ts - last < interval) return;
        last = ts;
        const ctx = canvas.getContext("2d");
        if (!ctx || !imgs[frame].complete) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgs[frame], 0, 0, canvas.width, canvas.height);
        frame += dir;
        if (frame >= FRAMES - 1) { dir = -1; frame = FRAMES - 1; }
        if (frame <= 0) { dir = 1; frame = 0; }
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [tier]);

  if (tier === 80) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/L3.png" alt="L3TRONIX" width={size} height={size} style={{ width: size, height: size, objectFit: "contain" }} />;
  }

  // Tier sin badge asignado todavia -> no se renderiza nada
  if (tier !== 200 && tier !== 500) return null;

  return <canvas ref={canvasRef} width={size} height={size} style={{ width: size, height: size }} />;
}
