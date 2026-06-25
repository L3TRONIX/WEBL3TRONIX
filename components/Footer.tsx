"use client";

import { useState, useCallback, useEffect } from "react";
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
const BORDER = "1px solid rgba(0,255,153,0.1)";
const BG_PANEL = "rgba(0,255,153,0.02)";
const COLOR_GREEN = "#00ff99";
const COLOR_YELLOW = "#ffcc00";
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
          boxShadow: "0 0 20px rgba(0,255,153,0.5)",
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
      <div style={{ fontSize: "clamp(11px, 0.8vw, 14px)", color: "rgba(0,255,153,0.3)", letterSpacing: "0.15em", marginBottom: "12px" }}>⎔ {t.footer.terminal.title}</div>
      <div style={{ flex: 1, overflowY: "auto", fontFamily: FONT_MONO, fontSize: "clamp(12px, 0.9vw, 15px)", lineHeight: "1.5", color: COLOR_GREEN }}>
        {state.output.map((line, i) => (
          <div key={i} style={{ color: line.startsWith("$") ? COLOR_YELLOW : line.startsWith(t.footer.terminal.commands.unknown.split(":")[0]) ? "#cc2200" : COLOR_GREEN, opacity: line.startsWith("$") ? 0.9 : 0.8 }}>{line}</div>
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
      <div style={{ fontSize: "clamp(11px, 0.8vw, 14px)", color: "rgba(0,255,153,0.3)", letterSpacing: "0.15em", marginBottom: "16px" }}>📡 {t.footer.updates.title}</div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "clamp(8px, 1vw, 12px)" }}>
        {updates.map((u, i) => (
          <div key={i} style={{ padding: "clamp(8px, 1vw, 12px) clamp(10px, 1.2vw, 14px)", borderLeft: "2px solid rgba(0,255,153,0.2)", background: "rgba(255,255,255,0.02)", borderRadius: "2px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "clamp(12px, 0.9vw, 15px)", color: COLOR_GREEN, fontWeight: "600" }}>{locale === "en" && u.title_en ? u.title_en : u.title}</span>
              <span style={{ fontSize: "clamp(10px, 0.7vw, 13px)", color: COLOR_YELLOW }}>{u.published_at}</span>
            </div>
            <div style={{ fontSize: "clamp(11px, 0.8vw, 14px)", color: COLOR_YELLOW }}>{locale === "en" && u.body_en ? u.body_en : u.body}</div>
          </div>
        ))}
        {updates.length === 0 && (
          <div style={{ fontSize: "clamp(11px, 0.8vw, 14px)", color: "rgba(0,255,153,0.2)", fontFamily: FONT_MONO }}>{t.footer.updates.empty}</div>
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
      <div style={{ fontSize: "clamp(11px, 0.8vw, 14px)", color: "rgba(0,255,153,0.3)", letterSpacing: "0.15em", marginBottom: "16px" }}>📡 {t.footer.telemetry.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 2vw, 28px)" }}>
        {[
          { label: t.footer.telemetry.labels.backers, value: "142", color: COLOR_YELLOW },
          { label: t.footer.telemetry.labels.funded, value: "47%", color: COLOR_GREEN },
          { label: t.footer.telemetry.labels.version, value: "v0.1.0", color: COLOR_YELLOW },
          { label: t.footer.telemetry.labels.uptime, value: "37d 14h", color: COLOR_YELLOW },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "clamp(16px, 1.4vw, 22px)", color: COLOR_YELLOW }}>{item.label}</span>
            <span style={{ fontSize: "clamp(16px, 1.4vw, 22px)", color: item.color }}>{item.value}</span>
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
      <span style={{ fontSize: "clamp(11px, 0.8vw, 14px)", color: "rgba(0,255,153,0.3)", letterSpacing: "0.15em" }}>⎔ {t.footer.founders.title}</span>
      <span style={{ fontSize: "clamp(12px, 1.0vw, 16px)", color: "rgba(0,255,153,0.2)", fontFamily: FONT_MONO, letterSpacing: "0.1em" }}>{t.footer.founders.empty}</span>
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
        <input
          type="text"
          value={inputCommand}
          onChange={e => setInputCommand(e.target.value)}
          onKeyDown={handleBottomKeyDown}
          placeholder={t.footer.terminal.placeholder}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: COLOR_GREEN, fontSize: "clamp(13px, 1.0vw, 17px)", fontFamily: FONT_MONO }}
        />
      </div>
      <div style={{ border: BORDER, background: BG_PANEL, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: "clamp(11px, 0.8vw, 14px)", color: COLOR_GREEN, letterSpacing: "0.1em" }}>{profileName ? t.footer.bottombar.welcomeName.replace("{name}", profileName.toUpperCase()) : t.footer.bottombar.welcome}</span>
      </div>
      <div style={{ padding: "clamp(10px, 1.2vw, 16px) clamp(14px, 2vw, 24px)", border: BORDER, background: BG_PANEL, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "clamp(6px, 0.8vw, 12px)" }}>
          {[COLOR_YELLOW, COLOR_GREEN, "rgba(255,255,255,0.1)"].map((c, i) => (
            <span key={i} style={{ display: "inline-block", width: "clamp(5px, 0.6vw, 8px)", height: "clamp(5px, 0.6vw, 8px)", background: c, borderRadius: "50%" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Componente Copyright ────────────────────────────────────────────────────
function Copyright() {
  const isMobile = useIsMobile();
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: "clamp(10px, 1.5vw, 24px)",
    }}>
      <div />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "clamp(20px, 1.4vw, 26px)", color: COLOR_YELLOW, letterSpacing: "0.05em" }}>
        <span>@ L3TRONIX 2026</span>
      </div>
      <div />
    </div>
  );
}

// ── Footer principal ────────────────────────────────────────────────────────
export default function Footer() {
  const { t } = useLanguage();
  const [unlocked, setUnlocked] = useState<{ tier: number; content: string } | null>(null);
  const { profileName } = useUser();
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
      borderTop: "2px solid rgba(0,255,153,0.15)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Fondos */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(0,255,153,0.03) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(255,204,0,0.02) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,153,0.008) 2px, rgba(0,255,153,0.008) 4px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,255,153,0.03) 1px, transparent 1px), linear-gradient(0deg, rgba(0,255,153,0.03) 1px, transparent 1px)", backgroundSize: "clamp(30px, 5vw, 60px) clamp(30px, 5vw, 60px)", pointerEvents: "none", zIndex: 0 }} />

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
          <div style={{ padding: "clamp(14px, 1.5vw, 24px)", border: "1px solid rgba(0,255,153,0.3)", background: "rgba(0,255,153,0.04)", borderRadius: "2px" }}>
            <div style={{ color: COLOR_YELLOW, letterSpacing: "0.15em", marginBottom: "16px", fontSize: "clamp(12px, 0.9vw, 15px)" }}>⎔ {t.footer.unlocked.title.replace("{tier}", String(unlocked.tier))}</div>
            <div style={{ color: COLOR_GREEN, whiteSpace: "pre-wrap", lineHeight: "1.7", fontSize: "clamp(13px, 1.0vw, 16px)" }}>{unlocked.content}</div>
            <button onClick={() => setUnlocked(null)} style={{ marginTop: "20px", background: "transparent", border: "1px solid rgba(0,255,153,0.2)", color: "rgba(0,255,153,0.4)", fontFamily: FONT_MONO, fontSize: "clamp(11px, 0.8vw, 14px)", padding: "6px 14px", cursor: "pointer", letterSpacing: "0.1em" }}>{t.footer.unlocked.close}</button>
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
      `}</style>
    </footer>
  );
}
