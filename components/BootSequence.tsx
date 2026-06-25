"use client";
import { useEffect, useState, useRef } from "react";

const LOGO_FRAMES = 75;
const SPINNER_FRAMES = 75;
const LOGO_FPS = 30;
const SPINNER_FPS = 30;

export default function BootSequence({ onBootReady }: { onBootReady?: () => void }) {
  const [phase, setPhase] = useState(0);
  const [logoFrame, setLogoFrame] = useState(0);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const readyCalled = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 2800);
    const t3 = setTimeout(() => setPhase(3), 3800);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  }, []);

  // Animar ojos ping-pong
  useEffect(() => {
    if (phase !== 2 && phase !== 3) return;
    const dir = { val: 1 };
    const interval = setInterval(() => {
      setLogoFrame(f => {
        const next = f + dir.val;
        if (next >= LOGO_FRAMES - 1) {
          dir.val = -1;
          return LOGO_FRAMES - 1;
        }
        if (next <= 0) { dir.val = 1; return 0; }
        return next;
      });
    }, 1000 / LOGO_FPS);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (logoFrame === LOGO_FRAMES - 1 && !readyCalled.current) {
      readyCalled.current = true;
      onBootReady?.();
    }
  }, [logoFrame]);

  // Animar spinner en loop
  useEffect(() => {
    if (phase < 1) return;
    const interval = setInterval(() => {
      setSpinnerFrame(f => (f + 1) % SPINNER_FRAMES);
    }, 1000 / SPINNER_FPS);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 9999, overflow: "hidden" }}>

      {phase >= 3 && <img
        src="/L3OS.png"
        alt="L3OS"
        style={{
          position: "absolute",
          top: "62%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "32%",
          opacity: 1,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />}

      {(phase === 2 || phase === 3) && (
        <img
          src={"/boot/eyes-" + logoFrame + ".png"}
          alt=""
          style={{
            position: "absolute",
            top: "-15%",
            left: "50%",
            transform: "translateX(-50%) scaleX(1.3)",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            mixBlendMode: "screen",
            opacity: 1,
          }}
        />
      )}

      {phase >= 1 && (
        <img
          src={"/boot/progress-" + spinnerFrame + ".png"}
          alt=""
          style={{
            position: "absolute",
            bottom: "4%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "320px",
            opacity: 1,
          }}
        />
      )}
    </div>
  );
}
