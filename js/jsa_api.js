/**
 * JSA API 모듈 (jsa_api.js)
 * SafeGuard Pro v5.4
 *
 * ─────────────────────────────────────────────────────────
 * 현재 모드: 규칙 기반 Fallback 엔진 (LLM 없이 완전 동작)
 *
 * [Streamlit/GitHub 이전 시 변경 사항]
 * 1. JSA_CONFIG.apiMode = 'llm' 으로 변경
 * 2. JSA_CONFIG.apiEndpoint = 'https://your-server.com/api/analyze-jsa' 로 변경
 * 3. Google Drive 저장: JSA_CONFIG.gdriveEndpoint = 'https://your-server.com/api/save-gdrive'
 *
 * [LLM 백엔드 구성 가이드]
 * - POST /api/analyze-jsa
 *   Request : { text: string, cases: AccidentCase[], options: AnalysisOptions }
 *   Response: JsaAnalysisResult (하단 스키마 참조)
 * - 권장 모델: GPT-4o / Claude-3.5-Sonnet (한국어 산업안전 도메인)
 * - 한국어 임베딩: bge-m3 또는 ko-sroberta
 * - Vector DB: pgvector (PostgreSQL) 또는 Chroma
 * ─────────────────────────────────────────────────────────
 */

'use strict';

/* =====================================================
   CONFIG — Streamlit 이전 시 여기만 수정
   ===================================================== */
const JSA_CONFIG = {
  // 'fallback' | 'llm'
  apiMode: 'fallback',

  // LLM 백엔드 엔드포인트 (apiMode='llm' 일 때 사용)
  apiEndpoint: '/api/analyze-jsa',

  // Google Drive 저장 엔드포인트
  gdriveEndpoint: '/api/save-gdrive',

  // 타임아웃 (ms)
  timeout: 60000,

  // 디버그 로그
  debug: false,
};

/* =====================================================
   LLM 시스템 프롬프트 (백엔드 참조용 — 여기에 유지)
   ===================================================== */
const JSA_SYSTEM_PROMPT = `당신은 제철/중공업 분야의 산업안전 전문가입니다.
사용자가 입력한 일일 작업속보를 분석하여 작업별 위험성평가를 수행하세요.

[수행 단계]
1. 텍스트에서 개별 작업 단위를 추출 (작업명, 장소, 인원, 시간, 사용 장비/자재)
   작업 단위 구분이 모호한 경우, 장소·시간·담당팀이 바뀌는 시점을 기준으로 별도 작업으로 분리하세요.
   추출 결과가 1개뿐이면 한 번 더 검토하세요.
2. 각 작업별로 잠재 위험요인(Hazard) 식별
   - 고온, 밀폐공간, 유해가스(CO/H2S 등), 분진, 소음, 고소, 중량물,
     화기, 전기, 회전체, 산소결핍, 위험물, 협착, 추락, 낙하 등
3. 재해사례 DB에서 유사 사고 사례 매칭 (첨부 데이터 활용)
4. 빈도(Likelihood) × 강도(Severity) 기반 위험성 등급 산정
   - 위험성 = 빈도(1~5) × 강도(1~5)
   - 등급: 낮음(1~6) / 보통(7~12) / 높음(13~19) / 매우높음(20~25)
5. 단계별 안전조치 제시 (작업 전/중/후)
6. 관련 법규/지침 인용 (산업안전보건법, KOSHA Guide 등)

[출력 형식 - JSON]
{
  "분석일시": "YYYY-MM-DD HH:mm",
  "총작업수": N,
  "고위험작업수": N,
  "작업목록": [
    {
      "순번": 1,
      "작업명": "...",
      "작업장소": "...",
      "작업인원": N,
      "예상위험요인": ["고온", "화기"],
      "위험성등급": "매우높음",
      "위험성점수": 20,
      "빈도": 4,
      "강도": 5,
      "유사재해사례": [{"사고일자":"...","사고개요":"...","원인":"...","교훈":"..."}],
      "안전조치": {
        "작업전": ["가스농도 측정", "화기작업허가서 발급"],
        "작업중": ["감시자 배치", "소화기 비치"],
        "작업후": ["잔류가스 확인", "정리정돈"]
      },
      "필수보호구": ["방열복", "방독마스크"],
      "관련법규": ["산업안전보건기준에관한규칙 제241조"],
      "권고사항": "..."
    }
  ],
  "종합의견": "..."
}`;

/* =====================================================
   위험 키워드 사전 (규칙기반 엔진)
   ─ 주의: 각 키워드는 실제 텍스트에 명시적으로 등장할 때만 사용됨
   ─ 짧은 주운 단어(노, 산, 열 등)은 오탐지 유발 가능성이 높아 제외
   ===================================================== */
