import { createClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  const { code } = await request.json();

  if (!code) {
    return Response.json({ error: "Falta el código" }, { status: 400 });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("weekly_codes")
    .select("tier, content")
    .eq("code", code.toUpperCase())
    .lte("valid_from", now)
    .gte("valid_until", now)
    .single();

  if (error || !data) {
    return Response.json({ valid: false, message: "CÓDIGO INVÁLIDO O EXPIRADO" });
  }

  return Response.json({ valid: true, tier: data.tier, content: data.content });
}
