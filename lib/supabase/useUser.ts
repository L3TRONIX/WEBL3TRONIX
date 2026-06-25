"use client";

import { useEffect, useState } from "react";
import { createClient } from "./client";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchProfileName = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", userId)
        .single();
      setProfileName(data?.name || null);
    };

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
      if (data.user) fetchProfileName(data.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileName(session.user.id);
      } else {
        setProfileName(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, profileName, loading };
}
