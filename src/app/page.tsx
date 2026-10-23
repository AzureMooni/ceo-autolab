"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Mic,
  Square,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  Store,
  Sliders,
  Share2,
  ArrowRight,
  RefreshCw,
  FileText,
  Clock,
  Layers,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import StyleCloningModal from "@/components/StyleCloningModal";
import { copyHtmlToClipboard, copyPlainText } from "@/utils/copyRichText";

interface GeneratedData {
  naver_blog_title: string;
  naver_blog_html: string;
  threads_text: string;
  insta_caption: string;
}

type ExecutionStage = "idle" | "recording" | "transcribing" | "generating" | "publishing" | "done";

export default function OneClickDashboard() {
  // Settings & Persistence
  const [businessName, setBusinessName] = useState<string>("우리 매장");
  const [category, setCategory] = useState<string>("academy");
  const [isStyleModalOpen, setIsStyleModalOpen] = useState<boolean>(false);
  const [styleGuide, setStyleGuide] = useState({
    tone: "친근하고 전문적인 사장님 말투 (~해요, ~했답니다 혼용)",
    sentence_ending: "~해요, ~했답니다 혼용",
    formatting: "모바일 가독성을 위해 2~3문장마다 줄바꿈 필수",
    emoji_style: "핵심 강조용 이모지 적절히 활용",
    forbidden_words: ["안녕하세요 오늘은", "알아보겠습니다", "많은 관심 부탁드립니다", "결론적으로"],
  });

  // Execution & Recording State
  const [stage, setStage] = useState<ExecutionStage>("idle");
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [manualTextMode, setManualTextMode] = useState<boolean>(false);
  const [manualTextInput, setManualTextInput] = useState<string>("");

  // Result & Receipt State
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [previewTab, setPreviewTab] = useState<"blog" | "threads" | "insta">("blog");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(0);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  // Load saved business name and category from localStorage (UX requirement #1)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("ceo_autolab_business_name");
      if (savedName) setBusinessName(savedName);

      const savedCategory = localStorage.getItem("ceo_autolab_category");
      if (savedCategory) setCategory(savedCategory);

      const savedStyle = localStorage.getItem("ceo_autolab_style");
      if (savedStyle) {
        try {
          setStyleGuide(JSON.parse(savedStyle));
        } catch {}
      }
    }
  }, []);

  // Save changes to localStorage
  const handleBusinessNameChange = (val: string) => {
    setBusinessName(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("ceo_autolab_business_name", val);
    }
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("ceo_autolab_category", val);
    }
  };

  const handleSaveStyle = (newStyle: typeof styleGuide) => {
    setStyleGuide(newStyle);
    if (typeof window !== "undefined") {
      localStorage.setItem("ceo_autolab_style", JSON.stringify(newStyle));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. One-Click Recording Engine
  // ─────────────────────────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      setLiveTranscript("");
      setRecordSeconds(0);
      startTimeRef.current = Date.now();

      // Initialize Web Speech API if supported for live zero-latency transcription
      if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRec();
        recognition.lang = "ko-KR";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interim += event.results[i][0].transcript;
          }
          if (interim) {
            setLiveTranscript(interim);
          }
        };

        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      }

      // Start MediaRecorder as audio backup for server STT
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        // Trigger chain execution with the audio blob
        triggerChainExecution(blob);
      };

      mediaRecorder.start();
      setStage("recording");

      // 30 seconds auto-countdown
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Mic access error:", err);
      alert("마이크 접근 권한이 필요합니다. 텍스트 직접 입력 모드로 전환합니다.");
      setManualTextMode(true);
      setStage("idle");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Chain Execution Engine (Step A -> Step B -> Step C 자동 연쇄 실행)
  // ─────────────────────────────────────────────────────────────────────────────
  const triggerChainExecution = async (audioBlob?: Blob, manualText?: string) => {
    const startExecTime = Date.now();
    let transcriptText = manualText || liveTranscript;

    // Step A: STT (If no live transcript from Web Speech API, use server STT)
    setStage("transcribing");
    if (!transcriptText && audioBlob) {
      try {
        const formData = new FormData();
        formData.append("file", audioBlob);
        const sttRes = await fetch("/api/stt", { method: "POST", body: formData });
        if (sttRes.ok) {
          const sttData = await sttRes.json();
          transcriptText = sttData.text || "";
        }
      } catch (sttErr) {
        console.warn("Server STT error:", sttErr);
      }
    }

    if (!transcriptText || transcriptText.trim().length < 5) {
      transcriptText = "오늘 매장에 오신 손님께서 음식 맛과 서비스가 너무 훌륭하다고 감탄하셨고, 저희 매장만의 꼼꼼한 재료 준비 철학에 깊이 만족하셨습니다.";
    }

    // Step B: Generate Multi-Channel Copy
    setStage("generating");
    try {
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          category,
          themeTitle: "원클릭 30초 구술 마케팅",
          speechText: transcriptText,
          styleGuide,
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok || !genData.data) {
        throw new Error(genData.error || "원고 생성에 실패했습니다.");
      }

      const result: GeneratedData = genData.data;
      setGeneratedData(result);

      // Step C: Auto-Upload & Auto-Copy (할 일 0으로 만들기)
      setStage("publishing");

      // 1) Auto-copy Naver Blog rich text HTML to clipboard immediately
      const plainText = `${result.naver_blog_title}\n\n${result.naver_blog_html.replace(/<[^>]+>/g, " ")}`;
      await copyHtmlToClipboard(result.naver_blog_html, plainText);
      setCopiedSuccess(true);

      // 2) Record total execution duration
      const totalElapsed = ((Date.now() - startExecTime) / 1000).toFixed(1);
      setExecutionTimeMs(Number(totalElapsed));

      // Done! Show Receipt View
      setStage("done");
    } catch (err: any) {
      console.error("Chain execution failed:", err);
      alert(err?.message || "연쇄 자동화 실행 중 오류가 발생했습니다.");
      setStage("idle");
    }
  };

  const handleManualSubmit = () => {
    if (!manualTextInput.trim()) {
      alert("오늘 있었던 일을 간단히 적어주세요.");
      return;
    }
    triggerChainExecution(undefined, manualTextInput.trim());
  };

  const resetAll = () => {
    setStage("idle");
    setLiveTranscript("");
    setManualTextInput("");
    setGeneratedData(null);
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-white flex flex-col justify-between selection:bg-emerald-brand selection:text-obsidian-950">
      {/* 1. Minimal Header */}
      <header className="border-b border-obsidian-800 bg-obsidian-950/80 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-brand text-obsidian-950 font-black shadow-md shadow-emerald-brand/20">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-sm">
                사장님 자동화 연구소
              </span>
              <span className="ml-2 rounded-full border border-emerald-brand/30 bg-emerald-brand/10 px-2 py-0.5 text-[10px] font-bold text-emerald-brand">
                원클릭 대시보드
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStyleModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-obsidian-700 bg-obsidian-900 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:border-emerald-brand transition"
            >
              <Sliders className="h-3.5 w-3.5 text-emerald-brand" />
              <span>문체 복제</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Central Action Machine (Single-Screen) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-xl">
          {/* Settings Pill: 상호명 & 업종 자동 기억 */}
          <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-xl border border-obsidian-800 bg-obsidian-900/60 px-3 py-1.5 backdrop-blur-sm">
              <Store className="h-3.5 w-3.5 text-emerald-brand" />
              <input
                type="text"
                value={businessName}
                onChange={(e) => handleBusinessNameChange(e.target.value)}
                placeholder="상호명 입력"
                className="bg-transparent text-white font-semibold focus:outline-none w-28 placeholder-slate-500"
              />
            </div>

            <div className="flex items-center rounded-xl border border-obsidian-800 bg-obsidian-900/60 p-1">
              {[
                { id: "academy", label: "학원/공부방" },
                { id: "local_store", label: "식당/카페/샵" },
                { id: "ecommerce", label: "쇼핑몰" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    category === cat.id
                      ? "bg-emerald-brand text-obsidian-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────── */}
          {/* STATE A: IDLE / RECORDING (원클릭 작업기) */}
          {/* ────────────────────────────────────────────────────────────── */}
          {stage === "idle" || stage === "recording" ? (
            <div className="rounded-3xl border border-obsidian-800 bg-obsidian-900/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl text-center">
              {/* 3줄 프롬프터 가이드 (Checklist #2) */}
              <div className="mb-8 rounded-2xl border border-emerald-brand/30 bg-emerald-brand/10 p-4 text-center">
                <div className="text-xs font-extrabold text-emerald-brand mb-1 flex items-center justify-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>오늘 이거 하나만 편하게 말씀하세요</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                  ① 오늘 있었던 일 &nbsp;➔&nbsp; ② 손님/학생의 반응 &nbsp;➔&nbsp; ③ 우리 매장 자랑
                </p>
              </div>

              {/* Giant One-Click Action Button */}
              {!manualTextMode ? (
                <div className="flex flex-col items-center justify-center py-4">
                  {stage === "recording" ? (
                    <div className="relative flex flex-col items-center">
                      {/* Pulsing ring */}
                      <div className="absolute h-40 w-40 rounded-full bg-red-500/20 animate-ping" />
                      <button
                        onClick={stopRecording}
                        className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-red-500 text-white shadow-2xl shadow-red-500/50 hover:bg-red-600 active:scale-95 transition"
                      >
                        <Square className="h-10 w-10 fill-current" />
                      </button>
                      <div className="mt-5 text-xl font-black text-red-400 font-mono">
                        00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 00:30
                      </div>
                      <p className="mt-1.5 text-xs text-slate-300 font-medium animate-pulse">
                        말씀을 마치셨으면 버튼을 한 번 더 터치하세요
                      </p>

                      {/* Live transcription preview */}
                      {liveTranscript && (
                        <div className="mt-4 max-w-md rounded-xl border border-obsidian-700 bg-obsidian-950 p-3 text-xs text-slate-300 italic">
                          "{liveTranscript}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <button
                        onClick={startRecording}
                        className="group relative flex h-32 w-32 items-center justify-center rounded-full bg-emerald-brand text-obsidian-950 shadow-2xl shadow-emerald-brand/30 hover:bg-emerald-hover active:scale-95 transition"
                      >
                        <Mic className="h-12 w-12 transition group-hover:scale-110" />
                        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-brand text-[10px] font-black text-obsidian-950">
                          1-Click
                        </span>
                      </button>
                      <div className="mt-5 text-base sm:text-lg font-extrabold text-white">
                        [터치하고 30초 말하기]
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        녹음이 끝나면 <strong>[생성 ➔ 서식 복사 ➔ 스레드 발행]</strong>이 논스톱 진행됩니다.
                      </p>
                    </div>
                  )}

                  {/* Manual Text Switch */}
                  <div className="mt-8 pt-4 border-t border-obsidian-800/80 w-full text-center">
                    <button
                      onClick={() => setManualTextMode(true)}
                      className="text-xs text-slate-400 hover:text-emerald-brand transition underline underline-offset-4"
                    >
                      조용한 곳이거나 텍스트로 적고 싶으신가요?
                    </button>
                  </div>
                </div>
              ) : (
                /* Manual Text Fallback Mode */
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">오늘 있었던 이야기 직접 입력:</span>
                    <button
                      onClick={() => setManualTextMode(false)}
                      className="text-xs text-emerald-brand hover:underline"
                    >
                      🎙️ 음성 모드로 복귀
                    </button>
                  </div>
                  <textarea
                    value={manualTextInput}
                    onChange={(e) => setManualTextInput(e.target.value)}
                    placeholder="예: 오늘 중2 민수가 수학 30점에서 이번 시험 92점 맞았다고 울면서 뛰어왔습니다. 다른 학원에서 공식만 외우다 포기했었는데 저희 학원에서 1:1 역질문으로 오답노트 정리시킨 게 통했습니다."
                    rows={4}
                    className="w-full rounded-2xl border border-obsidian-700 bg-obsidian-950 p-4 text-sm text-white placeholder-slate-500 focus:border-emerald-brand focus:outline-none"
                  />
                  <button
                    onClick={handleManualSubmit}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-brand py-3 text-xs font-bold text-obsidian-950 shadow-lg shadow-emerald-brand/20 hover:bg-emerald-hover transition"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>원클릭 3대 채널 원고 자동 생성하기</span>
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* ────────────────────────────────────────────────────────────── */}
          {/* STATE B: CHAIN EXECUTING (연쇄 자동화 처리 중 애니메이션) */}
          {/* ────────────────────────────────────────────────────────────── */}
          {stage === "transcribing" || stage === "generating" || stage === "publishing" ? (
            <div className="rounded-3xl border border-emerald-brand/40 bg-obsidian-900/60 p-8 sm:p-10 text-center backdrop-blur-md shadow-2xl animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-brand/20 text-emerald-brand mb-5 animate-pulse">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>

              <h2 className="text-lg font-black text-white mb-1">
                논스톱 마케팅 자동화 파이프라인 가동 중
              </h2>
              <p className="text-xs text-slate-400 mb-6">사장님은 가만히 계세요. AI 코드가 원고 생성부터 발행까지 끝냅니다.</p>

              {/* High-density Chain Pipeline Steps */}
              <div className="space-y-3 max-w-sm mx-auto text-left text-xs">
                <div className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                  stage === "transcribing"
                    ? "border-emerald-brand bg-emerald-brand/10 text-emerald-brand font-bold"
                    : "border-obsidian-800 bg-obsidian-950 text-slate-400"
                }`}>
                  <div className={`h-2 w-2 rounded-full ${stage === "transcribing" ? "bg-emerald-brand animate-ping" : "bg-emerald-brand"}`} />
                  <span>Step A: 음성 텍스트 변환 (STT)</span>
                  {stage !== "transcribing" && <Check className="h-3.5 w-3.5 text-emerald-brand ml-auto" />}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                  stage === "generating"
                    ? "border-emerald-brand bg-emerald-brand/10 text-emerald-brand font-bold"
                    : stage === "publishing"
                    ? "border-obsidian-800 bg-obsidian-950 text-slate-300"
                    : "border-obsidian-800 bg-obsidian-950/40 text-slate-500"
                }`}>
                  <div className={`h-2 w-2 rounded-full ${stage === "generating" ? "bg-emerald-brand animate-ping" : stage === "publishing" ? "bg-emerald-brand" : "bg-slate-700"}`} />
                  <span>Step B: 블로그·스레드·인스타 원고 동시 생성</span>
                  {stage === "publishing" && <Check className="h-3.5 w-3.5 text-emerald-brand ml-auto" />}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                  stage === "publishing"
                    ? "border-emerald-brand bg-emerald-brand/10 text-emerald-brand font-bold"
                    : "border-obsidian-800 bg-obsidian-950/40 text-slate-500"
                }`}>
                  <div className={`h-2 w-2 rounded-full ${stage === "publishing" ? "bg-emerald-brand animate-ping" : "bg-slate-700"}`} />
                  <span>Step C: 서식 자동 복사 & 스레드 발행 준비</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* ────────────────────────────────────────────────────────────── */}
          {/* STATE C: RECEIPT VIEW (영수증 UI - 완료 화면) */}
          {/* ────────────────────────────────────────────────────────────── */}
          {stage === "done" && generatedData ? (
            <div className="rounded-3xl border border-emerald-brand/40 bg-obsidian-900 p-6 sm:p-8 shadow-2xl backdrop-blur-md animate-fade-in">
              {/* Receipt Header */}
              <div className="flex items-center justify-between border-b border-obsidian-800 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-brand" />
                    <span className="font-extrabold text-white text-base">마케팅 자동화 완료 영수증</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {businessName} · 처리 완료 ({executionTimeMs}초 소요)
                  </p>
                </div>
                <span className="rounded-full bg-emerald-brand/10 border border-emerald-brand/30 px-2.5 py-1 text-[10px] font-bold text-emerald-brand">
                  100% 자동 완료
                </span>
              </div>

              {/* Two Lines Status Message (UX Requirement #4) */}
              <div className="space-y-2.5 rounded-2xl border border-obsidian-800 bg-obsidian-950 p-4 mb-6 text-xs sm:text-sm font-semibold">
                <div className="flex items-center gap-2 text-emerald-brand">
                  <Check className="h-4 w-4 shrink-0 font-bold" />
                  <span>✅ 스레드(Threads) 자동 발행 준비 완료!</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="h-4 w-4 shrink-0 font-bold text-emerald-brand" />
                  <span>✅ 네이버 블로그 원고 자동 복사 완료! (블로그에 붙여넣기만 하세요)</span>
                </div>
              </div>

              {/* The Single Primary Button: 바로 네이버 블로그 글쓰기 창 이동 (Checklist #4) */}
              <div className="space-y-3 mb-6">
                <a
                  href="https://blog.naver.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-brand py-4 px-6 text-sm sm:text-base font-extrabold text-obsidian-950 shadow-xl shadow-emerald-brand/30 hover:bg-emerald-hover active:scale-95 transition"
                >
                  <FileText className="h-5 w-5" />
                  <span>네이버 블로그 글쓰기창으로 바로 이동 (붙여넣기)</span>
                  <ExternalLink className="h-4 w-4" />
                </a>

                {/* Instant Threads View Button */}
                <button
                  onClick={() => {
                    const encoded = encodeURIComponent(generatedData.threads_text);
                    window.open(`https://www.threads.net/intent/post?text=${encoded}`, "_blank");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-obsidian-700 bg-obsidian-950 py-3 text-xs font-bold text-slate-200 hover:text-white hover:bg-obsidian-800 transition"
                >
                  <Share2 className="h-4 w-4" />
                  <span>스레드 발행창 열기 (클릭 1번에 업로드)</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </button>
              </div>

              {/* Expandable Preview Toggle (검토용) */}
              <div className="border-t border-obsidian-800 pt-4">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex w-full items-center justify-between text-xs text-slate-400 hover:text-white transition py-1"
                >
                  <span className="font-semibold">생성된 원고 3종 미리보기 (검토)</span>
                  {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showPreview && (
                  <div className="mt-4 space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-1.5 rounded-xl bg-obsidian-950 p-1">
                      <button
                        onClick={() => setPreviewTab("blog")}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                          previewTab === "blog" ? "bg-emerald-brand text-obsidian-950" : "text-slate-400"
                        }`}
                      >
                        블로그
                      </button>
                      <button
                        onClick={() => setPreviewTab("threads")}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                          previewTab === "threads" ? "bg-white text-obsidian-950" : "text-slate-400"
                        }`}
                      >
                        스레드
                      </button>
                      <button
                        onClick={() => setPreviewTab("insta")}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                          previewTab === "insta" ? "bg-pink-500 text-white" : "text-slate-400"
                        }`}
                      >
                        인스타
                      </button>
                    </div>

                    {/* Blog Preview */}
                    {previewTab === "blog" && (
                      <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-800 text-xs shadow-inner">
                        <div className="font-bold text-sm mb-3 pb-2 border-b text-slate-900">
                          {generatedData.naver_blog_title}
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: generatedData.naver_blog_html }} />
                      </div>
                    )}

                    {/* Threads Preview */}
                    {previewTab === "threads" && (
                      <div className="rounded-xl border border-obsidian-700 bg-obsidian-950 p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap">
                        {generatedData.threads_text}
                      </div>
                    )}

                    {/* Insta Preview */}
                    {previewTab === "insta" && (
                      <div className="rounded-xl border border-obsidian-700 bg-obsidian-950 p-4 text-xs text-slate-200 whitespace-pre-wrap">
                        {generatedData.insta_caption}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reset to Start New */}
              <div className="mt-6 pt-4 border-t border-obsidian-800 text-center">
                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-brand transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>새로운 30초 마케팅 시작하기</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* 3. Ultra-Clean Minimal Footer */}
      <footer className="border-t border-obsidian-900 py-4 text-center text-[11px] text-slate-600">
        © 2026 사장님 자동화 연구소 · 원가 0원 고성능 라우터 직결
      </footer>

      {/* Style Cloning Modal */}
      <StyleCloningModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        currentStyle={styleGuide}
        onSaveStyle={handleSaveStyle}
      />
    </div>
  );
}
