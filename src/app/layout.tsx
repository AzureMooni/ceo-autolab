import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ceoautolab.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "사장님 자동화 연구소 | 말로 하는 1분 마케팅 비서",
    template: "%s | 사장님 자동화 연구소",
  },
  description: "3문 3답 음성 인터뷰로 네이버 블로그(인라인 서식 완비), 스레드, 인스타그램 원고를 5초 만에 동시 생성하고 1초 만에 발행하는 B2B 마케팅 자동화 SaaS",
  keywords: [
    "소상공인 마케팅",
    "네이버 블로그 자동화",
    "스레드 마케팅",
    "학원 마케팅",
    "자영업자 마케팅",
    "인터뷰형 AI",
    "사장님 자동화 연구소",
    "Voice to Publish",
  ],
  authors: [{ name: "사장님 자동화 연구소" }],
  creator: "사장님 자동화 연구소",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    title: "사장님 자동화 연구소 | 말로 하는 1분 마케팅 비서",
    description: "블로그 대행사에 월 100만 원 주지 마세요. 사장님은 1분만 말씀하시면 AI 코드가 마케팅을 끝냅니다.",
    siteName: "사장님 자동화 연구소",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "사장님 자동화 연구소 1분 마케팅 비서",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "사장님 자동화 연구소 | 말로 하는 1분 마케팅 비서",
    description: "타이핑 1글자 안 치고 [네이버 블로그 + 스레드 + 인스타] 3대 채널 원고를 5초 만에 동시 생성합니다.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema.org JSON-LD Structured Data for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "사장님 자동화 연구소 (CEO AutoLab)",
        "operatingSystem": "All (Web-based)",
        "applicationCategory": "BusinessApplication",
        "description": "3문 3답 음성 인터뷰를 통해 네이버 블로그, 스레드, 인스타그램 마케팅 원고를 1분 만에 동시 생성 및 발행하는 SaaS",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "KRW",
          "description": "회원가입 시 3회 무료 체험 제공",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "정말 타이핑 한 글자도 안 치고 마케팅 글이 완성되나요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "네, 스마트폰이나 PC 마이크 버튼을 누르고 화면에 나오는 3가지 질문에 구술하시면 AI가 5초 만에 네이버 블로그, 스레드, 인스타그램 원고를 동시 생성합니다.",
            },
          },
          {
            "@type": "Question",
            "name": "AI가 쓴 글인 게 티 나면 네이버 블로그 저품질에 걸리지 않나요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "사장님의 생생한 현장 경험과 문체 클로닝 기술을 적용하고, 스마트에디터 전용 인라인 CSS와 사진 배치 마커를 주입하여 정성스러운 수기형 칼럼으로 등록됩니다.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="ko" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-obsidian-950 text-white selection:bg-emerald-brand selection:text-obsidian-950">
        {children}
      </body>
    </html>
  );
}
