import { Resend } from "resend";
import { createClient } from "../../../lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { tier, code, content } = await request.json();

  if (!tier || !code || !content) {
    return Response.json({ error: "Faltan campos" }, { status: 400 });
  }

  const supabase = await createClient();

  // Obtener todos los usuarios del tier indicado
  const { data: users, error } = await supabase
    .from("profiles")
    .select("email, name")
    .eq("tier", tier);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!users || users.length === 0) {
    return Response.json({ message: "No hay usuarios en este tier", sent: 0 });
  }

  // Mandar mail a cada usuario
  const results = await Promise.allSettled(
    users.map((user) =>
      resend.emails.send({
        from: "L3TRONIX <updates@resend.dev>",
        to: user.email,
        subject: `[L3TRONIX] Clave semanal — Tier ${tier}€`,
        html: `
          <div style="background:#0a0a0a;color:#00ff99;font-family:monospace;padding:40px;max-width:600px;">
            <h1 style="color:#ffcc00;letter-spacing:0.2em;">⎔ L3TRONIX</h1>
            <p style="color:rgba(255,255,255,0.5);">Hola ${user.name || "Backer"},</p>
            <p>Tu clave de acceso esta semana:</p>
            <div style="background:#111;border:1px solid rgba(0,255,153,0.3);padding:20px;margin:20px 0;font-size:24px;letter-spacing:0.3em;color:#ffcc00;">
              ${code}
            </div>
            <p style="color:rgba(255,255,255,0.5);">Introdúcela en la terminal de <a href="https://webl-3-tronix.vercel.app" style="color:#00ff99;">webl-3-tronix.vercel.app</a> con el comando:</p>
            <div style="background:#111;border:1px solid rgba(0,255,153,0.1);padding:12px;font-size:16px;color:#ffcc00;">
              $ unlock ${code}
            </div>
            <hr style="border-color:rgba(0,255,153,0.1);margin:30px 0;" />
            <p style="color:rgba(255,255,255,0.3);font-size:12px;">Actualización exclusiva Tier ${tier}€ · L3TRONIX © 2026</p>
          </div>
        `,
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return Response.json({ sent, failed });
}
