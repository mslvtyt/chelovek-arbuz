// Отправляет ответ Жени в Telegram. Токен и chat_id берутся из
// переменных окружения Netlify (BOT_TOKEN, CHAT_ID) и в браузер не попадают.
export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }

  const text = String(body?.text || "").slice(0, 1500);
  if (!text.startsWith("💌")) return Response.json({ ok: false }, { status: 400 });

  const token = Netlify.env.get("BOT_TOKEN");
  const chatId = Netlify.env.get("CHAT_ID");
  if (!token || !chatId) return Response.json({ ok: false, description: "env not set" }, { status: 500 });

  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const d = await r.json().catch(() => ({}));
  return Response.json({ ok: !!d.ok, description: d.description }, { status: d.ok ? 200 : 502 });
};

export const config = { path: "/api/send" };
