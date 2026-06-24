# SafeGuard Pro v5.6
## 철강산업 통합 안전관리 플랫폼

> **현재 환경**: 정적 웹사이트 (GitHub Pages / 로컬 브라우저)  
> **목표 환경**: Streamlit + FastAPI + Google Drive 연동

---

## ✅ 완료된 기능

### 핵심 모듈
| 모듈 | 상태 | 설명 |
|------|------|------|
| 로그인/세션 관리 | ✅ | sessionStorage 기반 인증 (`sg_session`) |
| POSCO CI 디자인 | ✅ | POSCO BLUE/LIGHT BLUE 팔레트 전면 적용 |
| 다크모드 토글 | ✅ | LocalStorage 저장, FOUC 방지, 0.3s 전환 |
| 대시보드 | ✅ | Gantt 차트, 일정 현황, JSA 요약 패널 |
| JSA 위험성평가 v2 | ✅ | **작업속보 자동분석 + 수동입력 이중 탭** — v5.6 버그 수정·텍스트 가시성 개선 |
| 인허가 체크리스트 | ✅ | 제철·제선 플랜트 특화 체크리스트 |
| 알림 관리 | ✅ | 텔레그램/이메일 채널 설정 |
| 법령 조회 | ✅ | 법제처 Open API 연동 |
| 유권해석 챗봇 | ✅ | 키워드 기반 Q&A |
| 재해사례 DB | ✅ | **24건** 철강업 재해사례 (accident_db.js) — 2025년 고용노동부 공시 4건 추가 (ID 21~24) |

---

## 🗂️ 파일 구조

```
index.html              메인 SPA
css/
  style.css             POSCO CI 팔레트 CSS 변수 + 전체 스타일 (~5,900줄)
js/
  theme.js              다크모드 토글 (LocalStorage themeMode)
  constants.js          전역 상수 (schema v5.1)
  jsa_api.js            ★ JSA 분석 엔진 (규칙기반 fallback + LLM API stub)
  jsa.js                JSA UI 컨트롤러 (탭전환, 렌더링, 이력관리)
  accident_db.js        재해사례 DB 24건 (ACCIDENT_CASES 배열)
  auth.js               로그인/로그아웃 인증
  main.js               SPA 라우터 + 페이지 초기화
  dashboard.js          대시보드 위젯
  law_api.js            법제처 Open API 클라이언트
  chatbot.js            유권해석 챗봇
  checklist.js          인허가 체크리스트
  notification.js       알림 관리
  data.js               정적 시드 데이터
  law_db.js             법령 오프라인 DB
  guideline_db.js       가이드라인 DB
README.md
```

---

## 🔐 로그인 정보

| 계정 | 비밀번호 |
|------|----------|
| admin | admin123 |
| safety | safety2024 |
| posco | posco!@# |

---

## 📱 화면 구성 (SPA 라우터)

| data-page | 제목 | 기능 |
|-----------|------|------|
| `dashboard` | 대시보드 | Gantt, 일정, JSA 요약 |
| `jsa-analysis` | ★ JSA 위험성평가 | 작업속보 자동분석 |
| `checklist` | 인허가 체크리스트 | 제철·제선 특화 |
| `notification` | 알림 관리 | 텔레그램/이메일 |
| `law-search` | 법령 조회 | 법제처 API |
| `law-guideline` | 유권해석 | 챗봇 Q&A |

---

## ⭐ JSA 위험성평가 v2.0 (핵심 기능)

### 입력 방식 (이중 탭)

#### 탭1: 작업속보 붙여넣기 (추천)
카카오톡·문자·이메일로 수신한 일일 작업속보를 그대로 붙여넣으면 자동 분석:
```
[○○제철소 일일 작업속보 - 2026.05.19]
1. 고로 1호기 출선구 보수작업 (10:00~14:00, 3명)
   - 장소: 제1고로 출선장
   - 작업내용: 내화물 교체, 산소절단 사용
2. 코크스 오븐 상부 점검 (13:00~17:00, 2명)
   - 고소작업, 분진 노출 우려
```

#### 탭2: 수동 입력
작업명, 종류, 장소, 환경요소(12종), 인원, 날짜 직접 입력

### 분석 프로세스
```
텍스트 입력 → 작업 단위 파싱 → 위험요인 키워드 매칭
→ 재해사례 RAG 매칭 → 빈도×강도 위험성 점수 산정
→ 단계별 안전조치 생성 → 결과 카드 렌더링
```

### 분석 결과 출력
1. **요약 카드 3개**: 총 작업수 / 고위험 작업수 / 평균 위험성 점수
2. **작업별 카드** (위험도 높은 순): 위험성 배지, 위험요인 태그, 펼침 상세보기
3. **상세 정보**: 빈도×강도 매트릭스, 유사 재해사례(RAG), 단계별 안전조치, 보호구, 법규
4. **작업허가서 생성**: 인쇄용 서식 자동 생성
5. **JSON 내보내기**: Google Drive 업로드용

### 위험성 등급 기준 (빈도×강도)
| 등급 | 점수 | 색상 |
|------|------|------|
| 매우높음 | 20~25점 | 🔴 `#C62828` |
| 높음 | 13~19점 | 🟠 `#E65100` |
| 보통 | 7~12점 | 🟡 `#B8860B` |
| 낮음 | 1~6점 | 🟢 `#2E7D32` |

---

