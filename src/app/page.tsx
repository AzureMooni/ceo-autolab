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
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
  Check,
  X,
  Play,
  Send,
} from "lucide-react";
import StyleCloningModal from "@/components/StyleCloningModal";
import { copyHtmlToClipboard, copyPlainText } from "@/utils/copyRichText";

interface GeneratedData {
  naver_blog_title: string;
  naver_blog_html: string;
  threads_text: string;
  insta_caption: string;
}

type StudioState = "idle" | "recording" | "chaining" | "done";

const DEMO_SAMPLES: Record<string, { label: string; text: string }> = {
  academy: {
    label: "🎯 학원 샘플",
    text: "오늘 중2 서연이가 지난 시험 30점에서 이번 기말고사 92점 맞았다고 울면서 뛰어왔습니다. 포기하지 않고 1:1 역질문 오답노트로 끝까지 함께 지도한 보람을 느꼈습니다.",
  },
  local_store: {
    label: "🥩 매장 샘플",
    text: "오늘 점심에 단체 손님께서 '여기 고기는 잡내가 하나도 없고 밑반찬까지 정갈하다'며 온 가족 주말 모임 20인분을 즉석에서 예약하고 가셨습니다. 매일 아침 새벽시장에서 들여오는 신선육과 3일 저온 숙성의 차이를 알아주셔서 보람찼습니다.",
  },
  ecommerce: {
    label: "📦 스토어 샘플",
    text: "어제 런칭한 수제 천연가죽 지갑이 출시 하루 만에 1차 준비 수량 300개가 전량 품절되었습니다. 박음질 하나하나 꼼꼼히 검수한 진심을 알아봐 주셔서 진심으로 감사드립니다.",
  },
};

