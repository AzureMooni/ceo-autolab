-- ==============================================================================
-- 사장님 자동화 연구소 (Voice-to-Publish SaaS)
-- Supabase 데이터베이스 스키마 & 킬러 인터뷰 시드 데이터
-- ==============================================================================

-- 1. UUID 확장 활성화
create extension if not exists "uuid-ossp";

-- 2. 유저 프로필 및 매장 문체(Style Cloning) 테이블
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  business_name text not null default '우리 매장',
  category text not null default 'academy', -- 'academy'(학원/공부방), 'local_store'(식당/카페/샵), 'ecommerce'(스마트스토어)
  target_audience text default '지역 학부모님 및 학생',
  style_guide jsonb default '{
    "tone": "친근하고 전문적인 원장님 말투 (~해요, ~했답니다 혼용)",
    "formatting": "모바일 가독성을 위해 2~3문장마다 줄바꿈 필수",
    "forbidden_words": ["안녕하세요 오늘은", "알아보겠습니다", "많은 관심 부탁드립니다", "결론적으로"]
  }'::jsonb,
  credits_remaining int default 3, -- 무료 체험 3회 기본 제공
  pass_expires_at timestamp with time zone, -- 기간권 만료일 (단건 결제용)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 업종별 3문 3답 인터뷰 템플릿 테이블 (핵심 해자 DB)
create table if not exists public.interview_templates (
  id uuid default uuid_generate_v4() primary key,
  category text not null,
  theme_title text not null,
  q1_situation text not null, -- 1단계: 오늘 있었던 상황/에피소드 (Hook)
  q2_pain_point text not null, -- 2단계: 고객/학생이 겪던 고민 (Story/Empathy)
  q3_solution text not null, -- 3단계: 우리 매장만의 해결책 및 결과 (Offer)
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. 생성된 원고 히스토리 테이블
create table if not exists public.generated_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade,
  template_id uuid references public.interview_templates(id),
  raw_transcript jsonb not null, -- {"a1": "...", "a2": "...", "a3": "..."}
  naver_blog_title text,
  naver_blog_html text, -- 인라인 CSS가 적용된 스마트에디터 전용 HTML
  threads_text text, -- 500자 이내 스레드 단문
  insta_caption text, -- 인스타 캡션 및 해시태그
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. 초기 킬러 질문 시드 데이터 삽입 (학원/공부방 & 로컬 매장)
insert into public.interview_templates (category, theme_title, q1_situation, q2_pain_point, q3_solution)
values
(
  'academy',
  '성적 향상/변화 사례',
  '원장님! 최근 수업 중에 눈에 띄게 실력이 늘었거나 태도가 좋아진 학생이 있었나요? 어떤 일이 있었는지 편하게 말씀해 주세요.',
  '그 학생이 처음 우리 학원(공부방)에 왔을 때 가장 힘들어하거나 막혀했던 부분은 무엇이었나요?',
  '원장님께서 그 아이를 위해 특별히 신경 써주신 지도 방법이나 노하우는 무엇이었나요?'
),
(
  'academy',
  '학부모 단골 상담 질문',
  '요즘 상담 오시는 학부모님들이나 전화 문의에서 가장 많이 물어보시는 질문이나 걱정거리는 무엇인가요?',
  '보통 집에서 혼자 공부하거나 다른 학원에 다닐 때 왜 그 문제가 잘 해결되지 않는 걸까요?',
  '그 고민에 대해 원장님은 어떻게 명쾌하게 해답을 주셨나요? 우리 학원만의 시스템 자랑을 살짝 섞어주세요!'
),
(
  'local_store',
  '단골손님/찐리뷰 에피소드',
  '사장님! 오늘 다녀가신 손님 중에 가장 기억에 남거나 기분 좋은 칭찬을 해주신 분이 있었나요?',
  '그 손님이 처음에 무엇을 기대하고 오셨거나, 어떤 고민(메뉴 선택, 니즈 등)을 가지고 계셨나요?',
  '사장님이 추천해 드린 메뉴나 서비스의 어떤 포인트에 손님이 가장 만족하셨나요?'
),
(
  'local_store',
  '사장님의 재료/준비 철학',
  '사장님! 오늘 매장 오픈 준비를 하시면서 특별히 신선하게 챙겼거나 타협하지 않고 고집한 재료/포인트가 있나요?',
  '많은 다른 매장들은 원가 절감이나 편의를 위해 보통 이 부분을 어떻게 대충 넘어가나요?',
  '그럼에도 불구하고 사장님이 굳이 이 수고로운 방식을 고집하시는 진짜 이유는 무엇인가요?'
);
