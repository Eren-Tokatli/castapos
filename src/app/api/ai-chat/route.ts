import { NextResponse } from "next/server";
import { defaultPeriod, formatPrice, monthlyPrice, type CatalogProduct } from "@/lib/catalog-shared";
import { getActiveProducts } from "@/lib/catalog-server";

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

function getCatalogContext(products: CatalogProduct[]) {
  return products.map((product) => {
    const period = defaultPeriod(product);
    return [
      product.name,
      `kategori: ${product.category}`,
      `marka: ${product.brand}`,
      `aylik: ${formatPrice(monthlyPrice(product, period))}`,
      `sureler: ${product.periods.join(", ")} ay`,
      `url: /urun/${product.id}`,
    ].join(" | ");
  }).join("\n");
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

type RecommendedProduct = {
  id: string;
  name: string;
  image: string;
  monthly: string;
  url: string;
};

// AI cevabinda gecen /urun/<slug> referanslarini katalogla eslestirip kart
// verisine cevirir; metinden de link/kalin isaretlerini temizler ki ayni
// urun hem duz yazida hem kartta cift gosterilmesin.
function extractRecommendedProducts(text: string, catalog: CatalogProduct[]): { cleanedText: string; products: RecommendedProduct[] } {
  const slugPattern = /\/urun\/([a-z0-9-]+)/g;
  const foundSlugs = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = slugPattern.exec(text)) !== null) {
    foundSlugs.add(match[1]);
  }

  const products: RecommendedProduct[] = Array.from(foundSlugs)
    .map((slug) => catalog.find((product) => product.id === slug))
    .filter((product): product is CatalogProduct => !!product)
    .slice(0, 4)
    .map((product) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      monthly: formatPrice(monthlyPrice(product, defaultPeriod(product))),
      url: `/urun/${product.id}`,
    }));

  const cleanedText = text
    .replace(/\[([^\]]+)\]\(\/urun\/[a-z0-9-]+\)/g, "$1")
    .replace(/\/urun\/[a-z0-9-]+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([.,;:!?])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { cleanedText, products };
}

type ClarifyQuestion = {
  question: string;
  options: string[];
};

// AI, cok genel bir istekte netlestirme sorusu sorarken cevabinin sonuna
// "SORU: ...\nSECENEK: ...\nSECENEK: ..." bloğu ekliyor (bkz. sistem promptu).
// Bu blogu ayiklayip tikanabilir secenek olarak dondurur, ekrandan da temizler.
function extractClarifyQuestion(text: string): { displayText: string; clarify: ClarifyQuestion | null } {
  const pattern = /SORU:\s*(.+)\n((?:[ \t]*SECENEK:\s*.+\n?){2,4})/i;
  const match = text.match(pattern);
  if (!match) return { displayText: text.trim(), clarify: null };

  const question = match[1].trim();
  const options = match[2]
    .split("\n")
    .map((line) => line.replace(/^[ \t]*SECENEK:\s*/i, "").trim())
    .filter(Boolean)
    .slice(0, 4);

  if (options.length < 2 || !question) return { displayText: text.trim(), clarify: null };

  const displayText = text.replace(match[0], "").trim();
  return { displayText: displayText || question, clarify: { question, options } };
}

// Gemini/OpenAI'den gelen ham metni tek yerden isleyip API cevabini kurar:
// urun kartlarini ayiklar, netlestirme sorusunu ayiklar, ekrana giden metni
// temizler. historyReply urun linkleri temizlenmis ama SORU/SECENEK blogu
// KORUNMUS halidir — boylece bir sonraki turda model kendi sordugu soruyu
// ve secenekleri konusma gecmisinde hala gorur, tekrar sormaz.
function buildChatResponse(rawReply: string, catalog: CatalogProduct[]) {
  if (!rawReply) {
    return NextResponse.json({
      reply: "Şu anda net bir yanıt üretemedim. Canlı destek ekibine yönlenerek hızlıca yardım alabilirsin.",
      historyReply: "",
      products: [],
      clarify: null,
    });
  }

  const { cleanedText, products } = extractRecommendedProducts(rawReply, catalog);
  const { displayText, clarify } = extractClarifyQuestion(cleanedText);

  return NextResponse.json({
    reply: displayText,
    historyReply: cleanedText,
    products,
    clarify,
  });
}

