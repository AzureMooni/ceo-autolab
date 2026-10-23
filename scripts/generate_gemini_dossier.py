import os

base_dir = "/Users/moon/Documents/ceo_autolab"
output_path = os.path.join(base_dir, "CEO_AUTOLAB_GEMINI_DOSSIER.md")

files_to_bundle = [
    ("src/app/page.tsx", "typescript"),
    ("src/app/layout.tsx", "typescript"),
    ("src/app/api/generate/route.ts", "typescript"),
    ("src/app/api/publish/route.ts", "typescript"),
    ("src/app/api/stt/route.ts", "typescript"),
    ("src/app/api/analyze-style/route.ts", "typescript"),
    ("src/utils/copyRichText.ts", "typescript"),
    ("src/components/StyleCloningModal.tsx", "typescript"),
    ("src/components/SocialProofSection.tsx", "typescript"),
    ("src/components/FaqSection.tsx", "typescript"),
    ("supabase/schema.sql", "sql"),
    ("package.json", "json"),
]

content = []
content.append("# 🏛️ 사장님 자동화 연구소 (CEO Auto Lab) 전체 시스템 & 코드 & 상품 분석 종합 보고서\n")
content.append("> **서비스 공식 도메인**: [https://ceoautolab.com](https://ceoautolab.com) | [https://www.ceoautolab.com](https://www.ceoautolab.com)\n")
content.append("> **목적**: Google Gemini 모델에게 서비스의 비즈니스 모델, 상품 구성, UX/UI, 백엔드 아키텍처 및 소스 코드를 종합 전달하여 심층 피드백 및 발전 방향을 자문받기 위한 마스터 패키지 파일입니다.\n\n")

