"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./KickstarterCountdown.module.css";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ@#$%&";
const TARGET = new Date("2026-07-01T00:00:00");

function pad(n: number) { return String(n).padStart(2, "0"); }
function rndChar() { return CHARS[Math.floor(Math.random() * CHARS.length)]; }

function useMatrixDigit(real: string, chaos: boolean) {
  const [display, setDisplay] = useState(real);
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stabilizeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startChaos = useCallback((target: string, duration: number) => {
    if (frameRef.current) clearInterval(frameRef.current);
    if (stabilizeRef.current) clearTimeout(stabilizeRef.current);

    frameRef.current = setInterval(() => {
      setDisplay(
        target.split("").map(() => rndChar()).join("")
      );
    }, 32);

    stabilizeRef.current = setTimeout(() => {
      if (frameRef.current) clearInterval(frameRef.current);
      let i = 0;
      const reveal = setInterval(() => {
        setDisplay(prev =>
          target.split("").map((c, idx) => idx <= i ? c : rndChar()).join("")
        );
        i++;
        if (i >= target.length) clearInterval(reveal);
      }, 80);
    }, duration);
  }, []);

  useEffect(() => {
    startChaos(real, 300);
  }, [real]);

  useEffect(() => {
    if (!chaos) return;
    startChaos(real, 800);
  }, [chaos]);

  useEffect(() => {
    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
      if (stabilizeRef.current) clearTimeout(stabilizeRef.current);
    };
  }, []);

  return display;
}

export default function KickstarterCountdown() {
  const [time, setTime] = useState({ d: "30", h: "00", m: "00", s: "00" });
  const [chaos, setChaos] = useState(false);

  // PENDIENTE DE ACTIVAR EL DIA DEL LANZAMIENTO REAL:
  // useEffect(() => {
  //   const tick = () => {
  //     const diff = Math.max(TARGET.getTime() - Date.now(), 0);
  //     setTime({
  //       d: pad(Math.floor(diff / 86400000)),
  //       h: pad(Math.floor((diff % 86400000) / 3600000)),
  //       m: pad(Math.floor((diff % 3600000) / 60000)),
  //       s: pad(Math.floor((diff % 60000) / 1000)),
  //     });
  //   };
  //   tick();
  //   const id = setInterval(tick, 1000);
  //   return () => clearInterval(id);
  // }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setChaos(true);
      setTimeout(() => setChaos(false), 100);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const days  = useMatrixDigit(time.d, chaos);
  const hours = useMatrixDigit(time.h, chaos);
  const mins  = useMatrixDigit(time.m, chaos);
  const secs  = useMatrixDigit(time.s, chaos);

  return (
    <div className={styles.wrap}>
      <div className={styles.counter}>
        <span className={styles.unit}><span className={styles.val}>{days}</span><span className={styles.tag}>D</span></span>
        <span className={styles.sep}>:</span>
        <span className={styles.unit}><span className={styles.val}>{hours}</span><span className={styles.tag}>H</span></span>
        <span className={styles.sep}>:</span>
        <span className={styles.unit}><span className={styles.val}>{mins}</span><span className={styles.tag}>M</span></span>
        <span className={styles.sep}>:</span>
        <span className={styles.unit}><span className={styles.val}>{secs}</span><span className={styles.tag}>S</span></span>
      </div>
    </div>
  );
}
