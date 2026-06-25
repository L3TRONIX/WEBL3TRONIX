"use client";

import { useLanguage } from "../context/LanguageContext";
import MatrixText from "./MatrixText";

export default function L3StoreSection() {
  const { t } = useLanguage();

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
      <img
        src="/L3STOR3.png"
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
