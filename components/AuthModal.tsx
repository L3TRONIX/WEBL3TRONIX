"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [backerId, setBackerId] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, kickstarter_backer_id: backerId || null } },
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Registro correcto. Revisa tu email para confirmar la cuenta." });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Sesión iniciada." });
        setTimeout(onClose, 800);
      }
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#000",
          border: "1px solid var(--color-primary-dim)",
          borderRadius: "4px",
          padding: "32px",
          width: "min(90vw, 380px)",
          fontFamily: "'Courier New', monospace",
          color: "var(--color-primary)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "transparent",
            border: "none",
            color: "var(--color-primary)",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          <button
            onClick={() => setMode("login")}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: mode === "login" ? "2px solid var(--color-accent)" : "2px solid transparent",
              color: mode === "login" ? "var(--color-accent)" : "color-mix(in srgb, var(--color-primary) 40%, transparent)",
              padding: "8px 0",
              cursor: "pointer",
              fontFamily: "'Courier New', monospace",
              fontSize: "13px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setMode("signup")}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: mode === "signup" ? "2px solid var(--color-accent)" : "2px solid transparent",
              color: mode === "signup" ? "var(--color-accent)" : "color-mix(in srgb, var(--color-primary) 40%, transparent)",
              padding: "8px 0",
              cursor: "pointer",
              fontFamily: "'Courier New', monospace",
              fontSize: "13px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "signup" && (
            <input
              type="text"
              placeholder="nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                background: "color-mix(in srgb, var(--color-primary) 5%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
                borderRadius: "2px",
                padding: "10px 12px",
                color: "var(--color-primary)",
                fontFamily: "'Courier New', monospace",
                fontSize: "14px",
                outline: "none",
              }}
            />
          )}
          <input
            type="text"
            placeholder="Kickstarter Backer ID (opcional — solo si has donado)"
            value={backerId}
            onChange={(e) => setBackerId(e.target.value)}
            style={{
              background: "color-mix(in srgb, var(--color-primary) 5%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)",
              borderRadius: "2px",
              padding: "10px 12px",
              color: "color-mix(in srgb, var(--color-primary) 70%, transparent)",
              fontFamily: "'Courier New', monospace",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              background: "color-mix(in srgb, var(--color-primary) 5%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
              borderRadius: "2px",
              padding: "10px 12px",
              color: "var(--color-primary)",
              fontFamily: "'Courier New', monospace",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              background: "color-mix(in srgb, var(--color-primary) 5%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
              borderRadius: "2px",
              padding: "10px 12px",
              color: "var(--color-primary)",
              fontFamily: "'Courier New', monospace",
              fontSize: "14px",
              outline: "none",
            }}
          />

          {message && (
            <div style={{
              fontSize: "12px",
              color: message.type === "error" ? "#00ffcc" : "var(--color-primary)",
              padding: "8px 10px",
              border: `1px solid ${message.type === "error" ? "rgba(0,255,204,0.3)" : "var(--color-primary-dim)"}`,
              borderRadius: "2px",
            }}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--color-accent)",
              border: "none",
              borderRadius: "2px",
              padding: "12px",
              color: "#000",
              fontWeight: "700",
              fontFamily: "'Courier New', monospace",
              fontSize: "14px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Procesando..." : mode === "signup" ? "Crear cuenta" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
