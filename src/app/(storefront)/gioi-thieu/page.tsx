import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  Coffee,
  HeartHandshake,
  Leaf,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { aboutContent, shopConfig } from "@/lib/config";

// Trang Giới thiệu (HAP-18) theo DESIGN.md: hero → câu chuyện quán → điểm
// khác biệt → CTA xem menu. Toàn bộ nội dung chữ + ảnh lấy từ
// src/lib/config.ts (aboutContent) — NỘI DUNG MẪU, thay thật ở HAP-20.

// Title ngắn — root layout template tự thêm " — Happier Coffee" (HAP-19).
export const metadata: Metadata = {
  title: "Giới thiệu",
  description: aboutContent.lead,
  openGraph: {
    title: `Giới thiệu — ${shopConfig.name}`,
    description: aboutContent.lead,
    images: [{ url: aboutContent.heroImage, alt: aboutContent.heroImageAlt }],
  },
};

// Tra khóa icon trong config sang component Lucide.
const highlightIcons: Record<string, LucideIcon> = {
  coffee: Coffee,
  leaf: Leaf,
  zap: Zap,
  heart: HeartHandshake,
};

export default function AboutPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section>
        <Container className="grid items-center gap-8 py-12 md:py-16 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col items-start gap-5">
            <p className="text-sm font-medium tracking-wide text-caramel uppercase">
              Giới thiệu
            </p>
            <h1 className="text-4xl leading-[1.2] font-bold text-coffee md:text-[40px]">
              {aboutContent.heading}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted">
              {aboutContent.lead}
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-line/40">
            <Image
              src={aboutContent.heroImage}
              alt={aboutContent.heroImageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* ---------- Câu chuyện quán ---------- */}
      <section className="bg-surface">
        <Container className="grid items-center gap-8 py-12 md:py-16 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-line/40">
            <Image
              src={aboutContent.storyImage}
              alt={aboutContent.storyImageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-start gap-4">
            <h2 className="text-2xl font-bold text-coffee md:text-[32px] md:leading-[1.2]">
              {aboutContent.storyTitle}
            </h2>
            {aboutContent.story.map((paragraph) => (
              <p
                key={paragraph.slice(0, 24)}
                className="text-base leading-relaxed text-muted"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- Điểm khác biệt ---------- */}
      <section>
        <Container className="py-12 md:py-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-coffee md:text-[32px] md:leading-[1.2]">
              {aboutContent.highlightsTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-base text-muted">
              {aboutContent.highlightsIntro}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {aboutContent.highlights.map((item) => {
              const Icon = highlightIcons[item.icon] ?? Coffee;
              return (
                <div
                  key={item.title}
                  className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-6"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-cream text-cta">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="font-bold text-coffee">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="bg-surface">
        <Container className="flex flex-col items-center gap-4 py-12 text-center md:py-16">
          <h2 className="text-2xl font-bold text-coffee md:text-[32px] md:leading-[1.2]">
            {aboutContent.cta.title}
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted">
            {aboutContent.cta.text}
          </p>
          <Button href={aboutContent.cta.href} variant="primary">
            {aboutContent.cta.buttonLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Container>
      </section>
    </>
  );
}
