import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType ?? "image/jpeg",
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: `Analiza esta captura de pantalla de una app de control de peso/báscula inteligente.
Extrae TODOS los valores numéricos que encuentres y devuelve SOLO un JSON válido con esta estructura exacta (usa null si el campo no aparece en la imagen):

{
  "peso_kg": number | null,
  "imc": number | null,
  "clasificacion_imc": string | null,
  "grasa_corporal_pct": number | null,
  "masa_libre_grasa_kg": number | null,
  "agua_corporal_pct": number | null,
  "grasa_visceral_nivel": number | null,
  "masa_osea_kg": number | null,
  "proteinas_pct": number | null,
  "masa_musculoesqueletica_kg": number | null,
  "tasa_metabolica_basal_kcal": number | null,
  "frecuencia_cardiaca_ppm": number | null,
  "peso_objetivo_kg": number | null,
  "peso_inicial_kg": number | null,
  "total_perdido_kg": number | null,
  "fecha_medicion": string | null
}

Responde ÚNICAMENTE con el JSON, sin explicaciones, sin markdown, sin texto adicional.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `API error: ${err}` }, { status: 502 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    // Limpiar el JSON de posibles bloques markdown
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({ ok: true, data: parsed });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
