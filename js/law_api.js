/* =============================================
   SafeGuard Pro – 법제처 국가법령정보 Open API 연동
   law_api.js  v1.0
   =============================================
   - Base URL : http://www.law.go.kr/DRF/
   - 인증키(OC): lsbeom97
   - CORS 해결 : allorigins.win 무료 프록시 경유
   - 캐싱     : LocalStorage 24시간 캐시
   - 폴백     : API 실패 시 law_db.js 오프라인 DB 사용
   ============================================= */

/* ─────────────────────────────────────────────
   기본 상수
   ───────────────────────────────────────────── */
const LAW_API_OC       = 'lsbeom97';
const LAW_API_BASE     = 'https://www.law.go.kr/DRF/';  // ✅ http→https (Mixed Content 차단 방지)
const LAW_API_PROXY    = 'https://corsproxy.io/?';       // ✅ 안정적인 CORS 프록시로 교체
const LAW_API_PROXY_FB = 'https://api.allorigins.win/raw?url='; // fallback 프록시
const LAW_CACHE_PREFIX = 'law_cache_';
const LAW_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24시간

/* ─────────────────────────────────────────────
   연동 법령 MST 번호 매핑
   (법제처 lawSearch.do 결과에서 사전 수집)
   ───────────────────────────────────────────── */
const LAW_MST_MAP = {
  /* ──────────────────────────────────────────────────────
     법령명 → { mst, short, full, searchQuery }
     MST 번호: 법제처 국가법령정보 Open API 기준 (2026.06 확인)
     법제처 lawSearch.do 로 확인 가능
     ────────────────────────────────────────────────────── */
  '중대재해처벌법': {
    mst: '22042',                         // 중대재해 처벌 등에 관한 법률 (2021.1.26 제정)
    short: '중대재해처벌법',
    full: '중대재해 처벌 등에 관한 법률',
    searchQuery: '중대재해 처벌'
  },
  '중대재해처벌법시행령': {
    mst: '22043',                         // 중대재해처벌법 시행령 (2025.12 개정 반영)
    short: '중대재해처벌법시행령',
    full: '중대재해 처벌 등에 관한 법률 시행령',
    searchQuery: '중대재해 처벌 시행령'
  },
  '산업안전보건법': {
    mst: '20648',                         // 산업안전보건법 (2019.1.15 전부개정)
    short: '산업안전보건법',
    full: '산업안전보건법',
    searchQuery: '산업안전보건법'
  },
  '산업안전보건법시행령': {
    mst: '20649',                         // 산업안전보건법 시행령
    short: '산안법시행령',
    full: '산업안전보건법 시행령',
    searchQuery: '산업안전보건법 시행령'
  },
  '산업안전보건법시행규칙': {
    mst: '20650',                         // 산업안전보건법 시행규칙 (2026.01 개정)
    short: '산안법시행규칙',
    full: '산업안전보건법 시행규칙',
    searchQuery: '산업안전보건법 시행규칙'
  },
  '건설기술진흥법': {
    mst: '18770',                         // 건설기술 진흥법 (2013.5.22 제정)
    short: '건설기술진흥법',
    full: '건설기술 진흥법',
    searchQuery: '건설기술 진흥법'
  },
  '건설기술진흥법시행령': {
    mst: '18771',                         // 건설기술진흥법 시행령 (2025.09 개정)
    short: '건설기술진흥법시행령',
    full: '건설기술 진흥법 시행령',
    searchQuery: '건설기술 진흥법 시행령'
  },
  '시설물안전법': {
    mst: '15009',                         // 시설물의 안전 및 유지관리에 관한 특별법
    short: '시설물안전법',
    full: '시설물의 안전 및 유지관리에 관한 특별법',
    searchQuery: '시설물 안전 유지관리'
  }
};

/* ──────────────────────────────────────────────────────
   키워드 → MST 키 매핑 (질문에서 법령 자동 감지)
   우선순위 높은 순서로 배열 (앞쪽 규칙 먼저 매칭)
   ────────────────────────────────────────────────────── */
