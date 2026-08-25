import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ArrowRight } from "lucide-react";
import { BLOG_POSTS, getBlogPostBySlug } from "@/lib/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Blog | Castapos" };
  return {
    title: `${post.title} | Castapos Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Mağaza</Link> › <Link href="/blog">Blog</Link> › {post.title}
            </nav>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container">
          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <h2>{post.title}</h2>
            </div>
            {post.sections.map((section) => (
              <section key={section.title}>
                <h2>
                  <BadgeCheck size={18} />
                  {section.title}
                </h2>
                <p>{section.body}</p>
              </section>
            ))}
            <Link href="/kategori" className="btn btn-primary blog-post-cta">
              Ürünleri Keşfet <ArrowRight size={16} />
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
