"use client";

import { useLanguage } from "../context/LanguageContext";
import { useUser } from "@/lib/supabase/useUser";
import MatrixText from "./MatrixText";
import PCBBackground from "./PCBBackground";

export default function L3StoreSection() {
  const { t } = useLanguage();
  const { tier } = useUser();

  return (
    <section style={{
      width: "100%",
      height: "100vh",
      background: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <PCBBackground />
      <img
        src={tier === 500 ? "/L3STOR3_hiveneo.png" : "/L3STOR3.png"}
        alt="L3STORE"
        style={{
          width: "60%",
          maxWidth: "600px",
          height: "auto",
          objectFit: "contain",
          animation: tier === 500 ? "storePulse 2s ease-in-out infinite, storeGlitch 5s infinite" : undefined,
        }}
      />
      <MatrixText
        tag="p"
        text={t.l3store.comingSoon}
        chaosInterval={8000}
        className="l3store-coming"
      />
      <style>{`
        @keyframes storePulse {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 5px var(--color-accent)); }
          50% { opacity: 0.85; filter: drop-shadow(0 0 1px var(--color-accent)); }
        }
        @keyframes storeGlitch {
          0%,80%,100% { transform: skewX(0deg); filter: drop-shadow(0 0 5px var(--color-accent)); }
          82% { transform: translate(-3px, 1px) skewX(-4deg); filter: drop-shadow(-2px 0 var(--color-accent)) drop-shadow(2px 0 var(--color-primary)); }
          84% { transform: translate(2px, -1px) skewX(2deg); filter: none; }
          86% { transform: translate(-1px, 2px) skewX(-1deg); filter: drop-shadow(2px 0 var(--color-accent)); }
          88% { transform: translate(0,0) skewX(0deg); filter: drop-shadow(0 0 5px var(--color-accent)); }
        }
      `}</style>
    </section>
  );
}
