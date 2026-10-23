"use client";

import React, { useState } from "react";
import { Sparkles, Sliders, Eye, Share2, Check, Copy, ExternalLink, Zap, Mic, Store, ArrowRight, ShieldCheck } from "lucide-react";
import VoiceInterviewWizard from "@/components/VoiceInterviewWizard";
import PublishActionBar from "@/components/PublishActionBar";
import StyleCloningModal from "@/components/StyleCloningModal";
import { copyHtmlToClipboard, copyPlainText } from "@/utils/copyRichText";

interface GeneratedData {
  naver_blog_title: string;
  naver_blog_html: string;
  threads_text: string;
  insta_caption: string;
}

export default function HomePage() {
  const [businessName, setBusinessName] = useState<string>("우리 매장");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [activeTab, setActiveTab] = useState<"blog" | "threads" | "insta">("blog");
  const [isStyleModalOpen, setIsStyleModalOpen] = useState<boolean>(false);

  const [copiedType, setCopiedType] = useState<string | null>(null);

  const [styleGuide, setStyleGuide] = useState({
    tone: "친근하고 전문적인 사장님 말투 (~해요, ~했답니다 혼용)",
    sentence_ending: "~해요, ~했답니다 혼용",
    formatting: "모바일 가독성을 위해 2~3문장마다 줄바꿈 필수",
    emoji_style: "핵심 강조용 이모지 적절히 활용",
    forbidden_words: ["안녕하세요 오늘은", "알아보겠습니다", "많은 관심 부탁드립니다", "결론적으로"],
  });

  const handleGenerate = async (
    answers: { a1: string; a2: string; a3: string },
    category: string,
    theme: string
  ) => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          category,
          themeTitle: theme,
          answers,
          styleGuide,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "원고 생성에 실패했습니다.");
      }

      setGeneratedData(json.data);
      // Auto-scroll to results
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (err: any) {
      alert(err?.message || "원고 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyBlog = async () => {
    if (!generatedData) return;
    const plainText = `${generatedData.naver_blog_title}\n\n${generatedData.naver_blog_html.replace(/<[^>]+>/g, " ")}`;
    const success = await copyHtmlToClipboard(generatedData.naver_blog_html, plainText);
    if (success) {
      setCopiedType("blog");
      setTimeout(() => setCopiedType(null), 3000);
    }
  };

  const handlePublishThreads = () => {
    if (!generatedData) return;
    const encoded = encodeURIComponent(generatedData.threads_text);
    window.open(`https://www.threads.net/intent/post?text=${encoded}`, "_blank");
  };

  const handleCopyInsta = async () => {
    if (!generatedData) return;
    const success = await copyPlainText(generatedData.insta_caption);
    if (success) {
      setCopiedType("insta");
      setTimeout(() => setCopiedType(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 pb-28 text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-obsidian-800 bg-obsidian-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-brand text-obsidian-950 font-black shadow-lg shadow-emerald-brand/20">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-sm sm:text-base">
                  사장님 자동화 연구소
                </span>
                <span className="hidden rounded-full border border-emerald-brand/30 bg-emerald-brand/10 px-2 py-0.5 text-[10px] font-bold text-emerald-brand sm:inline-block">
                  Voice-to-Publish AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">말로 하는 1분 마케팅 비서</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* FreeLLMAPI Zero-Cost Indicator */}
            <div className="hidden items-center gap-1.5 rounded-lg border border-obsidian-700 bg-obsidian-900 px-2.5 py-1 text-[11px] text-slate-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-brand animate-pulse" />
              <span>원가 0원 고성능 라우터 가동 중</span>
            </div>

            {/* Style Cloning Trigger */}
            <button
              onClick={() => setIsStyleModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-obsidian-700 bg-obsidian-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-brand hover:text-white"
            >
              <Sliders className="h-3.5 w-3.5 text-emerald-brand" />
              <span>문체 복제 설정</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        {/* Hero Section */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-obsidian-700 bg-obsidian-900/60 px-3 py-1 text-xs text-slate-300 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-brand" />
            <span>월 100만 원 마케팅 대행사 대체 솔루션</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            사장님은 본업에만 집중하세요.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-brand to-emerald-hover">
              1분 말로 하는 인터뷰
            </span>
            가 3대 채널 원고를 끝냅니다.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            타이핑 1글자 안 치고 [네이버 블로그 서식 HTML + 스레드 450자 + 인스타 캡션]을 동시에 뽑아 1초 만에 발행합니다.
          </p>

          {/* Quick Business Name Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-obsidian-800 bg-obsidian-900/40 p-2.5 sm:w-fit">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-1">
              <Store className="h-4 w-4 text-emerald-brand" />
              <span>매장/상호명:</span>
            </div>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="예: 골든수학학원, 제주흑돼지식당"
              className="rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-1 text-xs text-white placeholder-slate-500 focus:border-emerald-brand focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 hidden sm:inline">(원고 제목과 본문에 자동 반영됩니다)</span>
          </div>
        </div>

        {/* Wizard Section */}
        <section className="mb-12">
          <VoiceInterviewWizard onGenerate={handleGenerate} isGenerating={isGenerating} />
        </section>

        {/* Generated Results Section */}
        {generatedData && (
          <section id="results-section" className="mb-12 animate-fade-in scroll-mt-20">
            <div className="rounded-2xl border border-emerald-brand/40 bg-obsidian-900 p-5 shadow-2xl sm:p-7">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-obsidian-800 pb-4 mb-6">
                <div>
                  <span className="text-xs font-bold text-emerald-brand">3대 채널 원고 생성 완료</span>
                  <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    {generatedData.naver_blog_title}
                  </h2>
                </div>

                {/* Platform Switcher Tabs */}
                <div className="flex gap-1.5 rounded-xl bg-obsidian-950 p-1">
                  <button
                    onClick={() => setActiveTab("blog")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      activeTab === "blog"
                        ? "bg-emerald-brand text-obsidian-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📗 네이버 블로그
                  </button>
                  <button
                    onClick={() => setActiveTab("threads")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      activeTab === "threads"
                        ? "bg-white text-obsidian-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🧵 스레드
                  </button>
                  <button
                    onClick={() => setActiveTab("insta")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      activeTab === "insta"
                        ? "bg-pink-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    📸 인스타 / 쇼츠
                  </button>
                </div>
              </div>

              {/* Tab 1: Naver Blog Rendered Preview */}
              {activeTab === "blog" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      네이버 스마트에디터 전용 인라인 CSS가 적용된 실제 렌더링 화면:
                    </span>
                    <button
                      onClick={handleCopyBlog}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-brand px-3 py-1.5 text-xs font-bold text-obsidian-950 hover:bg-emerald-hover"
                    >
                      {copiedType === "blog" ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>서식 복사 완료</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>블로그 서식 복사</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-800 shadow-inner">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 border-b border-slate-200 pb-3 mb-6">
                      {generatedData.naver_blog_title}
                    </h1>
                    <div
                      className="naver-blog-preview"
                      dangerouslySetInnerHTML={{ __html: generatedData.naver_blog_html }}
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Threads Preview */}
              {activeTab === "threads" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      스레드 450자 솔직한 독백 인사이트 (해시태그 제외 알고리즘 최적화):
                    </span>
                    <button
                      onClick={handlePublishThreads}
                      className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-obsidian-950 hover:bg-slate-200"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>스레드 1초 발행</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="rounded-xl border border-obsidian-700 bg-obsidian-950 p-5 font-mono text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                    {generatedData.threads_text}
                  </div>
                </div>
              )}

              {/* Tab 3: Instagram / Shorts Preview */}
              {activeTab === "insta" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      인스타그램 피드 캡션 & 릴스/쇼츠 대본 (상위 노출 해시태그 10개 포함):
                    </span>
                    <button
                      onClick={handleCopyInsta}
                      className="flex items-center gap-1.5 rounded-lg border border-obsidian-700 bg-obsidian-950 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white"
                    >
                      {copiedType === "insta" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-brand" />
                          <span className="text-emerald-brand">복사 완료</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-pink-400" />
                          <span>캡션 복사</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-xl border border-obsidian-700 bg-obsidian-950 p-5 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                    {generatedData.insta_caption}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Feature Highlights & Trust Badges */}
        <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-obsidian-800 pt-8 text-xs text-slate-400">
          <div className="flex items-start gap-3 rounded-xl border border-obsidian-800 bg-obsidian-900/30 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-brand/10 text-emerald-brand">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-white mb-0.5">네이버 블로그 100% 서식 보존</div>
              <p>스마트에디터 인라인 CSS로 글자 크기, 볼드체, 인용구, 사진 배치 마커까지 한 번에 복사됩니다.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-obsidian-800 bg-obsidian-900/30 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-white mb-0.5">스레드 1초 인텐트 발행</div>
              <p>복잡한 API 연동 없이 메타 스레드 글쓰기 화면으로 원고를 자동 주입하여 즉시 발행합니다.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-obsidian-800 bg-obsidian-900/30 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-brand/10 text-amber-brand">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-white mb-0.5">사장님 문체 클로닝 해자</div>
              <p>기존 글을 학습하여 "안녕하세요 오늘은" 같은 AI 말투를 원천 차단하고 사장님 어투를 유지합니다.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Bar */}
      {generatedData && (
        <PublishActionBar
          naverBlogHtml={generatedData.naver_blog_html}
          naverBlogTitle={generatedData.naver_blog_title}
          threadsText={generatedData.threads_text}
          instaCaption={generatedData.insta_caption}
        />
      )}

      {/* Style Cloning Modal */}
      <StyleCloningModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        currentStyle={styleGuide}
        onSaveStyle={(newStyle) => setStyleGuide(newStyle)}
      />
    </div>
  );
}
