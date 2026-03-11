import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data || null);
    setLoading(false);
  }

  async function signIn(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function saveProfile(name, declared_role) {
    const user = session?.user;
    if (!user) return { error: new Error("Not authenticated") };

    // Verify organizer claim against server-side allowlist
    if (declared_role === "organizer") {
      const { data: allowed, error: checkErr } = await supabase
        .rpc("is_allowed_organizer", { user_email: user.email });
      if (checkErr || !allowed) {
        return {
          error: new Error(
            "Organizer access is by invitation only. Contact an existing organizer to be added."
          ),
        };
      }
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, name, declared_role }, { onConflict: "id" })
      .select()
      .single();
    if (!error) setProfile(data);
    return { error };
  }

  return {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signIn,
    signOut,
    saveProfile,
  };
}