const LAW_KEYWORD_TO_MST_KEY = [
  {
    keywords: ['중대재해처벌법 시행령', '중대재해처벌법시행령', '안전보건관리체계 구축', '반기 이행점검'],
    key: '중대재해처벌법시행령'
  },
  {
    keywords: ['중대재해처벌법', '중대재해 처벌', '중대산업재해', '중대시민재해', '경영책임자', '징벌적 손해배상', '양벌규정', '발생사실 공표'],
    key: '중대재해처벌법'
  },
  {
    keywords: ['산업안전보건법 시행령', '산안법 시행령', '안전보건법 시행령'],
    key: '산업안전보건법시행령'
  },
  {
    keywords: ['산업안전보건법 시행규칙', '산안법 시행규칙', '안전보건법 시행규칙', '사이버교육', '수시평가 주기'],
    key: '산업안전보건법시행규칙'
  },
  {
    keywords: ['산업안전보건법', '산안법', '안전관리자', '보건관리자', '위험성평가', '안전보건교육', '유해위험방지계획서', '산재', '안전보건', '안전보건관리책임자', '안전검사', '작업환경측정', '건강진단', '특수건강진단', '안전보건위원회', '안전관리비', 'KOSHA', 'KRAS'],
    key: '산업안전보건법'
  },
  {
    keywords: ['건설기술진흥법 시행령', 'DFS 200억', '스마트안전관리', '설계안전성검토 200억'],
    key: '건설기술진흥법시행령'
  },
  {
    keywords: ['건설기술진흥법', '건설기술 진흥', '건설공사 안전', '건설안전관리', 'DFS', '설계안전성검토', '안전관리계획서', 'CM 배치', '하자담보책임', '부실벌점'],
    key: '건설기술진흥법'
  },
  {
    keywords: ['시설물안전법', '시설물 안전', '정밀안전진단', '정밀안전점검', '1종 시설물', '2종 시설물', 'FMS', '긴급안전점검'],
    key: '시설물안전법'
  }
];

/* ─────────────────────────────────────────────
   전역 API 상태
   ───────────────────────────────────────────── */
let lawApiStatus = 'unknown'; // 'online' | 'offline' | 'unknown'

function getLawApiStatus()  { return lawApiStatus; }
function setLawApiStatus(s) {
  lawApiStatus = s;
  updateLawStatusIndicator(s);
}

/* ─────────────────────────────────────────────
   캐시 헬퍼
   ───────────────────────────────────────────── */
function getLawCacheKey(mst) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return LAW_CACHE_PREFIX + mst + '_' + today;
}

