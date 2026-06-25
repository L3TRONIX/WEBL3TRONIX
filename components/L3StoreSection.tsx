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
        }}
      />
      <MatrixText
        tag="p"
        text={t.l3store.comingSoon}
        chaosInterval={8000}
        className="l3store-coming"
      />
    </section>
  );
}