const HAZARD_KEYWORD_MAP = {
  // 고온: 실제 열틉 작업 도구/장소 명시 시만
  '고온': ['고온', '용융', '용탑', '용강', '용선', '슬래그', '출선', '출강', '내화물', '소둥로', '소성로', '전로', '히터', '모르타르', '열풍로'],
  // 화기: 실제 화기작업 명시
  '화기': ['화기', '용접', '산소절단', '아세틸렌', '다르클', '불꽃', 'LPG', '가스절단', '그라인딩', '스파크', '화염'],
  // 밀폐공간: 명확한 밀폐공간 표현
  '밀폐공간': ['밀폐공간', '밀폐', '탱크 내부', '탱크내부', '뱙커', '피트', '사일로', '호퍼 내부', '갱도', '맨홀'],
  // 유해가스: CO를 대문자로, 단돉 '가스' 사용 금지(오탐지 높음)
  '유해가스': ['일산화탄소', 'H2S', '황화수소', '암모니아', '산소결핑', '유해가스', '독성가스', '고로가스', '코크스가스', 'BFG', 'COG', 'LDG', 'CO 농도', 'CO 측정'],
  // 분진: 분진 명시 또는 분진 작업
  '분진': ['분진', '석면', '실리카', '철분', '연마분진', '분쿜', '도금'],
  // 소음: 실제 소음 작업
  '소음': ['소음', '충격음', '압충기', '해머링', '수가작업'],
  // 고소: 명확한 고소 표현 또는 높이 명시
  '고소': ['고소', '사다리', '설치대', '비계', '지붕', '옵상', '가설발판', '상부 작업', '하역 작업', '3m 이상', '4m 이상', '5m 이상', '10m'],
  // 중량물: 크레인 사용 또는 중량물 명시
  '중량물': ['중량물', '인양', '크레인', '지게차', '호이스트', '리프트', '코일', '슈', '빌렛', '블르마지'],
  // 전기: LOTO/전기 명시 시만
  '전기': ['전기 작업', '활선', '전원차단', 'LOTO', '절연 작업', '감전', '누전', '변압기', '전기기계 수리'],
  // 회전체: 실제 회전체 접근
  '회전체': ['회전체', '콘베이어', '롬러', '로우러', '기어', '켬인', '벨트', '압연 롤'],
  // 추락: 릻지 우려 명시
  '추락': ['추락', '낙하', '떨어집', '미끄러집', '추락방지망', '개구부'],
  // 협착: 미주침 명시
  '협착': ['협착', '끼임', '말림', '프레스', '철거 작업'],
  // 화학물질: 화학물질명 명시
  '화학물질': ['유기용제', '도료', '세정제', '냉매', '윤활유', '황산', '염산', '알칼리'],
  // 폭발: 명확한 폭발위험 명시
  '폭발': ['폭발', '인화성', '가연성', '폭발위험', 'BLEVE'],
};

/* ======================================================
   작업유형별 기본 위험요인 매핑
   ─ 작업명에 정확히 해당 키워드가 포함될 때만 적용
   ─ '열풍로', '소결', '전로' 등은 실제 기서/장소명 일치시만
   ─ WORK_TYPE_BASE_HAZARDS는 작업 미지 부분에 추가하지 않음에 주의
   ====================================================== */
const WORK_TYPE_BASE_HAZARDS = {
  // 제체 공정명 (실제 작업 장소명/설비명으로만 한정)
  '열풍로': ['고온', '유해가스', '밀폐공간'],
  '출선쿨': ['고온', '스플래쉬', '고소'],
  '전로 새돈리': ['고온', '화기', '고소'],
  '소결': ['고온', '분진'],
  '호퍼': ['밀폐공간', '추락'],
  '맨홀': ['밀폐공간', '유해가스'],
  '코크오븐': ['고온', '유해가스', '분진'],
  // 작업종류 (실제 작업 타입)
  '용접': ['화기', '유해가스', '분진'],
  '산소절단': ['화기', '분진'],
  '내화물 교체': ['고온', '중량물'],
  '들라올리기': ['수직고소', '중량물'],
  '하역': ['중량물'],               // 하역은 중량물만 (전기 추가 안 함)
  '철거': ['협착', '분진'],
  '정비': ['협착', '회전체'],
  '점검': ['고소'],
  '보수': ['고소', '협착'],
  '청소': ['화학물질'],
  '도장': ['화학물질', '분진'],
  '해체': ['고소', '분진', '협착'],
};

/* 위험성 등급 기준 */
const RISK_GRADE = {
  '매우높음': { min: 20, max: 25, freq: [4, 5], sev: [4, 5], color: '#C62828', bg: 'rgba(198,40,40,0.1)', border: 'rgba(198,40,40,0.3)' },
  '높음':     { min: 13, max: 19, freq: [3, 4], sev: [3, 4], color: '#E65100', bg: 'rgba(230,81,0,0.1)',  border: 'rgba(230,81,0,0.3)' },
  '보통':     { min: 7,  max: 12, freq: [2, 3], sev: [2, 3], color: '#B8860B', bg: 'rgba(249,168,37,0.1)',border: 'rgba(249,168,37,0.3)' },
  '낮음':     { min: 1,  max: 6,  freq: [1, 2], sev: [1, 2], color: '#2E7D32', bg: 'rgba(46,125,50,0.1)', border: 'rgba(46,125,50,0.3)' },
};

/* 위험요인별 빈도/강도 기본값 */
const HAZARD_RISK_SCORES = {
  '고온':      { freq: 4, sev: 5 },
  '화기':      { freq: 3, sev: 5 },
  '밀폐공간':  { freq: 3, sev: 5 },
  '유해가스':  { freq: 3, sev: 5 },
  '폭발':      { freq: 2, sev: 5 },
  '고소':      { freq: 4, sev: 4 },
  '중량물':    { freq: 4, sev: 4 },
  '전기':      { freq: 3, sev: 4 },
  '회전체':    { freq: 4, sev: 3 },
  '협착':      { freq: 4, sev: 3 },
  '추락':      { freq: 3, sev: 4 },
  '화학물질':  { freq: 3, sev: 3 },
  '분진':      { freq: 4, sev: 2 },
  '소음':      { freq: 5, sev: 2 },
};

/* 보호구 매핑 */
const PPE_MAP = {
  '고온':      ['방열복', '방열장갑', '안면보호구'],
  '화기':      ['용접면', '가죽장갑', '방염복', '안전화'],
  '밀폐공간':  ['공기호흡기(SCBA)', '구명줄', '가스검지기'],
  '유해가스':  ['방독마스크', '공기호흡기', '가스검지기'],
  '분진':      ['방진마스크(N95이상)', '보안경'],
  '고소':      ['안전대(전신식)', '안전모', '안전화'],
  '중량물':    ['안전화(S3등급)', '안전장갑', '신호용 조끼'],
  '전기':      ['절연장갑', '절연안전화', '절연방호구'],
  '회전체':    ['안전덮개 확인', '안전장갑(KV)', '작업복(헐렁한 옷 금지)'],
  '협착':      ['안전덮개 확인', 'LOTO(잠금/태그아웃) 장치'],
  '화학물질':  ['화학물질용 장갑', '보안경/안면보호구', '방독마스크'],
  '소음':      ['귀마개/귀덮개(NRR25 이상)'],
};