function getLawCache(mst) {
  try {
    const key  = getLawCacheKey(mst);
    const raw  = localStorage.getItem(key);
    if (!raw) return null;
    const obj  = JSON.parse(raw);
    // TTL 재확인 (날짜 키로 충분하지만 이중 보호)
    if (Date.now() - obj.ts > LAW_CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return obj.data;
  } catch { return null; }
}

function setLawCache(mst, data) {
  try {
    const key = getLawCacheKey(mst);
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch (e) {
    console.warn('[LawAPI] 캐시 저장 실패:', e);
  }
}

/** 특정 MST 캐시 삭제 (수동 새로고침) */
function clearLawCache(mst) {
  try {
    const key = getLawCacheKey(mst);
    localStorage.removeItem(key);
  } catch {}
}

/** 법령 캐시 전체 삭제 */
function clearAllLawCache() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(LAW_CACHE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
    console.log('[LawAPI] 캐시 전체 삭제:', keys.length, '개');
  } catch {}
}

/* ─────────────────────────────────────────────
   URL 빌더 + 프록시 래핑
   ───────────────────────────────────────────── */
function buildLawApiUrl(endpoint, params, proxyUrl) {
  const base   = LAW_API_BASE + endpoint + '?';
  const search = new URLSearchParams({
    OC: LAW_API_OC,
    type: 'JSON',
    ...params
  });
  const rawUrl = base + search.toString();
  const proxy  = proxyUrl || LAW_API_PROXY;
  return proxy + encodeURIComponent(rawUrl);
}

/* ─────────────────────────────────────────────
   (A) 법령 검색 – lawSearch.do
   ───────────────────────────────────────────── */
async function fetchLawSearch(query) {
  const url = buildLawApiUrl('lawSearch.do', { target: 'eflaw', query });
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const text = await res.text();
  const json = JSON.parse(text);
  return json;
}

/* ─────────────────────────────────────────────
   (B) 법령 본문 조회 – lawService.do
   ───────────────────────────────────────────── */
async function fetchLawService(mst) {
  // 캐시 확인
  const cached = getLawCache(mst);
  if (cached) {
    console.log('[LawAPI] 캐시 히트:', mst);
    return cached;
  }

  // 1차 시도: corsproxy.io
  let json = null;
  const proxies = [LAW_API_PROXY, LAW_API_PROXY_FB];
  let lastError = null;

  for (const proxy of proxies) {
    try {
      const url = buildLawApiUrl('lawService.do', { target: 'eflaw', MST: mst }, proxy);
      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      if (text.trim().startsWith('<')) throw new Error('프록시 HTML 응답 (JSON 아님)');
      json = JSON.parse(text);
      console.log('[LawAPI] ✅ 성공 (프록시:', proxy.slice(0, 30) + '...)');
      break; // 성공 시 루프 탈출
    } catch (e) {
      lastError = e;
      console.warn('[LawAPI] 프록시 실패, 다음 시도:', proxy.slice(0, 30), e.message);
    }
  }

  if (!json) throw lastError || new Error('모든 프록시 실패');

  setLawCache(mst, json);
  return json;
}

/* ─────────────────────────────────────────────
   (C) 조문 파싱 헬퍼
   ───────────────────────────────────────────── */

/**
 * lawService 응답에서 조문(Jo) 배열 추출
 * 응답 구조: { LawService: { 기본정보: {...}, 조문: { 조문단위: [...] } } }
 * 또는:       { LawService: { 기본정보: {...}, 조문: [{...}] } }
 */
function extractArticles(lawServiceJson) {
  try {
    const ls = lawServiceJson.LawService || lawServiceJson;
    // 기본정보
    const info = ls['기본정보'] || {};
    // 조문 배열
    let articles = [];
    const joSection = ls['조문'];
    if (!joSection) return { info, articles: [] };

    if (Array.isArray(joSection)) {
      articles = joSection;
    } else if (joSection['조문단위']) {
      articles = Array.isArray(joSection['조문단위'])
        ? joSection['조문단위']
        : [joSection['조문단위']];
    }
    return { info, articles };
  } catch (e) {
    console.warn('[LawAPI] 조문 파싱 오류:', e);
    return { info: {}, articles: [] };
  }
}

/**
 * 조문 배열에서 키워드 관련 조문 검색 (최대 maxCount개)
 */
function searchArticlesByKeywords(articles, keywords, maxCount = 3) {
  if (!articles || !articles.length) return [];
  const kws = keywords.map(k => k.toLowerCase());

  // 점수 계산
  const scored = articles.map(art => {
    const joNo   = String(art['조문번호'] || art['조번호']   || '');
    const joTitle = String(art['조문제목'] || art['제목']     || '');
    const joBody  = String(art['조문내용'] || art['조문']     || art['내용'] || '');
    const haystack = (joNo + ' ' + joTitle + ' ' + joBody).toLowerCase();

    let score = 0;
    kws.forEach(k => {
      if (haystack.includes(k)) score += 2;
      if (joTitle.toLowerCase().includes(k)) score += 2; // 제목 가중치
    });
    return { art, score, joNo, joTitle, joBody };
  }).filter(x => x.score > 0);

  // 점수 내림차순 → 상위 maxCount개
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxCount);
}

/* ─────────────────────────────────────────────
   핵심 통합 함수: 질문 → API 검색 → 결과 반환
   ───────────────────────────────────────────── */

/**
 * 질문 텍스트에서 어떤 법령의 MST 키를 검색해야 하는지 감지
 * 여러 법령이 감지될 수도 있으므로 배열 반환
 */
function detectLawKeysFromQuery(query) {
  const q = query.toLowerCase();
  const found = [];
  for (const rule of LAW_KEYWORD_TO_MST_KEY) {
    for (const kw of rule.keywords) {
      if (q.includes(kw.toLowerCase())) {
        if (!found.includes(rule.key)) found.push(rule.key);
        break;
      }
    }
  }
  // 감지 못하면 산업안전보건법 기본값
  if (found.length === 0) found.push('산업안전보건법');
  return found;
}

