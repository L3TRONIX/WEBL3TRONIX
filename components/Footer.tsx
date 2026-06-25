"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useUser } from "@/lib/supabase/useUser";
import { useLanguage } from "../context/LanguageContext";

// ── Hook responsive ────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ── Estilos base reutilizables ──────────────────────────────────────────────
const BORDER = "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)";
const BG_PANEL = "color-mix(in srgb, var(--color-primary) 2%, transparent)";
const COLOR_GREEN = "var(--color-primary)";
const COLOR_YELLOW = "var(--color-accent)";
const FONT_MONO = "'Courier New', monospace";

// ── Componente TopBar ───────────────────────────────────────────────────────
function TopBar({ activeTab, setActiveTab }: { activeTab: "signal" | "founders"; setActiveTab: (t: "signal" | "founders") => void }) {
  const { t } = useLanguage();
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "clamp(12px, 2vw, 20px) clamp(16px, 2.5vw, 30px)",
      borderTop: BORDER,
      borderLeft: BORDER,
      borderRight: BORDER,
      background: BG_PANEL,
      borderRadius: "2px",
    }}>
      <div style={{ display: "flex", gap: "clamp(16px, 2vw, 32px)", alignItems: "center" }}>
        {(["signal", "founders"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT_MONO,
              fontSize: "clamp(16px, 1.7vw, 26px)",
              fontWeight: "700",
              letterSpacing: "0.15em",
              color: activeTab === tab ? COLOR_YELLOW : COLOR_GREEN,
              borderBottom: activeTab === tab ? `2px solid ${COLOR_YELLOW}` : "2px solid transparent",
              paddingBottom: "4px",
              transition: "color 0.2s, border-color 0.2s",
            }}
          >
            ⎔ {t.footer.tabs[tab]}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 1vw, 16px)" }}>
        <span style={{
          fontSize: "clamp(11px, 0.8vw, 14px)",
          color: COLOR_YELLOW,
          letterSpacing: "0.1em",
        }}>
          {t.footer.topbar.system}
        </span>
        <span style={{
          display: "inline-block",
          width: "clamp(6px, 0.8vw, 10px)",
          height: "clamp(6px, 0.8vw, 10px)",
          background: COLOR_GREEN,
          borderRadius: "50%",
          boxShadow: "0 0 20px var(--color-primary-dim)",
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
        <span style={{
          fontSize: "clamp(11px, 0.8vw, 14px)",
          color: COLOR_GREEN,
          letterSpacing: "0.05em",
        }}>
          {t.footer.topbar.online}
        </span>
      </div>
    </div>
  );
}

