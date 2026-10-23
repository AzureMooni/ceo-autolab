import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
당신은 대한민국 상위 0.1% 로컬 비즈니스 마케터이자 카피라이터입니다.
사장님이 바쁜 와중에 음성으로 대답한 [3문 3답 인터뷰 내용]을 바탕으로, 잠재 고객이 읽자마자 매장에 문의하거나 방문하고 싶어지는 설득력 있는 마케팅 원고를 작성합니다.

[핵심 작성 원칙]
1. 백지 상태에서 지어낸 거짓말이나 과장 없이, 사장님이 언급한 3문 3답의 팩트와 생생한 현장 디테일을 100% 녹여내십시오.
2. 기계적인 AI 말투("안녕하세요! 오늘은 ~에 대해 알아보겠습니다", "많은 관심 부탁드립니다", "결론적으로")는 절대 사용하지 마십시오.
3. 사장님의 전문성과 진정성이 느껴지면서도, 고객의 결핍(Pain Point)을 정확히 건드려 자연스러운 방문/문의로 연결하십시오.

[채널별 가이드라인]

1. 네이버 블로그 (naver_blog_title & naver_blog_html):
- naver_blog_title: 검색 노출과 클릭률을 동시에 잡는 후킹한 제목 (예: "30점 맞던 중학생이 3달 만에 전교 5등 된 진짜 이유", "새벽 5시에 가락시장 뛰어가며 깨달은 1가지").
- naver_blog_html: 네이버 스마트에디터에 붙여넣었을 때 서식이 깨지지 않도록 **오직 인라인 CSS(style="...")만 사용한 HTML 태그**로 작성하십시오.
  * 소제목: <h3 style="font-size: 20px; font-weight: bold; color: #111827; margin: 32px 0 16px 0; border-left: 4px solid #10B981; padding-left: 12px;">소제목</h3>
  * 본문 문단: <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 20px;">2~3문장 단위로 줄바꿈된 본문</p>
  * 핵심 강조(형광펜): <mark style="background-color: #FEF08A; padding: 2px 6px; border-radius: 4px; font-weight: 600;">강조 문장</mark>
  * 인용구 박스: <blockquote style="background-color: #F3F4F6; border-radius: 8px; padding: 16px 20px; margin: 24px 0; color: #4B5563; font-style: normal; border: 1px solid #E5E7EB;">인터뷰 에피소드 인용</blockquote>
  * 사진 위치 가이드 마커: 본문 흐름에 맞게 3곳에 아래 HTML 마커를 배치하십시오.
    <div style="background-color: #ECFDF5; border: 2px dashed #10B981; border-radius: 8px; padding: 14px; text-align: center; margin: 24px 0; color: #047857; font-weight: bold; font-size: 14px;">[📸 여기에 1번 사진을 넣어주세요]</div>
    <div style="background-color: #ECFDF5; border: 2px dashed #10B981; border-radius: 8px; padding: 14px; text-align: center; margin: 24px 0; color: #047857; font-weight: bold; font-size: 14px;">[📸 여기에 2번 사진을 넣어주세요]</div>
    <div style="background-color: #ECFDF5; border: 2px dashed #10B981; border-radius: 8px; padding: 14px; text-align: center; margin: 24px 0; color: #047857; font-weight: bold; font-size: 14px;">[📸 여기에 3번 사진을 넣어주세요]</div>

2. 스레드 (threads_text):
- 스레드에서 폭발적인 반응을 얻는 '현업 사장님의 솔직한 독백/인사이트' 어조로 작성하십시오.
- 첫 줄에 강력한 후킹 문장을 배치하고, 줄바꿈을 활용해 400자 이내로 압축하십시오.
- 알고리즘 노출을 위해 해시태그는 절대 달지 마십시오.

3. 인스타그램 (insta_caption):
- 릴스 대본 및 피드 캡션 겸용으로 첫 3줄 안에 핵심 메시지를 전달하십시오.
- 하단에 검색 유입을 위한 지역명+업종 키워드 해시태그 10개를 포함하십시오.

