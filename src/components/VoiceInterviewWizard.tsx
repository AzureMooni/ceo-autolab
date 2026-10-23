"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Sparkles, Image as ImageIcon, ChevronRight, ChevronLeft, Volume2, RefreshCw, AlertCircle } from "lucide-react";

interface QuestionStep {
  title: string;
  guide: string;
  question: string;
  placeholder: string;
}

const TEMPLATES: Record<string, { name: string; questions: QuestionStep[] }> = {
  academy: {
    name: "학원 / 공부방",
    questions: [
      {
        title: "1단계: 오늘 있었던 생생한 상황",
        guide: "Hook (호기심 유발)",
        question: "원장님! 최근 수업 중에 눈에 띄게 실력이 늘었거나 태도가 좋아진 학생이 있었나요? 어떤 일이 있었는지 편하게 말씀해 주세요.",
        placeholder: "예: 오늘 중2 서연이가 지난달 모의고사 40점 받아서 울던 아이인데, 오늘 88점 맞았다고 시험지 들고 원장실로 뛰어들어왔어요.",
      },
      {
        title: "2단계: 고객/학생이 겪던 진짜 고민",
        guide: "Story & Pain Point (공감대 형성)",
        question: "그 학생이 처음 우리 학원(공부방)에 왔을 때 가장 힘들어하거나 막혀했던 부분은 무엇이었나요?",
        placeholder: "예: 개념 이해도 안 된 상태에서 대형 학원 진도만 따라가다 보니 '난 수포자다' 하고 아예 손을 놓아버린 상태였어요.",
      },
      {
        title: "3단계: 우리 학원만의 해결책 & 노하우",
        guide: "Offer & Solution (상담 문의 유도)",
        question: "원장님께서 그 아이를 위해 특별히 신경 써주신 지도 방법이나 노하우는 무엇이었나요?",
        placeholder: "예: 진도를 멈추고 지난 3주 동안 1:1 역질문 피드백으로 막힌 개념을 뚫어줬더니, 스스로 오답노트를 정리하기 시작하더라고요.",
      },
    ],
  },
  local_store: {
    name: "로컬 매장 (식당/카페/샵)",
    questions: [
      {
        title: "1단계: 단골손님 & 찐리뷰 에피소드",
        guide: "Hook (호기심 유발)",
        question: "사장님! 오늘 다녀가신 손님 중에 가장 기억에 남거나 기분 좋은 칭찬을 해주신 분이 있었나요?",
        placeholder: "예: 오늘 점심에 멀리 판교에서 부모님 모시고 온 30대 단골손님이 '부모님이 평생 먹은 고기 중 제일 부드럽다고 하셨다'며 악수를 청하셨어요.",
      },
      {
        title: "2단계: 손님이 기대했던 점 & 고민",
        guide: "Story & Pain Point (공감대 형성)",
        question: "그 손님이 처음에 무엇을 기대하고 오셨거나, 어떤 고민(메뉴 선택, 맛 등)을 가지고 계셨나요?",
        placeholder: "예: 부모님 치아가 약하셔서 질긴 고기를 전혀 못 드시는데, 잡내 없이 부드러운 숙성 고기 맛집을 찾느라 며칠 고민하셨대요.",
      },
      {
        title: "3단계: 타협하지 않는 사장님의 비결",
        guide: "Offer & Solution (방문 욕구 자극)",
        question: "사장님이 추천해 드린 메뉴나 준비 과정 중 어떤 포인트에 손님이 가장 만족하셨나요?",
        placeholder: "예: 저희가 매일 새벽 직접 선별해서 336시간 교차 숙성한 특수부위를 내어드렸는데, 입에서 살살 녹는다고 정말 감탄하셨습니다.",
      },
    ],
  },
  ecommerce: {
    name: "스마트스토어 / 쇼핑몰",
    questions: [
      {
        title: "1단계: 고객의 첫 반응과 문의",
        guide: "Hook (호기심 유발)",
        question: "최근 고객 문의나 구매 후기 중 가장 인상 깊었던 피드백은 무엇이었나요?",
        placeholder: "예: '다른 브랜드 제품 3개 써보고 다 버렸는데 이 제품 쓰고 목 통증이 사라졌어요'라는 장문의 포토리뷰가 달렸어요.",
      },
      {
        title: "2단계: 기존 시중 제품들의 문제점",
        guide: "Pain Point (기존 제품의 결핍)",
        question: "기존에 시중에 팔리던 일반 제품들은 왜 고객의 그 문제를 해결해주지 못했을까요?",
        placeholder: "예: 시중 베개들은 대부분 모양만 인체공학적이지, 실제 목 C커브 높이 조절이 불가능해서 자고 나면 담이 걸리기 일쑤였거든요.",
      },
      {
        title: "3단계: 우리 제품만의 압도적 차별점",
        guide: "Offer (구매 전환 유도)",
        question: "대표님께서 이 제품을 개발/소싱할 때 가장 집착했던 핵심 디테일은 무엇인가요?",
        placeholder: "예: 6개월 동안 40번 샘플링을 거쳐 마이크로 에어폼 밀도를 조절했고, 체형별 높낮이 조절 패드를 기본 구성에 포함시켰습니다.",
      },
    ],
  },
};

interface VoiceInterviewWizardProps {
  onGenerate: (answers: { a1: string; a2: string; a3: string }, category: string, theme: string) => void;
  isGenerating: boolean;
}

