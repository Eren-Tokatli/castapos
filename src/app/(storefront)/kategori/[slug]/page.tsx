import { PlaceholderPage } from "@/components/PlaceholderPage";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PlaceholderPage
      title={`Kategori: ${slug}`}
      milestone="M1 — Katalog gezintisi"
      description="Bu kategorideki ürünler burada listelenecek."
    />
  );
}
