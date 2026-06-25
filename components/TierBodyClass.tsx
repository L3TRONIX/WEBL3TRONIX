"use client";
import { useEffect } from "react";
import { useUser } from "@/lib/supabase/useUser";

export default function TierBodyClass() {
  const { tier } = useUser();
  useEffect(() => {
    if (tier === 500) {
      document.body.classList.add("tier-hive-neo");
    } else {
      document.body.classList.remove("tier-hive-neo");
    }
  }, [tier]);
  return null;
}
