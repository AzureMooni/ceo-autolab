"use client";

import React, { useState } from "react";
import { Sparkles, X, Check, AlertCircle, Loader2 } from "lucide-react";

interface StyleGuide {
  tone: string;
  sentence_ending: string;
  formatting: string;
  emoji_style: string;
  forbidden_words: string[];
}

interface StyleCloningModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: StyleGuide;
  onSaveStyle: (style: StyleGuide) => void;
}

export default function StyleCloningModal({
  isOpen,
  onClose,
  currentStyle,
  onSaveStyle,
}: StyleCloningModalProps) {
  const [sampleText, setSampleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState<StyleGuide>(currentStyle);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!sampleText || sampleText.trim().length < 20) {
      setError("사장님이 직접 작성하셨던 글을 최소 20자 이상 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "문체 분석 실패");
      }

      setStyle(data.styleGuide);
      onSaveStyle(data.styleGuide);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || "문체 분석 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-obsidian-700 bg-obsidian-900 p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-obsidian-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-brand/20 text-emerald-brand">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">사장님 문체 복제 (Style Cloning)</h2>
              <p className="text-xs text-slate-400">기계적 AI 말투를 없애고 사장님 고유의 어투를 복제합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-obsidian-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              기존 작성 글 샘플 붙여넣기 (블로그 본문, 인스타 캡션 등)
            </label>
            <textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="예: 안녕하세요 원장입니다. 오늘 중2 민수가 중간고사 30점에서 이번 기말 92점 맞았다고 울면서 뛰어왔네요. 다른 학원 다닐 땐 공식만 외우다 포기했었는데..."
              rows={4}
              className="w-full rounded-xl border border-obsidian-700 bg-obsidian-950 p-3 text-sm text-white placeholder-slate-500 focus:border-emerald-brand focus:outline-none focus:ring-1 focus:ring-emerald-brand"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-brand/10 p-3 text-xs text-emerald-brand border border-emerald-brand/20">
              <Check className="h-4 w-4 shrink-0" />
              <span>사장님만의 문체가 성공적으로 복제·적용되었습니다!</span>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-brand py-3 font-semibold text-obsidian-950 transition hover:bg-emerald-hover disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>문체 분석 및 복제 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>사장님 말투 1초 추출하기</span>
              </>
            )}
          </button>

          {/* Current Style Guide Display */}
          <div className="rounded-xl border border-obsidian-800 bg-obsidian-950/60 p-4 text-xs space-y-2">
            <div className="font-semibold text-emerald-brand">현재 적용된 문체 가이드:</div>
            <div><span className="text-slate-400">어조:</span> {style.tone}</div>
            <div><span className="text-slate-400">종결어미:</span> {style.sentence_ending}</div>
            <div>
              <span className="text-slate-400">금지 단어:</span>{" "}
              {style.forbidden_words?.join(", ") || "없음"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