/**
 * 질문을 받아 API에서 관련 조문을 검색하고 결과 배열 반환
 * 반환값: { articles: [...], lawInfo: {...}, lawKey, source: 'api'|'offline', error? }
 */
async function searchLawByQuery(query) {
  const lawKeys  = detectLawKeysFromQuery(query);
  const queryKws = query.split(/\s+/).filter(w => w.length > 1);

  const allResults = [];
  let   anySuccess = false;
  let   lawInfo    = {};

  for (const key of lawKeys) {
    const mapping = LAW_MST_MAP[key];
    if (!mapping) continue;

    try {
      const json = await fetchLawService(mapping.mst);
      const { info, articles } = extractArticles(json);
      lawInfo = info;

      const matched = searchArticlesByKeywords(articles, queryKws, 3);
      matched.forEach(m => allResults.push({ ...m, lawKey: key, mapping }));
      anySuccess = true;
    } catch (e) {
      console.warn('[LawAPI] 법령 조회 실패:', key, e.message);
    }
  }

  if (!anySuccess || allResults.length === 0) {
    return { articles: [], lawInfo, source: 'offline', lawKeys };
  }

  // 점수 정렬 후 상위 3개
  allResults.sort((a, b) => b.score - a.score);
  return {
    articles: allResults.slice(0, 3),
    lawInfo,
    source: 'api',
    lawKeys
  };
}

/* ─────────────────────────────────────────────
   API 연결 상태 초기 체크 (앱 로드 시 호출)
   ───────────────────────────────────────────── */
async function checkLawApiHealth() {
  try {
    // 산업안전보건법 검색으로 연결 상태 확인 (캐시 사용)
    const mapping = LAW_MST_MAP['산업안전보건법'];
    await fetchLawService(mapping.mst);
    setLawApiStatus('online');
    console.log('[LawAPI] ✅ 법제처 API 연결 확인');
  } catch (e) {
    setLawApiStatus('offline');
    console.warn('[LawAPI] ⚠️ 법제처 API 연결 실패 → 오프라인 모드:', e.message);
  }
}

/* ─────────────────────────────────────────────
   UI 업데이트 함수들
   ───────────────────────────────────────────── */

/** 법령 상태 인디케이터 DOM 업데이트 */
function updateLawStatusIndicator(status) {
  const dot   = document.getElementById('lawApiStatusDot');
  const text  = document.getElementById('lawApiStatusText');
  if (!dot || !text) return;

  if (status === 'online') {
    dot.className  = 'law-status-dot law-status-online';
    text.textContent = '실시간 연동 중';
    text.className = 'law-status-text law-status-text-online';
  } else if (status === 'offline') {
    dot.className  = 'law-status-dot law-status-offline';
    text.textContent = '오프라인 모드';
    text.className = 'law-status-text law-status-text-offline';
  } else {
    dot.className  = 'law-status-dot law-status-checking';
    text.textContent = '연결 확인 중...';
    text.className = 'law-status-text';
  }
}

/** 수동 새로고침 버튼 핸들러 */
async function refreshLawData() {
  const btn = document.getElementById('lawRefreshBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 새로고침 중...';
  }

  // 캐시 전체 삭제
  clearAllLawCache();
  setLawApiStatus('unknown');

  try {
    await checkLawApiHealth();
    if (typeof showToast === 'function') {
      showToast(lawApiStatus === 'online' ? 'success' : 'warning',
        lawApiStatus === 'online'
          ? '✅ 법령 데이터를 최신 버전으로 새로고침했습니다.'
          : '⚠️ API 연결 실패 — 오프라인 데이터를 사용합니다.');
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sync-alt"></i> 법령 데이터 새로고침';
    }
  }
}

/* ─────────────────────────────────────────────
   오늘 날짜 문자열 (배지용)
   ───────────────────────────────────────────── */
function getTodayDateStr() {
  const d = new Date();
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0');
}

/* ─────────────────────────────────────────────
   모듈 초기화 (DOMContentLoaded 이후 authInit 통과 후 호출됨)
   ───────────────────────────────────────────── */
function initLawApi() {
  updateLawStatusIndicator('unknown');
  // 비동기로 연결 상태 체크 (UI 블로킹 없이)
  checkLawApiHealth();
}