[응답 포맷 가이드]
반드시 다음 JSON 스키마 규격으로만 응답해야 합니다:
{
  "naver_blog_title": "string",
  "naver_blog_html": "string",
  "threads_text": "string",
  "insta_caption": "string"
}
`;

export async function POST(req: NextRequest) {
  try {
    const { businessName, category, themeTitle, answers, speechText, styleGuide } = await req.json();

    const textToProcess = speechText || (answers ? `${answers.a1 || ""} ${answers.a2 || ""} ${answers.a3 || ""}`.trim() : "");

    if (!textToProcess) {
      return NextResponse.json(
        { error: "음성 녹음 내용 또는 3문 3답 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const freellmUrl = process.env.FREELLMAPI_BASE_URL || "http://localhost:3001/v1";
    const freellmKey = process.env.FREELLMAPI_API_KEY || "";
    const model = process.env.FREELLMAPI_MODEL || "auto";

    const speechSection = speechText
      ? `[사장님의 30초 원클릭 음성 구술 내용]
"${speechText}"

(위 구술 내용 속에서 ① 오늘 있었던 일, ② 손님/학생의 고민과 반응, ③ 우리 매장만의 해결 비법을 스스로 추출하여 비즈니스PT 마케팅 공식으로 승화시켜주세요)`
      : `[사장님의 3문 3답 인터뷰 내용]
- [질문 1: 상황 및 에피소드]: ${answers?.a1 || ""}
- [질문 2: 고객의 고민 및 결핍]: ${answers?.a2 || ""}
- [질문 3: 매장만의 해결책 및 차별화 노하우]: ${answers?.a3 || ""}`;

    const userPrompt = `
[매장 정보]
- 상호명: ${businessName || "우리 매장"}
- 업종/카테고리: ${category || "소상공인 매장"}
- 인터뷰 주제: ${themeTitle || "매장 스토리 및 전문성"}

${speechSection}

[사장님 문체 가이드]
${JSON.stringify(
  styleGuide || {
    tone: "친근하고 전문적인 사장님/원장님 어조",
    sentence_ending: "~해요, ~했답니다 혼용",
    formatting: "2~3문장마다 줄바꿈",
    forbidden_words: ["안녕하세요 오늘은", "알아보겠습니다", "많은 관심 부탁드립니다", "결론적으로"],
  },
  null,
  2
)}

위 내용을 바탕으로 네이버 블로그 HTML(스마트에디터 인라인 CSS + 사진 배치 마커 3개), 스레드 450자 단문, 인스타그램 캡션을 즉시 작성하여 JSON으로 반환해주세요.
`;

    let rawContent = "";
    let modelUsed = model;

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
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.6,
          response_format: { type: "json_object" },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        rawContent = data.choices?.[0]?.message?.content || "";
        modelUsed = data.model || model;
      }
    } catch (localErr) {
      console.warn("Local FreeLLMAPI unreachable, attempting Gemini fallback...");
    }

    // 2. Production Fallback to Gemini 1.5 Flash (0-cost tier)
    if (!rawContent && process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ parts: [{ text: userPrompt }] }],
              generationConfig: {
                temperature: 0.6,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          modelUsed = "gemini-1.5-flash (Cloud Free Tier)";
        }
      } catch (geminiErr) {
        console.error("Gemini Fallback failed:", geminiErr);
      }
    }

    if (!rawContent) {
      return NextResponse.json(
        { error: "원고 생성 엔진 호출 중 오류가 발생했습니다." },
        { status: 502 }
      );
    }

    let generated;
    try {
      const cleaned = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
      generated = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse JSON response:", parseErr, rawContent);
      return NextResponse.json(
        { error: "AI 응답 형식을 파싱하지 못했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: generated,
      modelUsed: data.model || model,
    });
  } catch (error: any) {
    console.error("Generate Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "원고 생성 처리 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