// ── Componente Terminal ─────────────────────────────────────────────────────
function Terminal({ unlocked, setUnlocked }: {
  unlocked: { tier: number; content: string } | null;
  setUnlocked: (v: { tier: number; content: string } | null) => void;
  onHistoryUpdate?: (history: string[]) => void;
}) {
  const { t } = useLanguage();
  const [state, setState] = useState({
    command: "",
    output: [...t.footer.terminal.welcome],
    history: [] as string[],
    historyIndex: -1,
  });

  const executeCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    setState(prev => {
      let response: string[] = [];

      switch (trimmed) {
        case "help":
          response = t.footer.terminal.commands.help;
          break;
        case "status":
          response = t.footer.terminal.commands.status;
          break;
        case "version":
          response = t.footer.terminal.commands.version;
          break;
        case "backers":
          response = t.footer.terminal.commands.backers;
          break;
        case "funded":
          response = t.footer.terminal.commands.funded;
          break;
        case "uptime":
          response = t.footer.terminal.commands.uptime;
          break;
        case "clear":
          return { ...prev, output: [], command: "" };
        case "whoami":
          response = t.footer.terminal.commands.whoami;
          break;
        default:
          if (trimmed.startsWith("unlock ")) {
            const code = trimmed.replace("unlock ", "").trim().toUpperCase();
            fetch("/api/unlock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            })
              .then(r => r.json())
              .then(data => {
                if (data.valid) {
                  setUnlocked({ tier: data.tier, content: data.content });
                  setState(p => ({ ...p, output: [...p.output, "$ unlock ****", t.footer.terminal.commands.unlockGranted.replace("{tier}", String(data.tier)), t.footer.terminal.commands.unlockedMsg, ""] }));
                } else {
                  setState(p => ({ ...p, output: [...p.output, "$ unlock ****", data.message || t.footer.terminal.commands.unlockInvalid, ""] }));
                }
              });
            return { ...prev, output: [...prev.output, "$ unlock ****", t.footer.terminal.commands.unlockChecking, ""], history: [...prev.history, trimmed], historyIndex: -1, command: "" };
          }
          response = [t.footer.terminal.commands.unknown.replace("{cmd}", trimmed)];
          break;
      }

      const newOutput = [...prev.output, `$ ${trimmed}`, ...response, ""];
      if (newOutput.length > 20) newOutput.splice(0, newOutput.length - 20);
      const newHistory = [...prev.history, trimmed];
      if (newHistory.length > 10) newHistory.shift();
      return { ...prev, output: newOutput, history: newHistory, historyIndex: -1 };
    });
  }, [setUnlocked, t]);

  useEffect(() => {
    const handler = (e: Event) => {
      const cmd = (e as CustomEvent).detail;
      if (cmd) executeCommand(cmd);
    };
    window.addEventListener("terminalcommand", handler);
    return () => window.removeEventListener("terminalcommand", handler);
  }, [executeCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(state.command);
      setState(prev => ({ ...prev, command: "" }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setState(prev => {
        if (!prev.history.length) return prev;
        const newIndex = prev.historyIndex < prev.history.length - 1 ? prev.historyIndex + 1 : prev.historyIndex;
        return { ...prev, historyIndex: newIndex, command: prev.history[prev.history.length - 1 - newIndex] || "" };
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setState(prev => {
        if (prev.historyIndex > 0) {
          const newIndex = prev.historyIndex - 1;
          return { ...prev, historyIndex: newIndex, command: prev.history[prev.history.length - 1 - newIndex] || "" };
        }
        return { ...prev, historyIndex: -1, command: "" };
      });
    }
  }, [state.command, executeCommand]);

  return (
    <div style={{ padding: "clamp(14px, 1.5vw, 20px)", background: BG_PANEL, display: "flex", flexDirection: "column", minHeight: "clamp(240px, 25vw, 340px)" }}>
      <div style={{ fontSize: "clamp(22px, 1.6vw, 28px)", color: COLOR_GREEN, letterSpacing: "0.15em", marginBottom: "12px" }}>⎔ {t.footer.terminal.title}</div>
      <div style={{ flex: 1, overflowY: "auto", fontFamily: FONT_MONO, fontSize: "clamp(18px, 1.35vw, 22px)", lineHeight: "1.5", color: COLOR_GREEN }}>
        {state.output.map((line, i) => (
          <div key={i} style={{ color: line.startsWith("$") ? COLOR_GREEN : line.startsWith(t.footer.terminal.commands.unknown.split(":")[0]) ? "#cc2200" : COLOR_YELLOW, opacity: line.startsWith("$") ? 0.9 : 0.8 }}>{line}</div>
        ))}
        <span style={{ display: "inline-block", width: "8px", height: "1em", background: COLOR_GREEN, animation: "blink 1s step-end infinite", verticalAlign: "text-bottom" }} />
      </div>

    </div>
  );
}

// ── Componente Updates ──────────────────────────────────────────────────────
function Updates() {
  const { t, locale } = useLanguage();
  const [updates, setUpdates] = useState<{ title: string; published_at: string; body: string; title_en: string | null; body_en: string | null }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const supabase = (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      return createClient();
    })();
    supabase.then(client =>
      client.from("updates").select("title, published_at, body, title_en, body_en").order("published_at", { ascending: false }).limit(5)
    ).then(({ data }) => {
      if (data) setUpdates(data);
    });
  }, []);

  return (
    <div style={{ padding: "clamp(14px, 1.5vw, 20px)", background: BG_PANEL, display: "flex", flexDirection: "column", minHeight: "clamp(240px, 25vw, 340px)" }}>
      <div style={{ fontSize: "clamp(22px, 1.6vw, 28px)", color: COLOR_YELLOW, letterSpacing: "0.15em", marginBottom: "16px" }}>📡 {t.footer.updates.title}</div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "clamp(8px, 1vw, 12px)" }}>
        {selected === null ? (
          <>
            {updates.map((u, i) => (
              <div key={i} onClick={() => setSelected(i)} style={{ padding: "clamp(8px, 1vw, 12px) clamp(10px, 1.2vw, 14px)", borderLeft: "2px solid var(--color-primary-dim)", background: "rgba(255,255,255,0.02)", borderRadius: "2px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "clamp(13px, 1.0vw, 16px)", color: COLOR_GREEN, fontWeight: "600" }}>{locale === "en" && u.title_en ? u.title_en : u.title}</span>
                <span style={{ fontSize: "clamp(11px, 0.8vw, 14px)", color: COLOR_YELLOW, whiteSpace: "nowrap", marginLeft: "8px" }}>{u.published_at}</span>
              </div>
            ))}
            {updates.length === 0 && (
              <div style={{ fontSize: "clamp(11px, 0.8vw, 14px)", color: "var(--color-primary-dimmer)", fontFamily: FONT_MONO }}>{t.footer.updates.empty}</div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 1.2vw, 16px)" }}>
            <div onClick={() => setSelected(null)} style={{ fontSize: "clamp(11px, 0.8vw, 14px)", color: COLOR_GREEN, cursor: "pointer", letterSpacing: "0.1em", fontFamily: FONT_MONO }}>← {locale === "en" ? "BACK" : "VOLVER"}</div>
            <div style={{ fontSize: "clamp(14px, 1.1vw, 18px)", color: COLOR_GREEN, fontWeight: "600" }}>{locale === "en" && updates[selected].title_en ? updates[selected].title_en : updates[selected].title}</div>
            <div style={{ fontSize: "clamp(11px, 0.8vw, 14px)", color: COLOR_YELLOW }}>{updates[selected].published_at}</div>
            <div style={{ fontSize: "clamp(13px, 1.0vw, 16px)", color: COLOR_YELLOW, lineHeight: "1.7" }}>{locale === "en" && updates[selected].body_en ? updates[selected].body_en : updates[selected].body}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente Telemetría ───────────────────────────────────────────────────
function Telemetry() {
  const { t } = useLanguage();
  return (
    <div style={{ padding: "clamp(14px, 1.5vw, 20px)", background: BG_PANEL, minHeight: "clamp(240px, 25vw, 340px)" }}>
      <div style={{ fontSize: "clamp(22px, 1.6vw, 28px)", color: COLOR_YELLOW, letterSpacing: "0.15em", marginBottom: "16px" }}>📡 {t.footer.telemetry.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 2vw, 28px)" }}>
        {[
          { label: t.footer.telemetry.labels.backers, value: "142", color: COLOR_GREEN },
          { label: t.footer.telemetry.labels.funded, value: "47%", color: COLOR_GREEN },
          { label: t.footer.telemetry.labels.version, value: "v0.1.0", color: COLOR_GREEN },
          { label: t.footer.telemetry.labels.uptime, value: "37d 14h", color: COLOR_GREEN },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "clamp(16px, 1.4vw, 22px)", color: item.color }}>{item.label}</span>
            <span style={{ fontSize: "clamp(16px, 1.4vw, 22px)", color: COLOR_YELLOW }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Componente FoundersPanel ───────────────────────────────────────────────
function FoundersPanel() {
  const { t } = useLanguage();
  return (
    <div style={{
      padding: "clamp(14px, 1.5vw, 20px)",
      border: BORDER,
      background: BG_PANEL,
      borderRadius: "2px",
      minHeight: "clamp(240px, 25vw, 340px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
    }}>
      <span style={{ fontSize: "clamp(11px, 0.8vw, 14px)", color: "var(--color-primary-dim)", letterSpacing: "0.15em" }}>⎔ {t.footer.founders.title}</span>
      <span style={{ fontSize: "clamp(12px, 1.0vw, 16px)", color: "var(--color-primary-dimmer)", fontFamily: FONT_MONO, letterSpacing: "0.1em" }}>{t.footer.founders.empty}</span>
    </div>
  );
}

// ── Componente BottomBar ────────────────────────────────────────────────────
function BottomBar({ inputCommand, setInputCommand, handleBottomKeyDown, profileName }: { inputCommand: string; setInputCommand: (v: string) => void; handleBottomKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void; profileName: string | null }) {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: "clamp(10px, 1.5vw, 24px)",
    }}>
      <div style={{ padding: "clamp(10px, 1.2vw, 16px) clamp(14px, 2vw, 24px)", border: BORDER, background: BG_PANEL, display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: COLOR_YELLOW, fontSize: "clamp(13px, 1.0vw, 17px)", fontFamily: FONT_MONO }}>$</span>
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="text"
            value={inputCommand}
            onChange={e => setInputCommand(e.target.value)}
            onKeyDown={handleBottomKeyDown}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: COLOR_GREEN, fontSize: "clamp(13px, 1.0vw, 17px)", fontFamily: FONT_MONO }}
          />
          {inputCommand === "" && (
            <span style={{ position: "absolute", left: 0, pointerEvents: "none", color: "var(--color-accent)", fontSize: "clamp(13px, 1.0vw, 17px)", fontFamily: FONT_MONO, animation: "glitchPlaceholder 4s infinite" }}>{t.footer.terminal.placeholder}</span>
          )}
        </div>
      </div>
      <div style={{ border: BORDER, background: BG_PANEL, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: "clamp(22px, 1.6vw, 28px)", letterSpacing: "0.1em" }}>
  {profileName ? (
    <>
      <span style={{ color: COLOR_YELLOW }}>{t.footer.bottombar.welcomeName.split("{name}")[0]}</span>
      <span style={{ color: COLOR_GREEN }}>{profileName.toUpperCase()}</span>
    </>
  ) : (
    <span style={{ color: COLOR_YELLOW }}>{t.footer.bottombar.welcome}</span>
  )}
</span>
      </div>
      <div style={{ padding: "clamp(10px, 1.2vw, 16px) clamp(14px, 2vw, 24px)", border: BORDER, background: BG_PANEL, display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", boxSizing: "border-box" }}>
        {[
            { id: "X", href: "#", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
            { id: "IG", href: "#", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
            { id: "YT", href: "#", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
            { id: "TT", href: "#", icon: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" },
            { id: "DC", href: "#", icon: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" },
          ].map(({ id, href, icon }, i) => (
            <a key={id} href={href} onClick={(e) => e.stopPropagation()} aria-label={id}
              style={{ color: COLOR_GREEN, display: "flex", animation: `glitch${i+1} ${3.5 + i*0.7}s infinite`, animationDelay: `${i*0.9}s` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = COLOR_YELLOW; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = COLOR_GREEN; }}
            ><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d={icon} /></svg></a>
          ))}
      </div>
    </div>
  );
}

// ── Componente Copyright ────────────────────────────────────────────────────
const MATRIX_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ@#$%&";
function rndMatrixChar() { return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]; }

function useMatrixText(real: string) {
  const [display, setDisplay] = useState(real);
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stabilizeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startChaos = useCallback((target: string, duration: number) => {
    if (frameRef.current) clearInterval(frameRef.current);
    if (stabilizeRef.current) clearTimeout(stabilizeRef.current);
    frameRef.current = setInterval(() => {
      setDisplay(target.split("").map(() => rndMatrixChar()).join(""));
    }, 32);
    stabilizeRef.current = setTimeout(() => {
      if (frameRef.current) clearInterval(frameRef.current);
      let i = 0;
      const reveal = setInterval(() => {
        setDisplay(prev => target.split("").map((c, idx) => idx <= i ? c : rndMatrixChar()).join(""));
        i++;
        if (i >= target.length) clearInterval(reveal);
      }, 80);
    }, duration);
  }, []);

  useEffect(() => { startChaos(real, 300); }, [real]);

  useEffect(() => {
    const id = setInterval(() => { startChaos(real, 800); }, 6000);
    return () => clearInterval(id);
  }, [real]);

  useEffect(() => {
    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
      if (stabilizeRef.current) clearTimeout(stabilizeRef.current);
    };
  }, []);

  return display;
}

function Copyright() {
  const isMobile = useIsMobile();
  const matrixText = useMatrixText("@ L3TRONIX 2026");
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: "clamp(10px, 1.5vw, 24px)",
    }}>
      <div />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "clamp(20px, 1.4vw, 26px)", color: COLOR_YELLOW, letterSpacing: "0.05em" }}>
        <span>{matrixText}</span>
      </div>
      <div />
    </div>
  );
}

// ── Footer principal ────────────────────────────────────────────────────────
export default function Footer() {
  const { t } = useLanguage();
  const [unlocked, setUnlocked] = useState<{ tier: number; content: string } | null>(null);
  const { profileName, tier } = useUser();
  const isGifneo = tier === 500;
  const FT_PRIMARY = isGifneo ? "255,0,255" : "0,255,153";
  const FT_GOLD = isGifneo ? "255,0,255" : "255,204,0";
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<"signal" | "founders">("signal");
  const [inputCommand, setInputCommand] = useState("");
  const [terminalState, setTerminalState] = useState<{ history: string[]; historyIndex: number }>({ history: [], historyIndex: -1 });
  const executeFromBottom = useCallback((cmd: string) => {
    const event = new CustomEvent("terminalcommand", { detail: cmd });
    window.dispatchEvent(event);
  }, []);
  const handleBottomKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeFromBottom(inputCommand);
      setInputCommand("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setTerminalState(prev => {
        if (!prev.history.length) return prev;
        const newIndex = prev.historyIndex < prev.history.length - 1 ? prev.historyIndex + 1 : prev.historyIndex;
        setInputCommand(prev.history[prev.history.length - 1 - newIndex] || "");
        return { ...prev, historyIndex: newIndex };
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setTerminalState(prev => {
        if (prev.historyIndex > 0) {
          const newIndex = prev.historyIndex - 1;
          setInputCommand(prev.history[prev.history.length - 1 - newIndex] || "");
          return { ...prev, historyIndex: newIndex };
        }
        setInputCommand("");
        return { ...prev, historyIndex: -1 };
      });
    }
  }, [inputCommand, executeFromBottom]);

  return (
    <footer style={{
      width: "100%",
      minHeight: "100vh",
      background: "#0a0a0a",
      borderTop: "2px solid var(--color-primary-dimmer)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Fondos */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 50%, var(--color-footer-bg) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(255,204,0,0.02) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, var(--color-footer-bg) 2px, var(--color-footer-bg) 4px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, var(--color-footer-bg) 1px, transparent 1px), linear-gradient(0deg, var(--color-footer-bg) 1px, transparent 1px)", backgroundSize: "clamp(30px, 5vw, 60px) clamp(30px, 5vw, 60px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Contenido */}
      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        boxSizing: "border-box",
        padding: "0",
        fontFamily: FONT_MONO,
        color: COLOR_GREEN,
        display: "flex",
        flexDirection: "column",
        gap: "clamp(12px, 1.5vw, 24px)",
        minHeight: "calc(100vh - 4px)",
      }}>
        <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {unlocked ? (
          <div style={{ padding: "clamp(14px, 1.5vw, 24px)", border: "1px solid var(--color-primary-dim)", background: "var(--color-footer-bg)", borderRadius: "2px" }}>
            <div style={{ color: COLOR_YELLOW, letterSpacing: "0.15em", marginBottom: "16px", fontSize: "clamp(12px, 0.9vw, 15px)" }}>⎔ {t.footer.unlocked.title.replace("{tier}", String(unlocked.tier))}</div>
            <div style={{ color: COLOR_GREEN, whiteSpace: "pre-wrap", lineHeight: "1.7", fontSize: "clamp(13px, 1.0vw, 16px)" }}>{unlocked.content}</div>
            <button onClick={() => setUnlocked(null)} style={{ marginTop: "20px", background: "transparent", border: "1px solid var(--color-primary-dimmer)", color: "var(--color-primary-dim)", fontFamily: FONT_MONO, fontSize: "clamp(11px, 0.8vw, 14px)", padding: "6px 14px", cursor: "pointer", letterSpacing: "0.1em" }}>{t.footer.unlocked.close}</button>
          </div>
        ) : activeTab === "founders" ? (
          <FoundersPanel />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "clamp(10px, 1.5vw, 24px)", flex: "1" }}>
            <Terminal unlocked={unlocked} setUnlocked={setUnlocked} onHistoryUpdate={(h) => setTerminalState(prev => ({ ...prev, history: h }))} />
            <Updates />
            <Telemetry />
          </div>
        )}

        <BottomBar inputCommand={inputCommand} setInputCommand={setInputCommand} handleBottomKeyDown={handleBottomKeyDown} profileName={profileName} />
        <Copyright />
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes glitchPlaceholder {
          0%,75%,100% { transform: translate(0,0) skewX(0deg); opacity:1; filter: none; }
          77% { transform: translate(-3px,1px) skewX(-5deg); opacity:0.8; filter: drop-shadow(-2px 0 var(--color-accent)) drop-shadow(2px 0 #00ffcc); }
          79% { transform: translate(2px,-1px) skewX(3deg); opacity:1; filter: none; }
          81% { transform: translate(-1px,2px) skewX(-2deg); opacity:0.7; filter: drop-shadow(2px 0 var(--color-accent)); }
          83% { transform: translate(0,0) skewX(0deg); opacity:1; filter: none; }
        }
        @keyframes glitch1 {
          0%,80%,100% { transform: translate(0,0) skewX(0deg); opacity:0.6; filter: none; }
          82% { transform: translate(-3px,1px) skewX(-4deg); opacity:1; color:var(--color-accent); filter: drop-shadow(-2px 0 var(--color-accent)) drop-shadow(2px 0 #00ffcc); }
          84% { transform: translate(2px,-1px) skewX(2deg); opacity:0.8; color:var(--color-accent); filter: none; }
          86% { transform: translate(-1px,2px) skewX(-1deg); opacity:1; filter: drop-shadow(2px 0 var(--color-accent)); }
          88% { transform: translate(0,0); opacity:0.6; filter: none; }
        }
        @keyframes glitch2 {
          0%,60%,100% { transform: translate(0,0) skewX(0deg); opacity:0.6; filter: none; }
          63% { transform: translate(3px,-2px) skewX(5deg); opacity:1; color:var(--color-accent); filter: drop-shadow(3px 0 var(--color-primary)) drop-shadow(-2px 0 var(--color-accent)); }
          65% { transform: translate(-2px,1px) skewX(-3deg); opacity:0.7; color:var(--color-accent); filter: none; }
          67% { transform: translate(1px,1px); opacity:1; filter: drop-shadow(-2px 0 #00ffcc); }
          69% { transform: translate(0,0); opacity:0.6; filter: none; }
        }
        @keyframes glitch3 {
          0%,45%,100% { transform: translate(0,0) skewX(0deg); opacity:0.6; filter: none; }
          47% { transform: translate(-4px,2px) skewX(-6deg); opacity:1; color:var(--color-accent); filter: drop-shadow(3px 0 var(--color-accent)) drop-shadow(-3px 0 var(--color-primary)); }
          49% { transform: translate(2px,-2px) skewX(3deg); opacity:0.8; color:var(--color-accent); filter: none; }
          51% { transform: translate(-1px,1px); opacity:1; filter: drop-shadow(-2px 0 var(--color-accent)); }
          53% { transform: translate(0,0); opacity:0.6; filter: none; }
        }
        @keyframes glitch4 {
          0%,70%,100% { transform: translate(0,0) skewX(0deg); opacity:0.6; filter: none; }
          72% { transform: translate(2px,3px) skewX(4deg); opacity:1; color:var(--color-accent); filter: drop-shadow(-3px 0 #00ffcc) drop-shadow(2px 0 var(--color-accent)); }
          74% { transform: translate(-3px,-1px) skewX(-2deg); opacity:0.7; color:var(--color-accent); filter: none; }
          76% { transform: translate(1px,0px); opacity:1; filter: drop-shadow(2px 0 var(--color-primary)); }
          78% { transform: translate(0,0); opacity:0.6; filter: none; }
        }
        @keyframes glitch5 {
          0%,55%,100% { transform: translate(0,0) skewX(0deg); opacity:0.6; filter: none; }
          57% { transform: translate(-2px,-3px) skewX(-5deg); opacity:1; color:var(--color-accent); filter: drop-shadow(2px 0 var(--color-accent)) drop-shadow(-2px 0 var(--color-primary)); }
          59% { transform: translate(3px,1px) skewX(3deg); opacity:0.8; color:var(--color-accent); filter: none; }
          61% { transform: translate(-1px,-1px); opacity:1; filter: drop-shadow(-3px 0 #00ffcc); }
          63% { transform: translate(0,0); opacity:0.6; filter: none; }
        }
      `}</style>
    </footer>
  );
}
