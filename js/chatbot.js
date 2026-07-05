/* =============================================
   SafeGuard Pro - 챗봇 로직 v3.1
   법령 챗봇: 조문 DB 키워드 매칭 + 구조화 응답
   유권해석 챗봇: 하이브리드 검색 + 구조화 응답
   ============================================= */

/* ─────────────────────────────────────────────
   공통 유틸리티
   ───────────────────────────────────────────── */
function scrollToBottom(windowId) {
  const el = document.getElementById(windowId);
  if (el) { el.scrollTop = el.scrollHeight; }
}

function getTimeStr() {
  const now = new Date();
  return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function setTyping(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? 'flex' : 'none';
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function handleChatKeydown(e, type) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (type === 'law') sendLawChat();
    else if (type === 'guideline') sendGuidelineChat();
  } else {
    setTimeout(() => autoResize(e.target), 0);
  }
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/* ─────────────────────────────────────────────
   메시지 DOM 렌더링
   ───────────────────────────────────────────── */
function appendUserMessage(windowId, text) {
  const win = document.getElementById(windowId);
  if (!win) return;
  const div = document.createElement('div');
  div.className = 'chat-msg user-msg';
  div.innerHTML = `
    <div class="msg-avatar user-avatar"><i class="fas fa-user"></i></div>
    <div class="msg-bubble user-bubble">
      <p>${escapeHtml(text)}</p>
      <div class="msg-time-right">${getTimeStr()}</div>
    </div>`;
  win.appendChild(div);
  // 스크롤
  win.scrollTop = win.scrollHeight;
}

function appendAiMessage(windowId, html, avatarClass) {
  const win = document.getElementById(windowId);
  if (!win) return;
  const isGuideline = avatarClass && avatarClass.includes('guideline');
  const div = document.createElement('div');
  div.className = 'chat-msg ai-msg';
  div.innerHTML = `
    <div class="msg-avatar ${avatarClass || 'ai-avatar'}">
      <i class="${isGuideline ? 'fas fa-user-tie' : 'fas fa-robot'}"></i>
    </div>
    <div class="msg-bubble ai-bubble">
      ${html}
      <div class="msg-time-left">${getTimeStr()}</div>
    </div>`;
  win.appendChild(div);
  // 부드러운 스크롤
  requestAnimationFrame(() => { win.scrollTop = win.scrollHeight; });
}

/* ─────────────────────────────────────────────
   ① 법령 챗봇 (API 실시간 연동 v2.0)
   ───────────────────────────────────────────── */
let lawIsTyping = false;

/**
 * sendLawChat — 3단계 처리:
 *   1) API 호출 시도 (law_api.js)
 *   2) 성공 → buildLawApiResponse() → 실시간 배지
 *   3) 실패 → law_db.js fallback → 오프라인 배지
 */
async function sendLawChat() {
  if (lawIsTyping) return;
  const input = document.getElementById('lawChatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  if (text.length < 2) {
    showToast('warning', '2글자 이상 질문을 입력해 주세요.');
    return;
  }

  appendUserMessage('lawChatWindow', text);
  input.value = '';
  input.style.height = 'auto';

  lawIsTyping = true;
  setTyping('lawTyping', true);
  scrollToBottom('lawChatWindow');

  let html;
  try {
    /* ── 1단계: API 호출 ── */
    if (typeof searchLawByQuery === 'function') {
      const apiResult = await searchLawByQuery(text);

      if (apiResult.source === 'api' && apiResult.articles.length > 0) {
        /* ── 2단계: 실시간 데이터로 응답 ── */
        html = buildLawApiResponse(apiResult.articles, text, apiResult.lawInfo);
        setLawApiStatus('online');
      } else {
        /* API 성공했지만 조문 매칭 없음 → 오프라인 DB 보충 */
        throw new Error('api_no_match');
      }
    } else {
      throw new Error('law_api_not_loaded');
    }
  } catch (apiErr) {
    /* ── 3단계: 오프라인 폴백 (law_db.js) ── */
    if (apiErr.message !== 'api_no_match') {
      setLawApiStatus('offline');
    }
    try {
      let results = [];
      if (typeof searchLawDatabase === 'function') {
        results = searchLawDatabase(text);
      }
      if (results && results.length > 0) {
        html = buildLawResponse(results, true);   // true = 오프라인 배지
      } else {
        html = buildLawNotFoundResponse(text, apiErr.message === 'api_no_match');
      }
    } catch (dbErr) {
      console.error('[Law Chatbot] DB 오류:', dbErr);
      html = buildErrorResponse();
    }
  }

  setTyping('lawTyping', false);
  appendAiMessage('lawChatWindow', html, 'ai-avatar');
  lawIsTyping = false;
  scrollToBottom('lawChatWindow');
}

/* ─────────────────────────────────────────────
   법령 응답 빌더 — API 실시간 결과용
   ───────────────────────────────────────────── */
function buildLawApiResponse(articles, query, lawInfo) {
  const count   = articles.length;
  const today   = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
  const lawName = lawInfo && (lawInfo['법령명'] || lawInfo['법령명_한글'] || '');

  let html = `
    <div class="law-search-meta law-api-meta">
      <i class="fas fa-satellite-dish"></i>
      법제처 실시간 데이터에서 <strong>${count}개</strong>의 관련 조문을 찾았습니다.
      ${lawName ? `<span class="law-api-lawname">📖 ${escapeHtml(lawName)}</span>` : ''}
    </div>`;

  articles.forEach(({ art, joNo, joTitle, joBody, mapping }, idx) => {
    const isFirst    = idx === 0;
    const shortName  = mapping ? mapping.short : '';
    const articleNum = joNo ? `제${joNo}조` : '';
    const title      = joTitle || '';

    // 항(項) 배열 처리
    let bodyHtml = '';
    const items = art['항'] || art['조문내용'] || null;
    if (Array.isArray(items)) {
      bodyHtml = items.map(item => {
        const no  = item['항번호'] || '';
        const txt = item['항내용'] || item['내용'] || '';
        return `<p class="law-para">${no ? `<strong>제${no}항</strong> ` : ''}${escapeHtml(txt)}</p>`;
      }).join('');
    } else {
      bodyHtml = `<p class="law-para">${escapeHtml(joBody || '조문 내용을 표시할 수 없습니다.')}</p>`;
    }

    html += `
    <div class="law-result-block ${isFirst ? 'law-result-primary' : 'law-result-secondary'}">
      <div class="law-result-divider"></div>
      <div class="law-result-header">
        <span class="law-badge-tag">${escapeHtml(shortName)}</span>
        <span class="law-article-tag">${escapeHtml(articleNum)}</span>
        ${isFirst
          ? '<span class="law-best-tag"><i class="fas fa-star"></i> 최적 결과</span>'
          : `<span class="law-idx-tag">${idx + 1}번째 결과</span>`}
        <span class="law-realtime-badge"><i class="fas fa-bolt"></i> 실시간</span>
      </div>

      <div class="law-section">
        <div class="law-section-label"><i class="fas fa-thumbtack"></i> 관련 법령</div>
        <div class="law-section-body law-ref-text">
          📌 ${escapeHtml(mapping ? mapping.full : '')} ${escapeHtml(articleNum)}
          ${title ? `&nbsp;「${escapeHtml(title)}」` : ''}
        </div>
      </div>

      <div class="law-section">
        <div class="law-section-label"><i class="fas fa-file-alt"></i> 조문 내용</div>
        <div class="law-section-body law-content-text api-content">
          ${bodyHtml}
        </div>
      </div>

      <div class="law-footer">
        <i class="fas fa-satellite-dish" style="font-size:0.65rem;"></i>
        출처: 국가법령정보센터
        <a href="https://www.law.go.kr" target="_blank" rel="noopener" class="law-link">www.law.go.kr</a>
      </div>
    </div>`;
  });

  // 실시간 데이터 배지
  html += `
    <div class="law-data-badge law-data-realtime">
      <i class="fas fa-satellite-dish"></i>
      📡 실시간 법령 데이터 (업데이트: ${escapeHtml(today)})
    </div>
    <div class="law-more-tip">
      <i class="fas fa-info-circle"></i>
      출처: <a href="https://www.law.go.kr" target="_blank" rel="noopener" class="law-link">국가법령정보센터 (www.law.go.kr)</a>
      &nbsp;— 법제처 이용약관상 출처 표기 의무
    </div>
    <div class="msg-source">[출처] 법제처 Open API 실시간 | SafeGuard Pro v5.1</div>`;

  return html;
}

/* ─────────────────────────────────────────────
   법령 응답 빌더 — 오프라인 DB용 (law_db.js)
   ───────────────────────────────────────────── */
function buildLawResponse(results, isOffline = false) {
  const count = results.length;
  let html = `
    <div class="law-search-meta">
      <i class="fas fa-database"></i>
      법령 데이터베이스에서 <strong>${count}개</strong>의 관련 조문을 찾았습니다.
    </div>`;

  results.forEach((item, idx) => {
    const isFirst = idx === 0;
    html += `
    <div class="law-result-block ${isFirst ? 'law-result-primary' : 'law-result-secondary'}">
      <div class="law-result-divider"></div>

      <div class="law-result-header">
        <span class="law-badge-tag">${escapeHtml(item.lawShort)}</span>
        <span class="law-article-tag">${escapeHtml(item.article)}</span>
        ${isFirst
          ? '<span class="law-best-tag"><i class="fas fa-star"></i> 최적 결과</span>'
          : `<span class="law-idx-tag">${idx + 1}번째 결과</span>`}
      </div>

      <div class="law-section">
        <div class="law-section-label">
          <i class="fas fa-thumbtack"></i> 관련 법령
        </div>
        <div class="law-section-body law-ref-text">
          📌 ${escapeHtml(item.law)} ${escapeHtml(item.article)} &nbsp;「${escapeHtml(item.title)}」
        </div>
      </div>

      <div class="law-section">
        <div class="law-section-label">
          <i class="fas fa-file-alt"></i> 조문 내용
        </div>
        <div class="law-section-body law-content-text">
          ${escapeHtml(item.content)}
        </div>
      </div>

      <div class="law-section">
        <div class="law-section-label">
          <i class="fas fa-lightbulb"></i> 실무 포인트
        </div>
        <div class="law-practice-grid">
          <div class="law-practice-item">
            <div class="law-practice-key">▸ 적용 대상</div>
            <div class="law-practice-val">${escapeHtml(item.practicePoints.target)}</div>
          </div>
          <div class="law-practice-item law-practice-penalty">
            <div class="law-practice-key penalty-key">▸ 위반 시 제재</div>
            <div class="law-practice-val penalty-val">${escapeHtml(item.practicePoints.penalty)}</div>
          </div>
          <div class="law-practice-item">
            <div class="law-practice-key">▸ 주의사항</div>
            <div class="law-practice-val">${escapeHtml(item.practicePoints.caution)}</div>
          </div>
        </div>
      </div>

      <div class="law-footer">
        <i class="fas fa-external-link-alt" style="font-size:0.65rem;"></i>
        출처: 국가법령정보센터
        <a href="https://www.law.go.kr" target="_blank" rel="noopener" class="law-link">law.go.kr</a>
        &nbsp;|&nbsp; 기준일: 2026.01.01
      </div>
    </div>`;
  });

  if (count > 1) {
    html += `
    <div class="law-more-tip">
      <i class="fas fa-info-circle"></i>
      <a href="https://www.law.go.kr" target="_blank" rel="noopener" class="law-link">국가법령정보센터(law.go.kr)</a>에서
      전문 조문을 직접 확인하시기를 권장드립니다.
    </div>`;
  }

  // 오프라인 배지
  html += `
    <div class="law-data-badge ${isOffline ? 'law-data-offline' : 'law-data-offline'}">
      <i class="fas fa-database"></i>
      📦 오프라인 데이터 (기준: 2026-04)
    </div>
    <div class="msg-source">[출처] SafeGuard Pro 법령 DB (오프라인) | 조문 40개</div>`;
  return html;
}

/* 법령 미발견 응답 */
function buildLawNotFoundResponse(query, apiTried = false) {
  const apiNote = apiTried
    ? `<li>실시간 API와 오프라인 DB 모두 검색했으나 결과가 없습니다.</li>`
    : '';
  return `
    <div class="law-not-found">
      <div class="law-not-found-icon"><i class="fas fa-search-minus"></i></div>
      <div class="law-not-found-title">정확한 법령 조문을 찾지 못했습니다.</div>
      <div class="law-not-found-desc">
        <strong>"${escapeHtml(query)}"</strong>에 해당하는 조문을 데이터베이스에서 찾을 수 없습니다.<br>
        국가법령정보센터(law.go.kr)에서 직접 확인하시거나, 질문을 구체적으로 다시 입력해주세요.
      </div>
      <div class="law-not-found-tips">
        <div class="tip-title"><i class="fas fa-lightbulb"></i> 검색 팁</div>
        <ul>
          ${apiNote}
          <li>법령명 + 핵심 키워드 조합 예: <em>"산업안전보건법 안전관리자"</em></li>
          <li>조문 번호로 검색 예: <em>"제17조"</em>, <em>"42조"</em></li>
          <li>오른쪽 자주 묻는 질문 버튼을 클릭해 보세요</li>
        </ul>
      </div>
      <div class="law-not-found-links">
        <a href="https://www.law.go.kr" target="_blank" rel="noopener" class="law-ext-btn">
          <i class="fas fa-external-link-alt"></i> 국가법령정보센터
        </a>
        <a href="tel:1350" class="law-ext-btn law-ext-secondary">
          <i class="fas fa-phone"></i> 고용노동부 1350
        </a>
      </div>
    </div>
    <div class="law-data-badge law-data-offline">
      <i class="fas fa-database"></i>
      📦 오프라인 데이터 (기준: 2026-04)
    </div>
    <div class="msg-source">[출처] SafeGuard Pro 법령 DB (오프라인) | 조문 40개</div>`;
}

/* 에러 응답 */
function buildErrorResponse() {
  return `
    <div class="law-not-found">
      <div class="law-not-found-icon"><i class="fas fa-exclamation-triangle" style="color:var(--warning);"></i></div>
      <div class="law-not-found-title">일시적 오류가 발생했습니다.</div>
      <div class="law-not-found-desc">
        잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의하세요.
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────
   ② 유권해석 챗봇 (강화)
   ───────────────────────────────────────────── */
let guidelineIsTyping = false;
let currentCategory = 'all';

function filterCategory() {
  const sel = document.getElementById('guidelineCategory');
  if (!sel) return;
  currentCategory = sel.value;
  const catName = sel.options[sel.selectedIndex].text;
  if (currentCategory !== 'all') {
    showToast('info', `🔍 "${catName.replace(/^[^\w가-힣]+/, '').trim()}" 카테고리로 필터링됩니다.`);
  } else {
    showToast('info', '🔍 전체 유권해석 DB를 검색합니다.');
  }
}

function sendGuidelineChat() {
  if (guidelineIsTyping) return;
  const input = document.getElementById('guidelineChatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  if (text.length < 2) {
    showToast('warning', '2글자 이상 질문을 입력해 주세요.');
    return;
  }

  appendUserMessage('guidelineChatWindow', text);
  input.value = '';
  input.style.height = 'auto';

  guidelineIsTyping = true;
  setTyping('guidelineTyping', true);
  scrollToBottom('guidelineChatWindow');

  const thinkDelay = Math.min(700 + text.length * 14, 2400);

  setTimeout(() => {
    try {
      let results = [];
      if (typeof searchGuidelineDatabase === 'function') {
        results = searchGuidelineDatabase(text, currentCategory);
      }
      let html;
      if (results && results.length > 0) {
        html = buildGuidelineResponse(results);
      } else {
        html = buildGuidelineNotFoundResponse(text, currentCategory);
      }
      setTyping('guidelineTyping', false);
      appendAiMessage('guidelineChatWindow', html, 'ai-avatar guideline-avatar');
    } catch (err) {
      console.error('[Guideline Chatbot] 오류:', err);
      setTyping('guidelineTyping', false);
      appendAiMessage('guidelineChatWindow', buildErrorResponse(), 'ai-avatar guideline-avatar');
    }
    guidelineIsTyping = false;
    scrollToBottom('guidelineChatWindow');
  }, thinkDelay);
}

/* 유권해석 응답 HTML 빌더 */
function buildGuidelineResponse(results) {
  const count = results.length;
  let html = `
    <div class="law-search-meta guideline-meta">
      <i class="fas fa-database"></i>
      유권해석 DB에서 <strong>${count}개</strong>의 관련 해석을 찾았습니다.
    </div>`;

  results.forEach((item, idx) => {
    const isFirst = idx === 0;
    const notesHtml = (item.practicalNotes || []).map(n => `
      <div class="guideline-note-item">
        <i class="fas fa-chevron-right"></i>
        <span>${escapeHtml(n)}</span>
      </div>`).join('');

    html += `
    <div class="guideline-result-block ${isFirst ? 'guideline-result-primary' : 'guideline-result-secondary'}">
      <div class="law-result-divider"></div>

      <div class="guideline-result-header">
        <div class="guideline-header-top">
          <span class="guideline-source-tag">
            <i class="${item.sourceIcon || 'fas fa-stamp'}"></i> ${escapeHtml(item.source)}
          </span>
          <span class="guideline-category-tag">${escapeHtml(item.category)}</span>
          ${isFirst ? '<span class="law-best-tag"><i class="fas fa-star"></i> 최적 결과</span>' : ''}
        </div>
        <div class="guideline-meta-row">
          <span><i class="fas fa-hashtag"></i> 해석번호: <strong>${escapeHtml(item.number)}</strong></span>
          <span><i class="fas fa-calendar-alt"></i> 날짜: <strong>${escapeHtml(item.date)}</strong></span>
        </div>
      </div>

      <div class="guideline-block-title">📋 유권해석 결과</div>

      <div class="guideline-section">
        <div class="guideline-section-label question-label">
          <i class="fas fa-question-circle"></i> 질의 요지
        </div>
        <div class="guideline-section-body question-body">
          ${escapeHtml(item.question)}
        </div>
      </div>

      <div class="guideline-section">
        <div class="guideline-section-label answer-label">
          <i class="fas fa-check-circle"></i> 회신 요지
        </div>
        <div class="guideline-section-body answer-body">
          ${escapeHtml(item.answer)}
        </div>
      </div>

      <div class="guideline-section">
        <div class="guideline-section-label caution-label">
          <i class="fas fa-exclamation-triangle"></i> 실무 적용 시 주의사항
        </div>
        <div class="guideline-notes">
          ${notesHtml}
        </div>
      </div>

      <div class="guideline-footer">
        <i class="fas fa-info-circle"></i>
        본 해석은 참고용입니다. 최종 법적 판단은 관할 기관의 공식 회신을 따르시기 바랍니다.
      </div>
      <div class="law-result-divider"></div>
    </div>`;
  });

  html += `<div class="msg-source">[출처] SafeGuard Pro 유권해석 AI v3.1 | DB: 제철 특화 유권해석·가이드 ${(typeof GUIDELINE_DATABASE!=='undefined'?GUIDELINE_DATABASE.length:0)}건</div>`;
  return html;
}

/* 유권해석 미발견 응답 */
function buildGuidelineNotFoundResponse(query, category) {
  const catText = (category && category !== 'all') ? ` (필터: ${category})` : '';
  const filterHint = (category && category !== 'all')
    ? `<li>카테고리 필터를 <em>'전체'</em>로 변경 후 재검색</li>`
    : '';
  return `
    <div class="law-not-found guideline-not-found">
      <div class="law-not-found-icon"><i class="fas fa-search-minus"></i></div>
      <div class="law-not-found-title">관련 유권해석을 찾지 못했습니다.</div>
      <div class="law-not-found-desc">
        <strong>"${escapeHtml(query)}"${escapeHtml(catText)}</strong>에 대한 유권해석을 찾지 못했습니다.<br>
        다른 키워드로 검색하시거나 카테고리 필터를 변경해보세요.
      </div>
      <div class="law-not-found-tips">
        <div class="tip-title"><i class="fas fa-lightbulb"></i> 검색 팁</div>
        <ul>
          <li>핵심 용어로 검색: <em>유해위험방지계획서, 위험성평가, 타워크레인, 비계, 굴착</em></li>
          ${filterHint}
          <li>오른쪽 자주 묻는 질문을 활용해보세요</li>
          <li>고용노동부, KOSHA 등 발행 기관명과 함께 검색</li>
        </ul>
      </div>
      <div class="law-not-found-links">
        <a href="https://www.kosha.or.kr" target="_blank" rel="noopener" class="law-ext-btn guideline-ext-btn">
          <i class="fas fa-external-link-alt"></i> KOSHA 공식 사이트
        </a>
        <a href="tel:16444544" class="law-ext-btn law-ext-secondary">
          <i class="fas fa-phone"></i> KOSHA 1644-4544
        </a>
      </div>
    </div>
    <div class="msg-source">[출처] SafeGuard Pro 유권해석 AI v3.1 | DB: 제철 특화 유권해석·가이드 ${(typeof GUIDELINE_DATABASE!=='undefined'?GUIDELINE_DATABASE.length:0)}건</div>`;
}

/* ─────────────────────────────────────────────
   FAQ 클릭 (공통)
   ───────────────────────────────────────────── */
function askFaq(type, question) {
  const inputId = type === 'law' ? 'lawChatInput' : 'guidelineChatInput';
  const input = document.getElementById(inputId);
  if (input) {
    input.value = question;
    autoResize(input);
    input.focus();
  }
  // 짧은 딜레이 후 전송 (시각적 피드백)
  setTimeout(() => {
    if (type === 'law') sendLawChat();
    else sendGuidelineChat();
  }, 100);
}

/* ─────────────────────────────────────────────
   웰컴 메시지 빌더 (초기 로드용)
   ───────────────────────────────────────────── */
function buildLawWelcomeMsg() {
  return `
    <p>안녕하세요! 저는 <strong>SafeGuard AI 법령 상담사</strong>입니다.</p>
    <p>법제처 국가법령정보 <strong>실시간 API</strong>를 통해 최신 조문을 검색하고,
    API 연결 불가 시에는 오프라인 DB(<strong>${(typeof LAW_DATABASE!=='undefined'?LAW_DATABASE.length:0)}개 조문</strong>)로 자동 전환됩니다.</p>
    <p>궁금하신 법령 조문을 입력하시거나, 오른쪽 <strong>자주 묻는 질문</strong>을 클릭해보세요.</p>
    <div class="welcome-db-info">
      <div class="db-info-item"><i class="fas fa-satellite-dish"></i> 중대재해처벌법 (실시간)</div>
      <div class="db-info-item"><i class="fas fa-satellite-dish"></i> 산업안전보건법·시행령·시행규칙 (실시간)</div>
      <div class="db-info-item"><i class="fas fa-satellite-dish"></i> 건설기술진흥법 (실시간)</div>
      <div class="db-info-item"><i class="fas fa-database"></i> 오프라인 백업 DB: ${(typeof LAW_DATABASE!=='undefined'?LAW_DATABASE.length:0)}개 조문</div>
    </div>
    <div class="welcome-search-tips">
      <span class="tip-chip"><i class="fas fa-bolt"></i> 실시간 API 검색</span>
      <span class="tip-chip"><i class="fas fa-database"></i> 오프라인 자동 폴백</span>
      <span class="tip-chip"><i class="fas fa-layer-group"></i> 최대 3개 관련 조문 표시</span>
    </div>
    <div class="law-data-badge law-data-realtime" style="margin-top:10px;">
      <i class="fas fa-satellite-dish"></i> 출처: 국가법령정보센터 (www.law.go.kr)
    </div>
    <div class="msg-source">[시스템] SafeGuard Pro 법령 AI v5.1 | 법제처 Open API 연동</div>`;
}

function buildGuidelineWelcomeMsg() {
  return `
    <p>안녕하세요! <strong>인허가 가이드라인 상담 AI</strong>입니다.</p>
    <p>고용노동부·KOSHA·환경부·소방청 등 <strong>제철 인허가·안전 실무 유권해석과 가이드라인 ${(typeof GUIDELINE_DATABASE!=='undefined'?GUIDELINE_DATABASE.length:0)}건</strong>을 기반으로 답변해 드립니다.</p>
    <p>카테고리 필터와 키워드 검색을 결합한 <strong>하이브리드 검색</strong>으로 정확한 결과를 찾아드립니다.</p>
    <div class="guideline-format">
      <span class="format-tag summary"><i class="fas fa-question-circle"></i> 질의 요지</span>
      <span class="format-tag ref"><i class="fas fa-check-circle"></i> 회신 요지</span>
      <span class="format-tag caution"><i class="fas fa-exclamation-triangle"></i> 실무 주의사항</span>
    </div>
    <div class="welcome-db-info">
      <div class="db-info-item"><i class="fas fa-stamp"></i> 유권해석·가이드 ${(typeof GUIDELINE_DATABASE!=='undefined'?GUIDELINE_DATABASE.length:0)}건 (제철 특화)</div>
      <div class="db-info-item"><i class="fas fa-shield-alt"></i> 고용노동부·KOSHA·환경부·소방청 등</div>
    </div>
    <div class="msg-source">[시스템] 유권해석 DB v3.1 | 기준일: 2026.01.01 | 출처: 고용노동부, KOSHA</div>`;
}
