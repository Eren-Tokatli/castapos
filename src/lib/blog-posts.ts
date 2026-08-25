export interface BlogPostSection {
  title: string;
  body: string;
}

export interface BlogPostStatic {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string; // e.g. "4 dk"
  sections: BlogPostSection[];
}

export const BLOG_POSTS: BlogPostStatic[] = [
  {
    slug: "neden-satin-almadan-once-kiralamalisiniz",
    title: "Neden Satın Almadan Önce Kiralamalısınız?",
    excerpt:
      "Büyük bütçeli bir ürüne karar vermeden önce onu gerçekten deneyimlemek, en doğru kararı vermenin en kolay yoludur.",
    category: "Rehber",
    readTime: "4 dk",
    sections: [
      {
        title: "Büyük bütçeli kararları küçültün",
        body: "Bir koşu bandı, bir robot süpürge ya da bir oyun konsolu almadan önce onu günlük hayatınıza gerçekten katıp katamayacağınızı bilmek zordur. Kiralama, bu kararı tek seferlik büyük bir harcama yerine, deneyerek verebileceğiniz küçük ve geri döndürülebilir bir adıma dönüştürür.",
      },
      {
        title: "İhtiyaç değişkense, plan da değişsin",
        body: "Bazı ürünlere sürekli değil, belirli bir dönem için ihtiyacınız olur: yaz aylarında bir klima, taşınma sürecinde bir beyaz eşya, kısa süreli bir proje için bir elektronik cihaz. Kiralama modelinde süreyi siz belirlersiniz; ihtiyaç bittiğinde ürünü elinizde tutmak zorunda kalmazsınız.",
      },
      {
        title: "Riski platforma bırakın",
        body: "Satın aldığınız bir üründe arıza, bakım ya da teknik destek süreçleri tamamen size kalır. Castapos üzerinden kiraladığınız ürünlerde bu süreçlerin takibi platformun sorumluluğundadır; siz sadece ürünü kullanmaya odaklanırsınız.",
      },
    ],
  },
  {
    slug: "kiralamanin-5-avantaji",
    title: "Kiralamanın 5 Avantajı",
    excerpt:
      "Düşük başlangıç maliyetinden esnek sürelere kadar, kiralamayı satın almaya tercih etmek için beş somut sebep.",
    category: "Rehber",
    readTime: "3 dk",
    sections: [
      {
        title: "1. Düşük başlangıç maliyeti",
        body: "Ürünün tamamını peşin ödemek yerine, aylık makul bir tutarla kullanmaya hemen başlarsınız. Bütçenizin tamamını tek bir ürüne bağlamamış olursunuz.",
      },
      {
        title: "2. Esnek süre seçenekleri",
        body: "1, 3, 6 veya 9 ay gibi ihtiyacınıza uygun bir dönem seçebilir, süre dolduğunda dilerseniz uzatabilir, dilerseniz ürünü iade edebilirsiniz.",
      },
      {
        title: "3. Bakım ve destek derdi yok",
        body: "Ürünle ilgili teknik bir sorun yaşarsanız süreci platform üzerinden takip edersiniz; satın alınmış bir üründe olduğu gibi tamir ve garanti süreçleriyle tek başınıza uğraşmazsınız.",
      },
      {
        title: "4. Denedikten sonra karar verirsiniz",
        body: "Kiralama dönemi boyunca ürünü gerçek kullanımda test etmiş olursunuz. İster süreyi uzatırsınız, ister aynı kategoride farklı bir ürünü denersiniz.",
      },
      {
        title: "5. Bütçenizi başka ihtiyaçlara ayırırsınız",
        body: "Büyük bir ürüne bağlanan sermaye yerine, aylık öngörülebilir bir ödeme planıyla nakit akışınızı daha rahat yönetirsiniz.",
      },
    ],
  },
  {
    slug: "castapos-nasil-calisir",
    title: "Castapos Nasıl Çalışır? Keşfetten Teslimata",
    excerpt:
      "Ürünü bulmaktan kapınıza gelmesine kadar kiralama sürecinin her adımını nasıl yönetiyoruz?",
    category: "Hakkımızda",
    readTime: "3 dk",
    sections: [
      {
        title: "Keşfet",
        body: "Kategori, marka ve kiralama dönemi bilgisiyle ihtiyacınıza uygun ürünü bulursunuz. Her ürün sayfasında aylık tutar, günlük karşılığı ve süre seçenekleri net şekilde gösterilir.",
      },
      {
        title: "Planla",
        body: "Size uygun süreyi seçer, 3D Secure altyapısıyla güvenli ödemenizi yapar ve kiralama planınızı oluşturursunuz. Ödeme özeti, onaylamadan önce sepette görünür.",
      },
      {
        title: "Deneyimle",
        body: "Ürün planlanan teslimat sürecinde adresinize ulaşır. Kullanım boyunca hesap panelinizden sözleşmenizi, ödeme takvimini ve destek taleplerinizi takip edebilirsiniz.",
      },
      {
        title: "Karar ver",
        body: "Süre dolduğunda kiralamayı uzatabilir ya da ürünü iade edebilirsiniz. Deneyim sonrası kararı, ilk günkü tahminlerle değil gerçek kullanımla verirsiniz.",
      },
    ],
  },
  {
    slug: "aylik-odeme-mi-pesin-alim-mi",
    title: "Aylık Ödeme mi, Peşin Alım mı? Maliyeti Karşılaştırdık",
    excerpt:
      "Bir ürünü hemen satın almak mı, aylık planla kiralamak mı daha mantıklı? Karar vermeden önce bakılması gereken noktalar.",
    category: "Rehber",
    readTime: "4 dk",
    sections: [
      {
        title: "Peşin alımın görünmeyen maliyeti",
        body: "Bir ürünü satın aldığınızda ödediğiniz tutar sadece fiyat etiketiyle sınırlı kalmaz: bakım, garanti sonrası tamir ve kullanılmadığında elde kalan bir eşya riski de bu maliyete eklenir.",
      },
      {
        title: "Aylık planın avantajı",
        body: "Kiralamada ödediğiniz aylık tutar, kullandığınız süreyle orantılıdır. İhtiyacınız kısa sürede değişirse, elinizde kullanmadığınız bir ürünle kalmazsınız.",
      },
      {
        title: "Ne zaman satın almak daha mantıklı?",
        body: "Bir ürünü uzun yıllar, kesintisiz ve değişmeyen bir ihtiyaçla kullanacağınızı biliyorsanız satın almak daha avantajlı olabilir. Ama emin değilseniz, önce kiralayıp deneyimlemek riski azaltır.",
      },
    ],
  },
  {
    slug: "kiralama-suresi-nasil-secilir",
    title: "Kiralama Süresi Nasıl Seçilir? 1, 3, 6, 9 Ay Rehberi",
    excerpt:
      "Doğru kiralama süresini seçmek, hem bütçenizi hem de ürünle kuracağınız ilişkiyi doğrudan etkiler.",
    category: "Rehber",
    readTime: "3 dk",
    sections: [
      {
        title: "1 ay: Kısa süreli deneme",
        body: "Bir ürünü hiç kullanmadan karar vermek istemiyorsanız ideal başlangıç noktasıdır. Düşük taahhütle ürünü günlük hayatınıza katıp katamayacağınızı görürsünüz.",
      },
      {
        title: "3-6 ay: Orta vadeli kullanım",
        body: "Sezonluk ihtiyaçlar (klima, ısıtıcı) ya da belirli bir dönem için gereken ürünler (taşınma süreci, proje bazlı ekipman) için dengeli bir seçimdir.",
      },
      {
        title: "9 ay ve uzatma: Uzun süreli kullanım",
        body: "Ürünü düzenli ve uzun süre kullanacağınızı düşünüyorsanız daha uzun bir dönem seçerek aylık tutarı daha öngörülebilir hale getirebilir, süre sonunda dilediğiniz kadar uzatabilirsiniz.",
      },
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPostStatic | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
