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
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Check,
  X,
  MapPin,
  HelpCircle,
  Share2,
} from "lucide-react";
import StyleCloningModal from "@/components/StyleCloningModal";
import SocialProofSection from "@/components/SocialProofSection";
import FaqSection from "@/components/FaqSection";
import { copyHtmlToClipboard, copyPlainText } from "@/utils/copyRichText";

interface GeneratedData {
  naver_blog_title: string;
  naver_blog_html: string;
  threads_text: string;
  insta_caption: string;
}

type StudioState = "idle" | "recording" | "chaining" | "done";

// 업종별 맞춤형 3줄 프롬프터 가이드 & 데모 샘플
const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    placeholderName: string;
    placeholderKeyword: string;
    guides: [string, string, string];
    demoText: string;
  }
> = {
  academy: {
    label: "학원/공부방",
    placeholderName: "예: 연세에이스영어",
    placeholderKeyword: "예: 구월동 영어학원",
    guides: [
      "오늘 수업 중 성적이 올랐거나 태도가 변한 학생 일화",
      "그 학생이나 학부모님이 처음에 가장 고민했던 문제점",
      "원장님만의 1:1 지도 노하우와 특별히 신경 쓴 포인트",
    ],
    demoText:
      "오늘 중2 서연이가 지난 시험 30점에서 이번 기말고사 92점 맞았다고 울면서 뛰어왔습니다. 포기하지 않고 1:1 역질문 오답노트로 끝까지 함께 지도한 보람을 느꼈습니다.",
  },
  local_store: {
    label: "로컬 매장",
    placeholderName: "예: 제주 돌담흑돼지",
    placeholderKeyword: "예: 송파구 삼겹살 맛집",
    guides: [
      "오늘 다녀간 손님 중 기억에 남는 칭찬이나 에피소드",
      "손님이 방문 전 기대했거나 메뉴 선택 시 고민했던 점",
      "매일 타협하지 않고 고집하는 재료 손질·서비스 비법",
    ],
    demoText:
      "오늘 점심에 단체 손님께서 '여기 고기는 잡내가 하나도 없고 밑반찬까지 정갈하다'며 온 가족 주말 모임 20인분을 즉석에서 예약하고 가셨습니다. 매일 아침 새벽시장에서 들여오는 신선육과 3일 저온 숙성의 차이를 알아주셔서 보람찼습니다.",
  },
  ecommerce: {
    label: "스마트스토어",
    placeholderName: "예: 모던가죽공방",
    placeholderKeyword: "예: 수제 천연가죽 지갑",
    guides: [
      "오늘 출고/검수 과정이나 기억에 남는 고객 후기·재구매 사연",
      "고객들이 타사 제품을 쓰면서 흔히 겪던 불편함(결핍)",
      "불량률 0%를 위해 우리가 직접 고집하는 제작·검수 원칙",
    ],
    demoText:
      "어제 런칭한 수제 천연가죽 지갑이 출시 하루 만에 1차 준비 수량 300개가 전량 품절되었습니다. 박음질 하나하나 꼼꼼히 검수한 진심을 알아봐 주셔서 진심으로 감사드립니다.",
  },
};

