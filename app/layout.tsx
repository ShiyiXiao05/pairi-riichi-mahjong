import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "牌理 PAIRI｜立直麻将知识与实战资料馆",
  description: "从零学习日麻，练习何切与算点，追踪 M.LEAGUE 赛程并研究职业牌谱。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
