export function aiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

export async function completeJson(system: string, user: string): Promise<string> {
  const key = process.env.AI_API_KEY;
  if (!key) {
    throw new Error("AI_API_KEY belum diisi");
  }

  const base = (process.env.AI_API_BASE || "https://api.x.ai/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "grok-3";

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API ${res.status}: ${err.slice(0, 280)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") {
    throw new Error("AI API tidak mengembalikan teks");
  }
  return text;
}
