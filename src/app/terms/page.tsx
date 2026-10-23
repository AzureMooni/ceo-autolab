import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "서비스 이용약관 | 사장님 자동화 연구소",
  description: "사장님 자동화 연구소의 서비스 이용 조건, 권리 및 의무에 관한 규정입니다.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-300 py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="flex items-center gap-1 text-emerald-brand hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>메인으로 돌아가기</span>
          </Link>
          <span>/</span>
          <span>서비스 이용약관</span>
        </div>

        <div className="rounded-2xl border border-obsidian-800 bg-obsidian-900/60 p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-obsidian-800 pb-5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-brand/10 text-emerald-brand">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">서비스 이용약관</h1>
              <p className="text-xs text-slate-400 mt-0.5">시행일자: 2026년 10월 23일</p>
            </div>
          </div>

          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-white mb-2">제1조 (목적)</h2>
              <p>
                본 약관은 사장님 자동화 연구소(이하 '회사')가 제공하는 AI 기반 소상공인 마케팅 원고 자동 생성 및 발행 서비스의 이용 조건 및 절차에 관한 제반 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">제2조 (서비스의 내용)</h2>
              <p>
                회사는 이용자에게 다음과 같은 서비스를 제공합니다:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                <li>3문 3답 음성 인터뷰 가이드 및 음성 인식(STT)</li>
                <li>네이버 블로그(인라인 서식 완비), 스레드, 인스타그램 멀티채널 원고 자동 생성</li>
                <li>원클릭 발행 지원 및 클립보드 서식 복사 도구</li>
                <li>사장님 문체 복제(Style Cloning) 가이드 도구</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">제3조 (이용자의 의무 및 저작권)</h2>
              <p>
                이용자는 타인의 명예를 훼손하거나 저작권 등 제3자의 권리를 침해하는 허위 사실을 입력해서는 안 되며, AI를 통해 생성된 원고의 최종 검토 및 발행에 대한 최종 법적 책임은 이용자 본인에게 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">제4조 (고객 지원 및 분쟁 해결)</h2>
              <p>
                서비스 이용 중 발생하는 불편 사항이나 문의는 공식 고객지원 채널을 통해 접수하실 수 있으며, 회사는 <strong className="text-emerald-brand">영업일 기준 2시간 이내 회신</strong>을 목표로 신속히 응대합니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