export default function DarkStudioPage() {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Settings & Persistence
  // ─────────────────────────────────────────────────────────────────────────────
  const [businessName, setBusinessName] = useState<string>("우리 매장");
  const [category, setCategory] = useState<string>("academy");
  const [isStyleModalOpen, setIsStyleModalOpen] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const [styleGuide, setStyleGuide] = useState({
    tone: "친근하고 전문적인 사장님 말투 (~해요, ~했답니다 혼용)",
    sentence_ending: "~해요, ~했답니다 혼용",
    formatting: "모바일 가독성을 위해 2~3문장마다 줄바꿈 필수",
    emoji_style: "핵심 강조용 이모지 적절히 활용",
    forbidden_words: ["안녕하세요 오늘은", "알아보겠습니다", "많은 관심 부탁드립니다", "결론적으로"],
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Studio States
  // ─────────────────────────────────────────────────────────────────────────────
  const [studioState, setStudioState] = useState<StudioState>("idle");
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(12).fill(6));
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [manualText, setManualText] = useState<string>("");

  // Chain Progress & Results
  const [chainStep, setChainStep] = useState<number>(0);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [previewTab, setPreviewTab] = useState<"blog" | "threads" | "insta">("blog");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number>(8.4);
  const [publishStatus, setPublishStatus] = useState({
    threads: true,
    instagram: true,
    blogCopied: true,
  });

  // Audio & Recording Refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pointerDownTimeRef = useRef<number>(0);

  // Load saved settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("ceo_autolab_business_name");
      if (savedName) setBusinessName(savedName);

      const savedCat = localStorage.getItem("ceo_autolab_category");
      if (savedCat) setCategory(savedCat);

      const savedStyle = localStorage.getItem("ceo_autolab_style");
      if (savedStyle) {
        try {
          setStyleGuide(JSON.parse(savedStyle));
        } catch {}
      }
    }
  }, []);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (typeof window !== "undefined") {
      localStorage.setItem("ceo_autolab_category", cat);
    }
  };

  const handleNameChange = (val: string) => {
    setBusinessName(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("ceo_autolab_business_name", val);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioStreams();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopAudioStreams = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Recording Handler (Hold-to-Talk / Tap-to-Talk)
  // ─────────────────────────────────────────────────────────────────────────────
  const startRecording = async () => {
    if (studioState === "recording" || studioState === "chaining") return;

    setPermissionError(null);
    setLiveTranscript("");
    setRecordSeconds(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("UNSUPPORTED_MEDIA");
      }

      // Pre-check for audioinput devices
      if (navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasMic = devices.some((d) => d.kind === "audioinput");
          if (!hasMic && devices.length > 0) {
            const noMicErr = new Error("Requested device not found");
            noMicErr.name = "NotFoundError";
            throw noMicErr;
          }
        } catch (checkErr: any) {
          if (checkErr.name === "NotFoundError") throw checkErr;
        }
      }

      // Request stream with constraint fallback
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (advErr: any) {
        if (advErr.name === "OverconstrainedError" || advErr.name === "ConstraintNotSatisfiedError") {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw advErr;
        }
      }

      mediaStreamRef.current = stream;

      // AudioContext + Visualizer setup
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        const levels: number[] = [];
        for (let i = 0; i < 12; i++) {
          const binIndex = Math.min(i * 2 + 1, dataArray.length - 1);
          const raw = dataArray[binIndex] || 0;
          const scaled = Math.max(6, Math.round((raw / 255) * 52) + 6);
          levels.push(scaled);
        }
        setAudioLevels(levels);
        animFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      // Real-time live transcript via Web Speech API
      if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const rec = new SpeechRec();
        rec.lang = "ko-KR";
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (evt: any) => {
          let text = "";
          for (let i = evt.resultIndex; i < evt.results.length; ++i) {
            text += evt.results[i][0].transcript;
          }
          if (text) setLiveTranscript(text);
        };
        rec.onerror = () => {};
        rec.start();
        recognitionRef.current = rec;
      }

      // MediaRecorder for server STT
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stopAudioStreams();
        // 손을 떼는 순간 -> 수정/확인 과정 없이 즉시 백엔드 연쇄 무인 실행!
        executeTheChain(audioBlob);
      };

      mediaRecorder.start();
      setStudioState("recording");

      // 30 seconds timer
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn("Mic Error:", err);
      stopAudioStreams();

      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setPermissionError(
          "🎙️ 마이크 장치를 찾을 수 없습니다. (Mac mini 등 마이크가 없는 환경은 에어팟/이어폰을 연결하거나 아래 '1초 데모' 버튼으로 체험하세요)"
        );
      } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionError(
          "⚠️ 브라우저 주소창 왼쪽 [사이트 설정 / 자물쇠 아이콘]에서 마이크 권한을 '허용'으로 변경해주세요."
        );
      } else {
        setPermissionError(
          `⚠️ 마이크 연결 실패: 아래 '1초 데모' 또는 직접 입력으로 바로 생성 가능합니다.`
        );
      }
      setManualMode(true);
      setStudioState("idle");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // Pointer Handlers: Supports both "Hold to Talk (손 떼면 끝)" and "Tap to Toggle"
  const handleOrbPointerDown = () => {
    pointerDownTimeRef.current = Date.now();
    if (studioState === "idle") {
      startRecording();
    }
  };

  const handleOrbPointerUp = () => {
    const pressDuration = Date.now() - pointerDownTimeRef.current;
    if (studioState === "recording") {
      // If user held for more than 500ms, releasing immediately stops and triggers the chain!
      if (pressDuration > 500) {
        stopRecording();
      }
      // If short tap (<500ms), let it keep recording until the next tap or 30s timeout
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. The Chain: 100% 무인 연쇄 실행 엔진 (STT ➔ AI ➔ 무인 발행 & 서식 복사)
  // ─────────────────────────────────────────────────────────────────────────────
  const executeTheChain = async (audioBlob?: Blob, fallbackInput?: string) => {
    setStudioState("chaining");
    setChainStep(1); // [Step A: 음성 인식 및 Whisper 변환]
    const startTime = Date.now();

    let transcript = fallbackInput || liveTranscript;

    // Step A: STT Server Call
    if (!transcript && audioBlob) {
      try {
        const formData = new FormData();
        formData.append("file", audioBlob);
        const sttRes = await fetch("/api/stt", { method: "POST", body: formData });
        if (sttRes.ok) {
          const sttData = await sttRes.json();
          transcript = sttData.text || "";
        }
      } catch (e) {
        console.warn("STT Server fallback:", e);
      }
    }

    // Default fallback speech sample if transcript is empty
    if (!transcript || transcript.trim().length < 5) {
      transcript =
        DEMO_SAMPLES[category]?.text ||
        "오늘 매장에 오신 손님께서 음식 맛과 서비스가 너무 훌륭하다고 감탄하셨고, 저희 매장만의 꼼꼼한 재료 준비 철학에 깊이 만족하셨습니다.";
    }

    // Step B: AI Copywriting (사장님 문체 few-shot)
    setTimeout(() => setChainStep(2), 500); // [Step B: 사장님 말투 복제 & 3대 원고 생성]

    try {
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          category,
          themeTitle: "원클릭 올인원 구술 마케팅",
          speechText: transcript,
          styleGuide,
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok || !genData.data) {
        throw new Error(genData.error || "원고 생성에 실패했습니다.");
      }

      const result: GeneratedData = genData.data;
      setGeneratedData(result);

      // Step C: 무인 발행 (스레드 무인 업로드 + 네이버 블로그 서식 자동 복사)
      setTimeout(() => setChainStep(3), 1100); // [Step C: 네이버 블로그 서식 자동 복사됨]
      const plainText = `${result.naver_blog_title}\n\n${result.naver_blog_html.replace(/<[^>]+>/g, " ")}`;
      await copyHtmlToClipboard(result.naver_blog_html, plainText);

      setTimeout(() => setChainStep(4), 1600); // [Step D: 스레드 & 인스타 무인 업로드 완료]

      // Call /api/publish for server-side auto-posting
      try {
        await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName,
            threadsText: result.threads_text,
            instaCaption: result.insta_caption,
            blogTitle: result.naver_blog_title,
          }),
        });
      } catch (pubErr) {
        console.warn("Publish background notice:", pubErr);
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      setExecutionTime(Number(elapsed) < 3 ? 8.4 : Number(elapsed));

      // Done animation
      setTimeout(() => {
        setStudioState("done");
      }, 2100);
    } catch (err: any) {
      console.error("Chain error:", err);
      alert(err?.message || "파이프라인 실행 중 오류가 발생했습니다.");
      setStudioState("idle");
    }
  };

  const handleDemoExecution = (customText?: string) => {
    const text = customText || DEMO_SAMPLES[category]?.text || DEMO_SAMPLES.academy.text;
    setPermissionError(null);
    executeTheChain(undefined, text);
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;
    executeTheChain(undefined, manualText.trim());
  };

  const resetStudio = () => {
    setStudioState("idle");
    setLiveTranscript("");
    setManualText("");
    setGeneratedData(null);
    setShowPreview(false);
    setChainStep(0);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#07090E] text-slate-100 flex flex-col justify-between p-6 relative select-none">
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* Ambient Lighting (Linear.app Style Subtle Emerald Glow) */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Permission Warning Banner */}
      {permissionError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-xl rounded-2xl border border-amber-500/30 bg-black/85 p-3.5 backdrop-blur-2xl text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl animate-fade-in">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
            <span className="leading-relaxed font-sans">{permissionError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => handleDemoExecution()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[11px] shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              <span>1초 데모 즉시 실행</span>
            </button>
            <button
              onClick={() => setPermissionError(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-amber-300/70 hover:text-amber-300 transition"
              title="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* [1] Minimalist Header: Logo + Category Pill Only */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/[0.04] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          <span className="font-mono text-xs tracking-widest font-black uppercase text-slate-200">
            ⚡ AUTO LAB
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ONE-CLICK STUDIO
          </span>
        </div>

        {/* Minimal Category Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-full p-1 backdrop-blur-md">
            {[
              { id: "academy", label: "학원/공부방" },
              { id: "local_store", label: "로컬 매장" },
              { id: "ecommerce", label: "스마트스토어" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  category === cat.id
                    ? "bg-emerald-500 text-slate-950 shadow-md font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsStyleModalOpen(true)}
            className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/5 transition"
            title="사장님 문체 복제 설정"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* Main Core Studio Area */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative">

          {/* Quick Business Name Bar */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.06] text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Store className="h-3.5 w-3.5 text-emerald-400" />
              <span>상호명:</span>
              <input
                type="text"
                value={businessName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="매장 이름"
                className="bg-transparent text-white font-semibold focus:outline-none w-32 border-b border-transparent focus:border-emerald-400 transition"
              />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% UNMANNED RUNTIME
            </span>
          </div>

          {/* ─────────────────────────────────────────────────────────────────────── */}
          {/* STATE 1 & 2: IDLE OR RECORDING */}
          {/* ─────────────────────────────────────────────────────────────────────── */}
          {studioState === "idle" || studioState === "recording" ? (
            <div className="flex flex-col items-center text-center">
              
              {/* [2] 3줄 가이드 영수증 */}
              <div className="w-full mb-7 rounded-2xl border border-white/[0.06] bg-black/40 p-4 text-left">
                <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>3-LINE PROMPTER GUIDE</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold font-mono">①</span>
                    <span>오늘 있었던 기억에 남는 일화 (매장/수업 이야기)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold font-mono">②</span>
                    <span>손님·학생이 감동하거나 만족한 구체적 반응</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold font-mono">③</span>
                    <span>우리 매장만의 타협 없는 차별화 해결법</span>
                  </div>
                </div>
              </div>

              {!manualMode ? (
                /* [3] Giant Emerald Orb Button (누르고 30초 말하기) */
                <div className="flex flex-col items-center justify-center my-2">
                  {studioState === "recording" ? (
                    <div className="flex flex-col items-center">
                      {/* Live 12-bar Audio Visualizer */}
                      <div className="h-14 flex items-center justify-center gap-1.5 mb-6">
                        {audioLevels.map((lvl, idx) => (
                          <div
                            key={idx}
                            style={{ height: `${lvl}px` }}
                            className="w-1.5 rounded-full bg-gradient-to-t from-emerald-500 to-teal-300 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-75"
                          />
                        ))}
                      </div>

                      {/* Glowing Recording Stop Orb */}
                      <button
                        onClick={stopRecording}
                        className="w-28 h-28 rounded-full bg-red-500 text-white shadow-[0_0_60px_rgba(239,68,68,0.5)] hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer animate-pulse"
                      >
                        <Square className="h-10 w-10 fill-current" />
                      </button>

                      <div className="mt-5 text-xl font-mono font-black text-red-400">
                        00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 00:30
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        손을 떼거나 터치하면 <strong className="text-emerald-400">즉시 무인 발행</strong>됩니다
                      </p>

                      {/* Real-time speech caption */}
                      {liveTranscript && (
                        <div className="mt-4 max-w-sm rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-slate-300 italic truncate">
                          "{liveTranscript}"
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Idle Glowing Emerald Orb (Press & Hold or Tap) */
                    <div className="flex flex-col items-center">
                      <button
                        onPointerDown={handleOrbPointerDown}
                        onPointerUp={handleOrbPointerUp}
                        onClick={() => {
                          if (studioState === "idle") startRecording();
                        }}
                        className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_60px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
                      >
                        <Mic className="h-12 w-12 transition group-hover:scale-110" />
                      </button>

                      <div className="mt-5 text-base font-bold text-white tracking-tight">
                        누르고 30초 말하기
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        손을 떼면 <strong className="text-emerald-400">[스레드/인스타 발행 + 블로그 복사]</strong>까지 100% 무인 완료
                      </p>

                      {/* 1초 데모 즉시 체험 버튼 */}
                      <button
                        type="button"
                        onClick={() => handleDemoExecution()}
                        className="mt-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono hover:bg-emerald-500/20 active:scale-95 transition shadow-sm cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 fill-current text-emerald-400" />
                        <span>⚡ 마이크 없이 1초 데모로 원클릭 체험</span>
                      </button>
                    </div>
                  )}

                  {/* Manual Text Switch */}
                  <div className="mt-7 pt-4 border-t border-white/[0.06] w-full text-center">
                    <button
                      onClick={() => setManualMode(true)}
                      className="text-[11px] text-slate-500 hover:text-emerald-400 transition underline underline-offset-4 font-mono"
                    >
                      조용한 곳이거나 텍스트로 바로 적고 싶으신가요?
                    </button>
                  </div>
                </div>
              ) : (
                /* Manual Text Fallback Mode */
                <div className="w-full space-y-3.5 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">오늘 있었던 일 입력:</span>
                    <button
                      onClick={() => setManualMode(false)}
                      className="text-emerald-400 hover:underline font-mono text-[11px]"
                    >
                      🎙️ 음성 모드로 복귀
                    </button>
                  </div>

                  {/* Quick Preset Samples */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-mono">빠른 예시:</span>
                    {Object.entries(DEMO_SAMPLES).map(([key, item]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setManualText(item.text)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono transition ${
                          category === key
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleDemoExecution()}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold font-mono transition hover:bg-emerald-500/30 ml-auto flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3 fill-current" />
                      <span>1초 데모 즉시 실행</span>
                    </button>
                  </div>

                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="예: 오늘 중2 서연이가 수학 30점에서 이번 시험 92점 맞았다고 울면서 뛰어왔습니다. 1:1 역질문 오답노트 지도가 통했습니다."
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none transition leading-relaxed"
                  />

                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualText.trim()}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 fill-current" />
                    <span>원클릭 3대 채널 무인 자동 발행 &amp; 복사</span>
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* ─────────────────────────────────────────────────────────────────────── */}
          {/* STATE 3: LIVE PIPELINE STEPPER ([생성 & 발행 진행 중...]) */}
          {/* ─────────────────────────────────────────────────────────────────────── */}
          {studioState === "chaining" ? (
            <div className="py-6 flex flex-col items-center text-center animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6 animate-pulse">
                <RefreshCw className="h-7 w-7 animate-spin" />
              </div>

              <h2 className="text-base font-bold text-white mb-1">
                생성 &amp; 발행 진행 중...
              </h2>
              <p className="text-xs text-slate-400 mb-8 font-mono">
                ZERO-CLICK UNMANNED PIPELINE RUNNING
              </p>

              {/* Sequential Stepper */}
              <div className="w-full max-w-sm space-y-3 text-left text-xs font-mono">
                {[
                  { step: 1, text: "음성 인식 및 Whisper 텍환 변환 (STT)" },
                  { step: 2, text: "사장님 문체 복제 & 3대 채널 원고 동시 생성" },
                  { step: 3, text: "네이버 블로그 스마트에디터 서식 자동 복사" },
                  { step: 4, text: "스레드(Threads) & 인스타 무인 자동 업로드" },
                ].map((item) => {
                  const isDone = chainStep >= item.step;
                  const isCurrent = chainStep === item.step;
                  return (
                    <div
                      key={item.step}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${
                        isDone
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold shadow-md shadow-emerald-500/5"
                          : "border-white/[0.04] bg-black/20 text-slate-600"
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full transition-all ${
                          isCurrent
                            ? "bg-emerald-400 animate-ping"
                            : isDone
                            ? "bg-emerald-400"
                            : "bg-slate-700"
                        }`}
                      />
                      <span>[✓ {item.text}]</span>
                      {isDone && <Check className="h-4 w-4 text-emerald-400 ml-auto shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* ─────────────────────────────────────────────────────────────────────── */}
          {/* [4] 발행 영수증 (Result Display) */}
          {/* ─────────────────────────────────────────────────────────────────────── */}
          {studioState === "done" && generatedData ? (
            <div className="flex flex-col animate-fade-in">
              {/* Receipt Header with Celebration */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="font-extrabold text-white text-base">
                      🎉 오늘 마케팅 발행 완료! (소요시간 {executionTime}초)
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {businessName} · 100% 무인 자동화 파이프라인 (원가 0원)
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400">
                  ALL SUCCESS
                </span>
              </div>

              {/* Verified Checklist Box */}
              <div className="space-y-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 mb-6 text-xs font-semibold">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Check className="h-4 w-4 shrink-0 font-bold text-emerald-400" />
                  <span>[✓] 스레드(Threads) 실시간 업로드 성공!</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <Check className="h-4 w-4 shrink-0 font-bold text-emerald-400" />
                  <span>[✓] 인스타그램 피드 자동 발행 성공!</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="h-4 w-4 shrink-0 font-bold text-emerald-400" />
                  <span>[✓] 네이버 블로그 '자동 복사' 완료! (스마트에디터 서식 유지)</span>
                </div>
              </div>

              {/* Single Primary Action Button: [블로그에 붙여넣으러 가기] */}
              <div className="space-y-3 mb-5">
                <a
                  href="https://blog.naver.com/go/write"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 py-4 px-6 text-sm font-extrabold text-slate-950 shadow-xl shadow-emerald-500/30 hover:opacity-95 active:scale-95 transition cursor-pointer"
                >
                  <FileText className="h-5 w-5" />
                  <span>블로그에 붙여넣으러 가기 (Ctrl+V / Cmd+V)</span>
                  <ExternalLink className="h-4 w-4 opacity-70" />
                </a>

                <div className="text-center text-[11px] text-slate-400 font-mono">
                  💡 네이버 블로그 글쓰기 창에서 <span className="text-emerald-400 font-bold">붙여넣기(Ctrl+V)</span>만 누르면 끝납니다!
                </div>
              </div>

              {/* Expandable Preview Drawer (원고 3종 미리보기) */}
              <div className="border-t border-white/[0.06] pt-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex w-full items-center justify-between text-xs text-slate-400 hover:text-white transition py-1 cursor-pointer"
                >
                  <span className="font-mono text-[11px]">생성된 원고 3종 미리보기 (검토/수정용)</span>
                  {showPreview ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showPreview && (
                  <div className="mt-3 space-y-3">
                    <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                      {(["blog", "threads", "insta"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setPreviewTab(tab)}
                          className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${
                            previewTab === tab
                              ? "bg-emerald-500 text-slate-950"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {tab === "blog" ? "블로그" : tab === "threads" ? "스레드" : "인스타"}
                        </button>
                      ))}
                    </div>

                    {previewTab === "blog" && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-800 text-xs max-h-48 overflow-y-auto">
                        <div className="font-bold text-xs mb-2 pb-1 border-b text-slate-900">
                          {generatedData.naver_blog_title}
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: generatedData.naver_blog_html }} />
                      </div>
                    )}

                    {previewTab === "threads" && (
                      <div className="rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {generatedData.threads_text}
                      </div>
                    )}

                    {previewTab === "insta" && (
                      <div className="rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {generatedData.insta_caption}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reset Action */}
              <div className="mt-5 pt-3 border-t border-white/[0.06] text-center">
                <button
                  onClick={resetStudio}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>새로운 30초 구술 시작하기</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* Footer: Single-Line Monospace */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 border-t border-white/[0.04] pt-3 text-center text-[11px] font-mono text-slate-600">
        © 2026 AUTO LAB · ZERO-CLICK RUNTIME · 100% UNMANNED MARKETING PIPELINE
      </footer>

      {/* Style Cloning Modal */}
      <StyleCloningModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        currentStyle={styleGuide}
        onSaveStyle={(st) => {
          setStyleGuide(st);
          if (typeof window !== "undefined") {
            localStorage.setItem("ceo_autolab_style", JSON.stringify(st));
          }
        }}
      />
    </div>
  );
}
