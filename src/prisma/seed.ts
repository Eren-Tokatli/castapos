import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, SaleMode } from "../generated/prisma";

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

async function main() {
  console.log("Seeding...");

  await prisma.installment.deleteMany({});
  await prisma.rentalAgreement.deleteMany({});
  await prisma.paymentRecord.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.storeProfile.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.user.deleteMany({});

  const categories = await Promise.all(
    [
      { slug: "telefon-tablet", name: "Telefon & Tablet", sortOrder: 1 },
      { slug: "bilgisayar", name: "Bilgisayar", sortOrder: 2 },
      { slug: "kamera-goruntu", name: "Kamera & Görüntü", sortOrder: 3 },
      { slug: "oyun-etkinlik", name: "Oyun & Etkinlik Ekipmanları", sortOrder: 4 },
    ].map((c) => prisma.category.create({ data: c }))
  );

  const [telefonTablet, bilgisayar, kamera, oyunEtkinlik] = categories;

  const products: Parameters<typeof prisma.product.create>[0]["data"][] = [
    {
      sku: "IPH15PRO-128",
      slug: "iphone-15-pro-128gb",
      name: "iPhone 15 Pro 128GB",
      description: "Satın al veya aylık kirala. Kiralamada cihaz garantili teslim edilir.",
      images: [{ url: "/images/products/iphone-15-pro.jpg", sortOrder: 0 }],
      saleMode: SaleMode.BOTH,
      buyPrice: 54999,
      buySpecialPrice: 52999,
      rentalTiers: [
        { label: "1 Ay", durationMonths: 1, price: 2999, originalPrice: 3499, sortOrder: 0 },
        { label: "3 Ay", durationMonths: 3, price: 7999, originalPrice: 9499, sortOrder: 1 },
        { label: "6 Ay", durationMonths: 6, price: 14999, originalPrice: 18999, sortOrder: 2 },
      ],
      options: [
        {
          name: "Renk",
          type: "SELECT",
          required: true,
          values: [
            { label: "Doğal Titanyum", priceModifier: 0, sortOrder: 0 },
            { label: "Siyah Titanyum", priceModifier: 0, sortOrder: 1 },
          ],
        },
      ],
      categoryIds: [telefonTablet.id],
      quantity: 15,
      stockStatus: "IN_STOCK",
    },
    {
      sku: "IPADPRO-129",
      slug: "ipad-pro-12-9",
      name: "iPad Pro 12.9 inç",
      description: "Etkinlikler ve ofis kullanımı için satın alma veya kiralama seçenekleri.",
      images: [{ url: "/images/products/ipad-pro.jpg", sortOrder: 0 }],
      saleMode: SaleMode.BOTH,
      buyPrice: 38999,
      rentalTiers: [
        { label: "1 Ay", durationMonths: 1, price: 2199, originalPrice: 2599, sortOrder: 0 },
        { label: "3 Ay", durationMonths: 3, price: 5799, originalPrice: 6999, sortOrder: 1 },
      ],
      options: [
        {
          name: "Renk",
          type: "SELECT",
          required: false,
          values: [
            { label: "Uzay Grisi", priceModifier: 0, sortOrder: 0 },
            { label: "Gümüş", priceModifier: 0, sortOrder: 1 },
          ],
        },
      ],
      categoryIds: [telefonTablet.id],
      quantity: 10,
      stockStatus: "IN_STOCK",
    },
    {
      sku: "MBA-M2-256",
      slug: "macbook-air-m2-256gb",
      name: "MacBook Air M2 256GB",
      description: "Uzun süreli projeler için satın al, kısa süreli işler için kirala.",
      images: [{ url: "/images/products/macbook-air-m2.jpg", sortOrder: 0 }],
      saleMode: SaleMode.BOTH,
      buyPrice: 42999,
      rentalTiers: [
        { label: "1 Ay", durationMonths: 1, price: 3499, originalPrice: 3999, sortOrder: 0 },
        { label: "3 Ay", durationMonths: 3, price: 9499, originalPrice: 11499, sortOrder: 1 },
        { label: "6 Ay", durationMonths: 6, price: 17999, originalPrice: 21999, sortOrder: 2 },
      ],
      categoryIds: [bilgisayar.id],
      quantity: 8,
      stockStatus: "IN_STOCK",
    },
    {
      sku: "PS5-DISC",
      slug: "playstation-5",
      name: "PlayStation 5 (Disk Sürümü)",
      description: "Etkinlikler, doğum günleri ve kısa dönem kullanımlar için ideal.",
      images: [{ url: "/images/products/ps5.jpg", sortOrder: 0 }],
      saleMode: SaleMode.BOTH,
      buyPrice: 24999,
      rentalTiers: [
        { label: "1 Hafta", durationMonths: 0, price: 999, originalPrice: 1299, sortOrder: 0 },
        { label: "1 Ay", durationMonths: 1, price: 2499, originalPrice: 2999, sortOrder: 1 },
      ],
      categoryIds: [oyunEtkinlik.id],
      quantity: 12,
      stockStatus: "IN_STOCK",
    },
    {
      sku: "SONY-A7IV",
      slug: "sony-a7-iv",
      name: "Sony A7 IV Fotoğraf Makinesi",
      description: "Sadece kiralık — profesyonel çekimler için günlük/aylık kiralama.",
      images: [{ url: "/images/products/sony-a7-iv.jpg", sortOrder: 0 }],
      saleMode: SaleMode.RENT,
      rentalTiers: [
        { label: "1 Gün", durationMonths: 0, price: 799, sortOrder: 0 },
        { label: "1 Hafta", durationMonths: 0, price: 3499, originalPrice: 3999, sortOrder: 1 },
        { label: "1 Ay", durationMonths: 1, price: 8999, originalPrice: 10999, sortOrder: 2 },
      ],
      categoryIds: [kamera.id],
      quantity: 5,
      stockStatus: "IN_STOCK",
    },
    {
      sku: "CANON-R10-KIT",
      slug: "canon-eos-r10-kit",
      name: "Canon EOS R10 Kit",
      description: "Başlangıç seviyesi profesyonel fotoğrafçılık için satın al veya kirala.",
      images: [{ url: "/images/products/canon-r10.jpg", sortOrder: 0 }],
      saleMode: SaleMode.BOTH,
      buyPrice: 32999,
      rentalTiers: [
        { label: "1 Hafta", durationMonths: 0, price: 2799, originalPrice: 3299, sortOrder: 0 },
        { label: "1 Ay", durationMonths: 1, price: 6999, originalPrice: 8499, sortOrder: 1 },
      ],
      categoryIds: [kamera.id],
      quantity: 6,
      stockStatus: "IN_STOCK",
    },
    {
      sku: "GOPRO-H12",
      slug: "gopro-hero-12",
      name: "GoPro Hero 12",
      description: "Tatil ve aksiyon çekimleri için satın al veya kısa süreli kirala.",
      images: [{ url: "/images/products/gopro-hero-12.jpg", sortOrder: 0 }],
      saleMode: SaleMode.BOTH,
      buyPrice: 15999,
      rentalTiers: [
        { label: "1 Hafta", durationMonths: 0, price: 1299, originalPrice: 1599, sortOrder: 0 },
      ],
      categoryIds: [kamera.id],
      quantity: 20,
      stockStatus: "IN_STOCK",
    },
    {
      sku: "DJI-MINI4PRO",
      slug: "dji-mini-4-pro",
      name: "DJI Mini 4 Pro Drone",
      description: "Hobi ve profesyonel çekimler için satın alma veya kiralama.",
      images: [{ url: "/images/products/dji-mini-4-pro.jpg", sortOrder: 0 }],
      saleMode: SaleMode.BOTH,
      buyPrice: 27999,
      rentalTiers: [
        { label: "1 Hafta", durationMonths: 0, price: 2199, originalPrice: 2699, sortOrder: 0 },
        { label: "1 Ay", durationMonths: 1, price: 5999, originalPrice: 7499, sortOrder: 1 },
      ],
      categoryIds: [kamera.id],
      quantity: 7,
      stockStatus: "IN_STOCK",
    },
    {
      sku: "EPSON-EBX51",
      slug: "epson-eb-x51-projeksiyon",
      name: "Epson EB-X51 Projeksiyon Cihazı",
      description: "Sadece kiralık — sunum ve etkinlikler için günlük kiralama.",
      images: [{ url: "/images/products/epson-eb-x51.jpg", sortOrder: 0 }],
      saleMode: SaleMode.RENT,
      rentalTiers: [
        { label: "1 Gün", durationMonths: 0, price: 499, sortOrder: 0 },
        { label: "1 Hafta", durationMonths: 0, price: 1999, originalPrice: 2499, sortOrder: 1 },
      ],
      categoryIds: [oyunEtkinlik.id],
      quantity: 4,
      stockStatus: "IN_STOCK",
    },
    {
      sku: "JBL-PARTYBOX310",
      slug: "jbl-partybox-310",
      name: "JBL PartyBox 310 Ses Sistemi",
      description: "Sadece kiralık — düğün, parti ve etkinlikler için.",
      images: [{ url: "/images/products/jbl-partybox-310.jpg", sortOrder: 0 }],
      saleMode: SaleMode.RENT,
      rentalTiers: [
        { label: "1 Gün", durationMonths: 0, price: 899, sortOrder: 0 },
        { label: "1 Hafta", durationMonths: 0, price: 2999, originalPrice: 3599, sortOrder: 1 },
      ],
      categoryIds: [oyunEtkinlik.id],
      quantity: 6,
      stockStatus: "IN_STOCK",
    },
  ];

  await Promise.all(products.map((data) => prisma.product.create({ data })));
  console.log(`Created ${products.length} products across ${categories.length} categories.`);

  const demoCustomer = await prisma.user.create({
    data: {
      email: "demo@castapos.com",
      passwordHash: await bcrypt.hash("demo1234", 10),
      firstName: "Demo",
      lastName: "Müşteri",
      phone: "+905000000000",
      role: "CUSTOMER",
      customerProfile: {
        create: {
          addresses: [
            {
              firstName: "Demo",
              lastName: "Müşteri",
              addressLine1: "Örnek Mahallesi, Örnek Sokak No:1",
              city: "İstanbul",
              postcode: "34000",
              isDefault: true,
            },
          ],
        },
      },
    },
  });
  console.log(`Created demo customer: ${demoCustomer.email} (password: demo1234)`);

  const demoAdmin = await prisma.user.create({
    data: {
      email: "admin@castapos.com",
      passwordHash: await bcrypt.hash("admin1234", 10),
      firstName: "Castapos",
      lastName: "Admin",
      phone: "+905111111111",
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${demoAdmin.email} (password: admin1234)`);

  const demoSupport = await prisma.user.create({
    data: {
      email: "destek@castapos.com",
      passwordHash: await bcrypt.hash("destek1234", 10),
      firstName: "Castapos",
      lastName: "Destek",
      phone: "+905222222222",
      role: "SUPPORT",
    },
  });
  console.log(`Created support user: ${demoSupport.email} (password: destek1234)`);

  const demoSeller = await prisma.user.create({
    data: {
      email: "satici@castapos.com",
      passwordHash: await bcrypt.hash("satici1234", 10),
      firstName: "Örnek",
      lastName: "Satıcı",
      phone: "+905333333333",
      role: "SELLER",
      storeProfile: {
        create: {
          name: "Örnek Teknoloji Mağazası",
          slug: "ornek-teknoloji",
          description: "En son teknoloji kiralık cihazlar.",
          balance: 15400,
        },
      },
    },
  });
  console.log(`Created seller user: ${demoSeller.email} (password: satici1234)`);

  const today = new Date();
  const daysFromNow = (n: number) => new Date(today.getTime() + n * 24 * 60 * 60 * 1000);

  const agreement1 = await prisma.rentalAgreement.create({
    data: {
      userId: demoCustomer.id,
      assetName: "MacBook Air M2 256GB",
      assetSku: "MBA-M2-256",
      tenantName: "Ahmet Yılmaz",
      taxOrNationalId: "11111111110",
      phone: "+905551112233",
      email: "ahmet.yilmaz@example.com",
      city: "İstanbul",
      rentalTermMonths: 6,
      monthlyAmount: 3499,
      rentalStart: daysFromNow(-30),
      rentalEnd: daysFromNow(150),
      deliveryStatus: "DELIVERED",
      paymentStatus: "CURRENT",
    },
  });

  await prisma.installment.createMany({
    data: [
      { rentalAgreementId: agreement1.id, dueDate: daysFromNow(-30), amount: 3499, paid: true, description: "1. Ay Ödemesi" },
      { rentalAgreementId: agreement1.id, dueDate: daysFromNow(0), amount: 3499, paid: false, description: "2. Ay Ödemesi" },
      { rentalAgreementId: agreement1.id, dueDate: daysFromNow(30), amount: 3499, paid: false, description: "3. Ay Ödemesi" },
    ],
  });

  const agreement2 = await prisma.rentalAgreement.create({
    data: {
      userId: demoCustomer.id,
      assetName: "Sony A7 IV Fotoğraf Makinesi",
      assetSku: "SONY-A7IV",
      tenantName: "Elif Kaya",
      taxOrNationalId: "22222222220",
      phone: "+905552223344",
      email: "elif.kaya@example.com",
      city: "Ankara",
      rentalTermMonths: 1,
      monthlyAmount: 8999,
      rentalStart: daysFromNow(-5),
      rentalEnd: daysFromNow(25),
      deliveryStatus: "DELIVERED",
      paymentStatus: "LATE",
    },
  });

  await prisma.installment.createMany({
    data: [
      { rentalAgreementId: agreement2.id, dueDate: daysFromNow(-5), amount: 8999, paid: false, description: "1. Ay Ödemesi" },
    ],
  });

  console.log("Created 2 rental agreements with installment schedules.");
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
