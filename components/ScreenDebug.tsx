"use client";

import { useState, useRef } from "react";

type Corner = { id: string; x: number; y: number; label: string };

const INITIAL: Corner[] = [
  { id: "TL", x: 25.8, y: 23,   label: "↘" },
  { id: "TR", x: 73.9, y: 23,   label: "↙" },
  { id: "BL", x: 25.8, y: 64.5, label: "↗" },
  { id: "BR", x: 73.9, y: 64.5, label: "↖" },
];

export default function ScreenDebug() {
  const [corners, setCorners] = useState<Corner[]>(INITIAL);
  const dragging = useRef<string | null>(null);

  const onMouseDown = (id: string) => { dragging.current = id; };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCorners(prev => prev.map(c => c.id === dragging.current ? { ...c, x, y } : c));
  };

  const onMouseUp = () => { dragging.current = null; };

  return (
    <div
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{ position: "absolute", inset: 0, zIndex: 9998 }}
    >
      {corners.map(c => (
        <div
          key={c.id}
          onMouseDown={() => onMouseDown(c.id)}
          style={{
            position: "absolute",
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: 28,
            height: 28,
            cursor: "grab",
            userSelect: "none",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div style={{
            position: "absolute", inset: 0,
            borderTop: c.id.startsWith("T") ? "3px solid #ff0000" : undefined,
            borderBottom: c.id.startsWith("B") ? "3px solid #ff0000" : undefined,
            borderLeft: c.id.endsWith("L") ? "3px solid #ff0000" : undefined,
            borderRight: c.id.endsWith("R") ? "3px solid #ff0000" : undefined,
          }} />
          <span style={{ position: "absolute", top: -18, left: 0, color: "#ff0000", fontSize: 10, fontFamily: "monospace", whiteSpace: "nowrap" }}>
            {c.id} {c.x.toFixed(1)}% {c.y.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}
