import Link from "next/link";
import { ArrowLeft, Home, Sparkles, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="relative">
        <div className="text-8xl sm:text-9xl font-black text-obsidian-800 tracking-tighter select-none">
          404
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-brand text-obsidian-950 font-black shadow-xl shadow-emerald-brand/30 mb-2">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <span className="text-sm font-bold text-emerald-brand uppercase tracking-widest">
            페이지를 찾을 수 없습니다
          </span>
        </div>
      </div>

      <h1 className="mt-6 text-xl sm:text-2xl font-bold text-white">
        길을 잃으셨나요? 사장님의 마케팅은 멈추지 않습니다.
      </h1>
      <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md">
        입력하신 주소가 잘못되었거나 삭제되었습니다. 사장님 자동화 연구소 메인 화면으로 돌아가 1분 음성 인터뷰를 시작해보세요.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-emerald-brand px-5 py-3 text-xs font-bold text-obsidian-950 shadow-lg shadow-emerald-brand/20 transition hover:bg-emerald-hover active:scale-95"
        >
          <Home className="h-4 w-4" />
          <span>메인 홈으로 이동</span>
        </Link>
        <Link
          href="/#wizard"
          className="flex items-center gap-2 rounded-xl border border-obsidian-700 bg-obsidian-900 px-5 py-3 text-xs font-bold text-slate-200 transition hover:bg-obsidian-800 hover:text-white"
        >
          <Sparkles className="h-4 w-4 text-amber-brand" />
          <span>1분 마케팅 원고 바로 쓰기</span>
        </Link>
      </div>
    </div>
  );
}