function buildSystemPrompt(products: CatalogProduct[]) {
  return [
    "Sen Castapos'un Turkce konusan kiralama destek asistanisin.",
    "Kisa, net, premium ve guven veren cevaplar ver.",
    "Urun secimi, kiralama suresi, teslimat, sepet, KDV ve destek konularinda yardimci ol.",
    "Kilo verme, saglik, diyet veya tibbi konularda kesin tavsiye verme; sadece genel urun secimi bilgisi ver ve gerekirse profesyonel destek oner.",
    "Kesin stok, teslimat tarihi veya hukuki/finansal garanti verme; gerekli durumlarda canli destek veya sepet adimina yonlendir.",
    "Kullanici urun ariyorsa katalogdaki en uygun 1-3 urunu onerebilirsin; onerdigin her urun icin hem adini hem de katalogdaki url'sini (/urun/... seklinde) cevaba dahil et. Bu url ekrana yazilmayacak, sadece urun kartini otomatik olusturmak icin arka planda kullanilacak; bu yuzden metin akisini bozsa bile mutlaka ekle.",
    "Cevaplarinda markdown bicimlendirmesi kullanma: yildiz (**) ile kalinlastirma veya kose parantezli link ([metin](url)) yazma. Urun adini ve /urun/... yolunu duz metin olarak, yan yana yaz.",
    "Kullanici sadece genel bir kategori yazip ozellik/butce/sure gibi hicbir tercih belirtmediyse (ör. sadece 'kosu bandi istiyorum'), urun onermeden once TEK bir netlestirme sorusu sorabilirsin. Bu durumda cevabinin EN SONUNA, baska hicbir yerde kullanmadan, tam olarak su formatta bir blok ekle:\nSORU: <kisa soru>\nSECENEK: <secenek 1>\nSECENEK: <secenek 2>\nSECENEK: <secenek 3>\nEn az 2 en fazla 4 secenek olsun, her secenek 1-3 kelime, somut ve katalogdaki urunlerin gercek ozelliklerine dayali olsun (ör. 'Guclu motor', 'Katlanabilir', 'Butce dostu'). Konusma gecmisinde zaten boyle bir SORU sordugunu goruyorsan veya kullanici zaten bir tercih belirtmisse (butce, sure, ozellik, marka vb.) bir daha SORU bloğu yazma; bu durumda dogrudan katalogdan urun oner.",
    "Cevaplari 2-5 cumle arasinda tut.",
    `Katalog ozeti:\n${getCatalogContext(products)}`,
  ].join("\n");
}

function buildConversation(messages: ChatMessage[]) {
  return messages.map((message) => `${message.role === "user" ? "Musteri" : "Castapos AI"}: ${message.text}`).join("\n");
}

async function askGemini(messages: ChatMessage[], products: CatalogProduct[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(`${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildSystemPrompt(products) }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: buildConversation(messages) }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2048,
      },
    }),
  });

  const data = (await response.json().catch(() => null)) as GeminiResponse | null;

  if (!response.ok) {
    // Gemini basarisiz oldu (kota, gecersiz model, sunucu hatasi vb.) — burada
    // hatayi direkt kullaniciya dondurmek yerine null donup OpenAI'ye fallback
    // yapiyoruz (OPENAI_API_KEY tanimliysa). Sadece ikisi de basarisiz olursa
    // kullanici bir hata gorur.
    console.error("Gemini istegi basarisiz:", response.status, data?.error?.message);
    return null;
  }

  return buildChatResponse(data ? extractGeminiReply(data) : "", products);
}

async function askOpenAI(messages: ChatMessage[], products: CatalogProduct[]) {
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
      instructions: buildSystemPrompt(products),
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

  return buildChatResponse(data ? extractReply(data) : "", products);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { messages?: unknown } | null;
  const messages = sanitizeMessages(body?.messages);

  if (messages.length === 0) {
    return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 400 });
  }

  const products = await getActiveProducts();

  const geminiResponse = await askGemini(messages, products);
  if (geminiResponse) return geminiResponse;

  const openAIResponse = await askOpenAI(messages, products);
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