export default function VoiceInterviewWizard({ onGenerate, isGenerating }: VoiceInterviewWizardProps) {
  const [category, setCategory] = useState<string>("academy");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<{ a1: string; a2: string; a3: string }>({
    a1: "",
    a2: "",
    a3: "",
  });

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [sttError, setSttError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const template = TEMPLATES[category] || TEMPLATES.academy;
  const questions = template.questions;
  const currentQ = questions[currentStep];

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      setSttError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

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
      console.error("Mic permission or recorder error:", err);
      setSttError("마이크 권한을 허용해주세요. 권한이 없을 경우 아래 텍스트창에 직접 적으실 수도 있습니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setSttError(null);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob);

      const res = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "음성 변환 실패");
      }

      const text = data.text || "";
      if (text.trim()) {
        const stepKey = `a${currentStep + 1}` as "a1" | "a2" | "a3";
        setAnswers((prev) => ({
          ...prev,
          [stepKey]: prev[stepKey] ? `${prev[stepKey]} ${text}` : text,
        }));
      }
    } catch (err: any) {
      console.warn("STT server error:", err);
      setSttError("음성 자동 텍스트 변환이 원활하지 않습니다. 아래 입력창에 직접 적어주세요.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTextChange = (text: string) => {
    const stepKey = `a${currentStep + 1}` as "a1" | "a2" | "a3";
    setAnswers((prev) => ({ ...prev, [stepKey]: text }));
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
      setSttError(null);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setSttError(null);
    }
  };

  const canSubmit = Boolean(answers.a1.trim() && answers.a2.trim() && answers.a3.trim());

  return (
    <div className="w-full rounded-2xl border border-obsidian-700 bg-obsidian-900/90 p-5 shadow-2xl backdrop-blur-sm sm:p-7">
      {/* Category Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-obsidian-800 pb-4">
        <div className="flex gap-1.5 rounded-xl bg-obsidian-950 p-1">
          {Object.entries(TEMPLATES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => {
                setCategory(key);
                setCurrentStep(0);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                category === key
                  ? "bg-emerald-brand text-obsidian-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className={`h-2 w-8 rounded-full transition-all ${
                idx === currentStep
                  ? "bg-emerald-brand"
                  : answers[`a${idx + 1}` as "a1" | "a2" | "a3"]
                  ? "bg-emerald-brand/40"
                  : "bg-obsidian-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-xl border border-obsidian-800 bg-obsidian-950 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center rounded-md bg-emerald-brand/10 px-2.5 py-1 text-xs font-bold text-emerald-brand">
            {currentQ.guide}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            질문 {currentStep + 1} / 3
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Voice Recording / Input Zone */}
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-obsidian-700 bg-obsidian-900/40 p-4 sm:p-6">
          {isRecording ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 animate-ping" />
              <button
                onClick={stopRecording}
                className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600 active:scale-95"
              >
                <Square className="h-6 w-6 fill-current" />
              </button>
              <div className="mt-2 text-sm font-bold text-red-400">
                녹음 중... {recordSeconds}s / 45s (탭하여 정지)
              </div>
              <p className="text-xs text-slate-400">편안하게 말씀해 주시면 AI가 받아적습니다.</p>
            </div>
          ) : isTranscribing ? (
            <div className="flex flex-col items-center gap-2 py-4 text-emerald-brand">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <span className="text-xs font-semibold">말씀하신 내용을 텍스트로 정리하는 중...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={startRecording}
                className="group flex h-16 w-16 items-center justify-center rounded-full bg-emerald-brand text-obsidian-950 shadow-xl shadow-emerald-brand/20 transition hover:bg-emerald-hover active:scale-95"
              >
                <Mic className="h-7 w-7 transition group-hover:scale-110" />
              </button>
              <div className="text-center">
                <span className="text-sm font-bold text-white">마이크 누르고 말하기 (최대 45초)</span>
                <p className="text-xs text-slate-400 mt-0.5">또는 아래 텍스트창에 직접 적어주셔도 됩니다.</p>
              </div>
            </div>
          )}

          {sttError && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 p-2.5 text-xs text-amber-brand">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{sttError}</span>
            </div>
          )}
        </div>

        {/* Textarea for Answers */}
        <div className="mt-4">
          <textarea
            value={answers[`a${currentStep + 1}` as "a1" | "a2" | "a3"]}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={currentQ.placeholder}
            rows={3}
            className="w-full rounded-xl border border-obsidian-700 bg-obsidian-900 p-3.5 text-sm text-white placeholder-slate-500 focus:border-emerald-brand focus:outline-none focus:ring-1 focus:ring-emerald-brand leading-relaxed"
          />
        </div>
      </div>

      {/* Navigation & Submit Bar */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-1 rounded-xl border border-obsidian-700 bg-obsidian-950 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-obsidian-800 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>이전 질문</span>
        </button>

        {currentStep < 2 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-1 rounded-xl bg-obsidian-800 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-obsidian-700"
          >
            <span>다음 질문</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => onGenerate(answers, template.name, currentQ.title)}
            disabled={!canSubmit || isGenerating}
            className="flex items-center gap-2 rounded-xl bg-emerald-brand px-6 py-2.5 text-xs font-bold text-obsidian-950 shadow-lg shadow-emerald-brand/25 transition hover:bg-emerald-hover disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>3대 채널 원고 동시 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>원클릭 마케팅 원고 생성하기</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
