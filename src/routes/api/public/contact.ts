import { createFileRoute } from "@tanstack/react-router";

const TO_EMAIL = "factumscuderia2023@gmail.com";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => null) as
            | { nome?: string; email?: string; assunto?: string; mensagem?: string }
            | null;
          if (!body) {
            return new Response(JSON.stringify({ error: "Invalid JSON" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }
          const nome = String(body.nome ?? "").trim().slice(0, 200);
          const email = String(body.email ?? "").trim().slice(0, 200);
          const assunto = String(body.assunto ?? "").trim().slice(0, 200) || "Contato pelo site";
          const mensagem = String(body.mensagem ?? "").trim().slice(0, 5000);

          if (!nome || !email || !mensagem) {
            return new Response(JSON.stringify({ error: "Campos obrigatórios faltando" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return new Response(JSON.stringify({ error: "E-mail inválido" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          const RESEND_API_KEY = process.env.RESEND_API_KEY;
          if (!RESEND_API_KEY) {
            return new Response(JSON.stringify({ error: "RESEND_API_KEY não configurada" }), {
              status: 500,
              headers: { "content-type": "application/json" },
            });
          }

          const html = `
            <h2>Nova mensagem pelo site da Factum Scuderia</h2>
            <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
            <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
            <p><strong>Assunto:</strong> ${escapeHtml(assunto)}</p>
            <p><strong>Mensagem:</strong></p>
            <p style="white-space:pre-wrap">${escapeHtml(mensagem)}</p>
          `;

          const resp = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Factum Scuderia <onboarding@resend.dev>",
              to: [TO_EMAIL],
              reply_to: email,
              subject: `[Site Factum] ${assunto} — ${nome}`,
              html,
            }),
          });

          if (!resp.ok) {
            const errText = await resp.text();
            console.error("Resend error:", resp.status, errText);
            return new Response(JSON.stringify({ error: "Falha ao enviar e-mail" }), {
              status: 502,
              headers: { "content-type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          console.error("contact route error:", err);
          return new Response(JSON.stringify({ error: "Erro interno" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