export default function DarkStudioPage() {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Settings & Persistence
  // ─────────────────────────────────────────────────────────────────────────────
  const [businessName, setBusinessName] = useState<string>("우리 매장");
  const [localKeyword, setLocalKeyword] = useState<string>("");
  const [category, setCategory] = useState<string>("academy");
  const [isStyleModalOpen, setIsStyleModalOpen] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [styleGuide, setStyleGuide] = useState({
    tone: "친근하고 전문적인 사장님 말투 (~해요, ~했답니다 혼용)",
    sentence_ending: "~해요, ~했답니다 혼용",
    formatting: "모바일 가독성을 위해 2~3문장마다 줄바꿈 필수",
    emoji_style: "핵심 강조용 이모지 적절히 활용",
    forbidden_words: [
      "안녕하세요 오늘은",
      "알아보겠습니다",
      "많은 관심 부탁드립니다",
      "결론적으로",
    ],
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
  const [executionTime, setExecutionTime] = useState<number>(6.8);

  // Audio & Recording Refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Load saved settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("ceo_autolab_business_name");
      if (savedName) setBusinessName(savedName);

      const savedKw = localStorage.getItem("ceo_autolab_local_keyword");
      if (savedKw) setLocalKeyword(savedKw);

      const savedCat = localStorage.getItem("ceo_autolab_category");
      if (savedCat && CATEGORY_CONFIG[savedCat]) setCategory(savedCat);

      const savedStyle = localStorage.getItem("ceo_autolab_style");
      if (savedStyle) {
        try {
          setStyleGuide(JSON.parse(savedStyle));
        } catch {}
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

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

  const handleKeywordChange = (val: string) => {
    setLocalKeyword(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("ceo_autolab_local_keyword", val);
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
  // 3. Recording Handler (Clear Tap-to-Start / Tap-to-Stop)
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
        if (
          advErr.name === "OverconstrainedError" ||
          advErr.name === "ConstraintNotSatisfiedError"
        ) {
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
      if (
        typeof window !== "undefined" &&
        ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
      ) {
        const SpeechRec =
          (window as any).webkitSpeechRecognition ||
          (window as any).SpeechRecognition;
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
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        stopAudioStreams();
        executeTheChain(audioBlob);
      };

      mediaRecorder.start();
      setStudioState("recording");

      // 45 seconds timer
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 45) {
            stopRecording();
            return 45;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn("Mic Error:", err);
      stopAudioStreams();

      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setPermissionError(
          "🎙️ 마이크 장치를 찾을 수 없습니다. 이어폰을 연결하거나 아래 '1초 데모 체험' 또는 '텍스트 입력'을 이용해 주세요."
        );
      } else if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setPermissionError(
          "⚠️ 브라우저 주소창 왼쪽 [사이트 설정 / 자물쇠 아이콘]에서 마이크 권한을 '허용'으로 켜주세요."
        );
      } else {
        setPermissionError(
          "⚠️ 마이크 연결이 원활하지 않습니다. 아래 '1초 데모 체험' 또는 직접 텍스트 입력으로 바로 생성 가능합니다."
        );
      }
      setManualMode(true);
      setStudioState("idle");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. The Chain: 원클릭 연쇄 실행 엔진
  // ─────────────────────────────────────────────────────────────────────────────
  const executeTheChain = async (
    audioBlob?: Blob,
    explicitTextInput?: string
  ) => {
    setStudioState("chaining");
    setChainStep(1);
    const startTime = Date.now();

    let transcript = explicitTextInput || liveTranscript;

    // Step A: STT Server Call
    if (!transcript && audioBlob) {
      try {
        const formData = new FormData();
        formData.append("file", audioBlob);
        const sttRes = await fetch("/api/stt", {
          method: "POST",
          body: formData,
        });
        if (sttRes.ok) {
          const sttData = await sttRes.json();
          transcript = sttData.text || "";
        }
      } catch (e) {
        console.warn("STT Server fallback:", e);
      }
    }

    // 음성이 너무 짧거나 인식되지 않았을 때 멋대로 데모로 덮어씌우지 않고 정직하게 안내
    if (!explicitTextInput && (!transcript || transcript.trim().length < 4)) {
      setStudioState("idle");
      setPermissionError(
        "🎙️ 음성이 너무 짧거나 인식되지 않았습니다. 마이크에 대고 조금만 더 길게 말씀해 주시거나 '1초 데모 체험'을 눌러보세요."
      );
      return;
    }

    // Step B: AI Copywriting (사장님 문체 + 지역 SEO 키워드 주입)
    setTimeout(() => setChainStep(2), 400);

    try {
      const combinedBusinessName = localKeyword.trim()
        ? `${businessName} (${localKeyword.trim()})`
        : businessName;

      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: combinedBusinessName,
          category,
          themeTitle: localKeyword.trim()
            ? `${localKeyword.trim()} 로컬 SEO 맞춤 칼럼`
            : "원클릭 올인원 구술 마케팅",
          speechText: transcript,
          styleGuide,
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok || !genData.data) {
        throw new Error(genData.error || "원고 생성에 실패했습니다.");
      }

      const result: GeneratedData = genData.data;

      // 무료 체험 워터마크 시그니처 (Growth Loop) 자동 부착
      const viralFooter = `<p style="font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 12px;">🎙️ 이 글은 바쁜 사장님이 <strong>30초 음성 인터뷰</strong>로 구술하고 <a href="https://ceoautolab.com/?utm_source=blog_viral" target="_blank" style="color: #10B981; text-decoration: underline; font-weight: bold;">사장님 자동화 연구소</a>를 통해 작성되었습니다.</p>`;
      result.naver_blog_html = `${result.naver_blog_html}\n${viralFooter}`;

      setGeneratedData(result);

      // Step C: 클립보드 1차 복사 시도
      setTimeout(() => setChainStep(3), 900);
      const plainText = `${result.naver_blog_title}\n\n${result.naver_blog_html.replace(
        /<[^>]+>/g,
        " "
      )}`;
      await copyHtmlToClipboard(result.naver_blog_html, plainText);

      setTimeout(() => setChainStep(4), 1400);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      setExecutionTime(Number(elapsed) < 2 ? 5.8 : Number(elapsed));

      setTimeout(() => {
        setStudioState("done");
      }, 1800);
    } catch (err: any) {
      console.error("Chain error:", err);
      alert(err?.message || "원고 생성 중 일시적인 오류가 발생했습니다.");
      setStudioState("idle");
    }
  };

  // [핵심 패치] 유저 클릭 제스처(User Gesture) 시점에 동기적으로 클립보드 복사 후 블로그 글쓰기 창 오픈
  const handleCopyAndOpenNaverBlog = async () => {
    if (!generatedData) return;
    const plainText = `${generatedData.naver_blog_title}\n\n${generatedData.naver_blog_html.replace(
      /<[^>]+>/g,
      " "
    )}`;
    await copyHtmlToClipboard(generatedData.naver_blog_html, plainText);
    showToast("✅ 블로그 서식 복사 완료! 열리는 창에 붙여넣기(Ctrl+V)만 하세요.");
    window.open("https://blog.naver.com/go/write", "_blank", "noopener,noreferrer");
  };

  // [핵심 패치] 스레드 공식 Intent URL로 1초 발행창 오픈 (원고 자동 주입)
  const handleOpenThreadsIntent = () => {
    if (!generatedData) return;
    const intentUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(
      generatedData.threads_text
    )}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
  };

  // 인스타 캡션 원클릭 복사
  const handleCopyInstagram = async () => {
    if (!generatedData) return;
    await copyPlainText(generatedData.insta_caption);
    showToast("📸 인스타그램 캡션 & 해시태그 10개가 복사되었습니다!");
  };

  const handleDemoExecution = (customText?: string) => {
    const text =
      customText ||
      CATEGORY_CONFIG[category]?.demoText ||
      CATEGORY_CONFIG.academy.demoText;
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

  const currentConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.academy;

  return (
    <div className="h-screen overflow-hidden bg-[#07090E] text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative select-none">
      {/* Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-xs px-5 py-2.5 shadow-2xl shadow-emerald-500/40 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Permission Warning Banner */}
      {permissionError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-xl rounded-2xl border border-amber-500/30 bg-black/90 p-3.5 backdrop-blur-2xl text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
            <span className="leading-relaxed">{permissionError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => handleDemoExecution()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[11px] shadow-lg hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              <span>1초 데모 즉시 실행</span>
            </button>
            <button
              onClick={() => setPermissionError(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-amber-300/70 hover:text-amber-300 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* [1] 직관적 한글 헤더 + 업종 선택 + 후기/FAQ 모달 버튼 */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/[0.06] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-white">
            사장님 자동화 연구소
          </span>
          <span className="hidden md:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            말로 쓰는 1분 마케팅 비서
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Pill Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-full p-1 backdrop-blur-md">
            {Object.entries(CATEGORY_CONFIG).map(([id, cfg]) => (
              <button
                key={id}
                onClick={() => handleCategoryChange(id)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                  category === id
                    ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsStyleModalOpen(true)}
            className="rounded-full px-2.5 py-1.5 text-[11px] font-bold bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:border-emerald-500/40 transition flex items-center gap-1.5 cursor-pointer"
            title="내 말투 복제 설정"
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">내 말투 설정</span>
          </button>

          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="rounded-full p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition cursor-pointer"
            title="실제 사장님 후기 및 자주 묻는 질문"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* [2] Main Core Studio Area (5초 테스트 통과용 헤드라인 + 글래스 카드) */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center overflow-y-auto py-2">
        {/* 직관적 가치 제안 헤드라인 (유튜브 미시청 방문자 설득용) */}
        {studioState === "idle" && (
          <div className="text-center mb-4 px-2 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-bold text-slate-300 mb-2">
              <span className="text-emerald-400 font-black">N 블로그 서식</span>
              <span className="text-slate-600">·</span>
              <span className="text-white font-black">@ 스레드</span>
              <span className="text-slate-600">·</span>
              <span className="text-pink-400 font-black">인스타그램</span>
              <span className="text-emerald-400">동시 생성기</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              사장님, 키보드로 힘들게 홍보 글 쓰지 마세요.
            </h1>
            <p className="text-xs sm:text-sm text-emerald-400 font-bold mt-0.5">
              마이크를 누르고 30초만 말하면 사장님 말투 그대로 3대 채널 원고가 완성됩니다.
            </p>
          </div>
        )}

        <div className="max-w-xl w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* 상호명 + 지역 SEO 키워드 입력 바 */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-5 border-b border-white/[0.06] text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Store className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">상호명:</span>
              <input
                type="text"
                value={businessName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={currentConfig.placeholderName}
                className="bg-white/5 px-2 py-1 rounded-lg text-white font-bold focus:outline-none w-28 sm:w-32 border border-white/10 focus:border-emerald-400 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">노출 키워드:</span>
              <input
                type="text"
                value={localKeyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                placeholder={currentConfig.placeholderKeyword}
                className="bg-white/5 px-2 py-1 rounded-lg text-emerald-300 font-bold placeholder-slate-500 focus:outline-none w-32 sm:w-36 border border-white/10 focus:border-emerald-400 transition"
              />
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────────── */}
          {/* STATE 1 & 2: IDLE OR RECORDING */}
          {/* ─────────────────────────────────────────────────────────────────────── */}
          {studioState === "idle" || studioState === "recording" ? (
            <div className="flex flex-col items-center text-center">
              {/* 업종별 동적 3줄 프롬프터 가이드 */}
              <div className="w-full mb-6 rounded-2xl border border-white/[0.08] bg-black/40 p-4 text-left">
                <div className="text-[11px] font-bold text-emerald-400 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    💡 마이크를 켜고 아래 3가지를 편하게 말씀해 보세요 ({currentConfig.label})
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-200">
                  {currentConfig.guides.map((g, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-extrabold font-mono">
                        0{idx + 1}
                      </span>
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!manualMode ? (
                <div className="flex flex-col items-center justify-center my-1">
                  {studioState === "recording" ? (
                    <div className="flex flex-col items-center">
                      {/* Live 12-bar Audio Visualizer */}
                      <div className="h-12 flex items-center justify-center gap-1.5 mb-4">
                        {audioLevels.map((lvl, idx) => (
                          <div
                            key={idx}
                            style={{ height: `${lvl}px` }}
                            className="w-1.5 rounded-full bg-gradient-to-t from-emerald-500 to-teal-300 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-75"
                          />
                        ))}
                      </div>

                      {/* Stop Recording Orb */}
                      <button
                        onClick={stopRecording}
                        className="w-24 h-24 rounded-full bg-red-500 text-white shadow-[0_0_60px_rgba(239,68,68,0.5)] hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer animate-pulse"
                      >
                        <Square className="h-9 w-9 fill-current" />
                      </button>

                      <div className="mt-4 text-lg font-mono font-black text-red-400">
                        00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 00:45
                      </div>

                      <p className="mt-1 text-xs text-slate-300">
                        말씀을 마쳤다면 <strong className="text-red-400">네모 버튼</strong>을 눌러주세요 (즉시 원고 생성)
                      </p>

                      {liveTranscript && (
                        <div className="mt-3 max-w-sm rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-slate-300 italic truncate">
                          "{liveTranscript}"
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Idle Glowing Emerald Orb (Clear Tap-to-Start) */
                    <div className="flex flex-col items-center">
                      <button
                        onClick={startRecording}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_60px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
                      >
                        <Mic className="h-11 w-11 transition group-hover:scale-110" />
                      </button>

                      <div className="mt-4 text-base font-extrabold text-white tracking-tight">
                        마이크 터치하고 편하게 말하기
                      </div>

                      {/* 3대 채널 결과물 뱃지 */}
                      <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                          N 블로그 서식 완성
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          @ 스레드 1초 발행
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          📸 인스타 캡션+태그
                        </span>
                      </div>

                      {/* 1초 데모 즉시 체험 버튼 */}
                      <button
                        type="button"
                        onClick={() => handleDemoExecution()}
                        className="mt-4 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 active:scale-95 transition shadow-sm cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 fill-current text-emerald-400" />
                        <span>⚡ 마이크 없이 1초 데모로 결과물 먼저 보기</span>
                      </button>
                    </div>
                  )}

                  {/* Manual Text Switch */}
                  <div className="mt-5 pt-3 border-t border-white/[0.06] w-full text-center">
                    <button
                      onClick={() => setManualMode(true)}
                      className="text-xs text-slate-400 hover:text-emerald-400 transition underline underline-offset-4 cursor-pointer"
                    >
                      조용한 곳이거나 키보드로 직접 적고 싶으신가요?
                    </button>
                  </div>
                </div>
              ) : (
                /* Manual Text Fallback Mode */
                <div className="w-full space-y-3 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">
                      오늘 있었던 일 간단히 적기:
                    </span>
                    <button
                      onClick={() => setManualMode(false)}
                      className="text-emerald-400 hover:underline font-bold text-xs cursor-pointer"
                    >
                      🎙️ 음성 녹음 모드로 돌아가기
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">예시 넣기:</span>
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setManualText(cfg.demoText)}
                        className="text-[11px] px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition cursor-pointer"
                      >
                        {cfg.label} 예시
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder={currentConfig.demoText}
                    rows={3}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 p-3.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none transition leading-relaxed"
                  />

                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualText.trim()}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 fill-current" />
                    <span>3대 채널 홍보 글 한 번에 생성하기</span>
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* ─────────────────────────────────────────────────────────────────────── */}
          {/* STATE 3: LIVE PIPELINE STEPPER */}
          {/* ─────────────────────────────────────────────────────────────────────── */}
          {studioState === "chaining" ? (
            <div className="py-6 flex flex-col items-center text-center animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-5 animate-pulse">
                <RefreshCw className="h-7 w-7 animate-spin" />
              </div>

              <h2 className="text-base font-extrabold text-white mb-1">
                사장님 말투로 3대 채널 원고를 작성하고 있습니다...
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                잠시만 기다려 주세요 (평균 5~8초 소요)
              </p>

              <div className="w-full max-w-sm space-y-2.5 text-left text-xs">
                {[
                  { step: 1, text: "사장님 음성 내용 정밀 분석 완료" },
                  { step: 2, text: "사장님 고유 말투 복제 & 지역 키워드 주입" },
                  { step: 3, text: "네이버 블로그 스마트에디터 전용 서식 생성" },
                  { step: 4, text: "스레드(Threads) 및 인스타그램 원고 완성" },
                ].map((item) => {
                  const isDone = chainStep >= item.step;
                  const isCurrent = chainStep === item.step;
                  return (
                    <div
                      key={item.step}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                        isDone
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold"
                          : "border-white/[0.04] bg-black/20 text-slate-600"
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isCurrent
                            ? "bg-emerald-400 animate-ping"
                            : isDone
                            ? "bg-emerald-400"
                            : "bg-slate-700"
                        }`}
                      />
                      <span>{item.text}</span>
                      {isDone && (
                        <Check className="h-4 w-4 text-emerald-400 ml-auto shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* ─────────────────────────────────────────────────────────────────────── */}
          {/* [4] 완료 화면: 솔직하고 확실한 원클릭 발행 액션 바 */}
          {/* ─────────────────────────────────────────────────────────────────────── */}
          {studioState === "done" && generatedData ? (
            <div className="flex flex-col animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="font-extrabold text-white text-base">
                      🎉 3대 채널 마케팅 원고 완성! ({executionTime}초)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    아래 버튼을 누르면 각 채널에 서식 그대로 즉시 발행됩니다.
                  </p>
                </div>
              </div>

              {/* 1순위 액션: 네이버 블로그 서식 동기 복사 + 글쓰기 창 즉시 오픈 */}
              <div className="space-y-2.5 mb-4">
                <button
                  type="button"
                  onClick={handleCopyAndOpenNaverBlog}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3.5 px-5 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/25 hover:brightness-105 active:scale-95 transition cursor-pointer"
                >
                  <FileText className="h-5 w-5" />
                  <span>1. 네이버 블로그 서식 복사 & 글쓰기 창 열기</span>
                  <ExternalLink className="h-4 w-4 opacity-80" />
                </button>

                {/* 2순위 액션: 스레드 1초 발행창(Intent) + 인스타 캡션 복사 */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleOpenThreadsIntent}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 py-3 px-3 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4 text-emerald-400" />
                    <span>2. 스레드 1초 발행창 열기</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyInstagram}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 py-3 px-3 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer"
                  >
                    <Copy className="h-4 w-4 text-pink-400" />
                    <span>3. 인스타 캡션·태그 복사</span>
                  </button>
                </div>
              </div>

              {/* 생성된 원고 바로 확인 탭 (기본 펼침으로 신뢰도 향상) */}
              <div className="border-t border-white/[0.06] pt-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex w-full items-center justify-between text-xs font-bold text-emerald-400 hover:text-emerald-300 transition py-1 cursor-pointer"
                >
                  <span>🔍 생성된 원고 3종 눈으로 먼저 확인하기</span>
                  {showPreview ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showPreview && (
                  <div className="mt-2.5 space-y-2.5">
                    <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                      {(["blog", "threads", "insta"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setPreviewTab(tab)}
                          className={`flex-1 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            previewTab === tab
                              ? "bg-emerald-500 text-slate-950"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {tab === "blog"
                            ? "네이버 블로그"
                            : tab === "threads"
                            ? "스레드(Threads)"
                            : "인스타그램"}
                        </button>
                      ))}
                    </div>

                    {previewTab === "blog" && (
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-slate-800 text-xs max-h-44 overflow-y-auto">
                        <div className="font-extrabold text-sm mb-2 pb-1.5 border-b text-slate-900">
                          {generatedData.naver_blog_title}
                        </div>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: generatedData.naver_blog_html,
                          }}
                        />
                      </div>
                    )}

                    {previewTab === "threads" && (
                      <div className="rounded-xl border border-white/10 bg-black/50 p-3.5 text-xs text-slate-200 whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed">
                        {generatedData.threads_text}
                      </div>
                    )}

                    {previewTab === "insta" && (
                      <div className="rounded-xl border border-white/10 bg-black/50 p-3.5 text-xs text-slate-200 whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed">
                        {generatedData.insta_caption}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reset Action */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
                <button
                  onClick={resetStudio}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>다른 주제로 30초 다시 말하기</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* Footer */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 border-t border-white/[0.04] pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
        <span>사장님 자동화 연구소 · 타이핑 0글자로 끝내는 로컬 비즈니스 마케팅</span>
        <button
          onClick={() => setIsInfoModalOpen(true)}
          className="text-slate-400 hover:text-emerald-400 underline underline-offset-4 cursor-pointer"
        >
          실제 도입 후기 & FAQ 보기
        </button>
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

      {/* Social Proof & FAQ Modal (방치된 컴포넌트를 모달로 깔끔하게 연결) */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0B0F17] p-6 sm:p-8 text-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#0B0F17]/90 backdrop-blur pb-4 border-b border-white/10">
              <span className="font-extrabold text-base text-emerald-400">
                💡 사장님 자동화 연구소 도입 사례 및 자주 묻는 질문
              </span>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="rounded-full p-1.5 bg-white/5 hover:bg-white/10 text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SocialProofSection />
            <FaqSection />
          </div>
        </div>
      )}
    </div>
  );
}
