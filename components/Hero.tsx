"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Hero.module.css";
import KickstarterCountdown from "./KickstarterCountdown";
import MatrixText from "./MatrixText";
import BootSequence from "./BootSequence";
import PCBBackground from "./PCBBackground";
import GlitchOverlay from "./GlitchOverlay";
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
  const bootDone = useRef(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [cp, setCp] = useState<Record<string, number> | null>(null);
  const [splashDone, setSplashDone] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const audioUnlocked = useRef(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profileName } = useUser();

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
      ctaTop:     iy + ih * (SCR.t + SCR.h * 0.45),
      subTop:     iy + ih * (SCR.t + SCR.h * 0.83),
      scrLeft:    ix + iw * SCR.l,
      scrTop:     iy + ih * SCR.t,
      scrWidth:   iw * SCR.w,
      scrHeight:  ih * SCR.h,
    });
  };

  useEffect(() => {
    calcCp();
    window.addEventListener("resize", calcCp);
    return () => window.removeEventListener("resize", calcCp);
  }, []);

  const handleBootReady = () => {
    bootDone.current = true;
    setBootActive(false);
    window.dispatchEvent(new CustomEvent("bootready"));
  };

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
    if (cutOpacity >= 0.95) {
      if (!bootActive && !bootDone.current) {
        setTimeout(() => setBootActive(true), 350);
      }
    } else if (cutOpacity < 0.9) {
      setBootActive(false);
      bootDone.current = false;
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
        }}
      >
        <img ref={imgRef} src="/l3tronix-glow.png" alt="L3TRONIX" className={styles.consoleSvg} />

        {cp && <>
          <div
            className={styles.langToggle}
            style={{ left: cp.langLeft, top: cp.langTop, opacity: uiOpacity }}
          >
            {LOCALES.map((l, i) => (
              <span key={l}>
                <button
                  className={l === locale ? styles.langActive : styles.langBtn}
                  onClick={(e) => { e.stopPropagation(); setLocale(l); }}
                >{l.toUpperCase()}</button>
                {i < LOCALES.length - 1 && <span className={styles.langSep}>·</span>}
              </span>
            ))}
          </div>
          <div
            className={styles.countdown}
            style={{ right: cp.countRight, top: cp.countTop, opacity: uiOpacity }}
          >
            <KickstarterCountdown />
          </div>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (user) {
                const supabase = createClient();
                await supabase.auth.signOut();
              } else {
                setShowAuthModal(true);
              }
            }}
            style={{
              position: "absolute",
              left: cp.langLeft,
              top: cp.langTop + 28,
              opacity: uiOpacity,
              background: "transparent",
              border: "1px solid rgba(0,255,153,0.4)",
              color: "#00ff99",
              fontFamily: "monospace",
              fontSize: "11px",
              letterSpacing: "0.1em",
              padding: "4px 10px",
              cursor: "pointer",
              zIndex: 20,
              maxWidth: "160px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user ? `${profileName || user.email} · LOGOUT` : "LOGIN"}
          </button>
          <div style={{ position:"absolute", left:0, right:0, top:cp.ctaTop, zIndex:20, opacity:uiOpacity, textAlign:"center", pointerEvents:"none" }}>
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

      {bootActive && <BootSequence onBootReady={handleBootReady} />}
      <GlitchOverlay />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <div className={styles.scrollHint} style={{ opacity: uiOpacity }} aria-hidden="true">
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
