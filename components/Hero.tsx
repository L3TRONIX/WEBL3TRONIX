"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Hero.module.css";
import KickstarterCountdown from "./KickstarterCountdown";
import MatrixText from "./MatrixText";
import BootSequence from "./BootSequence";
import GlitchOverlay from "./GlitchOverlay";
import PCBBackground from "./PCBBackground";
import { useLanguage, Locale } from "../context/LanguageContext";
import AuthModal from "./AuthModal";
import { useUser } from "../lib/supabase/useUser";
import { createClient } from "../lib/supabase/client";

const LOCALES: Locale[] = ["en", "es"];
const KICKSTARTER_URL = "https://www.kickstarter.com";

const SCR = { l: 0.271, t: 0.287, w: 0.461, h: 0.374 };

export default function Hero() {
  const { locale, setLocale, t } = useLanguage();
  const [showHeadline, setShowHeadline] = useState(false);
  const [progress, setProgress] = useState(0);
  const [crtPhase, setCrtPhase] = useState(-1);
  const [bootActive, setBootActive] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const badgeCanvas = useRef<HTMLCanvasElement>(null);
  const badgeRaf = useRef<number>(0);
  const [cp, setCp] = useState<Record<string, number> | null>(null);
  const [splashDone, setSplashDone] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const audioUnlocked = useRef(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profileName, tier, founderNumber } = useUser();

  useEffect(() => {
    if (!splashDone) {
      document.body.style.overflow = "hidden";
      const block = (e: Event) => e.preventDefault();
      window.addEventListener("wheel", block, { passive: false });
      window.addEventListener("touchmove", block, { passive: false });
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("wheel", block);
        window.removeEventListener("touchmove", block);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [splashDone]);

  const handleSplash = () => {
    if (audioUnlocked.current) return;
    audioUnlocked.current = true;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    ctx.resume();
    setSplashVisible(false);
    setTimeout(() => setSplashDone(true), 600);
  };

  useEffect(() => {
    const handleProgress = (e: Event) => setProgress((e as CustomEvent).detail);
    window.addEventListener("heroprogress", handleProgress);
    return () => window.removeEventListener("heroprogress", handleProgress);
  }, []);

  const calcCp = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const naturalRatio = 1636 / 1124;
    let iw: number, ih: number, ix: number, iy: number;
    if (vw / vh > naturalRatio) {
      ih = vh; iw = ih * naturalRatio; ix = (vw - iw) / 2; iy = 0;
    } else {
      iw = vw; ih = iw / naturalRatio; ix = 0; iy = (vh - ih) / 2;
    }
    setCp({
      langLeft:   ix + iw * SCR.l,
      langTop:    iy + ih * SCR.t,
      countRight: vw - (ix + iw * (SCR.l + SCR.w)),
      countTop:   iy + ih * SCR.t,
      ctaTop:     iy + ih * (SCR.t + SCR.h * 0.58),
      subTop:     iy + ih * (SCR.t + SCR.h * 0.83),
      scrLeft:    ix + iw * SCR.l,
      scrTop:     iy + ih * SCR.t,
      scrWidth:   iw * SCR.w,
      scrHeight:  ih * SCR.h,
      ih:         ih,
    });
  };

  useEffect(() => {
    calcCp();
    window.addEventListener("resize", calcCp);
    return () => window.removeEventListener("resize", calcCp);
  }, []);

  useEffect(() => {
    const canvas = badgeCanvas.current;
    if (!canvas || !tier) return;
    cancelAnimationFrame(badgeRaf.current);

    if (tier === 200) {
      const FRAMES = 75, FPS = 30;
      const imgs = Array.from({ length: FRAMES }, (_, i) => {
        const img = new Image(); img.src = "/boot/progress-" + i + ".png"; return img;
      });
      let frame = 0, last = 0;
      const interval = 1000 / FPS;
      const tick = (ts: number) => {
        badgeRaf.current = requestAnimationFrame(tick);
        if (ts - last < interval) return;
        last = ts;
        const ctx = canvas.getContext("2d");
        if (!ctx || !imgs[frame].complete) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgs[frame], 0, 0, canvas.width, canvas.height);
        frame = (frame + 1) % FRAMES;
      };
      badgeRaf.current = requestAnimationFrame(tick);
    } else if (tier === 500) {
      const FRAMES = 75, FPS = 60;
      const imgs = Array.from({ length: FRAMES }, (_, i) => {
        const img = new Image(); img.src = "/boot/eyes-" + i + ".png"; return img;
      });
      let frame = 0, dir = 1, last = 0;
      const interval = 1000 / FPS;
      const tick = (ts: number) => {
        badgeRaf.current = requestAnimationFrame(tick);
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
      badgeRaf.current = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(badgeRaf.current);
  }, [tier]);



  const safeProgress = progress || 0;
  
  const ease = safeProgress < 0.5
    ? 2 * safeProgress * safeProgress
    : 1 - Math.pow(-2 * safeProgress + 2, 2) / 2;

  const scale = 1 + ease * 1.67;
  const uiOpacity = !splashDone ? 0 : Math.max(1 - safeProgress * 2, 0);
  const cutOpacity = ease > 0.85 ? (ease - 0.85) / 0.15 : 0;
  const subOpacity = Math.max(1 - cutOpacity, 0);

  useEffect(() => {
    if (cutOpacity >= 0.95 && crtPhase === -1) {
      setCrtPhase(1);
    } else if (cutOpacity < 0.9 && crtPhase === 1) {
      setCrtPhase(2);
      setTimeout(() => { setCrtPhase(-1); }, 400);
    }
    if (cutOpacity > 0) {
      if (!bootActive) {
        setBootActive(true);
      }
    } else {
      setBootActive(false);
    }
  }, [cutOpacity, crtPhase]);

  return (
    <section className={styles.hero} style={{ perspective: "800px", cursor: "pointer", visibility: progress >= 1 ? "hidden" : "visible" }} onClick={() => window.open(KICKSTARTER_URL, "_blank")}>
      <PCBBackground />
      <div className={styles.vignette} aria-hidden="true" />

      <div
        className={styles.consoleWrap}
        aria-hidden="true"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "50.15% 46.8%",
          willChange: "transform",
          isolation: "isolate",
          ["--ch" as any]: cp ? `${cp.ih}px` : "300px",
        } as React.CSSProperties}
      >
        <img ref={imgRef} src="/l3tronix-glow.png" alt="L3TRONIX" className={styles.consoleSvg} />

        {cp && <>
          {/* Franja superior pantalla: insignia + nombre + número */}
          {user && (
            <>
              {/* Insignia centrada */}
              <div style={{
                position: "absolute",
                left: cp.scrLeft + cp.scrWidth * 0.5,
                top: cp.scrTop - cp.scrHeight * 0.08,
                width: cp.scrHeight * 0.72,
                height: cp.scrHeight * 0.72,
                transform: "translateX(-50%)",
                zIndex: 20,
                opacity: uiOpacity,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {tier === 80 && (
                  <img src="/L3.png" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                )}
                {(tier === 200 || tier === 500) && (
                  <canvas
                    ref={badgeCanvas}
                    width={tier === 500 ? 1264 : 359}
                    height={tier === 500 ? 842 : 269}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )}
              </div>

              {/* Nombre izquierda */}
              <div style={{
                position: "absolute",
                left: cp.scrLeft + cp.scrWidth * 0.04,
                top: cp.scrTop + cp.scrHeight * 0.08,
                zIndex: 20,
                opacity: uiOpacity,
                pointerEvents: "none",
                textAlign: "left",
                fontFamily: "monospace",
                fontSize: `clamp(10px, ${cp.scrHeight * 0.045}px, 22px)`,
                color: "#ffcc00",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
                {profileName || user.email}
              </div>

              {/* Número de fundador derecha */}
              {founderNumber && (
                <div style={{
                  position: "absolute",
                  left: cp.scrLeft + cp.scrWidth * 0.96,
                  top: cp.scrTop + cp.scrHeight * 0.08,
                  width: cp.scrWidth * 0.22,
                  zIndex: 20,
                  opacity: uiOpacity,
                  pointerEvents: "none",
                  textAlign: "right",
                  transform: "translateX(-100%)",
                  fontFamily: "monospace",
                  fontSize: `clamp(10px, ${cp.scrHeight * 0.052}px, 24px)`,
                  color: "#00ffcc",
                  letterSpacing: "0.1em",
                }}>
                  #{String(founderNumber).padStart(4, "0")}
                </div>
              )}
            </>
          )}

          {/* CTA — sube al centro si no hay usuario con tier */}
          <div style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: (user && tier) ? cp.ctaTop : cp.scrTop + cp.scrHeight * 0.38,
            zIndex: 20,
            opacity: uiOpacity,
            textAlign: "center",
            pointerEvents: "none",
          }}>
            <MatrixText tag="p" className={styles.ctaHero} text={t.hero.cta} chaosInterval={8000} />
          </div>
        </>}
      </div>

      {/* Splash overlay */}
      {!splashDone && cp && (
        <>
          <div
            className={`${styles.splashOverlay} ${!splashVisible ? styles.splashOverlayHidden : ""}`}
            onClick={(e) => { e.stopPropagation(); handleSplash(); }}
            aria-hidden="true"
          />
          <div
            className={`${styles.splash} ${!splashVisible ? styles.splashHidden : ""}`}
            style={{
              left: cp.scrLeft,
              top: cp.scrTop,
              width: cp.scrWidth,
              height: cp.scrHeight,
            }}
            onClick={(e) => { e.stopPropagation(); handleSplash(); }}
          >
            <div className={styles.powerBtn}>⏻</div>
            <span className={styles.pressStart}>PRESS START</span>
          </div>
        </>
      )}

      {cp && (
        <div style={{ position:"fixed", left:0, right:0, top:cp.subTop, zIndex:20, opacity:subOpacity, textAlign:"center", pointerEvents:"none", transform:`scale(${1 + ease * 0.8})`, transformOrigin:"center center" }}>
          <MatrixText tag="p" className={styles.sub} text={t.hero.sub} chaosInterval={10000} />
        </div>
      )}

      {cutOpacity > 0 && (
        <div aria-hidden="true" style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          opacity: cutOpacity,
          zIndex: 60,
          pointerEvents: "none",
        }}>
          {(crtPhase === 1 || crtPhase === 2) && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 80% 15% at 50% 50%, #00ff99 0%, rgba(0,255,153,0.25) 50%, transparent 100%)",
              animation: crtPhase === 1 ? "crtFlash 0.35s ease-out forwards" : "crtFlashOut 0.35s ease-in forwards",
            }} />
          )}
        </div>
      )}

      <div className={styles.copy} style={{ opacity: uiOpacity }}>
        {showHeadline ? (
          <h1 className={styles.headline}>
            {t.hero.headline.split("\n").map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>
        ) : null}
      </div>

      {bootActive && <BootSequence />}
      <GlitchOverlay />
      <div style={{
          position: "fixed",
          top: "clamp(10px, 2vh, 20px)",
          right: "clamp(10px, 2vw, 24px)",
          zIndex: 100,
        }}>
        <KickstarterCountdown />
      </div>
      <div style={{
          position: "fixed",
          top: "clamp(10px, 2vh, 20px)",
          left: "clamp(10px, 2vw, 24px)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "clamp(6px, 1vw, 14px)",
        }}>
        <button
          style={{
            background: "transparent",
            border: "1px solid rgba(0,255,153,0.4)",
            color: "#00ff99",
            fontFamily: "monospace",
            fontSize: "clamp(10px, 1.2vw, 13px)",
            letterSpacing: "0.1em",
            padding: "clamp(3px, 0.5vh, 6px) clamp(8px, 1vw, 14px)",
            cursor: "pointer",
            maxWidth: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          onClick={async (e) => {
            e.stopPropagation();
            if (user) {
              const supabase = createClient();
              await supabase.auth.signOut();
            } else {
              setShowAuthModal(true);
            }
          }}
        >
          {user ? `${profileName || user.email} · LOGOUT` : "LOGIN"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {LOCALES.map((l, i) => (
            <span key={l} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button
                className={l === locale ? styles.langActive : styles.langBtn}
                onClick={(e) => { e.stopPropagation(); setLocale(l); }}
              >{l.toUpperCase()}</button>
              {i < LOCALES.length - 1 && <span className={styles.langSep}>·</span>}
            </span>
          ))}
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <div className={styles.scrollHint} style={{ opacity: uiOpacity }} aria-hidden="true">
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
