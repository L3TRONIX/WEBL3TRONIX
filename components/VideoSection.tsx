"use client";

import { useEffect, useState, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useUser } from "@/lib/supabase/useUser";
import PCBBackground from "./PCBBackground";

export default function VideoSection() {
  const { locale } = useLanguage();
  const { tier } = useUser();
  const [visible, setVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const videoBase = process.env.NEXT_PUBLIC_VIDEO_BASE_URL;
  const src = locale === "es"
    ? `${videoBase}/presentacion_final.mp4`
    : `${videoBase}/presentacion_final_en.mp4`;

  useEffect(() => {
    const handleProgress = (e: Event) => {
      const p = (e as CustomEvent).detail;
      if (p >= 1) setVisible(true);
    };
    window.addEventListener("heroprogress", handleProgress);
    return () => window.removeEventListener("heroprogress", handleProgress);
  }, []);

  useEffect(() => {
    if (visible && videoRef.current) {
      videoRef.current.load();
      videoRef.current!.muted = true;
      videoRef.current.play().then(() => {
        videoRef.current?.pause();
        videoRef.current!.currentTime = 0;
        setIsReady(true);
      }).catch(() => {});
    }
  }, [visible]);

  const togglePlay = () => {
    if (!videoRef.current || !isReady) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.muted = isMuted;
      videoRef.current!.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const resetVideo = () => {
    if (!videoRef.current) return;
    videoRef.current!.currentTime = 0;
    videoRef.current.pause();
    setIsPlaying(false);
  };

  if (!visible) return null;

  return (
    <section style={{
      width: "100%",
      height: "100vh",
      background: "transparent",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    }}>
      <PCBBackground />
      <div style={{
        position: "relative",
        width: "100%",
        maxHeight: "100vh",
        aspectRatio: "3.2 / 1",
        background: "#000",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <video
        ref={videoRef}
        key={src}
        src={src}
        playsInline
        preload="auto"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
        onEnded={() => setIsPlaying(false)}
      />
      </div>
      
      <div style={{
        position: "absolute",
        bottom: "60px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "20px",
        zIndex: 10,
        background: "transparent",
        padding: "16px 32px",
        borderRadius: "4px",
        border: "none",
        backdropFilter: "none",
        animation: tier === 500 ? "btnPulse 2s ease-in-out infinite, btnGlitch 5s infinite" : undefined,
      }}>
        <button
          onClick={togglePlay}
          disabled={!isReady}
          style={{
            fontFamily: "'L3OS', sans-serif",
            fontSize: "14px",
            letterSpacing: "0.15em",
            padding: "8px 24px",
            background: isPlaying ? "rgba(0,255,153,0.2)" : "rgba(255,204,0,0.2)",
            border: "1px solid " + (isPlaying ? "var(--color-primary)" : "var(--color-accent)"),
            color: isPlaying ? "var(--color-primary)" : "var(--color-accent)",
            cursor: isReady ? "pointer" : "not-allowed",
            opacity: isReady ? 1 : 0.4,
            borderRadius: "2px",
            transition: "all 0.3s ease",
            textTransform: "uppercase",
          }}
          onMouseEnter={(e) => {
            if (!isReady) return;
            e.currentTarget.style.background = isPlaying ? "rgba(0,255,153,0.4)" : "rgba(255,204,0,0.4)";
          }}
          onMouseLeave={(e) => {
            if (!isReady) return;
            e.currentTarget.style.background = isPlaying ? "rgba(0,255,153,0.2)" : "rgba(255,204,0,0.2)";
          }}
        >
          {!isReady ? "⏳ LOADING" : isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
        </button>
        
        <button
          onClick={toggleMute}
          disabled={!isReady}
          style={{
            fontFamily: "'L3OS', sans-serif",
            fontSize: "14px",
            letterSpacing: "0.15em",
            padding: "8px 20px",
            background: isMuted ? "rgba(255,50,50,0.2)" : "rgba(0,255,153,0.2)",
            border: "1px solid " + (isMuted ? "#cc2200" : "var(--color-primary)"),
            color: isMuted ? "#cc2200" : "var(--color-primary)",
            cursor: isReady ? "pointer" : "not-allowed",
            opacity: isReady ? 1 : 0.4,
            borderRadius: "2px",
            transition: "all 0.3s ease",
            textTransform: "uppercase",
          }}
          onMouseEnter={(e) => {
            if (!isReady) return;
            e.currentTarget.style.background = isMuted ? "rgba(255,50,50,0.4)" : "rgba(0,255,153,0.4)";
          }}
          onMouseLeave={(e) => {
            if (!isReady) return;
            e.currentTarget.style.background = isMuted ? "rgba(255,50,50,0.2)" : "rgba(0,255,153,0.2)";
          }}
        >
          {isMuted ? "🔇 MUTE" : "🔊 UNMUTE"}
        </button>
        
        <button
          onClick={resetVideo}
          disabled={!isReady}
          style={{
            fontFamily: "'L3OS', sans-serif",
            fontSize: "14px",
            letterSpacing: "0.15em",
            padding: "8px 20px",
            background: tier === 500 ? (isPlaying ? "rgba(0,255,153,0.2)" : "rgba(255,204,0,0.2)") : "rgba(255,255,255,0.05)",
            border: "1px solid " + (tier === 500 ? (isPlaying ? "var(--color-primary)" : "var(--color-accent)") : "rgba(255,255,255,0.2)"),
            color: tier === 500 ? (isPlaying ? "var(--color-primary)" : "var(--color-accent)") : "rgba(255,255,255,0.7)",
            cursor: isReady ? "pointer" : "not-allowed",
            opacity: isReady ? 1 : 0.4,
            borderRadius: "2px",
            transition: "all 0.3s ease",
            textTransform: "uppercase",
          }}
          onMouseEnter={(e) => {
            if (!isReady) return;
            e.currentTarget.style.background = tier === 500 ? (isPlaying ? "rgba(0,255,153,0.4)" : "rgba(255,204,0,0.4)") : "rgba(255,255,255,0.15)";
          }}
          onMouseLeave={(e) => {
            if (!isReady) return;
            e.currentTarget.style.background = tier === 500 ? (isPlaying ? "rgba(0,255,153,0.2)" : "rgba(255,204,0,0.2)") : "rgba(255,255,255,0.05)";
          }}
        >
          ⟲ RESET
        </button>
      </div>
      <style>{`
        @keyframes btnPulse {
          0%, 100% { filter: drop-shadow(0 0 5px var(--color-accent)); }
          50% { filter: drop-shadow(0 0 1px var(--color-accent)); }
        }
        @keyframes btnGlitch {
          0%,80%,100% { transform: translateX(-50%) skewX(0deg); filter: drop-shadow(0 0 5px var(--color-accent)); }
          82% { transform: translateX(calc(-50% - 3px)) skewX(-4deg); filter: drop-shadow(-2px 0 var(--color-accent)) drop-shadow(2px 0 var(--color-primary)); }
          84% { transform: translateX(calc(-50% + 2px)) skewX(2deg); filter: none; }
          86% { transform: translateX(calc(-50% - 1px)) skewX(-1deg); filter: drop-shadow(2px 0 var(--color-accent)); }
          88% { transform: translateX(-50%) skewX(0deg); filter: drop-shadow(0 0 5px var(--color-accent)); }
        }
      `}</style>
    </section>
  );
}
