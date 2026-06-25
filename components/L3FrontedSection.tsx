"use client";

export default function L3FrontedSection() {
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
        src="/L3FRONTED.png"
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </section>
  );
}
