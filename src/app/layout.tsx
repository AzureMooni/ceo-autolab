import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "사장님 자동화 연구소 | 말로 하는 1분 마케팅 비서",
  description: "3문 3답 음성 인터뷰로 네이버 블로그, 스레드, 인스타그램 원고를 10초 만에 동시 생성하고 1초 만에 발행하는 B2B 마케팅 자동화 SaaS",
  openGraph: {
    title: "사장님 자동화 연구소 | 말로 하는 1분 마케팅 비서",
    description: "블로그 대행사에 월 100만 원 주지 마세요. 사장님은 1분만 말씀하시면 AI 코드가 마케팅을 끝냅니다.",
    siteName: "사장님 자동화 연구소",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-obsidian-950 text-white selection:bg-emerald-brand selection:text-obsidian-950">
        {children}
      </body>
    </html>
  );
}
