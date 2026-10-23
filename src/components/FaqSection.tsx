"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0); // First item open by default

  const faqs: FaqItem[] = [
    {
      question: "정말 타이핑 한 글자도 안 치고 마케팅 글이 완성되나요?",
      answer:
        "네, 100% 사실입니다. 스마트폰이나 PC 마이크 버튼을 누르고 화면에 나오는 3가지 질문(오늘 있었던 일 ➔ 손님이 겪던 고민 ➔ 우리 매장의 해결책)에 각각 15초 내외로 편안하게 구술하시면, AI가 사장님의 음성을 실시간 텍스트로 변환한 뒤 전문 카피라이팅 공식이 적용된 3대 채널 원고를 5초 만에 생성합니다.",
    },
    {
      question: "AI가 쓴 글인 게 티 나면 네이버 블로그 저품질(어뷰징)에 걸리지 않나요?",
      answer:
        "전혀 걱정하지 않으셔도 됩니다. 인터넷에서 떠도는 일반론을 긁어모은 단순 챗GPT 래퍼와 달리, 사장님 자동화 연구소는 사장님의 '오늘 매장 실화'와 '문체 클로닝(Style Cloning)' 기술을 적용합니다. 또한 상투적인 기계적 말투를 원천 차단하고, C-Rank 및 스마트블록 알고리즘에 맞춘 소제목, 인용구, 사진 배치 가이드 마커가 인라인 CSS로 자동 주입되어 네이버가 가장 좋아하는 정성스러운 수기형 칼럼으로 등록됩니다.",
    },
    {
      question: "제가 말을 조리 있게 못 하고 두서없이 말해도 좋은 글이 나오나요?",
      answer:
        "오히려 날것 그대로 솔직하게 말씀해 주실수록 훨씬 더 진정성 있는 킬러 원고가 탄생합니다. 문맥이 어색하거나 사투리, 추임새(음, 어...)가 섞여 있어도 전문 마케팅 AI가 핵심 팩트만 골라내어 고객을 설득하는 매끄럽고 단단한 문장으로 자동 재구성해 드립니다.",
    },
    {
      question: "스레드(Threads)와 인스타그램에는 어떻게 연동되어 올라가나요?",
      answer:
        "원고가 생성되면 하단의 [스레드 1초 발행] 버튼을 누르시는 즉시 메타(Meta) 공식 스레드 웹/앱 글쓰기 화면이 열리며 원고가 자동 주입됩니다. 검토 후 발행 버튼만 누르시면 끝납니다. 네이버 블로그는 [서식 복사] 버튼을 누르신 뒤 블로그 스마트에디터에 'Ctrl+V(붙여넣기)'만 하시면 디자인과 레이아웃이 그대로 꽂힙니다.",
    },
    {
      question: "무료 체험 후 유료 요금제나 정기 구독 정책은 어떻게 되나요?",
      answer:
        "가입 즉시 3회의 무료 원고 생성 크레딧이 기본 제공되어 아무런 비용 부담 없이 모든 기능을 테스트해보실 수 있습니다. 이후에는 주 3회 정기 발행이 가능한 Basic 플랜(월 29,000원)과 매일 무제한 생성 및 예약 큐를 지원하는 Pro 플랜(월 59,000원) 중 자유롭게 선택하실 수 있으며 언제든 위약금 없이 해지 가능합니다.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="my-16 scroll-mt-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-obsidian-700 bg-obsidian-900/60 px-3 py-1 text-xs text-slate-300 mb-2">
          <HelpCircle className="h-3.5 w-3.5 text-emerald-brand" />
          <span>자주 묻는 질문 5선</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
          궁금한 점이 있으신가요? 선제적으로 답변해 드립니다
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
          도입 전 사장님들이 가장 많이 여쭤보신 질문들을 모았습니다.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? "border-emerald-brand/40 bg-obsidian-900/80 shadow-lg"
                  : "border-obsidian-800 bg-obsidian-900/40 hover:border-obsidian-700"
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between p-5 text-left transition"
              >
                <span className="text-sm font-bold text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-emerald-brand" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-xs sm:text-sm leading-relaxed text-slate-300 border-t border-obsidian-800/60 mt-1 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