/* 관련 법규 매핑 */
const LAW_MAP = {
  '화기':      ['산업안전보건기준에 관한 규칙 제241조(화재위험작업)', 'KOSHA GUIDE W-3 화기작업 허가절차'],
  '밀폐공간':  ['산업안전보건기준에 관한 규칙 제618조~제623조(밀폐공간 보건조치)', 'KOSHA GUIDE H-80 밀폐공간 작업 프로그램'],
  '유해가스':  ['산업안전보건기준에 관한 규칙 제618조(밀폐공간 유해가스)', 'KOSHA GUIDE H-80'],
  '고소':      ['산업안전보건기준에 관한 규칙 제42조(추락의 방지)', '산업안전보건기준에 관한 규칙 제44조(안전대 부착설비)'],
  '중량물':    ['산업안전보건기준에 관한 규칙 제38조(사전조사 및 작업계획서 작성)', 'KOSHA GUIDE M-72 중량물 취급작업'],
  '전기':      ['산업안전보건기준에 관한 규칙 제301조(전기기계·기구 등의 충전부 방호)', '전기안전관리법 제9조'],
  '고온':      ['산업안전보건기준에 관한 규칙 제558조(고열장해 예방)', 'KOSHA GUIDE H-65 고열작업장 관리'],
  '분진':      ['산업안전보건기준에 관한 규칙 제605조(분진의 흡입방지)', 'KOSHA GUIDE H-9 분진 측정 및 관리'],
  '회전체':    ['산업안전보건기준에 관한 규칙 제87조(원동기·회전축 등의 위험방지)'],
  '협착':      ['산업안전보건기준에 관한 규칙 제92조(끼임방지)', 'KOSHA GUIDE M-117 LOTO 절차'],
  '화학물질':  ['산업안전보건기준에 관한 규칙 제420조(관리대상 유해물질)', '화학물질관리법 제23조'],
};

/* 안전조치 매핑 */
const SAFETY_MEASURES = {
  '화기': {
    전: ['화기작업 허가서 발급', '가연성 물질 제거/차단', '소화기 비치(2개 이상)', '감시자 지정'],
    중: ['불꽃/불티 비산 방지 포장', '인근 가연물 지속 확인', '소화기 즉시 사용 가능 상태 유지'],
    후: ['작업구역 30분간 화재감시', '잔불/불씨 최종 확인', '화기작업 허가서 반납'],
  },
  '고온': {
    전: ['열사병 예방 교육 실시', '냉수/이온음료 준비', '작업구역 환기 확인', '방열복 착용'],
    중: ['20분 작업/10분 휴식 교대 원칙', '체온 이상 증상 상호 확인', '고온 표면 접촉 금지'],
    후: ['열기 충분히 냉각 후 정리', '건강 이상 여부 확인', '방열복 세탁·보관'],
  },
  '밀폐공간': {
    전: ['밀폐공간 작업 허가서 발급', '산소·유해가스 농도 측정(O2 18~23.5%, CO<25ppm)', '환기 충분히 실시', '구조·구급 장비 준비', '감시자 지정'],
    중: ['지속적 가스 농도 모니터링', '작업자 상태 10분마다 확인', '긴급 대피로 확보'],
    후: ['작업자 전원 퇴출 확인', '환기 지속 후 밀폐', '작업 허가서 종료 처리'],
  },
  '고소': {
    전: ['안전대 지급 및 착용 확인', '발판·사다리 점검(3지점 접촉)', '추락방망·안전난간 설치', '3m 이상 고소작업 신고'],
    중: ['안전대 랜야드 체결 확인', '작업반경 하부 통제선 설치', '이동 중 안전대 이중 체결'],
    후: ['공구·자재 하부 낙하 없음 확인', '발판·사다리 수거·보관', '안전대 이상 여부 점검'],
  },
  '유해가스': {
    전: ['가스검지기 보정·기능 확인', '방독마스크/SCBA 지급', '비상대피 동선 공유', '환기설비 가동 확인'],
    중: ['연속 가스 모니터링', '알람 발생 시 즉시 대피', '작업자 2인 1조 원칙'],
    후: ['환기 충분 실시 후 밀폐', '검지기 기록 보관(3년)', '이상 증상자 의무실 조치'],
  },
  '중량물': {
    전: ['중량물 취급 작업계획서 작성', '크레인·지게차 사전 점검', '신호수 지정·배치', '작업반경 통제'],
    중: ['와이어로프·샤클 체결 확인', '달기 작업 시 하부 접근 금지', '인양물 밑 통과 절대 금지'],
    후: ['크레인·지게차 엔진 정지 확인', '적치 안정성 확인', '작업 일지 기록'],
  },
  '전기': {
    전: ['LOTO(잠금·태그아웃) 적용', '검전기로 전원 차단 확인', '절연보호구 착용', '근접 활선 방호구 설치'],
    중: ['단독 작업 금지(2인 1조)', '전원 무단 투입 금지', '작업 구역 경계 표시'],
    후: ['LOTO 해제 전 전원인가 확인', '전원 인가 시 전 작업자 안전위치 확인', '절연저항 측정·기록'],
  },
  '회전체': {
    전: ['LOTO(잠금·태그아웃) 적용', '방호 덮개 점검', '회전부 근접 금지 표지 설치'],
    중: ['방호 덮개 제거 금지', '헐렁한 복장·목도리 금지', '작동 중 청소·급유 금지'],
    후: ['방호 덮개 복원 확인', 'LOTO 해제 절차 준수', '이상음·진동 여부 확인'],
  },
  '협착': {
    전: ['LOTO 적용·확인', '협착점 방호 조치', '안전블록 설치'],
    중: ['2인 1조 원칙 준수', '신체 일부 협착점 접근 절대 금지'],
    후: ['방호 조치 복원 확인', 'LOTO 해제 전 이상 없음 확인'],
  },
  '분진': {
    전: ['분진 측정 및 농도 확인', '방진마스크 지급·착용', '국소 배기 가동 확인'],
    중: ['주기적 환기', '분진 발생 최소화 작업방법 적용'],
    후: ['작업복 진동 털기 금지(젖은 걸레 사용)', '세면·샤워 실시', '분진 농도 측정 기록'],
  },
  '화학물질': {
    전: ['MSDS 확인 및 교육', '화학물질용 보호구 착용', '환기 확인'],
    중: ['피부·눈 접촉 즉시 다량의 물로 세척', '누출 시 즉시 대피·신고'],
    후: ['잔류 화학물질 적정 폐기', '보호구 오염 제거', '이상 증상 확인'],
  },
};

