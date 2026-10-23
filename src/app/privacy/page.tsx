import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "개인정보 처리방침 | 사장님 자동화 연구소",
  description: "사장님 자동화 연구소의 개인정보 수집, 이용 목적 및 보호 대책에 대한 규정입니다.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-300 py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb / Back button */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="flex items-center gap-1 text-emerald-brand hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>메인으로 돌아가기</span>
          </Link>
          <span>/</span>
          <span>개인정보 처리방침</span>
        </div>

        <div className="rounded-2xl border border-obsidian-800 bg-obsidian-900/60 p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-obsidian-800 pb-5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-brand/10 text-emerald-brand">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">개인정보 처리방침</h1>
              <p className="text-xs text-slate-400 mt-0.5">시행일자: 2026년 10월 23일</p>
            </div>
          </div>

          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-white mb-2">1. 개인정보의 수집 항목 및 목적</h2>
              <p>
                사장님 자동화 연구소('회사')는 소상공인 마케팅 원고 생성 및 자동 발행 서비스를 제공하기 위해 다음과 같은 최소한의 개인정보를 수집하고 있습니다.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                <li><strong className="text-slate-200">필수 항목:</strong> 상호명, 업종 카테고리, 서비스 이용 중 녹음된 음성 데이터 및 텍스트 원고</li>
                <li><strong className="text-slate-200">수집 목적:</strong> 3문 3답 인터뷰 기반 마케팅 원고 생성, 문체 분석 및 복제(Style Cloning), 고객 응대</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">2. 음성 데이터 및 텍스트의 처리 원칙</h2>
              <p>
                회사는 이용자가 입력한 3문 3답 음성 인터뷰 데이터와 생성된 원고를 서비스 제공 및 품질 개선 목적으로만 사용하며, 제3자에게 임의로 제공하거나 외부에 공개하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">3. 개인정보의 보유 및 이용 기간</h2>
              <p>
                수집된 정보는 회원 탈퇴 시 또는 원고 생성 세션 종료 시 지체 없이 파기합니다. 단, 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 해당 법령이 정한 기간 동안 보관합니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">4. 개인정보 보호책임자 및 문의</h2>
              <div className="rounded-xl border border-obsidian-800 bg-obsidian-950 p-4 text-xs text-slate-400 space-y-1">
                <div><span className="text-slate-200 font-semibold">고객지원 담당:</span> 사장님 자동화 연구소 CPO</div>
                <div><span className="text-slate-200 font-semibold">이메일 문의:</span> support@ceoautolab.com</div>
                <div><span className="text-slate-200 font-semibold">답변 보장:</span> 영업일 기준 2시간 이내 회신 원칙 준수</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
