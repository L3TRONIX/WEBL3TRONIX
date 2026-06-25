"use client";
import { useEffect, useRef } from "react";

export default function ScrollFade({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const total = ref.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.min(Math.max(scrolled / total, 0), 1);
      window.dispatchEvent(new CustomEvent("heroprogress", { detail: p }));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={ref} style={{ height: "300vh" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh" }}>
        {children}
      </div>
    </div>
  );
}