/* =====================================================
   작업속보 파서 v2 (텍스트 → 작업 목록)
   ▶ 주요 개선사항:
     1) [관리3, 안전1, 작업14] 같은 메타라인 작업명 오인식 제거
     2) 장비: / 취약작업자: 등 부가정보 라인 필터링
     3) 작업명 클린업 강화
   ===================================================== */

// 메타라인 판별 — 작업명이 아닌 부가정보 라인
function isMetaLine(line) {
  // ── 날짜/일자 패턴 (최우선) ──
  // <2026. 06. 24 (수)> 또는 <2026.06.24> 형태
  if (/^<\d{4}[\s.년]\s*\d{1,2}[\s.월]\s*\d{1,2}/.test(line)) return true;
  // 2026.06.24 / 2026-06-24 / 2026년 6월 24일 형태
  if (/^\d{4}[.\-년]\s*\d{1,2}[.\-월]\s*\d{1,2}/.test(line) && line.length < 40) return true;
  // (월) (화) (수) (목) (금) (토) (일) 만 포함된 짧은 라인
  if (/^\(.{0,20}(월|화|수|목|금|토|일)\)$/.test(line) && line.length < 25) return true;

  // ── 인원 구성 라인 ──
  // [관리3, 안전1, 작업N] 형태
  if (/^\[(관리|안전|감독|책임|기계|제관|비계|화재|신호|실장)\d/.test(line)) return true;
  // [취약작업자 : ...] 라인
  if (/^\[?취약작업자/.test(line)) return true;
  // 업체명 + 숫자명 라인 (예: 동진건설 18명)
  if (/^[가-힣]{2,8}\s+\d+명$/.test(line)) return true;

  // ── 장비/부가정보 라인 ──
  // 장비 / 투입장비 / 사용장비 (1) : 지게차·크레인 등 → 장비는 '작업'이 아님
  if (/^[○◇▶\-]?\s*(투입|사용|동원|주요)?\s*장비\s*(\(\d+\))?\s*[:：]/.test(line)) return true;
  // 계약명 / 공사명 / 작업시간 / 작업내용 / 작업인원 / 안전수칙 등 부가항목 (○ 유무 무관)
  if (/^[○◇▶\-]?\s*(계\s*약\s*명|공\s*사\s*명|작업\s*시간|작업\s*내용|작업\s*인원|투입\s*인원|안전\s*수칙|주요\s*내용|현\s*황)\s*[:：]/.test(line)) return true;

  // ── 헤더 라인 ──
  if (/^\[.{2,20}(일일\s*작업속보|작업속보)/.test(line)) return true;

  return false;
}

// 작업 시작 라인 판별
function isWorkStartLine(line) {
  if (isMetaLine(line)) return false;
  // 숫자. / 숫자) / ○기호 / - 로 시작하는 라인
  if (!/^(\d+[.)]\s+|[①②③④⑤⑥⑦⑧⑨⑩]\s*|[■●▶◆○-]\s+)/.test(line)) return false;
  // 기호 제거 후 실질 내용이 2글자 이상
  const content = line.replace(/^[\d.)\s①②③④⑤⑥⑦⑧⑨⑩■●▶◆○-]+/, '').trim();
  return content.length >= 2;
}

// 한 줄에서 작업장소/작업시간/작업인원을 추출해 current에 채운다 (미설정 시에만)
function extractWorkFields(line, current) {
  if (!current) return;
  const t = line.match(/(\d{1,2}:\d{2})\s*[~\-]\s*(\d{1,2}:\d{2})/);
  if (t && !current.작업시간) current.작업시간 = t[1] + '~' + t[2];
  const l = line.match(/(?:장소|위치|현장)\s*[:：]?\s*([^,\n]{2,30})/);
  if (l && !current.작업장소) current.작업장소 = l[1].trim();
  const p = line.match(/인원\s*[:：]?\s*(\d+)|(\d+)\s*명/);
  if (p && !current.작업인원) current.작업인원 = parseInt(p[1] || p[2] || 0);
}

function parseWorkBulletin(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const works = [];
  let current = null;

  const timePattern    = /(\d{1,2}:\d{2})\s*[~\-]\s*(\d{1,2}:\d{2})/;
  const personPattern  = /(\d+)\s*명(?!.*Coke)|인원\s*:?\s*(\d+)/;
  const locationPattern = /(?:장소|위치|현장)\s*:?\s*([^,\n]{2,30})/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 무조건 스킵 라인
    if (isMetaLine(line)) continue;
    // "- #1,2 Coke Screen..." 형태처럼 대시+공백+# 시작 = 작업 상세내용, 별도 작업이 아님
    // 단, 현재 작업이 없으면 새 작업으로 처리
    const isDetailLine = /^-\s+#/.test(line);

    if (isWorkStartLine(line) && !isDetailLine) {
      if (current) works.push(current);
      current = {
        순번: works.length + 1,
        작업명: extractWorkName(line),
        작업장소: '',
        작업인원: 0,
        작업시간: '',
        rawLines: [line],
      };
      // 작업 시작 줄 자체에서도 장소/시간/인원 추출 (같은 줄에 붙은 경우)
      extractWorkFields(line, current);
    } else if (current) {
      current.rawLines.push(line);
      extractWorkFields(line, current);
    } else {
      // 첫 작업 자동 시작 (총괄 텍스트)
      if (line.length > 5 && !line.startsWith('//') && !isMetaLine(line)) {
        current = {
          순번: 1,
          작업명: extractWorkName(line),
          작업장소: '',
          작업인원: 0,
          작업시간: '',
          rawLines: [line],
        };
      }
    }
  }
  if (current) works.push(current);

  // 사후 필터: 작업명이 메타정보 패턴인 항목 제거
  const validWorks = works.filter(w => {
    const n = w.작업명;
    // 날짜 패턴 — <2026. 06. 24 (수)> 또는 2026.06.24 형태
    if (/^<\d{4}/.test(n)) return false;
    if (/^\d{4}[.\-년]/.test(n) && n.length < 40) return false;
    // 인원 구성 메타
    if (/^\[(관리|안전|감독|기계|제관|비계|화재|신호)/.test(n)) return false;
    if (/^\[취약/.test(n)) return false;
    // 장비 라인 (장비 / 투입장비 (1) : 지게차 등)
    if (/^(투입|사용|동원|주요)?\s*장비\s*(\(\d+\))?\s*[:：]/.test(n)) return false;
    // 계약명 / 공사명 / 취약작업자 / 작업시간 등 부가항목
    if (/^(계\s*약\s*명|공\s*사\s*명|취약작업자|작업\s*시간|작업\s*내용|안전\s*수칙)\s*[:：]?/.test(n)) return false;
    // 업체명+인원 라인
    if (/^[가-힣]{2,8}\s+\d+명$/.test(n)) return false;
    return n.length >= 2;
  });

  // 순번 재번호
  validWorks.forEach((w, i) => { w.순번 = i + 1; });

  // 최소 1개 보장
  if (validWorks.length === 0 && text.trim().length > 0) {
    validWorks.push({
      순번: 1,
      작업명: text.split('\n').find(l => l.trim().length > 5)?.trim().slice(0, 50) || '작업',
      작업장소: '현장 확인 필요',
      작업인원: 0,
      작업시간: '',
      rawLines: text.split('\n'),
    });
  }

  return validWorks;
}

function isLikelyNewWork(line, prevLine) {
  if (!prevLine) return false;
  return !isMetaLine(line) && /^\d+[.)]/.test(line);
}

function extractWorkName(line) {
  let s = line
    .replace(/^\d+[.)]\s*/, '')
    .replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, '')
    .replace(/^[■●▶◆○\-]\s*/, '');
  // 시간/장소/위치/현장/인원 표기가 시작되는 지점에서 작업명을 끊어
  // 순수한 '작업' 부분만 인식한다 (부가정보가 작업명에 섞이는 문제 해결)
  const cutters = [
    /\s*\(?\d{1,2}:\d{2}\s*[~\-]/,
    /\s*[,·]?\s*(장소|위치|현장)\s*[:：]/,
    /\s*[,·]?\s*인원\s*[:：]?\s*\d/,
    /\s*\d+\s*명/
  ];
  let cut = s.length;
  for (const re of cutters) { const m = s.match(re); if (m && m.index < cut) cut = m.index; }
  s = s.slice(0, cut).replace(/[\s,·(（]+$/, '').trim();
  return s.slice(0, 70) || '작업';
}

/* =====================================================
   위험요인 추출 엔진
   ===================================================== */
function extractHazards(work) {
  // 작업명 + 작업장소 + 세부 내용 라인 전체를 결합
  const combinedText = [work.작업명, work.작업장소, ...(work.rawLines || [])].join(' ');
  const hazards = new Set();

  /* ── 1단계: 키워드 사전 매칭 (HAZARD_KEYWORD_MAP) ── */
  for (const [hazard, keywords] of Object.entries(HAZARD_KEYWORD_MAP)) {
    for (const kw of keywords) {
      if (combinedText.includes(kw)) {
        hazards.add(hazard);
        break;
      }
    }
  }

  /* ── 2단계: 작업유형별 기본 위험요인 추가 ──
     WORK_TYPE_BASE_HAZARDS는 해당 키워드가 실제로 작업명/장소에
     명확히 포함될 때만 적용. '설치'처럼 짧은 단어는 정확한 맥락만. */
  for (const [workType, baseHazards] of Object.entries(WORK_TYPE_BASE_HAZARDS)) {
    if (combinedText.includes(workType)) {
      baseHazards.forEach(h => hazards.add(h));
    }
  }

  /* ── 3단계: 크레인/지게차가 있으면 고소 추가 (하역/인양 맥락) ── */
  if (combinedText.includes('크레인') || combinedText.includes('지게차')) {
    hazards.add('중량물');
    // 고소는 크레인 위 작업이 명시된 경우에만
    if (combinedText.includes('크레인 위') || combinedText.includes('상부')) {
      hazards.add('고소');
    }
  }

  /* ── 4단계: 철거/교체/하역 작업에서 중량물 확인 ── */
  if (/철거|교체|하역|설치품|기자재/.test(combinedText)) {
    hazards.add('중량물');
  }

  /* ── 5단계: 고소 작업 맥락 추가 판단 ──
     "하역" 자체는 고소가 아님. 명시적 높이/설치대 언급 시에만. */
  if (/사다리|설치대|비계|3m|4m|5m|상부 작업|고소 작업/.test(combinedText)) {
    hazards.add('고소');
  }

  /* ── 6단계: Vibrator/Screen/체인블록 → 협착·중량물 (회전체 아님) ── */
  if (/Vibrator|vibrator|바이브레이터/.test(combinedText)) {
    hazards.add('협착');
    hazards.add('중량물');
    // Vibrator 자체는 회전체이지만, 상차작업이면 회전체 위험 낮음
    if (/상차|하차|이동|교체/.test(combinedText)) {
      hazards.delete('회전체'); // 운반 중이면 회전체 위험 제외
    } else {
      hazards.add('회전체');
    }
  }

  /* ── 7단계: Screen 설치/철거 작업 ── */
  if (/Screen|screen|스크린/.test(combinedText)) {
    hazards.add('협착');
    hazards.add('중량물');
    // 전기는 Screen 전기작업이 명시될 때만 (단순 Screen 교체는 제외)
    if (!/LOTO|전기|활선|배선|케이블/.test(combinedText)) {
      hazards.delete('전기');
    }
  }

  /* ── 8단계: 4고로/#고로 → 유해가스/고온은 실제 고로 내부/출선 작업 맥락만 ──
     단순히 '4고로' 명칭이 들어가도 Vibrator 상차는 고온·유해가스 해당 없음 */
  if (/고로|용광로/.test(combinedText)) {
    // 출선/내화물/열풍로 관련 키워드 있을 때만 고온·유해가스 추가
    if (/출선|내화물|열풍로|노심|탕도|용선/.test(combinedText)) {
      hazards.add('고온');
      hazards.add('유해가스');
    }
    // 밀폐공간은 실제 내부 진입 작업만
    if (/내부|맨홀|피트|벙커/.test(combinedText)) {
      hazards.add('밀폐공간');
    }
  }

  /* ── 9단계: 코크스(Coke) 오탐지 방지 ──
     Coke Screen/Vibrator 등 설비명에 Coke가 포함돼도 고온·가스 ×
     단, 실제 코크스 오븐 / 코크스 이송 작업이면 분진 추가 */
  if (/Coke|coke|코크스/.test(combinedText)) {
    // 코크스 자체 접촉 작업(오븐, 압출, 이송)이 아니면 분진만
    if (/오븐|압출|이송|장입|방산/.test(combinedText)) {
      hazards.add('고온');
      hazards.add('유해가스');
      hazards.add('분진');
    } else {
      // Screen/Vibrator 등 설비만 있는 경우 → 분진 경미 가능성만
      hazards.add('분진');
      // 잘못 추가된 고온·유해가스 제거
      hazards.delete('고온');
      hazards.delete('유해가스');
      hazards.delete('밀폐공간');
    }
  }

  /* ── 최소 1개 보장 ── */
  if (hazards.size === 0) hazards.add('협착');

  return [...hazards];
}

/* =====================================================
   위험성 점수 계산
   ===================================================== */
function calcRiskScore(hazards) {
  let maxFreq = 1, maxSev = 1;
  for (const h of hazards) {
    const score = HAZARD_RISK_SCORES[h];
    if (score) {
      if (score.freq > maxFreq) maxFreq = score.freq;
      if (score.sev > maxSev) maxSev = score.sev;
    }
  }
  // 복합위험요인 보정 (2개 이상이면 +1)
  if (hazards.length >= 3) maxFreq = Math.min(5, maxFreq + 1);

  const score = maxFreq * maxSev;
  let grade = '낮음';
  if (score >= 20) grade = '매우높음';
  else if (score >= 13) grade = '높음';
  else if (score >= 7) grade = '보통';

  return { 빈도: maxFreq, 강도: maxSev, 위험성점수: score, 위험성등급: grade };
}

/* =====================================================
   안전조치 생성
   ===================================================== */
function buildSafetyMeasures(hazards) {
  const result = { 작업전: [], 작업중: [], 작업후: [] };
  const seen = { 작업전: new Set(), 작업중: new Set(), 작업후: new Set() };

  // 공통 조치
  result.작업전.push('작업 전 TBM(Toolbox Meeting) 실시');
  result.작업전.push('작업허가서 발급 및 관리감독자 서명');
  result.작업후.push('작업 후 현장 정리정돈 및 이상 유무 확인');
  result.작업후.push('작업일지 기록 및 관리감독자 보고');

  for (const h of hazards) {
    const m = SAFETY_MEASURES[h];
    if (!m) continue;
    ['전', '중', '후'].forEach((step, i) => {
      const key = ['작업전', '작업중', '작업후'][i];
      (m[step] || []).forEach(item => {
        if (!seen[key].has(item)) {
          result[key].push(item);
          seen[key].add(item);
        }
      });
    });
  }

  // 중복 제거
  result.작업전 = [...new Set(result.작업전)];
  result.작업중 = [...new Set(result.작업중)];
  result.작업후 = [...new Set(result.작업후)];

  return result;
}

/* 보호구 목록 생성 */
function buildPPE(hazards) {
  const ppe = new Set(['안전모', '안전화', '안전조끼']);
  for (const h of hazards) {
    (PPE_MAP[h] || []).forEach(p => ppe.add(p));
  }
  return [...ppe];
}

/* 관련 법규 목록 생성 */
function buildLaws(hazards) {
  const laws = new Set();
  laws.add('산업안전보건법 제38조(안전조치)');
  laws.add('산업안전보건법 제139조(중대재해 발생 시 보고)');
  for (const h of hazards) {
    (LAW_MAP[h] || []).forEach(l => laws.add(l));
  }
  return [...laws];
}

/* =====================================================
   재해사례 RAG — accident_db.js 기반 유사 매칭
   ===================================================== */
function ragMatchAccidentCases(work, hazards) {
  if (typeof ACCIDENT_CASES === 'undefined') return [];

  const combinedText = [work.작업명, work.작업장소, ...(work.rawLines || [])].join(' ');

  const scored = ACCIDENT_CASES.map(c => {
    let score = 0;
    // ID 16~20 추가 사례는 accidentSummary 대신 cause 필드 사용
    const summary = c.accidentSummary || c.cause || '';
    const directCause = c.directCause || c.cause || '';
    const caseText = [
      c.workType, c.workLocation, summary, directCause,
      (c.environmentFactors || []).join(' ')
    ].join(' ');

    // 작업유형 매칭 (+5)
    if (c.workType && combinedText.includes(c.workType)) score += 5;

    // 위험요인 키워드 매칭 (+2 per hazard)
    for (const h of hazards) {
      const keywords = HAZARD_KEYWORD_MAP[h] || [];
      for (const kw of keywords) {
        if (caseText.includes(kw)) { score += 2; break; }
      }
    }

    // 장소 매칭 (+3)
    if (work.작업장소 && c.workLocation && work.작업장소.includes(c.workLocation.slice(0, 3))) score += 3;

    // 사망자 발생 사례 우선순위 (+2)
    const deathCount = (c.victims && c.victims.death) || c.deathCount || 0;
    if (deathCount > 0) score += 2;

    // 최신 사례(2024~) 가중치 (+1) — 법령 반영도 높음
    if (c.date && parseInt(c.date.slice(0, 4)) >= 2024) score += 1;

    return { ...c, _score: score };
  });

  return scored
    .filter(c => c._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 3)
    .map(c => {
      const summary  = c.accidentSummary || c.cause || '';
      const cause    = c.directCause || c.cause || '';
      const lesson   = c.preventiveMeasures || c.preventionMeasures || c.recommendations || '';
      const victims  = c.victims
        ? `사망 ${c.victims.death}명 / 중상 ${c.victims.serious}명 / 경상 ${c.victims.minor}명`
        : '';
      const sourceStr = c.source ? `[출처] ${c.source}` : '';
      return {
        사고일자:   c.date || c.accidentDate || '미상',
        사고장소:   c.workplace || c.workLocation || '미상',
        사고종류:   c.accidentType || '',
        사고개요:   summary,
        원인:       cause,
        피해규모:   victims,
        교훈:       lesson,
        출처:       sourceStr,
        _score:     c._score,
      };
    });
}

/* =====================================================
   권고사항 생성
   ===================================================== */
function buildRecommendation(work, hazards, grade) {
  const urgentMsg = grade === '매우높음'
    ? `⚠️ 이 작업은 위험성 등급 "매우높음"으로 반드시 관리감독자가 현장에 상주하고 `
    : grade === '높음'
    ? `이 작업은 위험성 등급 "높음"으로 작업 전 안전교육을 강화하고 `
    : '';

  const hazardDesc = hazards.slice(0, 3).join(', ');
  return `${urgentMsg}${work.작업명} 수행 시 ${hazardDesc} 위험에 특히 유의하십시오. ${
    hazards.includes('밀폐공간') ? '밀폐공간 작업은 반드시 3인 1조(작업자 2명 + 감시자 1명) 원칙을 준수하십시오.' : ''
  }${
    hazards.includes('고소') ? ' 고소작업 시 안전대 체결 및 추락방지망 설치를 필수로 확인하십시오.' : ''
  }`.trim();
}

/* =====================================================
   종합의견 생성
   ===================================================== */
function buildOverallOpinion(works, result) {
  const sortedByRisk = [...result.작업목록].sort((a, b) => b.위험성점수 - a.위험성점수);
  const topWork = sortedByRisk[0];
  const highRiskCount = result.고위험작업수;
  const totalCount = result.총작업수;

  let opinion = `오늘 총 ${totalCount}개 작업 중 `;
  if (highRiskCount > 0) {
    opinion += `${highRiskCount}개 작업이 고위험(높음 이상) 등급으로 분류되었습니다. `;
    opinion += `특히 "${topWork.작업명}"(위험성 점수: ${topWork.위험성점수}점)이 가장 위험도가 높으며, `;
    opinion += `${topWork.예상위험요인.slice(0, 3).join(', ')} 위험에 집중적인 안전관리가 필요합니다. `;
  } else {
    opinion += '모든 작업이 상대적으로 낮은 위험도를 보이나, ';
  }
  opinion += '모든 작업에 대해 작업 전 TBM 실시 및 허가서 발급을 철저히 준수하고, ';
  opinion += '이상 발생 시 즉시 작업 중단 후 관리감독자에게 보고하십시오.';

  return opinion;
}

/* =====================================================
   핵심 분석 함수 — 규칙기반 Fallback
   ===================================================== */
function analyzeByRules(text) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  // 1. 텍스트 파싱 → 작업 목록
  const parsedWorks = parseWorkBulletin(text);
  if (JSA_CONFIG.debug) console.log('[JSA] 파싱된 작업 수:', parsedWorks.length, parsedWorks);

  // 2. 작업별 분석
  const analyzed = parsedWorks.map(work => {
    const hazards = extractHazards(work);
    const riskResult = calcRiskScore(hazards);
    const safetyMeasures = buildSafetyMeasures(hazards);
    const ppe = buildPPE(hazards);
    const laws = buildLaws(hazards);
    const cases = ragMatchAccidentCases(work, hazards);
    const recommendation = buildRecommendation(work, hazards, riskResult.위험성등급);

    return {
      순번: work.순번,
      작업명: work.작업명,
      작업장소: work.작업장소 || '현장 확인 필요',
      작업인원: work.작업인원 || 0,
      작업시간: work.작업시간 || '',
      예상위험요인: hazards,
      위험성등급: riskResult.위험성등급,
      위험성점수: riskResult.위험성점수,
      빈도: riskResult.빈도,
      강도: riskResult.강도,
      유사재해사례: cases,
      안전조치: safetyMeasures,
      필수보호구: ppe,
      관련법규: laws,
      권고사항: recommendation,
    };
  });

  // 3. 위험도 높은 순 정렬
  analyzed.sort((a, b) => b.위험성점수 - a.위험성점수);

  // 4. 고위험 카운트
  const highRiskCount = analyzed.filter(w =>
    w.위험성등급 === '매우높음' || w.위험성등급 === '높음'
  ).length;

  const avgScore = analyzed.length > 0
    ? Math.round(analyzed.reduce((s, w) => s + w.위험성점수, 0) / analyzed.length)
    : 0;

  const result = {
    분석일시: dateStr,
    총작업수: analyzed.length,
    고위험작업수: highRiskCount,
    평균위험성점수: avgScore,
    작업목록: analyzed,
    종합의견: '',
    분석방식: 'rule-based',
  };

  result.종합의견 = buildOverallOpinion(parsedWorks, result);
  return result;
}

