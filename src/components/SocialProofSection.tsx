"use client";

import React from "react";
import { TrendingUp, Quote, Star, CheckCircle2, Award, Users } from "lucide-react";

export default function SocialProofSection() {
  const stats = [
    { label: "타이핑 시간 절감", value: "99%", desc: "키보드 1글자 안 치고 음성 1분으로 완료" },
    { label: "평균 원고 생성 속도", value: "5.8초", desc: "3대 채널 원고 및 인라인 서식 즉시 완성" },
    { label: "사장님 평균 절감 비용", value: "월 80만 원+", desc: "비싼 마케팅 외주 대행사 완전 대체" },
    { label: "블로그·스레드 도달률", value: "+340%", desc: "실제 현장 팩트 기반 찐소통 알고리즘 타겟" },
  ];

  const cases = [
    {
      badge: "학원 / 공부방",
      author: "대치 골든수학학원 이원장님",
      metric: "신규 원생 상담 문의 3.4배 증가",
      quote:
        "기존 대행사에 월 100만 원씩 주며 올리던 글은 뻔한 홍보글이라 학부모님들이 안 읽으셨어요. 지금은 퇴근 전에 오늘 수업 중 학생 오답 노트 고쳐준 일화 1분만 말해두면, 학부모님들이 '원장님 글 읽고 신뢰가 가서 등록한다'고 전화가 옵니다.",
      result: "월 100만 원 대행사 해지 완료",
    },
    {
      badge: "로컬 맛집 / 식당",
      author: "제주 돌담흑돼지 박대표님",
      metric: "스레드 단일 게시물 14만 노출",
      quote:
        "장사 끝나고 설거지하면서 스마트폰 마이크 켜고 오늘 새벽에 고기 떼온 이야기 40초 말했을 뿐인데, 스레드에서 터져서 주말 테이블 예약이 꽉 찼습니다. 타이핑 칠 시간도 없는 자영업자에게는 구세주 같은 도구입니다.",
      result: "주말 전 타임 예약 마감 달성",
    },
    {
      badge: "뷰티 / 필라테스",
      author: "서초 모던필라테스 김원장님",
      metric: "네이버 스마트블록 상위 노출 1위",
      quote:
        "글 쓰는 재주가 없어 챗GPT를 써봤지만 너무 기계 같았어요. '사장님 자동화 연구소'는 제 말투 그대로 살려주고, 네이버 블로그에 복사할 때 소제목과 형광펜, 사진 위치까지 그대로 꽂아주니까 10초면 글 하나가 끝납니다.",
      result: "체형 교정 키워드 1위 등극",
    },
  ];

  return (
    <section className="my-16">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-obsidian-800 bg-obsidian-900/50 p-5 text-center backdrop-blur-sm transition hover:border-emerald-brand/40"
          >
            <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-brand to-emerald-hover">
              {s.value}
            </div>
            <div className="mt-1 text-xs font-bold text-white">{s.label}</div>
            <div className="mt-1 text-[11px] text-slate-400">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Case Studies Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-brand/30 bg-emerald-brand/10 px-3 py-1 text-xs font-bold text-emerald-brand mb-2">
          <Award className="h-3.5 w-3.5" />
          <span>Real Social Proof</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
          "타이핑 칠 시간이 없었는데, 마케팅이 알아서 돌아갑니다"
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
          대행사를 끊고 1분 인터뷰로 매출과 문의를 폭발시킨 실제 사장님들의 이야기입니다.
        </p>
      </div>

      {/* 3 Case Study Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cases.map((c, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-2xl border border-obsidian-800 bg-obsidian-900/40 p-6 shadow-xl transition hover:border-emerald-brand/40 hover:bg-obsidian-900/70"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-lg bg-emerald-brand/10 px-2.5 py-1 text-[11px] font-bold text-emerald-brand">
                  {c.badge}
                </span>
                <div className="flex text-amber-brand">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>

              {/* Metric Impact */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-3">
                <TrendingUp className="h-4 w-4 text-emerald-brand" />
                <span>{c.metric}</span>
              </div>

              {/* Quote */}
              <p className="text-xs leading-relaxed text-slate-300 italic mb-4">
                "{c.quote}"
              </p>
            </div>

            {/* Author Footer */}
            <div className="pt-4 border-t border-obsidian-800/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">{c.author}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-brand">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {c.result}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
