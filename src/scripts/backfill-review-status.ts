// Değerlendirme onay sistemi devreye girmeden (bkz. admin/degerlendirmeler)
// önce oluşturulmuş yorumların status alanı yok — bunlar zaten yayında
// olduğu için geriye dönük APPROVED işaretleniyor. status alanı olan
// (yeni sistemden sonra oluşturulmuş) kayıtlara dokunmaz.
//
// Çalıştırma: npx tsx src/scripts/backfill-review-status.ts

import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  // status alanı yeni eklendi, Prisma bu alan üzerinden "eksik" filtresi
  // kuramıyor (non-nullable enum, `null` filtresi reddediliyor). Bu betik
  // tek seferlik bir geçiş olduğundan basitçe: şu an DB'de var olan HER
  // değerlendirme, sistem devreye girmeden önce oluşturulmuş demektir —
  // hepsini koşulsuz APPROVED işaretliyoruz.
  const result = await prisma.review.updateMany({
    where: {},
    data: { status: "APPROVED" },
  });
  console.log(`${result.count} eski değerlendirme APPROVED olarak işaretlendi.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
