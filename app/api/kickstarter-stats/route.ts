import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CAMPAIGN_URL = "https://www.kickstarter.com/projects/l3tronix/l3tronix-power-on-play/widget/card.html";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = req.nextUrl.searchParams.get("secret");
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManualTest = secret === process.env.KICKSTARTER_CRON_SECRET;
  if (!isVercelCron && !isManualTest) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(CAMPAIGN_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    const html = await res.text();

    const backersMatch = html.match(/"project_backers_count":(\d+)/);
    const pledgedMatch = html.match(/&quot;pledged&quot;:([\d.]+)/);
    const goalMatch = html.match(/&quot;goal&quot;:([\d.]+)/);

    if (!backersMatch || !pledgedMatch || !goalMatch) {
      return NextResponse.json({ error: "no se encontraron los datos en el HTML" }, { status: 502 });
    }

    const backers = parseInt(backersMatch[1], 10);
    const pledged = parseFloat(pledgedMatch[1]);
    const goal = parseFloat(goalMatch[1]);
    const funded_percent = goal > 0 ? Math.round((pledged / goal) * 1000000) / 10000 : 0;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("kickstarter_stats")
      .update({ backers, funded_percent, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, backers, funded_percent });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
