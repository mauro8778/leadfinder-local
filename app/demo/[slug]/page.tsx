import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoLanding } from "@/app/components/demo-landing";
import { isInternalQuery } from "@/lib/demo-preview";
import { DEMO_PAGES, getDemoPage } from "@/lib/demo-pages";

export function generateStaticParams() {
  return DEMO_PAGES.map((page) => ({ slug: page.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/demo/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const config = getDemoPage(slug);
  if (!config) return {};
  return {
    title: config.name,
    description: config.tagline,
    robots: { index: false, follow: false },
    openGraph: {
      title: config.name,
      description: config.tagline,
      images: [config.heroImage],
    },
  };
}

export default async function DemoPage({
  params,
  searchParams,
}: PageProps<"/demo/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const config = getDemoPage(slug);

  if (!config) {
    notFound();
  }

  const { id: _, ...props } = config;
  void _;
  return <DemoLanding {...props} internal={isInternalQuery(query.interno)} />;
}