/* =====================================================
   LLM API 호출 (apiMode='llm' 일 때 사용)
   ===================================================== */
async function analyzeByLLM(text) {
  // RAG: 키워드 기반 재해사례 Top 5 추출
  const tempWorks = parseWorkBulletin(text);
  const allHazards = [...new Set(tempWorks.flatMap(w => extractHazards(w)))];
  const ragCases = typeof ACCIDENT_CASES !== 'undefined'
    ? ACCIDENT_CASES
        .map(c => {
          let score = 0;
          const cText = [c.workType, c.workLocation, c.accidentSummary, c.directCause].join(' ');
          for (const h of allHazards) {
            (HAZARD_KEYWORD_MAP[h] || []).forEach(kw => { if (cText.includes(kw)) score++; });
          }
          return { ...c, _score: score };
        })
        .sort((a, b) => b._score - a._score)
        .slice(0, 5)
    : [];

  const requestBody = {
    text,
    cases: ragCases,
    systemPrompt: JSA_SYSTEM_PROMPT,
    options: { language: 'ko', domain: 'steel_industry' },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), JSA_CONFIG.timeout);

  try {
    const res = await fetch(JSA_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    data.분석방식 = 'llm';
    return data;
  } catch (err) {
    clearTimeout(timer);
    console.warn('[JSA] LLM API 실패, fallback 사용:', err.message);
    // Fallback to rule-based
    const fallback = analyzeByRules(text);
    fallback.분석방식 = 'fallback(llm-failed)';
    return fallback;
  }
}

