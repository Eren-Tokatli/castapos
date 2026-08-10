import { NextResponse } from "next/server";
import { PRODUCTS, defaultPeriod, formatPrice, monthlyPrice } from "@/lib/products-data";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

function getCatalogContext() {
  return PRODUCTS.slice(0, 18)
    .map((product) => {
      const period = defaultPeriod(product);
      return [
        product.name,
        `kategori: ${product.category}`,
        `marka: ${product.brand}`,
        `aylik: ${formatPrice(monthlyPrice(product, period))}`,
        `sureler: ${product.periods.join(", ")} ay`,
        `url: /urun/${product.id}`,
      ].join(" | ");
    })
    .join("\n");
}

function sanitizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message): message is ChatMessage => {
      if (!message || typeof message !== "object") return false;
      const maybeMessage = message as Partial<ChatMessage>;
      return (maybeMessage.role === "assistant" || maybeMessage.role === "user") && typeof maybeMessage.text === "string";
    })
    .map((message) => ({
      role: message.role,
      text: message.text.trim().slice(0, 900),
    }))
    .filter((message) => message.text.length > 0)
    .slice(-10);
}

function extractReply(data: OpenAIResponse) {
  if (data.output_text?.trim()) return data.output_text.trim();

  const nestedText = data.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter((text): text is string => !!text?.trim())
    .join("\n")
    .trim();

  return nestedText || "";
}

function extractGeminiReply(data: GeminiResponse) {
  return (
    data.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text)
      .filter((text): text is string => !!text?.trim())
      .join("\n")
      .trim() || ""
  );
}

function buildSystemPrompt() {
  return [
    "Sen Castapos'un Turkce konusan kiralama destek asistanisin.",
    "Kisa, net, premium ve guven veren cevaplar ver.",
    "Urun secimi, kiralama suresi, teslimat, sepet, KDV ve destek konularinda yardimci ol.",
    "Kilo verme, saglik, diyet veya tibbi konularda kesin tavsiye verme; sadece genel urun secimi bilgisi ver ve gerekirse profesyonel destek oner.",
    "Kesin stok, teslimat tarihi veya hukuki/finansal garanti verme; gerekli durumlarda canli destek veya sepet adimina yonlendir.",
    "Kullanici urun ariyorsa katalogdaki benzer urunleri ve URL'leri onerebilirsin.",
    "Cevaplari 2-5 cumle arasinda tut.",
    `Katalog ozeti:\n${getCatalogContext()}`,
  ].join("\n");
}

function buildConversation(messages: ChatMessage[]) {
  return messages.map((message) => `${message.role === "user" ? "Musteri" : "Castapos AI"}: ${message.text}`).join("\n");
}

async function askGemini(messages: ChatMessage[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(`${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildSystemPrompt() }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: buildConversation(messages) }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 720,
      },
    }),
  });

  const data = (await response.json().catch(() => null)) as GeminiResponse | null;

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data?.error?.message?.includes("no longer available")
            ? "Gemini model ayarı güncel değil. GEMINI_MODEL değerini gemini-3.6-flash olarak güncelle ve dev server'ı yeniden başlat."
            : data?.error?.message || "Gemini yanıtı alınamadı. Lütfen biraz sonra tekrar dene.",
      },
      { status: response.status }
    );
  }

  return NextResponse.json({
    reply: data ? extractGeminiReply(data) : "Şu anda net bir yanıt üretemedim. Canlı destek ekibine yönlenerek hızlıca yardım alabilirsin.",
  });
}

async function askOpenAI(messages: ChatMessage[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const conversation = buildConversation(messages);

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: buildSystemPrompt(),
      input: conversation,
    }),
  });

  const data = (await response.json().catch(() => null)) as OpenAIResponse | null;

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.message || "OpenAI yanıtı alınamadı. Lütfen biraz sonra tekrar dene." },
      { status: response.status }
    );
  }

  return NextResponse.json({
    reply: data ? extractReply(data) : "Şu anda net bir yanıt üretemedim. Canlı destek ekibine yönlenerek hızlıca yardım alabilirsin.",
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { messages?: unknown } | null;
  const messages = sanitizeMessages(body?.messages);

  if (messages.length === 0) {
    return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 400 });
  }

  const geminiResponse = await askGemini(messages);
  if (geminiResponse) return geminiResponse;

  const openAIResponse = await askOpenAI(messages);
  if (openAIResponse) return openAIResponse;

  return NextResponse.json(
    {
      error:
        "AI sohbetin çalışması için .env.local içine GEMINI_API_KEY veya OPENAI_API_KEY eklenmeli. Anahtar eklendikten sonra dev server yeniden başlatılmalı.",
    },
    { status: 503 }
  );
}

export const runtime = "nodejs";

export const dynamic = "force-dynamic";
