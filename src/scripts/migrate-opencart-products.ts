/**
 * One-off data migration: pulls categories & products from the legacy
 * OpenCart MySQL database (~/Desktop/castapos) into this project's MongoDB
 * via Prisma. Safe to re-run — categories/products are upserted by slug/sku.
 *
 * Usage: npx tsx src/scripts/migrate-opencart-products.ts
 */
import "dotenv/config";
import mysql from "mysql2/promise";
import { prisma } from "../lib/prisma";

const TR_LANG_ID = 2;
const EN_LANG_ID = 4;

const IMAGE_BASE_URL = process.env.OPENCART_IMAGE_BASE_URL ?? "https://www.castapos.com/image/";

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&", "&quot;": '"', "&#039;": "'", "&apos;": "'",
  "&lt;": "<", "&gt;": ">", "&nbsp;": " ",
};

function decodeHtmlEntities(input: string): string {
  return input.replace(/&(amp|quot|#039|apos|lt|gt|nbsp);/g, (m) => HTML_ENTITIES[m] ?? m);
}

function turkishSlugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return input
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/&/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "item";
}

function parseDurationMonths(label: string): number {
  const match = label.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.OPENCART_DB_HOST,
    port: Number(process.env.OPENCART_DB_PORT ?? 3306),
    user: process.env.OPENCART_DB_USER,
    password: process.env.OPENCART_DB_PASSWORD,
    database: process.env.OPENCART_DB_NAME,
  });

  console.log("Connected to legacy OpenCart MySQL database.");

  // ---------- Categories ----------

  const [categoryRows] = await conn.query<any[]>(
    `SELECT c.category_id, c.parent_id, c.sort_order, c.image
     FROM oc_category c ORDER BY c.category_id`
  );

  const [categoryDescRows] = await conn.query<any[]>(
    `SELECT category_id, language_id, name, short_description FROM oc_category_description`
  );
  const categoryNamesById = new Map<number, { tr?: string; en?: string; desc?: string }>();
  for (const row of categoryDescRows) {
    const entry = categoryNamesById.get(row.category_id) ?? {};
    if (row.language_id === TR_LANG_ID) { entry.tr = decodeHtmlEntities(row.name); entry.desc = row.short_description; }
    if (row.language_id === EN_LANG_ID) entry.en = decodeHtmlEntities(row.name);
    categoryNamesById.set(row.category_id, entry);
  }

  const [categorySeoRows] = await conn.query<any[]>(
    `SELECT query, language_id, keyword FROM oc_seo_url WHERE query LIKE 'category_id=%'`
  );
  const categorySlugById = new Map<number, string>();
  for (const row of categorySeoRows) {
    if (row.language_id !== TR_LANG_ID) continue;
    const id = parseInt(row.query.split("=")[1], 10);
    categorySlugById.set(id, row.keyword);
  }

  const oldToNewCategoryId = new Map<number, string>();

  // First pass: upsert without parentId (parents may not exist yet in insertion order).
  for (const row of categoryRows) {
    const names = categoryNamesById.get(row.category_id);
    const name = names?.tr ?? names?.en ?? `Kategori ${row.category_id}`;
    const slug = categorySlugById.get(row.category_id) ?? turkishSlugify(name);

    const saved = await prisma.category.upsert({
      where: { slug },
      update: {
        name,
        description: names?.desc || undefined,
        sortOrder: row.sort_order ?? 0,
        imageUrl: row.image ? `${IMAGE_BASE_URL}${row.image}` : undefined,
      },
      create: {
        slug,
        name,
        description: names?.desc || undefined,
        sortOrder: row.sort_order ?? 0,
        imageUrl: row.image ? `${IMAGE_BASE_URL}${row.image}` : undefined,
      },
    });
    oldToNewCategoryId.set(row.category_id, saved.id);
  }

  // Second pass: set parentId now that every category has a new id.
  for (const row of categoryRows) {
    if (!row.parent_id) continue;
    const newId = oldToNewCategoryId.get(row.category_id);
    const newParentId = oldToNewCategoryId.get(row.parent_id);
    if (!newId || !newParentId) continue;
    await prisma.category.update({ where: { id: newId }, data: { parentId: newParentId } });
  }

  console.log(`Migrated ${oldToNewCategoryId.size} categories.`);

  // ---------- Options lookup (option_id 5 = rental duration, everything else = variant option) ----------

  const [optionDescRows] = await conn.query<any[]>(
    `SELECT option_id, language_id, name FROM oc_option_description WHERE language_id = ${TR_LANG_ID}`
  );
  const optionNameById = new Map<number, string>(optionDescRows.map((r) => [r.option_id, decodeHtmlEntities(r.name)]));

  const [optionRows] = await conn.query<any[]>(`SELECT option_id, type FROM oc_option`);
  const optionTypeById = new Map<number, string>(optionRows.map((r) => [r.option_id, r.type]));

  const [optionValueRows] = await conn.query<any[]>(`SELECT option_value_id, option_id, color, image FROM oc_option_value`);
  const optionValueMeta = new Map<number, { colorHex?: string; imageUrl?: string }>(
    optionValueRows.map((r) => [r.option_value_id, { colorHex: r.color || undefined, imageUrl: r.image ? `${IMAGE_BASE_URL}${r.image}` : undefined }])
  );

  const [optionValueDescRows] = await conn.query<any[]>(
    `SELECT option_value_id, language_id, name FROM oc_option_value_description WHERE language_id = ${TR_LANG_ID}`
  );
  const optionValueNameById = new Map<number, string>(optionValueDescRows.map((r) => [r.option_value_id, decodeHtmlEntities(r.name)]));

  const openCartTypeToPrisma: Record<string, string> = {
    select: "SELECT",
    radio: "RADIO",
    checkbox: "CHECKBOX",
    text: "TEXT",
  };

  // ---------- Products ----------

  const [productRows] = await conn.query<any[]>(`SELECT * FROM oc_product ORDER BY product_id`);

  const [productDescRows] = await conn.query<any[]>(`SELECT product_id, language_id, name, description FROM oc_product_description`);
  const productDescById = new Map<number, { tr?: string; en?: string; description?: string }>();
  for (const row of productDescRows) {
    const entry = productDescById.get(row.product_id) ?? {};
    if (row.language_id === TR_LANG_ID) { entry.tr = decodeHtmlEntities(row.name); entry.description = row.description; }
    if (row.language_id === EN_LANG_ID) entry.en = decodeHtmlEntities(row.name);
    productDescById.set(row.product_id, entry);
  }

  const [productSeoRows] = await conn.query<any[]>(`SELECT query, language_id, keyword FROM oc_seo_url WHERE query LIKE 'product_id=%'`);
  const productSlugById = new Map<number, string>();
  for (const row of productSeoRows) {
    if (row.language_id !== TR_LANG_ID) continue;
    const id = parseInt(row.query.split("=")[1], 10);
    productSlugById.set(id, row.keyword);
  }

  const [productImageRows] = await conn.query<any[]>(`SELECT product_id, image, sort_order FROM oc_product_image ORDER BY product_id, sort_order`);
  const galleryImagesByProduct = new Map<number, { url: string; sortOrder: number }[]>();
  for (const row of productImageRows) {
    const list = galleryImagesByProduct.get(row.product_id) ?? [];
    list.push({ url: `${IMAGE_BASE_URL}${row.image}`, sortOrder: row.sort_order ?? list.length });
    galleryImagesByProduct.set(row.product_id, list);
  }

  const [productToCategoryRows] = await conn.query<any[]>(`SELECT product_id, category_id FROM oc_product_to_category`);
  const categoryIdsByProduct = new Map<number, number[]>();
  for (const row of productToCategoryRows) {
    const list = categoryIdsByProduct.get(row.product_id) ?? [];
    list.push(row.category_id);
    categoryIdsByProduct.set(row.product_id, list);
  }

  const [productOptionRows] = await conn.query<any[]>(`SELECT product_option_id, product_id, option_id, required FROM oc_product_option`);
  const [productOptionValueRows] = await conn.query<any[]>(
    `SELECT product_option_id, product_id, option_id, option_value_id, price, non_sale_price, price_prefix
     FROM oc_product_option_value`
  );
  const optionValuesByProductOptionId = new Map<number, any[]>();
  for (const row of productOptionValueRows) {
    const list = optionValuesByProductOptionId.get(row.product_option_id) ?? [];
    list.push(row);
    optionValuesByProductOptionId.set(row.product_option_id, list);
  }

  // Disambiguate sku collisions (model isn't guaranteed unique in the legacy DB).
  const skuUsage = new Map<string, number>();
  for (const p of productRows) {
    const base = (p.model || "").trim() || `URUN-${p.product_id}`;
    skuUsage.set(base, (skuUsage.get(base) ?? 0) + 1);
  }

  let migrated = 0;
  for (const p of productRows) {
    const desc = productDescById.get(p.product_id);
    const name = desc?.tr ?? desc?.en ?? `Ürün ${p.product_id}`;
    const slug = productSlugById.get(p.product_id) ?? turkishSlugify(name);

    const baseSku = (p.model || "").trim() || `URUN-${p.product_id}`;
    const sku = (skuUsage.get(baseSku) ?? 0) > 1 ? `${baseSku}-${p.product_id}` : baseSku;

    const images = [
      ...(p.image ? [{ url: `${IMAGE_BASE_URL}${p.image}`, sortOrder: -1 }] : []),
      ...(galleryImagesByProduct.get(p.product_id) ?? []),
    ].map((img, i) => ({ url: img.url, sortOrder: i }));

    const categoryIds = (categoryIdsByProduct.get(p.product_id) ?? [])
      .map((oldId) => oldToNewCategoryId.get(oldId))
      .filter((id): id is string => Boolean(id));

    const productOptions = productOptionRows.filter((po) => po.product_id === p.product_id);
    const rentalTiers: any[] = [];
    const options: any[] = [];

    for (const po of productOptions) {
      const values = optionValuesByProductOptionId.get(po.product_option_id) ?? [];

      if (po.option_id === 5) {
        for (const v of values) {
          const label = optionValueNameById.get(v.option_value_id) ?? "";
          const price = parseFloat(v.price) || 0;
          const originalPrice = parseFloat(v.non_sale_price) || 0;
          rentalTiers.push({
            label,
            durationMonths: parseDurationMonths(label),
            price,
            originalPrice: originalPrice > price ? originalPrice : undefined,
          });
        }
        continue;
      }

      const optionValues = values.map((v, i) => {
        const meta = optionValueMeta.get(v.option_value_id) ?? {};
        const amount = parseFloat(v.price) || 0;
        return {
          label: optionValueNameById.get(v.option_value_id) ?? "",
          priceModifier: v.price_prefix === "-" ? -amount : amount,
          priceModifierType: "FIXED",
          colorHex: meta.colorHex,
          imageUrl: meta.imageUrl,
          sortOrder: i,
        };
      });

      options.push({
        name: optionNameById.get(po.option_id) ?? `Seçenek ${po.option_id}`,
        type: openCartTypeToPrisma[optionTypeById.get(po.option_id) ?? "select"] ?? "SELECT",
        required: Boolean(po.required),
        sortOrder: 0,
        values: optionValues,
      });
    }
    rentalTiers.sort((a, b) => a.durationMonths - b.durationMonths);

    const buyPrice = parseFloat(p.price) || 0;
    const hasRental = rentalTiers.length > 0;
    const hasBuy = buyPrice > 0;
    const saleMode = hasRental && hasBuy ? "BOTH" : hasRental ? "RENT" : "BUY";

    const data = {
      sku,
      slug,
      name,
      description: desc?.description || undefined,
      images,
      saleMode: saleMode as any,
      buyPrice: hasBuy ? buyPrice : undefined,
      rentalTiers,
      options,
      categoryIds,
      quantity: p.quantity ?? 0,
      stockStatus: (p.quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK") as any,
      status: Boolean(p.status),
      dateAvailable: p.date_available ?? undefined,
    };

    await prisma.product.upsert({
      where: { sku },
      update: data,
      create: data,
    });
    migrated++;
  }

  console.log(`Migrated ${migrated} products.`);

  await conn.end();
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