/* =====================================================
   Google Drive 저장 (Streamlit 이전 후 활성화)
   ===================================================== */
async function saveToGoogleDrive(result, filename) {
  if (!JSA_CONFIG.gdriveEndpoint || JSA_CONFIG.gdriveEndpoint === '/api/save-gdrive') {
    // 현재는 localStorage 저장
    console.log('[JSA] Google Drive 미연결 — localStorage에만 저장');
    return null;
  }
  try {
    const res = await fetch(JSA_CONFIG.gdriveEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, data: result }),
    });
    if (!res.ok) throw new Error(`GDrive HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[JSA] Google Drive 저장 실패:', err.message);
    return null;
  }
}

/* =====================================================
   해시 캐시 (동일 텍스트 재분석 방지)
   ===================================================== */
const JSA_CACHE_KEY = 'jsa_analysis_cache_v3';  // v3: 날짜 헤더 라인 메타필터 추가
const JSA_CACHE_MAX = 20;

function hashText(text) {
  // 간단한 32비트 해시
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

function getCachedResult(text) {
  try {
    const cache = JSON.parse(localStorage.getItem(JSA_CACHE_KEY) || '{}');
    return cache[hashText(text)] || null;
  } catch { return null; }
}

function setCachedResult(text, result) {
  try {
    const cache = JSON.parse(localStorage.getItem(JSA_CACHE_KEY) || '{}');
    const keys = Object.keys(cache);
    if (keys.length >= JSA_CACHE_MAX) delete cache[keys[0]]; // LRU 제거
    cache[hashText(text)] = { result, cachedAt: Date.now() };
    localStorage.setItem(JSA_CACHE_KEY, JSON.stringify(cache));
  } catch (e) { console.warn('[JSA] 캐시 저장 실패:', e); }
}

/* =====================================================
   분석 이력 관리
   ===================================================== */
const JSA_HISTORY_KEY = 'jsa_history';
const JSA_HISTORY_MAX = 30;

function saveHistory(inputText, result) {
  try {
    const hist = JSON.parse(localStorage.getItem(JSA_HISTORY_KEY) || '[]');
    hist.unshift({
      id: Date.now(),
      inputPreview: inputText.slice(0, 80) + (inputText.length > 80 ? '...' : ''),
      분석일시: result.분석일시,
      총작업수: result.총작업수,
      고위험작업수: result.고위험작업수,
      평균위험성점수: result.평균위험성점수,
      분석방식: result.분석방식,
      result,
    });
    if (hist.length > JSA_HISTORY_MAX) hist.splice(JSA_HISTORY_MAX);
    localStorage.setItem(JSA_HISTORY_KEY, JSON.stringify(hist));
  } catch (e) { console.warn('[JSA] 이력 저장 실패:', e); }
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(JSA_HISTORY_KEY) || '[]');
  } catch { return []; }
}

function clearHistory() {
  localStorage.removeItem(JSA_HISTORY_KEY);
  localStorage.removeItem(JSA_CACHE_KEY);
}

/* =====================================================
   메인 진입 함수 — jsa.js에서 호출
   ===================================================== */
async function runJsaAnalysis(text, onProgress) {
  if (!text || text.trim().length < 10) {
    throw new Error('분석할 텍스트를 입력해 주세요. (최소 10자 이상)');
  }

  // 캐시 확인
  const cached = getCachedResult(text.trim());
  if (cached) {
    if (JSA_CONFIG.debug) console.log('[JSA] 캐시 히트');
    onProgress && onProgress('cache', '캐시된 분석 결과를 불러오는 중...', 100);
    return { ...cached.result, _fromCache: true };
  }

  // 진행 단계 알림
  onProgress && onProgress('parse',  '📋 작업속보 텍스트 파싱 중...', 15);
  await delay(300);

  onProgress && onProgress('rag',    '🔍 재해사례 DB 조회 중...', 35);
  await delay(500);

  onProgress && onProgress('risk',   '⚡ 위험요인 분석 중...', 55);
  await delay(400);

  onProgress && onProgress('measure','🛡️ 안전조치 생성 중...', 75);
  await delay(400);

  onProgress && onProgress('final',  '📊 결과 정리 중...', 90);
  await delay(300);

  let result;
  if (JSA_CONFIG.apiMode === 'llm') {
    result = await analyzeByLLM(text.trim());
  } else {
    result = analyzeByRules(text.trim());
  }

  // 캐시·이력 저장
  setCachedResult(text.trim(), result);
  saveHistory(text.trim(), result);

  // Google Drive 저장 (연동 시)
  const filename = `JSA_${result.분석일시.replace(/[: ]/g, '_')}.json`;
  saveToGoogleDrive(result, filename).catch(() => {});

  onProgress && onProgress('done', '✅ 분석 완료!', 100);
  return result;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* 전역 노출 */
window.JSA_CONFIG        = JSA_CONFIG;
window.JSA_SYSTEM_PROMPT = JSA_SYSTEM_PROMPT;
window.runJsaAnalysis    = runJsaAnalysis;
window.getJsaHistory     = getHistory;
window.clearJsaHistory   = clearHistory;

if (JSA_CONFIG.debug) console.log('[JSA API] jsa_api.js 로드 완료 — 모드:', JSA_CONFIG.apiMode);