## 🚀 Streamlit/GitHub 이전 가이드

### 1단계: 현재 설정 (규칙기반 엔진, LLM 없음)
`js/jsa_api.js` 상단 설정:
```javascript
const JSA_CONFIG = {
  apiMode: 'fallback',     // ← 규칙기반 엔진 사용
  apiEndpoint: '/api/analyze-jsa',
  gdriveEndpoint: '/api/save-gdrive',
};
```

### 2단계: LLM 백엔드 연동 (Streamlit/FastAPI)
```javascript
const JSA_CONFIG = {
  apiMode: 'llm',          // ← LLM 모드로 변경
  apiEndpoint: 'https://your-streamlit-app.com/api/analyze-jsa',
  gdriveEndpoint: 'https://your-streamlit-app.com/api/save-gdrive',
};
```

### 3단계: FastAPI 백엔드 구현 (Python)
```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import anthropic  # 또는 openai

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])

@app.post("/api/analyze-jsa")
async def analyze_jsa(req: JsaRequest):
    # RAG: pgvector에서 유사 재해사례 Top 5 추출
    rag_cases = await search_similar_cases(req.text, top_k=5)
    
    # LLM 호출 (Claude/GPT-4o)
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        system=req.systemPrompt,
        messages=[{
            "role": "user",
            "content": f"작업속보:\n{req.text}\n\n재해사례DB:\n{rag_cases}"
        }],
        max_tokens=4096,
    )
    return json.loads(response.content[0].text)
```

### 4단계: Google Drive 연동
```python
@app.post("/api/save-gdrive")
async def save_to_gdrive(req: GdriveRequest):
    from googleapiclient.discovery import build
    from google.oauth2.service_account import Credentials
    
    creds = Credentials.from_service_account_file('service-account.json')
    service = build('drive', 'v3', credentials=creds)
    
    file_metadata = {'name': req.filename, 'parents': [GDRIVE_FOLDER_ID]}
    media = MediaIoBaseUpload(io.BytesIO(req.data.encode()), mimetype='application/json')
    file = service.files().create(body=file_metadata, media_body=media).execute()
    return {"fileId": file.get('id')}
```

### 권장 기술 스택
```
Frontend  : 현재 HTML/CSS/JS 그대로 유지
Backend   : Python FastAPI (uvicorn)
LLM       : Claude 3.5 Sonnet 또는 GPT-4o
Embedding : bge-m3 (HuggingFace) 또는 ko-sroberta
Vector DB : pgvector (PostgreSQL) 또는 Chroma
File Store: Google Drive API v3
Deploy    : Streamlit Community Cloud 또는 Railway/Render
```

---

## 🎨 POSCO CI 색상 팔레트

```css
:root {
  --posco-blue:       #05507D;  /* 사이드바, 버튼, 헤더 */
  --posco-light-blue: #00A5E5;  /* 링크, 호버, 활성 탭 */
  --posco-dark-gray:  #4B5151;  /* 본문 텍스트 */
  --posco-light-gray: #BDBDBA;  /* 구분선, 비활성 */
  --posco-off-white:  #F5F7FA;  /* 페이지 배경 */
  /* JSA 위험도 전용 */
  --risk-very-high:   #C62828;
  --risk-high:        #E65100;
  --risk-medium:      #F9A825;
  --risk-low:         #2E7D32;
}
```

---

## 💾 LocalStorage 키 목록

| 키 | 형식 | 설명 |
|----|------|------|
| `themeMode` | `"light"` \| `"dark"` | 다크모드 설정 |
| `sg_session` | JSON | 로그인 세션 |
| `jsa_history` | JSON Array | JSA 분석 이력 (최대 30건) |
| `jsa_analysis_cache` | JSON Object | 동일 텍스트 캐시 (최대 20건) |
| `jsaHistory` | JSON Array | JSA v1 레거시 이력 |

---

## 🔌 스크립트 로드 순서

```html
<script src="js/theme.js"></script>       <!-- FOUC 방지 (즉시 실행) -->
<script src="js/constants.js"></script>    <!-- 전역 상수 -->
<script src="js/law_api.js"></script>      <!-- 법제처 API -->
<script src="js/accident_db.js"></script>  <!-- 재해사례 DB (ACCIDENT_CASES) -->
<script src="js/jsa_api.js"></script>      <!-- ★ JSA 분석 엔진 -->
<script src="js/jsa.js"></script>          <!-- JSA UI 컨트롤러 -->
<script src="js/auth.js"></script>
<script src="js/data.js"></script>
...
```

---

## 📋 미완료 / 향후 개발 권장

| 항목 | 우선순위 | 비고 |
|------|----------|------|
| LLM 백엔드 연동 | ★★★ | Streamlit 이전 후 `JSA_CONFIG.apiMode='llm'` 설정 |
| pgvector 재해사례 DB | ★★★ | 현재 15건 → 수백건으로 확장 |
| Google Drive 자동 저장 | ★★☆ | 현재 JSON 다운로드만 지원 |
| 작업허가서 PDF 서버 생성 | ★★☆ | 현재 브라우저 인쇄 활용 |
| 사용자별 이력 클라우드 동기화 | ★☆☆ | 현재 LocalStorage만 |
| 모바일 앱 (PWA) | ★☆☆ | Service Worker 추가 필요 |

---

*SafeGuard Pro v5.4 — 2026.05.19 기준*
