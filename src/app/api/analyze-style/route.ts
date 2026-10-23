import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sampleText } = await req.json();

    if (!sampleText || typeof sampleText !== "string" || sampleText.trim().length < 20) {
      return NextResponse.json(
        { error: "최소 20자 이상의 기존 작성 글을 입력해주세요." },
        { status: 400 }
      );
    }

    const freellmUrl = process.env.FREELLMAPI_BASE_URL || "http://localhost:3001/v1";
    const freellmKey = process.env.FREELLMAPI_API_KEY || "";
    const model = process.env.FREELLMAPI_MODEL || "gemini-3.8-flash";

    const prompt = `
다음은 한 매장 사장님(원장님)이 직접 작성한 과거 마케팅 글입니다.
이 글을 정밀 분석하여 사장님 고유의 문체(Style) 특징을 JSON 형식으로 추출해주세요.

[사장님의 과거 작성 글]
${sampleText}

[출력 형식 가이드]
반드시 아래 키를 가진 순수 JSON만 출력하세요:
{
  "tone": "글의 전반적인 분위기와 어조 (예: 친근하고 전문적인 원장님 말투, 털털하고 자신감 넘치는 사장님 어조 등)",
  "sentence_ending": "자주 쓰는 종결 어미 패턴 (예: ~해요, ~했답니다, ~하더라고요 등)",
  "formatting": "줄바꿈, 문단 길이, 여백 스타일",
  "emoji_style": "이모지 사용 빈도 및 선호하는 이모지",
  "forbidden_words": ["사투리나 어색한 단어, 또는 지양해야 할 상투적인 표현 4~5개"]
}
`;

    let content = "";

    // 1. Try local FreeLLMAPI first
    try {
      const response = await fetch(`${freellmUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${freellmKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "당신은 문체 복제(Style Cloning) 전문 언어학자이자 카피라이터입니다. 반드시 지정된 JSON 포맷으로만 응답하세요.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        content = data.choices?.[0]?.message?.content || "";
      }
    } catch (e) {
      console.warn("Local FreeLLMAPI unavailable for analyze-style, attempting fallback...");
    }

    // 2. Production Fallback to Gemini API
    if (!content && process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: "당신은 문체 복제 전문 카피라이터입니다. 반드시 지정된 JSON 포맷으로만 응답하세요." }] },
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (geminiErr) {
        console.error("Gemini Fallback failed for analyze-style:", geminiErr);
      }
    }

    // Parse JSON
    let parsedJson;
    try {
      const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedJson = JSON.parse(cleaned);
    } catch {
      parsedJson = {
        tone: "친근하고 신뢰감을 주는 전문적인 어조",
        sentence_ending: "~해요, ~했답니다 혼용",
        formatting: "2~3문장마다 줄바꿈",
        emoji_style: "핵심 강조용 이모지 적절히 활용",
        forbidden_words: ["안녕하세요 오늘은", "알아보겠습니다", "많은 관심 부탁드립니다", "결론적으로"],
      };
    }

    return NextResponse.json({ success: true, styleGuide: parsedJson });
  } catch (error: any) {
    console.error("Analyze style error:", error);
    return NextResponse.json(
      { error: error?.message || "문체 분석에 실패했습니다." },
      { status: 500 }
    );
  }
}
