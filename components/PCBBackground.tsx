"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@/lib/supabase/useUser";

export default function PCBBackground({ fixed = false }: { fixed?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tier } = useUser();
  const isGifneo = tier === 500;
  const PCB_COLOR = isGifneo ? "rgba(255,0,255,0.28)" : "rgba(0,255,153,0.28)";
  const PCB_GOLD  = isGifneo ? "rgba(255,0,255,0.11)" : "rgba(255,204,0,0.11)";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const GRID = 40;
    const COLOR_GREEN = PCB_COLOR;
    const COLOR_GOLD  = PCB_GOLD;
    const NODE_COLOR  = PCB_COLOR;

    type Line = { x1:number; y1:number; x2:number; y2:number; color:string; pulse:number; speed:number };
    type Node = { x:number; y:number; r:number; pulse:number; speed:number };

    const lines: Line[] = [];
    const nodes: Node[] = [];

    for (let x = 0; x < w; x += GRID) {
      for (let y = 0; y < h; y += GRID) {
        if (Math.random() > 0.5) {
          const horiz = Math.random() > 0.5;
          lines.push({
            x1: x, y1: y,
            x2: horiz ? x + GRID : x,
            y2: horiz ? y : y + GRID,
            color: Math.random() > 0.5 ? COLOR_GREEN : COLOR_GOLD,
            pulse: Math.random() * Math.PI * 2,
            speed: 0.008 + Math.random() * 0.012,
          });
        }
        if (Math.random() > 0.85) {
          nodes.push({ x, y, r: 2, pulse: Math.random() * Math.PI * 2, speed: 0.01 + Math.random() * 0.02 });
        }
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const l of lines) {
        l.pulse += l.speed;
        const alpha = 0.25 + 0.55 * Math.abs(Math.sin(l.pulse));
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
      }
      for (const n of nodes) {
        n.pulse += n.speed;
        const alpha = 0.2 + 0.55 * Math.abs(Math.sin(n.pulse));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = NODE_COLOR;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, [tier]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: fixed ? "fixed" : "absolute", inset:0, zIndex:0, pointerEvents:"none" }}
    />
  );
}
