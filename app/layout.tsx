import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "pairi-riichi-mahjong.shzykun.chatgpt.site";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "牌理 PAIRI｜立直麻将知识与实战资料馆",
    description: "从零学习日麻，练习何切与算点，追踪 M.LEAGUE 赛程并研究职业牌谱。",
    openGraph: {
      title: "牌理 PAIRI｜立直麻将资料馆",
      description: "从第一巡开始，读懂一局日麻。",
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "牌理 PAIRI" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "牌理 PAIRI｜立直麻将资料馆",
      description: "从第一巡开始，读懂一局日麻。",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
