"use client";

import { useEffect, useState } from "react";
import { createClient } from "./client";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [tier, setTier] = useState<number | null>(null);
  const [founderNumber, setFounderNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("name, tier, founder_number")
        .eq("id", userId)
        .single();
      setProfileName(data?.name || null);
      setTier(data?.tier || null);
      setFounderNumber(data?.founder_number || null);
    };

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
      if (data.user) fetchProfile(data.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfileName(null);
        setTier(null);
        setFounderNumber(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, profileName, tier, founderNumber, loading };
}
