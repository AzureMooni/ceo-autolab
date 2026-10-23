import React from "react";
import Link from "next/link";
import { Zap, Clock, ShieldCheck, Mail, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-obsidian-800 bg-obsidian-950 pt-12 pb-24 sm:pb-16 text-slate-400 text-xs">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-brand text-obsidian-950 font-black">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <span className="font-extrabold text-white text-sm tracking-tight">
                사장님 자동화 연구소
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              바쁜 소상공인·자영업자를 위한 1분 말로 하는 AI 마케팅 비서. 타이핑 없이 3대 채널 원고를 동시 생성하고 1초 만에 배포합니다.
            </p>

            {/* Response Time Guarantee (Checklist #6) */}
            <div className="flex items-center gap-2 rounded-xl border border-emerald-brand/30 bg-emerald-brand/10 p-3 text-emerald-brand max-w-md font-medium">
              <Clock className="h-4 w-4 shrink-0" />
              <span>고객 지원 약속: <strong>영업일 기준 2시간 이내 100% 회신</strong></span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
              바로가기 (Navigation)
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#wizard" className="hover:text-emerald-brand transition flex items-center gap-1">
                  <span>3문 3답 인터뷰 위저드</span>
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-brand transition flex items-center gap-1">
                  <span>자주 묻는 질문 5선</span>
                </a>
              </li>
              <li>
                <a
                  href="https://threads.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-brand transition flex items-center gap-1"
                >
                  <span>메타 스레드 공식</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <div className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
              약관 및 고객지원
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  서비스 이용약관
                </Link>
              </li>
              <li>
                <span className="text-slate-500">문의: support@ceoautolab.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-6 border-t border-obsidian-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 사장님 자동화 연구소 (CEO AutoLab). All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-brand" />
            <span>24/365 고가용성 자가 복구 인프라 및 AES-256 암호화 적용</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
