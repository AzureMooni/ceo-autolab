import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json(
        { error: "음성 파일이 누락되었습니다." },
        { status: 400 }
      );
    }

    const freellmUrl = process.env.FREELLMAPI_BASE_URL || "http://localhost:3001/v1";
    const freellmKey = process.env.FREELLMAPI_API_KEY || "";
    const openAiKey = process.env.OPENAI_API_KEY || "";

    // 1. Try local FreeLLMAPI first (only if running locally or remote URL specified)
    const isLocalServer = freellmUrl.includes("localhost") || freellmUrl.includes("127.0.0.1");
    if (!process.env.VERCEL || !isLocalServer) {
      try {
        const sttFormData = new FormData();
        sttFormData.append("file", file, "recording.webm");
        sttFormData.append("model", "whisper-1");

        const response = await fetch(`${freellmUrl}/audio/transcriptions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${freellmKey}`,
          },
          body: sttFormData,
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({ text: data.text || "" });
        }
      } catch (freellmErr) {
        console.warn("FreeLLMAPI STT failed, proceeding to Gemini fallback...", freellmErr);
      }
    }

    // 2. Try Gemini Audio Transcription with Multi-Model Redundancy (Cloud-Native & Free)
    if (process.env.GEMINI_API_KEY) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Audio = buffer.toString("base64");
        const mimeType = file.type || "audio/webm";

        const cloudModels = [
          "gemini-flash-latest",
          "gemini-3.5-flash",
          "gemini-3.5-flash-lite",
          "gemini-3.8-flash",
        ];

        for (const m of cloudModels) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${process.env.GEMINI_API_KEY}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        {
                          inlineData: {
                            mimeType,
                            data: base64Audio,
                          },
                        },
                        {
                          text: "다음 음성을 듣고 한국어로 정확하게 받아써주세요. 어떠한 부가 설명이나 인사말 없이 오직 들린 음성 내용 텍스트만 출력하세요.",
                        },
                      ],
                    },
                  ],
                }),
                signal: AbortSignal.timeout(20000),
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
              if (text) {
                return NextResponse.json({ text, provider: `${m}-cloud` });
              }
            }
          } catch (mErr) {
            console.warn(`Gemini [${m}] STT failed, trying next:`, mErr);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini STT failed, trying next fallback:", geminiErr);
      }
    }

    // 3. Try OpenAI Whisper fallback if API key is provided
    if (openAiKey) {
      try {
        const sttFormData = new FormData();
        sttFormData.append("file", file, "recording.webm");
        sttFormData.append("model", "whisper-1");
        sttFormData.append("language", "ko");

        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openAiKey}`,
          },
          body: sttFormData,
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({ text: data.text || "" });
        }
      } catch (openAiErr) {
        console.error("OpenAI Whisper STT failed:", openAiErr);
      }
    }

    // If both upstream STT are unavailable, inform client
    return NextResponse.json(
      {
        error: "음성 변환(STT) 서버 연결에 실패했습니다. 직접 텍스트로 입력하시거나 잠시 후 다시 시도해주세요.",
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("STT Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "음성 변환 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
