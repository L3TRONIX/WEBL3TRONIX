"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ@#$%&";

function rndChar() { return CHARS[Math.floor(Math.random() * CHARS.length)]; }

interface Props {
  text: string;
  className?: string;
  chaosDuration?: number;
  chaosInterval?: number;
  tag?: keyof React.JSX.IntrinsicElements;
}

export default function MatrixText({
  text,
  className,
  chaosDuration = 800,
  chaosInterval = 5000,
  tag: Tag = "span",
}: Props) {
  const [display, setDisplay] = useState(text);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stabilizeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runChaos = useCallback((target: string, duration: number) => {
    if (frameRef.current) clearInterval(frameRef.current);
    if (stabilizeRef.current) clearTimeout(stabilizeRef.current);

    frameRef.current = setInterval(() => {
      setDisplay(target.split("").map(c => c === " " || c === "\n" ? c : rndChar()).join(""));
    }, 32);

    stabilizeRef.current = setTimeout(() => {
      if (frameRef.current) clearInterval(frameRef.current);
      let i = 0;
      const reveal = setInterval(() => {
        setDisplay(
          target.split("").map((c, idx) =>
            c === " " || c === "\n" ? c : idx <= i ? c : rndChar()
          ).join("")
        );
        i++;
        if (i >= target.length) { clearInterval(reveal); setDisplay(target); }
      }, 60);
    }, duration);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      runChaos(text, chaosDuration);
    }
  }, [isVisible, text, chaosDuration]);

  useEffect(() => {
    if (!isVisible) return;
    
    intervalRef.current = setInterval(() => {
      runChaos(text, chaosDuration);
    }, chaosInterval);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVisible, text, chaosDuration, chaosInterval]);

  useEffect(() => {
    setDisplay(text);
  }, [text]);

  useEffect(() => {
    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
      if (stabilizeRef.current) clearTimeout(stabilizeRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return <Tag className={className}>{display}</Tag>;
}
