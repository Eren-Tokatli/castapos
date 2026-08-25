import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog | Castapos",
  description:
    "Kiralamanın avantajları, doğru süre seçimi ve Castapos'un işleyişi hakkında rehberler.",
};

export default function BlogIndexPage() {
  return (
    <>
      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Mağaza</Link> › Blog
            </nav>
            <h1>Kiralamanın avantajları ve işleyişimiz hakkında</h1>
            <p>
              Satın almadan önce kiralamayı neden düşünmelisiniz, doğru süreyi nasıl seçersiniz ve Castapos süreci
              nasıl işler? Rehberlerimiz burada.
            </p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container">
          <div className="blog-list-grid">
            {BLOG_POSTS.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
                <span className="blog-card-badge">{post.category.toUpperCase()}</span>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <div className="blog-card-meta">
                  <span className="blog-card-more">
                    Devamını Oku <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
