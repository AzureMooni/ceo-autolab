"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, ExternalLink, Instagram } from "lucide-react";
import { copyHtmlToClipboard, copyPlainText } from "@/utils/copyRichText";

interface PublishActionBarProps {
  naverBlogHtml: string;
  naverBlogTitle: string;
  threadsText: string;
  instaCaption: string;
}

export default function PublishActionBar({
  naverBlogHtml,
  naverBlogTitle,
  threadsText,
  instaCaption,
}: PublishActionBarProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopyBlog = async () => {
    const plainText = `${naverBlogTitle}\n\n${naverBlogHtml.replace(/<[^>]+>/g, " ")}`;
    const success = await copyHtmlToClipboard(naverBlogHtml, plainText);
    if (success) {
      setCopiedType("blog");
      setTimeout(() => setCopiedType(null), 3500);
    }
  };

  const handlePublishThreads = () => {
    const encoded = encodeURIComponent(threadsText);
    window.open(`https://www.threads.net/intent/post?text=${encoded}`, "_blank");
  };

  const handleCopyInsta = async () => {
    const success = await copyPlainText(instaCaption);
    if (success) {
      setCopiedType("insta");
      setTimeout(() => setCopiedType(null), 3000);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-obsidian-700 bg-obsidian-950/95 p-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
        {/* Left Status */}
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-brand animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            멀티채널 원고 생성 완료 (3대 플랫폼 즉시 배포 준비됨)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Threads 1-sec Instant Post */}
          <button
            onClick={handlePublishThreads}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-obsidian-950 shadow-md transition hover:bg-slate-200 active:scale-95"
          >
            <Share2 className="h-4 w-4" />
            <span>스레드 1초 발행</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </button>

          {/* Naver Blog Rich Text Copy */}
          <button
            onClick={handleCopyBlog}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-brand px-4 py-2.5 text-xs font-bold text-obsidian-950 shadow-lg shadow-emerald-brand/20 transition hover:bg-emerald-hover active:scale-95"
          >
            {copiedType === "blog" ? (
              <>
                <Check className="h-4 w-4" />
                <span>서식 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>네이버 블로그 서식 복사</span>
              </>
            )}
          </button>

          {/* Instagram / Shorts Copy */}
          <button
            onClick={handleCopyInsta}
            className="flex items-center gap-1.5 rounded-xl border border-obsidian-700 bg-obsidian-900 px-3.5 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-obsidian-800 hover:text-white"
          >
            {copiedType === "insta" ? (
              <>
                <Check className="h-4 w-4 text-emerald-brand" />
                <span className="text-emerald-brand">복사 완료</span>
              </>
            ) : (
              <>
                <Instagram className="h-4 w-4 text-pink-400" />
                <span>인스타/쇼츠 복사</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Naver Blog Toast Guide */}
      {copiedType === "blog" && (
        <div className="mt-2 text-center text-xs text-emerald-brand font-medium animate-fade-in">
          💡 네이버 블로그 스마트에디터에 바로 [붙여넣기(Ctrl+V)] 하시면 소제목, 형광펜, 사진 가이드 마커가 그대로 들어갑니다!
        </div>
      )}
    </div>
  );
}