content.append("""---

## 📋 [제미나이(Gemini) 맞춤 피드백 요청 프롬프트]
> 아래 프롬프트와 함께 본 마크다운 파일 전체를 제미나이(Gemini 1.5 Pro / Ultra / Advanced)에게 그대로 전달하시면 전문적인 비즈니스·개발·마케팅 피드백을 받으실 수 있습니다.

```text
당신은 대한민국 최고의 B2B SaaS 프로덕트 리드(CPO), 풀스택 소프트웨어 아키텍트, 그리고 소상공인 마케팅 최고 전문가입니다.
지금부터 제공되는 [사장님 자동화 연구소 (CEO Auto Lab)]의 전체 서비스 기획, 비즈니스 모델, 상품 구성, UX/UI 흐름, 그리고 실제 구동되는 프로덕션 전체 소스 코드를 정밀하게 검토하고 아래 5가지 관점에서 냉철하고 실행 가능한 심층 피드백을 제공해 주십시오.

[집중 분석 및 피드백 요청 항목]
1. 제품 시장 적합성(PMF) 및 가치 제안(Value Proposition) 평가:
   - 기존의 '월 80~100만 원짜리 블로그 대행사'나 '단순 챗GPT 래퍼' 대비, 본 서비스가 갖는 차별적 해자(30초 원클릭 구술, 사장님 문체 복제, 네이버 스마트에디터 인라인 CSS 및 3단 사진 마커 자동 삽입)의 시장 경쟁력은 어떠한가?
   - 학원장, 로컬 식당, 쇼핑몰 대표 등 타깃 고객군에게 실제로 어필할 수 있는 소구점과 보완해야 할 점은 무엇인가?

2. UX/UI 및 전환율(CRO) 마찰 제로화 분석:
   - 스크롤을 완전히 배제한 100vh Linear/OpenAI Voice 감성의 단일 다크 스튜디오 구조(오디오 파형 시각화 ➔ 손 떼면 원클릭 연쇄 실행 ➔ 라이브 영수증 UI)가 소상공인의 사용 허들을 얼마나 낮추었는가?
   - IT 기기에 익숙하지 않은 중장년층 사장님들에게 발생할 수 있는 잠재적 마찰(Friction)과 이를 극복할 UI 개선안은?

3. 수익화 모델 & 상품(Pricing Tier) 최적화 전략:
   - 무료 체험 3회 ➔ 베이직(월 2.9만 원) ➔ 프로(월 5.9만 원) ➔ B2B 프랜차이즈/협회 패키지의 가격 책정이 적절한가?
   - 소상공인의 결제 장벽을 깨부수고 월간 구독 유지율(Retention)을 90% 이상으로 유지하기 위한 킬러 업셀링(Upselling) 아이디어는?

4. 기술 아키텍처 & 0원 인프라(Zero-Cost) 안정성 검토:
   - Next.js 14 App Router + Vercel Serverless Edge + Google Gemini 다중 모델 자동 장애 복구(Failover) 풀(gemini-flash-latest ➔ gemini-3.5-flash ➔ gemini-flash-lite-latest ➔ gemini-3.8-flash)의 기술적 완성도와 신뢰성은 어떠한가?
   - 네이버 블로그 클립보드 서식 복사(copyHtmlToClipboard)와 스레드/인스타 자동 발행 파이프라인의 견고함과 예외 처리 수준은?

5. 바이럴 퍼널 & 비즈니스PT OSMU 확산 공식:
   - 3단계 퍼널(플링 80% 무링크 정보 유입 ➔ 키 20% 비교 전환 ➔ 랜딩) 및 OSMU(One-Source Multi-Use) 확산 공식이 프로덕트에 유기적으로 녹아들어 있는가?
   - 사용자가 원고를 발행할 때마다 서비스가 자생적으로 바이럴될 수 있는 그로스 루프(Growth Loop) 추천 방안은?
```

---

## 1. 🏢 비즈니스 및 프로덕트 개요 (Business & Product Overview)

### 1.1 서비스 미션 & 핵심 정체성
- **서비스명**: 사장님 자동화 연구소 (CEO Auto Lab)
- **도메인**: `https://ceoautolab.com` / `https://www.ceoautolab.com`
- **핵심 슬로건**: "타이핑 0글자, 30초 말하고 손 떼면 끝나는 올인원 마케팅"
- **정체성**: 키보드 칠 시간도 없이 바쁜 대한민국 소상공인·자영업자·원장님을 위한 **'음성 구술 기반 원클릭 3대 채널 마케팅 자동 발행 SaaS'**.

### 1.2 소상공인이 겪는 3대 치명적 고통 (Pain Points)
1. **외주 대행사의 횡포 & 낭비**:
   - 월 80~100만 원씩 주는데 인터넷 지식인 글을 복사 붙여넣기한 영혼 없는 홍보글만 올라와 고객 문의가 0건.
2. **타이핑 피로도 & 시간 부족**:
   - 종일 학생 지도나 주방 조리, 손님 응대로 녹초가 되어 퇴근 후 블로그 글 하나 쓰려면 2시간씩 걸림.
3. **네이버 블로그 서식 깨짐 & AI 저품질 공포**:
   - 챗GPT로 뽑은 글을 복사하면 서식이 다 깨지고, 기계적인 말투("안녕하세요! 오늘은 ~에 대해 알아보겠습니다")로 인해 네이버 알고리즘에서 어뷰징/저품질로 누락됨.

### 1.3 사장님 자동화 연구소의 4대 핵심 해결책 (The Solutions)
1. **마찰 제로 100vh 다크 스튜디오 (Zero-Friction UX)**:
   - 복잡한 메뉴, 홍보 랜딩, 단계별 이전/다음 이동 버튼을 전부 없애고, 화면 중앙의 초대형 에메랄드 오브(Orb) 마이크 버튼 하나로 인터랙션 단일화.
2. **원클릭 연쇄 실행 엔진 (The Chain)**:
   - 버튼을 누르고 30초 말한 뒤 손을 떼는 순간, 유저의 추가 조작 없이 [음성 텍스트 변환 ➔ 3대 원고 생성 ➔ 네이버 스마트에디터 서식 클립보드 자동 복사 ➔ 스레드/인스타 자동 발행]까지 논스톱 자동 완결.
3. **사장님 문체 복제 기술 (Style Cloning)**:
   - 사장님이 과거에 썼던 일기나 문자 1편만 붙여넣으면, AI가 사장님의 어조, 종결어미(~해요, ~했답니다), 감정선, 금지어를 추출하여 영혼이 깃든 100% 사장님 육성체로 원고를 작성.
4. **네이버 스마트에디터 최적화 인라인 CSS & 3단 사진 마커**:
   - 별도 서식 툴 없이 블로그 글쓰기 창에 'Ctrl+V'만 누르면 소제목 바, 형광펜 하이라이트, 인용구 박스, 그리고 정성스러운 사진 위치 가이드 마커 3개가 완벽한 인라인 스타일로 자동 꽂힘.

---

## 2. 💎 상품 구성 및 수익화 모델 (Monetization & Products)

| 상품 / 플랜 | 가격 (VAT 포함) | 주요 혜택 및 기능 | 타깃 고객 |
| :--- | :--- | :--- | :--- |
| **무료 체험 (Free Starter)** | **0원** (가입 즉시) | • 3회 무료 원고 생성 크레딧<br>• 3대 채널 동시 생성 및 인라인 HTML 서식 제공<br>• 오디오 파형 비주얼라이저 지원 | 신규 가입자 전원 |
| **베이직 플랜 (Basic)** | **월 29,000원** | • 주 3회(월 12회) 정기 발행 큐<br>• 사장님 문체 복제(Style Cloning) 기본 적용<br>• 네이버 블로그 서식 자동 복사<br>• 스레드/인스타 연동 지원 | 1인 샵, 공부방, 개인 카페 |
| **프로 무제한 (Pro Unlimited)** | **월 59,000원** | • **매일 365일 무제한 생성 & 즉시 발행**<br>• 고급 문체 정밀 복제 엔진 가동<br>• 원클릭 다채널 예약 발행 스케줄러<br>• 2시간 이내 1:1 VIP 고객지원 응대 | 대형 학원, 맛집 식당, 이커머스 |
| **B2B / 프랜차이즈 본사 패키지** | **월 50만 ~ 150만 원** | • 본사용 마케팅 관제 대시보드<br>• 전국 50~100개 가맹점 계정 일괄 관리<br>• 본사 프로모션 원고 가맹점 블로그/SNS 일괄 동시 배포 API | 프랜차이즈 가맹본부, 협회, 대형 에이전시 |

### 2.1 단위 경제학 (Unit Economics) & 0원 인프라 해자
- **서버리스 인프라**: Vercel Seoul Edge Serverless + Cloudflare DNS
- **AI 추론 비용**: Google Gemini Cloud Free Tier Multi-Model Failover (`gemini-flash-latest`, `gemini-3.5-flash`, `gemini-flash-lite-latest`, `gemini-3.8-flash`) 활용으로 **AI 토큰 원가 = 0원**.
- **영업이익률**: 결제 PG사 수수료(약 3.3%)를 제외한 **순 마진율 96% 이상**의 극단적 고수익 구조.

---

## 3. 🎨 UX/UI 및 프론트엔드 아키텍처

- **스크롤 없는 100vh 스튜디오**: `h-screen overflow-hidden bg-[#07090E]`로 불필요한 시선 분산을 막고 몰입감 극대화.
- **앰비언트 라이트 (Ambient Glow)**: 화면 중앙 뒤편 `bg-emerald-500/10 blur-[140px]`로 하이엔드 테크 감성 연출.
- **실시간 사운드웨이브 (Web Audio API)**: 마이크 입력 시 `AnalyserNode`의 주파수 데이터를 12개 에메랄드 이퀄라이저 바에 바인딩하여 사장님의 목소리에 역동적으로 반응.
- **클립보드 리치 텍스트 서식 복사 (`copyHtmlToClipboard`)**: `ClipboardItem` API를 사용하여 네이버 스마트에디터에 인라인 스타일 태그가 100% 온전하게 주입되도록 보장하며, 카카오톡 인앱 브라우저를 위한 `document.execCommand` Fallback 완비.
- **완료 영수증 UI**: 소요 시간(예: 8.4초), 스레드 업로드 완료, 블로그 서식 자동 복사 완료 메시지와 함께 [블로그에 붙여넣으러 가기] 단일 버튼만 노출하여 인지 과부하 제거.

---

## 4. ⚙️ 백엔드 및 클라우드 아키텍처

- **배포 인프라**: Vercel Seoul Edge (`icn1`), Node.js Serverless runtime (`export const maxDuration = 60;`)
- **다중 모델 자동 장애 복구 풀 (Multi-Model Failover Pool)**:
  - 1순위: `gemini-flash-latest` (최신 고속)
  - 2순위: `gemini-3.5-flash`
  - 3순위: `gemini-flash-lite-latest` (안정성 및 경량)
  - 4순위: `gemini-3.8-flash` (최신 고성능)
  - 일시적 서버 과부하(503 High Demand) 또는 호출 제한(429) 감지 시 1초 내에 차순위 모델로 자동 스위칭하여 99.99% 가동 보장.
- **로컬 독립성**: `process.env.VERCEL` 감지 시 로컬 주소(localhost) 호출을 완전 바이패스하여 0.001초 지연도 없이 클라우드 다이렉트 처리.

---

## 5. 💻 핵심 프로덕션 소스 코드 전체 (Complete Source Code)
\n""")

for rel_path, lang in files_to_bundle:
    full_path = os.path.join(base_dir, rel_path)
    if os.path.exists(full_path):
        with open(full_path, "r", encoding="utf-8") as f:
            code_str = f.read()
        content.append(f"### 📄 `{rel_path}`\n\n```{lang}\n{code_str}\n```\n\n---\n\n")

with open(output_path, "w", encoding="utf-8") as f:
    f.write("".join(content))

print(f"Successfully created {output_path} with size {os.path.getsize(output_path)} bytes.")
