"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  
  // ESTADO ÚNICO (en lugar de 5 useState separados)
  const [state, setState] = useState({
    command: "",
    output: [
      "L3TRONIX TERMINAL v0.1.0",
      "Sistema operativo listo.",
      "Escribe 'help' para ver comandos.",
      "",
    ],
    history: [] as string[],
    historyIndex: -1,
  });

  // Ejecutar comando (con límite de 20 líneas)
  const executeCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    setState(prev => {
      let response: string[] = [];

      switch (trimmed) {
        case "help":
          response = [
            "COMANDOS:",
            "  help     - Ayuda",
            "  status   - Estado del sistema",
            "  version  - Versión",
            "  backers  - Número de backers",
            "  funded   - % financiado",
            "  uptime   - Tiempo activo",
            "  clear    - Limpiar pantalla",
            "  whoami   - Info usuario",
          ];
          break;

        case "status":
          response = ["SISTEMA: ONLINE", "FASE: UI REFINEMENT", "ESTADO: OPERATIVO"];
          break;

        case "version":
          response = ["L3OS v0.1.0", "Kernel: L3TRONIX 2024"];
          break;

        case "backers":
          response = ["BACKERS: 142", "OBJETIVO: 300", "PROGRESO: 47%"];
          break;

        case "funded":
          response = ["FINANCIADO: 47%", "RECAUDADO: €47.000 / €100.000"];
          break;

        case "uptime":
          response = ["UPTIME: 37 días 14 horas"];
          break;

        case "clear":
          return { ...prev, output: [] };

        case "whoami":
          response = ["USUARIO: l3tronix", "ROL: FUNDADOR"];
          break;

        default:
          response = [`COMANDO NO RECONOCIDO: '${trimmed}'`];
          break;
      }

      // Nuevo output: máximo 20 líneas (elimina las más viejas)
      const newOutput = [...prev.output, `$ ${trimmed}`, ...response, ""];
      if (newOutput.length > 20) {
        newOutput.splice(0, newOutput.length - 20);
      }

      // Nuevo historial: máximo 10 comandos
      const newHistory = [...prev.history, trimmed];
      if (newHistory.length > 10) {
        newHistory.shift();
      }

      return {
        ...prev,
        output: newOutput,
        history: newHistory,
        historyIndex: -1,
      };
    });
  }, []);

  // Manejar teclas (Enter y flechas)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(state.command);
      setState(prev => ({ ...prev, command: "" }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setState(prev => {
        if (prev.history.length === 0) return prev;
        const newIndex = prev.historyIndex < prev.history.length - 1 ? prev.historyIndex + 1 : prev.historyIndex;
        return {
          ...prev,
          historyIndex: newIndex,
          command: prev.history[prev.history.length - 1 - newIndex] || "",
        };
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setState(prev => {
        if (prev.historyIndex > 0) {
          const newIndex = prev.historyIndex - 1;
          return {
            ...prev,
            historyIndex: newIndex,
            command: prev.history[prev.history.length - 1 - newIndex] || "",
          };
        }
        return { ...prev, historyIndex: -1, command: "" };
      });
    }
  }, [state.command, executeCommand]);

  return (
    <footer style={{
      width: "100%",
      minHeight: "80vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 40px",
      position: "relative",
      borderTop: "2px solid rgba(0,255,153,0.15)",
      overflow: "hidden",
    }}>
      {/* Fondos y efectos */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(0,255,153,0.03) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 50%, rgba(255,204,0,0.02) 0%, transparent 60%),
          #0a0a0a
        `,
        pointerEvents: "none",
        zIndex: 0,
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,153,0.008) 2px, rgba(0,255,153,0.008) 4px)",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          linear-gradient(90deg, rgba(0,255,153,0.03) 1px, transparent 1px),
          linear-gradient(0deg, rgba(0,255,153,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "1100px",
        fontFamily: "'Courier New', monospace",
        color: "#00ff99",
      }}>
        {/* Top Bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
          padding: "20px 30px",
          border: "1px solid rgba(0,255,153,0.15)",
          background: "rgba(0,255,153,0.03)",
          borderRadius: "2px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span style={{
              fontSize: "clamp(20px, 2.5vw, 36px)",
              fontWeight: "700",
              letterSpacing: "0.15em",
              color: "#00ff99",
              textShadow: "0 0 40px rgba(0,255,153,0.15)",
            }}>
              ⎔ L3TRONIX
            </span>
            <span style={{
              fontSize: "clamp(10px, 0.8vw, 14px)",
              color: "rgba(0,255,153,0.3)",
              letterSpacing: "0.2em",
              borderLeft: "1px solid rgba(0,255,153,0.1)",
              paddingLeft: "20px",
            }}>
              NAVE · CONTROL
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{
              fontSize: "clamp(10px, 0.8vw, 13px)",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.1em",
            }}>
              SISTEMA
            </span>
            <span style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              background: "#00ff99",
              borderRadius: "50%",
              boxShadow: "0 0 20px rgba(0,255,153,0.5), 0 0 60px rgba(0,255,153,0.15)",
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
            <span style={{
              fontSize: "clamp(10px, 0.8vw, 13px)",
              color: "#00ff99",
              letterSpacing: "0.05em",
            }}>
              ONLINE
            </span>
          </div>
        </div>

        {/* Grid 3 columnas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "24px",
          marginBottom: "40px",
        }}>
          {/* Columna 1: TERMINAL INTERACTIVA (NUEVO ENFOQUE) */}
          <div style={{
            padding: "20px",
            border: "1px solid rgba(0,255,153,0.1)",
            background: "rgba(0,255,153,0.02)",
            borderRadius: "2px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            minHeight: "300px",
          }}>
            <div style={{
              fontSize: "clamp(10px, 0.8vw, 13px)",
              color: "rgba(0,255,153,0.3)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              ⎔ TERMINAL
            </div>
            
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 4px",
              fontFamily: "'Courier New', monospace",
              fontSize: "clamp(11px, 0.9vw, 14px)",
              lineHeight: "1.5",
              color: "#00ff99",
              maxHeight: "300px",
            }}>
              {state.output.map((line, index) => (
                <div key={index} style={{
                  color: line.startsWith("$") ? "#ffcc00" : 
                          line.startsWith("COMANDO NO RECONOCIDO") ? "#ff4444" : 
                          line.includes("ERROR") ? "#ff4444" : "#00ff99",
                  opacity: line.startsWith("$") ? 0.9 : 0.8,
                }}>
                  {line}
                </div>
              ))}
              <span style={{
                display: "inline-block",
                width: "8px",
                height: "1em",
                background: "#00ff99",
                animation: "blink 1s step-end infinite",
                verticalAlign: "text-bottom",
              }} />
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              background: "rgba(0,255,153,0.03)",
              border: "1px solid rgba(0,255,153,0.08)",
              borderRadius: "2px",
              marginTop: "12px",
            }}>
              <span style={{
                color: "#ffcc00",
                fontSize: "clamp(12px, 1vw, 16px)",
              }}>
                $
              </span>
              <input
                type="text"
                value={state.command}
                onChange={(e) => setState(prev => ({ ...prev, command: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="comando..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#00ff99",
                  fontSize: "clamp(12px, 1vw, 16px)",
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: "0.05em",
                }}
              />
              <span style={{
                color: "rgba(0,255,153,0.1)",
                fontSize: "clamp(8px, 0.6vw, 10px)",
                letterSpacing: "0.05em",
              }}>
                ↑↓
              </span>
            </div>
          </div>

          {/* Columna 2: ACTUALIZACIONES */}
          <div style={{
            padding: "20px",
            border: "1px solid rgba(0,255,153,0.1)",
            background: "rgba(0,255,153,0.02)",
            borderRadius: "2px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            maxHeight: "400px",
          }}>
            <div style={{
              fontSize: "clamp(12px, 1vw, 16px)",
              color: "rgba(0,255,153,0.3)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}>
              📡 ACTUALIZACIONES
            </div>
            <div style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              paddingRight: "4px",
            }}>
              <div style={{
                padding: "12px 14px",
                borderLeft: "2px solid rgba(0,255,153,0.2)",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "2px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "clamp(11px, 0.8vw, 13px)", color: "#00ff99", fontWeight: "600" }}>
                    UI Refinement - Fase 2 iniciada
                  </span>
                  <span style={{ fontSize: "clamp(9px, 0.6vw, 11px)", color: "rgba(255,255,255,0.2)" }}>2026-06-24</span>
                </div>
                <div style={{ fontSize: "clamp(10px, 0.7vw, 12px)", color: "rgba(255,255,255,0.3)" }}>
                  Mejoras visuales en el Hero y componentes principales.
                </div>
              </div>
              <div style={{
                padding: "12px 14px",
                borderLeft: "2px solid rgba(0,255,153,0.2)",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "2px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "clamp(11px, 0.8vw, 13px)", color: "#00ff99", fontWeight: "600" }}>
                    Sistema de scroll optimizado
                  </span>
                  <span style={{ fontSize: "clamp(9px, 0.6vw, 11px)", color: "rgba(255,255,255,0.2)" }}>2026-06-23</span>
                </div>
                <div style={{ fontSize: "clamp(10px, 0.7vw, 12px)", color: "rgba(255,255,255,0.3)" }}>
                  Transiciones más suaves y mejor rendimiento.
                </div>
              </div>
              <div style={{
                padding: "12px 14px",
                borderLeft: "2px solid rgba(0,255,153,0.2)",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "2px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "clamp(11px, 0.8vw, 13px)", color: "#00ff99", fontWeight: "600" }}>
                    Efectos Matrix implementados
                  </span>
                  <span style={{ fontSize: "clamp(9px, 0.6vw, 11px)", color: "rgba(255,255,255,0.2)" }}>2026-06-22</span>
                </div>
                <div style={{ fontSize: "clamp(10px, 0.7vw, 12px)", color: "rgba(255,255,255,0.3)" }}>
                  Animaciones de texto estilo Matrix en toda la web.
                </div>
              </div>
            </div>
          </div>

          {/* Columna 3: Telemetría */}
          <div style={{
            padding: "24px",
            border: "1px solid rgba(0,255,153,0.1)",
            background: "rgba(0,255,153,0.02)",
            borderRadius: "2px",
          }}>
            <div style={{
              fontSize: "clamp(9px, 0.7vw, 12px)",
              color: "rgba(0,255,153,0.3)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}>
              📡 TELEMETRÍA
            </div>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>BACKERS</span>
                <span style={{ color: "#ffcc00" }}>142</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>FUNDADO</span>
                <span style={{ color: "#00ff99" }}>47%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>VERSIÓN</span>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>v0.1.0</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>UPTIME</span>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>37d 14h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel inferior */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          border: "1px solid rgba(0,255,153,0.08)",
          background: "rgba(0,255,153,0.02)",
          borderRadius: "2px",
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <span style={{
              fontSize: "clamp(9px, 0.7vw, 12px)",
              color: "rgba(0,255,153,0.2)",
              letterSpacing: "0.1em",
            }}>
              COMANDOS
            </span>
            <span style={{
              fontSize: "clamp(10px, 0.8vw, 13px)",
              color: "rgba(255,255,255,0.15)",
              fontFamily: "'Courier New', monospace",
            }}>
              {`> status`}
            </span>
            <span style={{
              fontSize: "clamp(10px, 0.8vw, 13px)",
              color: "rgba(255,255,255,0.15)",
              fontFamily: "'Courier New', monospace",
            }}>
              {`> version`}
            </span>
            <span style={{
              fontSize: "clamp(10px, 0.8vw, 13px)",
              color: "rgba(255,255,255,0.15)",
              fontFamily: "'Courier New', monospace",
            }}>
              {`> backers`}
            </span>
            <span style={{
              fontSize: "clamp(10px, 0.8vw, 13px)",
              color: "rgba(255,255,255,0.15)",
              fontFamily: "'Courier New', monospace",
            }}>
              {`> help`}
            </span>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <span style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              background: "#ffcc00",
              borderRadius: "50%",
              boxShadow: "0 0 12px rgba(255,204,0,0.2)",
            }} />
            <span style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              background: "#00ff99",
              borderRadius: "50%",
              boxShadow: "0 0 12px rgba(0,255,153,0.2)",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
            }} />
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "clamp(10px, 0.7vw, 12px)",
          color: "rgba(255,255,255,0.08)",
          letterSpacing: "0.05em",
          padding: "0 8px",
        }}>
          <span>© 2026 L3TRONIX · ALL RIGHTS RESERVED</span>
          <span style={{ color: "rgba(0,255,153,0.08)" }}>
            L3OS v0.1.0 · SISTEMA OPERATIVO
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </footer>
  );
}
