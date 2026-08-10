export interface ProductStatic {
  id: string;
  name: string;
  code: string;
  brand: string;
  category: string;
  collection: string;
  price: number;
  badge: string | null;
  discount: string | null;
  premium: boolean;
  image: string;
  summary: string;
  specs: string[];
  periods: number[];
}

export interface NavCategory {
  name: string;
  href: string;
  highlight?: boolean;
  groups: [string, { label: string; href: string; all?: boolean }[]][];
}

export const PRODUCTS: ProductStatic[] = [
  {
    id: "walkingpad-r2-pro",
    name: "WalkingPad R2 Pro Katlanabilir Koşu Bandı",
    code: "SPR152",
    brand: "WalkingPad",
    category: "Koşu Bantları",
    collection: "Koşu Bantları",
    price: 3670,
    badge: "Premium",
    discount: null,
    premium: true,
    image: "/assets/products/real-walkingpad-r2.jpg",
    summary: "Sessiz motoru, 12 km/s hız kapasitesi ve katlanabilir gövdesiyle evde düzenli koşu/yürüyüş deneyimi sunar.",
    specs: [
      "Motor: 1.25 HP DC sessiz fırçasız motor",
      "Hız: 0.5 - 12 km/s",
      "Taşıma kapasitesi: 110 kg",
      "Gövde: Katlanabilir yapı",
      "Kullanım: Ev/ofis kullanımına uygun"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "voit-astra",
    name: "Voit Astra Koşu Bandı",
    code: "SPR085",
    brand: "Voit",
    category: "Koşu Bantları",
    collection: "Koşu Bantları",
    price: 3580,
    badge: "Popüler",
    discount: null,
    premium: true,
    image: "/assets/products/voit-super-fit.svg",
    summary: "Evde düzenli spor yapmak isteyenler için güçlü motor ve konforlu koşu alanı.",
    specs: [
      "Kullanım: Ev tipi koşu bandı",
      "Ekran: Dijital ekran",
      "Tasarım: Katlanabilir yapı",
      "Bölge: İstanbul içi kiralama"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "voit-super-fit",
    name: "Voit Super Fit Katlanabilir Koşu Bandı",
    code: "SPR084",
    brand: "Voit",
    category: "Koşu Bantları",
    collection: "Koşu Bantları",
    price: 3235,
    badge: "Kampanyalı",
    discount: "-%20",
    premium: false,
    image: "/assets/products/voit-super-fit.svg",
    summary: "Katlanabilir tasarımıyla evde düzenli koşu rutini için pratik çözüm.",
    specs: [
      "Tasarım: Katlanabilir yapı",
      "Kullanım: Ev tipi kullanım",
      "Panel: Dijital kontrol paneli",
      "Depolama: Kolay saklama",
      "Destek: Teknik servis desteği"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "urevo-25hp",
    name: "Urevo 2.5HP Katlanabilir Koşu Bandı",
    code: "SPR094",
    brand: "Urevo",
    category: "Koşu Bantları",
    collection: "Koşu Bantları",
    price: 1435,
    badge: "Avantajlı",
    discount: "-%55",
    premium: false,
    image: "/assets/products/real-urevo-25hp.jpg",
    summary: "2.5HP motor gücü ve katlanabilir formuyla evde koşu/yürüyüş için erişilebilir model.",
    specs: [
      "Motor: 2.5 HP motor gücü",
      "Hız: 0 - 12 km/s maksimum hız",
      "Taşıma kapasitesi: 120 kg",
      "Bant alanı: 106 x 42 cm",
      "Özellik: Nabız ölçme sistemi"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "cardio-kosu",
    name: "Cardio Koşu Bandı",
    code: "SPR301",
    brand: "Cardio",
    category: "Koşu Bantları",
    collection: "Koşu Bantları",
    price: 2530,
    badge: "Güçlü motor",
    discount: null,
    premium: false,
    image: "/assets/products/dynamic-runpad.svg",
    summary: "Daha güçlü antrenman ihtiyacı olan kullanıcılar için yüksek motor gücü odaklı koşu bandı.",
    specs: [
      "Motor: 3.0 HP sürekli motor",
      "Alan: Geniş koşu alanı",
      "Kullanım: Ev/ofis kullanımı",
      "Panel: Dijital panel",
      "Model: Kiralama seçeneği"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "walkingpad-s1-c2",
    name: "WalkingPad S1/C2 Pro Katlanabilir Yürüme Bandı",
    code: "SPR070",
    brand: "WalkingPad",
    category: "Yürüyüş Bantları",
    collection: "Yürüyüş Bantları",
    price: 1965,
    badge: "Kompakt",
    discount: "-%20",
    premium: false,
    image: "/assets/products/dynamic-runpad.svg",
    summary: "Küçük alanlarda günlük yürüyüş rutini oluşturmak için sessiz ve kompakt seçenek.",
    specs: [
      "Motor: 1.25 HP yüksek verimli motor",
      "Hız: 0.5 - 6 km/s",
      "Taşıma kapasitesi: 105 kg",
      "Uygulama: KS Fit uygulama desteği",
      "Tasarım: Katlanabilir kompakt yapı"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "dynamic-runpad",
    name: "Dynamic Runpad Yürüyüş Bandı",
    code: "SPR-Y",
    brand: "Dynamic",
    category: "Yürüyüş Bantları",
    collection: "Yürüyüş Bantları",
    price: 1600,
    badge: "Günlük kullanım",
    discount: null,
    premium: false,
    image: "/assets/products/dynamic-runpad.svg",
    summary: "Günlük yürüyüş alışkanlığı için sade ve pratik kiralama alternatifi.",
    specs: [
      "Ürün tipi: Yürüyüş bandı",
      "Tasarım: Düşük yer kaplama",
      "Kullanım: Ev kullanımı",
      "Kontrol: Kolay kontrol",
      "Taşıma: Pratik taşıma"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "relax-runpad",
    name: "Relax Uzaktan Kumandalı Portatif Yürüme ve Koşu Bandı",
    code: "SPR401",
    brand: "Relax",
    category: "Yürüyüş Bantları",
    collection: "Yürüyüş Bantları",
    price: 1300,
    badge: "Portatif",
    discount: "-%15",
    premium: false,
    image: "/assets/products/relax-runpad.svg",
    summary: "Uzaktan kumandalı portatif yapısıyla düşük tempolu spor için kolay başlangıç.",
    specs: [
      "Kontrol: Uzaktan kumanda",
      "Tasarım: Portatif yapı",
      "Kullanım: Ev içi kullanım",
      "Taşıma: Kolay taşıma",
      "Yoğunluk: Yürüyüş/hafif koşu"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "urevo-u1",
    name: "Urevo U1 Walkingpad Yürüyüş Bandı",
    code: "SPR-BBB",
    brand: "Urevo",
    category: "Yürüyüş Bantları",
    collection: "Yürüyüş Bantları",
    price: 1800,
    badge: "Yeni",
    discount: null,
    premium: false,
    image: "/assets/products/dynamic-runpad.svg",
    summary: "Evde ve ofiste kullanım için düşük yer kaplayan walkingpad alternatifi.",
    specs: [
      "Form: Walkingpad formu",
      "Gövde: Kompakt gövde",
      "Ses: Düşük ses",
      "Depolama: Kolay saklama",
      "Model: Aylık kiralama"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "voit-oxycycle",
    name: "Voit Oxycycle Kondisyon Bisikleti",
    code: "SPR091",
    brand: "Voit",
    category: "Bisiklet",
    collection: "Bisiklet",
    price: 800,
    badge: "En ekonomik",
    discount: "-%25",
    premium: false,
    image: "/assets/products/voit-oxycycle.svg",
    summary: "Sessiz ve kompakt yapısıyla evde düşük tempolu kardiyo için ideal kondisyon bisikleti.",
    specs: [
      "Sistem: Manyetik çalışma tipi",
      "Ekran: LCD ekran",
      "Göstergeler: Zaman, kalori ve pedal sayısı",
      "Kademe: 1 - 12 kademe hız ayarı",
      "Taşıma kapasitesi: 90 kg"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "voit-at1000",
    name: "Voit AT 1000 Dikey Kondisyon Bisikleti",
    code: "SPR074",
    brand: "Voit",
    category: "Bisiklet",
    collection: "Bisiklet",
    price: 2025,
    badge: null,
    discount: null,
    premium: false,
    image: "/assets/products/voit-at1000.svg",
    summary: "Evde dikey bisiklet deneyimi isteyenler için güçlü ve konforlu model.",
    specs: [
      "Tür: Dikey bisiklet",
      "Ekran: LCD ekran",
      "Direnç: Ayarlanabilir direnç",
      "Kullanım: Ev tipi kullanım"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "btwin-fold-500",
    name: "Btwin Fold 500 Katlanır Bisiklet",
    code: "SPR-QQQ",
    brand: "Btwin",
    category: "Bisiklet",
    collection: "Bisiklet",
    price: 3360,
    badge: "Yaz sezonu",
    discount: "-%10",
    premium: false,
    image: "/assets/products/btwin-fold500.svg",
    summary: "Şehir içi ve dönemsel kullanım için katlanabilir bisiklet seçeneği.",
    specs: [
      "Kadro: Katlanabilir kadro",
      "Kullanım: Şehir içi kullanım",
      "Taşıma: Kolay taşıma",
      "Depolama: Kompakt saklama",
      "Model: Dönemsel kiralama"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "btwin-fold-120",
    name: "Btwin Fold 120 Katlanır Bisiklet",
    code: "SPR-FFF",
    brand: "Btwin",
    category: "Bisiklet",
    collection: "Bisiklet",
    price: 2100,
    badge: "Kompakt",
    discount: null,
    premium: false,
    image: "/assets/products/btwin-fold500.svg",
    summary: "Günlük ulaşım ve yaz sezonu kullanımı için pratik katlanır bisiklet.",
    specs: [
      "Kadro: Katlanabilir kadro",
      "Kullanım: Pratik kullanım",
      "Sürüş: Şehir içi sürüş",
      "Depolama: Kolay saklama",
      "Model: Kiralama seçeneği"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "wero-ai-bike",
    name: "Wero AI Bike Home Akıllı Kondisyon Bisikleti",
    code: "SPR170",
    brand: "Wero",
    category: "Fitness",
    collection: "Fitness",
    price: 2750,
    badge: "AI",
    discount: null,
    premium: true,
    image: "/assets/products/wero-bike.svg",
    summary: "Yapay zeka destekli antrenman, sanal sürüş ve etkileşimli spor deneyimi.",
    specs: [
      "Güç: 30W - 250W çıkış gücü",
      "Tür: Dikey bisiklet tipi",
      "Bağlantı: Bluetooth bağlantısı",
      "Taşıma kapasitesi: 120 kg",
      "Özellik: Ayarlanabilir sele ve akıllı antrenman"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "domyos-el120",
    name: "Domyos EL120 Eliptik Bisiklet",
    code: "SPR501",
    brand: "Domyos",
    category: "Fitness",
    collection: "Fitness",
    price: 1470,
    badge: "Eliptik",
    discount: "-%10",
    premium: false,
    image: "/assets/products/vfit-eos.svg",
    summary: "Düşük darbe etkili kardiyo için ev tipi eliptik bisiklet.",
    specs: [
      "Hareket: Eliptik hareket",
      "Etki: Düşük darbe etkisi",
      "Kullanım: Ev tipi kullanım",
      "Gösterge: LCD gösterge",
      "Odak: Kardiyo odaklı"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "vfit-eos",
    name: "Vfit EOS Manyetik Eliptik Kondisyon Bisikleti",
    code: "SPR502",
    brand: "VFit",
    category: "Fitness",
    collection: "Fitness",
    price: 1600,
    badge: "Manyetik",
    discount: null,
    premium: false,
    image: "/assets/products/vfit-eos.svg",
    summary: "Tüm vücut kardiyo çalışması için konforlu ve sessiz eliptik çözüm.",
    specs: [
      "Direnç: Manyetik direnç",
      "Tür: Eliptik çalışma",
      "Gösterge: LCD gösterge",
      "Etki: Düşük darbe",
      "Kullanım: Ev tipi kullanım"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "domyos-stepper",
    name: "Domyos Stepper",
    code: "SPR-CCC",
    brand: "Domyos",
    category: "Fitness",
    collection: "Fitness",
    price: 530,
    badge: "Pratik",
    discount: null,
    premium: false,
    image: "/assets/products/vfit-eos.svg",
    summary: "Kompakt yapısıyla evde kısa süreli egzersizler için pratik fitness ürünü.",
    specs: [
      "Tasarım: Kompakt yapı",
      "Kullanım: Ev içi kullanım",
      "Egzersiz: Pratik egzersiz",
      "Depolama: Kolay saklama",
      "Model: Ekonomik kiralama"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "bissell-proheat",
    name: "Bissell ProHeat 2X Revolution Halı ve Koltuk Yıkama Makinesi",
    code: "SPR-G",
    brand: "Bissell",
    category: "Ev Aletleri",
    collection: "Ev Aletleri",
    price: 3500,
    badge: "Premium",
    discount: null,
    premium: true,
    image: "/assets/products/bissell-proheat.svg",
    summary: "Dönemsel temizlik ihtiyaçları için satın almadan profesyonel kullanım deneyimi.",
    specs: [
      "Temizlik: Halı ve koltuk temizliği",
      "Kullanım: Dönemsel kullanım",
      "Motor: Yüksek emiş gücü",
      "Tür: Ev tipi kullanım",
      "Model: Pratik kiralama"
    ],
    periods: [1, 3, 6, 9]
  },
  {
    id: "bissell-spotclean",
    name: "Bissell SpotClean Pro Halı ve Koltuk Yıkama Makinesi",
    code: "SPR-H",
    brand: "Bissell",
    category: "Ev Aletleri",
    collection: "Ev Aletleri",
    price: 1900,
    badge: "Leke çıkarma",
    discount: "-%14",
    premium: false,
    image: "/assets/products/spotclean.svg",
    summary: "Lokal halı/koltuk temizliği ve dönemsel ihtiyaçlar için pratik temizlik ürünü.",
    specs: [
      "Özellik: Leke çıkarma",
      "Temizlik: Koltuk temizliği",
      "Kullanım: Kompakt kullanım",
      "Tür: Ev tipi çözüm",
      "Model: Kiralama modeli"
    ],
    periods: [1, 3, 6, 9]
  },
  {
    id: "wero-ai-bike-pro",
    name: "Wero AI Bike Pro Akıllı Kondisyon Bisikleti",
    code: "PRM701",
    brand: "Wero",
    category: "Premium",
    collection: "Premium",
    price: 4950,
    badge: "Premium",
    discount: null,
    premium: true,
    image: "/assets/products/wero-bike.svg",
    summary: "Daha gelişmiş sensörler, yüksek direnç kademesi ve bağlantılı antrenman deneyimi sunan premium akıllı bisiklet.",
    specs: [
      "Ürün tipi: Akıllı bisiklet",
      "Bağlantı: Bluetooth ve uygulama bağlantısı",
      "Direnç: Gelişmiş direnç sistemi",
      "Deneyim: Premium kiralama deneyimi",
      "Performans: Yüksek performans"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "walkingpad-premium-x23",
    name: "WalkingPad X23 Premium Koşu Bandı",
    code: "PRM702",
    brand: "WalkingPad",
    category: "Premium",
    collection: "Premium",
    price: 5290,
    badge: "Premium",
    discount: null,
    premium: true,
    image: "/assets/products/real-walkingpad-r2.jpg",
    summary: "Geniş bant alanı, sessiz motoru ve modern tasarımıyla premium segment koşu bandı deneyimi.",
    specs: [
      "Motor: Sessiz motor",
      "Alan: Geniş koşu alanı",
      "Gövde: Katlanabilir premium gövde",
      "Ekran: Akıllı ekran desteği",
      "Kullanım: Ev tipi premium kullanım"
    ],
    periods: [3, 6, 9]
  },
  {
    id: "bissell-hydrosteam",
    name: "Bissell HydroSteam Premium Temizlik Makinesi",
    code: "PRM703",
    brand: "Bissell",
    category: "Premium",
    collection: "Premium",
    price: 4590,
    badge: "Premium",
    discount: null,
    premium: true,
    image: "/assets/products/bissell-proheat.svg",
    summary: "Yoğun temizlik ihtiyaçları için yüksek performans sunan premium temizlik çözümü.",
    specs: [
      "Temizlik: Halı ve koltuk temizliği",
      "Motor: Yüksek emiş gücü",
      "Özellik: Buharlı destek",
      "Kullanım: Premium ev temizliği",
      "Model: Dönemsel kiralama"
    ],
    periods: [3, 6, 9]
  }
];

export const NAV_CATEGORIES: NavCategory[] = [
  {
    name: "Spor Aletleri",
    href: "/kategori?cat=Spor%20Aletleri",
    groups: [
      ["Ürün Türleri", [
        { label: "Koşu Bantları", href: "/kategori?cat=Koşu%20Bantları" },
        { label: "Yürüyüş Bantları", href: "/kategori?cat=Yürüyüş%20Bantları" },
        { label: "Kondisyon Bisikletleri", href: "/kategori?cat=Bisiklet&q=Kondisyon%20Bisikletleri" },
        { label: "Eliptik Bisikletler", href: "/kategori?cat=Fitness&q=Eliptik%20Bisikletler" },
        { label: "Fitness Ekipmanları", href: "/kategori?cat=Fitness" },
        { label: "Tümünü Gör", href: "/kategori?cat=Spor%20Aletleri", all: true }
      ]]
    ]
  },
  {
    name: "Koşu Bantları",
    href: "/kategori?cat=Koşu%20Bantları",
    groups: [
      ["Ürün Türleri", [
        { label: "Katlanabilir Modeller", href: "/kategori?cat=Koşu%20Bantları&q=Katlanabilir" },
        { label: "Ev Tipi Modeller", href: "/kategori?cat=Koşu%20Bantları&q=Ev%20Tipi" },
        { label: "Performans Modelleri", href: "/kategori?cat=Koşu%20Bantları&q=Motor" },
        { label: "Tümünü Gör", href: "/kategori?cat=Koşu%20Bantları", all: true }
      ]]
    ]
  },
  {
    name: "Yürüyüş Bantları",
    href: "/kategori?cat=Yürüyüş%20Bantları",
    groups: [
      ["Ürün Türleri", [
        { label: "Katlanabilir Modeller", href: "/kategori?cat=Yürüyüş%20Bantları&q=Katlanabilir" },
        { label: "WalkingPad Modelleri", href: "/kategori?cat=Yürüyüş%20Bantları&q=WalkingPad" },
        { label: "Portatif Modeller", href: "/kategori?cat=Yürüyüş%20Bantları&q=Portatif" },
        { label: "Tümünü Gör", href: "/kategori?cat=Yürüyüş%20Bantları", all: true }
      ]]
    ]
  },
  {
    name: "Bisiklet",
    href: "/kategori?cat=Bisiklet",
    groups: [
      ["Ürün Türleri", [
        { label: "Elektrikli Bisikletler", href: "/kategori?cat=Bisiklet&q=Elektrikli" },
        { label: "Katlanır Bisikletler", href: "/kategori?cat=Bisiklet&q=Katlanır" },
        { label: "Kondisyon Bisikletleri", href: "/kategori?cat=Bisiklet&q=Kondisyon" },
        { label: "Şehir Bisikletleri", href: "/kategori?cat=Bisiklet&q=Şehir" },
        { label: "Tümünü Gör", href: "/kategori?cat=Bisiklet", all: true }
      ]]
    ]
  },
  {
    name: "Fitness",
    href: "/kategori?cat=Fitness",
    groups: [
      ["Ürün Türleri", [
        { label: "Eliptik Bisikletler", href: "/kategori?cat=Fitness&q=Eliptik" },
        { label: "Stepper Ürünleri", href: "/kategori?cat=Fitness&q=Stepper" },
        { label: "Akıllı Spor Ekipmanları", href: "/kategori?cat=Fitness&q=Akıllı" },
        { label: "Tümünü Gör", href: "/kategori?cat=Fitness", all: true }
      ]]
    ]
  },
  {
    name: "Ev Aletleri",
    href: "/kategori?cat=Ev%20Aletleri",
    groups: [[
      "Ürün Türleri", [
        { label: "Halı & Koltuk Yıkama", href: "/kategori?cat=Ev%20Aletleri&q=Halı" },
        { label: "Buharlı Temizlik", href: "/kategori?cat=Ev%20Aletleri&q=Buharlı" },
        { label: "Leke Çıkarma", href: "/kategori?cat=Ev%20Aletleri&q=Leke" },
        { label: "Zemin Temizliği", href: "/kategori?cat=Ev%20Aletleri&q=Zemin" },
        { label: "Tümünü Gör", href: "/kategori?cat=Ev%20Aletleri", all: true }
      ]
    ]]
  },
  {
    name: "Elektronik",
    href: "/kategori?cat=Elektronik",
    groups: [[
      "Ürün Türleri", [
        { label: "Akıllı Ev Ürünleri", href: "/kategori?cat=Elektronik&q=Akıllı%20Ev" },
        { label: "Görüntü & Ses Sistemleri", href: "/kategori?cat=Elektronik&q=Görüntü" },
        { label: "Küçük Elektronikler", href: "/kategori?cat=Elektronik&q=Küçük" },
        { label: "Tümünü Gör", href: "/kategori?cat=Elektronik", all: true }
      ]
    ]]
  },
  {
    name: "Güzellik Teknolojileri",
    href: "/kategori?cat=Güzellik%20Teknolojileri",
    groups: [[
      "Ürün Türleri", [
        { label: "Cilt Bakım Cihazları", href: "/kategori?cat=Güzellik%20Teknolojileri&q=Cilt" },
        { label: "Saç Şekillendirme", href: "/kategori?cat=Güzellik%20Teknolojileri&q=Saç" },
        { label: "Epilasyon Cihazları", href: "/kategori?cat=Güzellik%20Teknolojileri&q=Epilasyon" },
        { label: "Masaj & Bakım", href: "/kategori?cat=Güzellik%20Teknolojileri&q=Masaj" },
        { label: "Tümünü Gör", href: "/kategori?cat=Güzellik%20Teknolojileri", all: true }
      ]
    ]]
  },
  {
    name: "Premium",
    href: "/kategori?cat=Premium",
    groups: [[
      "Ürün Türleri", [
        { label: "Premium Spor Aletleri", href: "/kategori?cat=Premium&q=Spor" },
        { label: "Premium Ev Aletleri", href: "/kategori?cat=Premium&q=Ev%20Aletleri" },
        { label: "Popüler Premium Modeller", href: "/kategori?cat=Premium&q=Popüler" },
        { label: "Tümünü Gör", href: "/kategori?cat=Premium", all: true }
      ]
    ]]
  },
  {
    name: "Yaz Sezonu",
    href: "/kategori?cat=Yaz%20Sezonu",
    highlight: true,
    groups: [[
      "Ürün Türleri", [
        { label: "Elektrikli Bisiklet & Scooter", href: "/kategori?cat=Yaz%20Sezonu&q=Elektrikli" },
        { label: "Açık Hava Ürünleri", href: "/kategori?cat=Yaz%20Sezonu&q=Açık%20Hava" },
        { label: "Tatil & Sezonluk Kullanım", href: "/kategori?cat=Yaz%20Sezonu&q=Sezonluk" },
        { label: "Tümünü Gör", href: "/kategori?cat=Yaz%20Sezonu", all: true }
      ]
    ]]
  }
];

export function defaultPeriod(p: ProductStatic): number {
  return p.periods.includes(3) ? 3 : p.periods[0];
}

export function monthlyPrice(p: ProductStatic, period: number): number {
  const m = Number(period || defaultPeriod(p));
  if (m <= 1) return Math.round(p.price * 1.08);
  if (m === 3) return p.price;
  if (m === 6) return Math.round(p.price * 0.94);
  if (m >= 9) return Math.round(p.price * 0.89);
  return p.price;
}

export function dailyPrice(p: ProductStatic, period: number): number {
  const m = Number(period || defaultPeriod(p));
  const total = monthlyPrice(p, m) * m;
  return Math.max(1, Math.round(total / (m * 30)));
}

export function ratingCount(p: ProductStatic): number {
  return Math.floor((p.price % 900) + 42);
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value) + " TL";
}

export function getProduct(id: string): ProductStatic {
  return PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
}

export function uniqueBrands(): string[] {
  return [...new Set(PRODUCTS.map((p) => p.brand))].sort((a, b) =>
    a.localeCompare(b, "tr")
  );
}

export const TYPE_FILTERS: Record<string, string[]> = {
  "Tüm Kategoriler": [
    "Tüm ürünler",
    "Koşu Bantları",
    "Yürüyüş Bantları",
    "Bisiklet",
    "Fitness",
    "Ev Aletleri",
    "Elektronik",
    "Güzellik Teknolojileri"
  ]
};

export function categoryTypeConfig() {
  return { title: "Ürün Türleri", options: TYPE_FILTERS["Tüm Kategoriler"] };
}
