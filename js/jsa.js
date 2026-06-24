/* =============================================
   SafeGuard Pro – JSA 위험성평가 모듈
   js/jsa.js  v1.0
   =============================================
   - 작업일보 입력 → 재해사례 매칭 → 위험도 계산
   - 3단계 JSA 카드 렌더링
   - 재해사례 DB 열람 (필터 + 모달)
   - 분석 이력 LocalStorage 저장 (최대 20건)
   ============================================= */

/* ─────────────────────────────────────────────
   상수
   ───────────────────────────────────────────── */
var JSA_HISTORY_KEY_V1 = 'jsaHistory';  // v1 레거시 키 (jsa_api.js의 'jsa_history'와 분리)
var JSA_MAX_HISTORY = 20;

/* POSCO CI 기반 위험도 설정 (JSA 전용 상태컬러 사용) */
const RISK_CONFIG = {
  '매우높음': { color: '#C62828', bg: 'rgba(198,40,40,0.1)',  border: 'rgba(198,40,40,0.3)',  icon: 'fas fa-radiation',           label: '매우높음' },
  '높음':     { color: '#E65100', bg: 'rgba(230,81,0,0.1)',   border: 'rgba(230,81,0,0.3)',   icon: 'fas fa-exclamation-triangle', label: '높음' },
  '보통':     { color: '#B8860B', bg: 'rgba(249,168,37,0.1)', border: 'rgba(249,168,37,0.3)', icon: 'fas fa-info-circle',          label: '보통' },
  '낮음':     { color: '#2E7D32', bg: 'rgba(46,125,50,0.1)',  border: 'rgba(46,125,50,0.3)',  icon: 'fas fa-check-circle',         label: '낮음' }
};

const ACCIDENT_TYPE_ICONS = {
  '추락': 'fas fa-arrow-down',
  '질식': 'fas fa-lungs',
  '화상': 'fas fa-fire',
  '감전': 'fas fa-bolt',
  '폭발': 'fas fa-bomb',
  '끼임': 'fas fa-cogs',
  '기타': 'fas fa-exclamation'
};

/* ─────────────────────────────────────────────
   JSA 페이지 초기화
   ───────────────────────────────────────────── */
function initJsaPage() {
  renderJsaHistory();
  renderJsaHistoryFromApi();
  updateApiModeBadge();
  updateJsaResultArea('empty');
  // 오늘 날짜 기본값
  const dateEl = document.getElementById('jsaWorkDate');
  if (dateEl && !dateEl.value) {
    const now = new Date();
    dateEl.value = now.toISOString().split('T')[0];
  }
}

/* API 모드 배지 업데이트 */
function updateApiModeBadge() {
  const badge = document.getElementById('jsaApiModeBadge');
  if (!badge || typeof JSA_CONFIG === 'undefined') return;
  if (JSA_CONFIG.apiMode === 'llm') {
    badge.innerHTML = '<i class="fas fa-brain"></i> LLM 분석 모드';
    badge.style.background = 'linear-gradient(135deg, var(--posco-blue), var(--posco-light-blue))';
    badge.style.color = '#fff';
  } else {
    badge.innerHTML = '<i class="fas fa-microchip"></i> 규칙기반 엔진';
    badge.style.background = 'rgba(5,80,125,0.12)';
    badge.style.color = 'var(--posco-blue)';
  }
}

/* ─────────────────────────────────────────────
   탭 전환
   ───────────────────────────────────────────── */
function switchJsaTab(tab) {
  const btnBulletin = document.getElementById('tabBulletin');
  const btnManual   = document.getElementById('tabManual');
  const contBulletin = document.getElementById('tabContentBulletin');
  const contManual   = document.getElementById('tabContentManual');

  if (tab === 'bulletin') {
    btnBulletin?.classList.add('active');
    btnManual?.classList.remove('active');
    if (contBulletin) contBulletin.style.display = '';
    if (contManual)   contManual.style.display   = 'none';
    btnBulletin?.setAttribute('aria-selected', 'true');
    btnManual?.setAttribute('aria-selected', 'false');
  } else {
    btnManual?.classList.add('active');
    btnBulletin?.classList.remove('active');
    if (contManual)   contManual.style.display   = '';
    if (contBulletin) contBulletin.style.display = 'none';
    btnManual?.setAttribute('aria-selected', 'true');
    btnBulletin?.setAttribute('aria-selected', 'false');
  }
}

/* 텍스트 영역 초기화 */
function clearBulletinText() {
  const ta = document.getElementById('jsaBulletinText');
  if (ta) ta.value = '';
  ta?.focus();
}

/* ─────────────────────────────────────────────
   ★ 작업속보 탭 — 분석 시작 (jsa_api.js 연동)
   ───────────────────────────────────────────── */
async function startJsaAnalysis() {
  const text = (document.getElementById('jsaBulletinText')?.value || '').trim();
  if (text.length < 10) {
    if (typeof showToast === 'function') showToast('warning', '분석할 작업속보 내용을 입력해 주세요. (최소 10자)');
    document.getElementById('jsaBulletinText')?.focus();
    return;
  }

  // 로딩 시작
  showJsaLoading(true);
  hideJsaEmptyState();

  try {
    const result = await window.runJsaAnalysis(text, onJsaProgress);
    renderJsaResultNew(result);
    renderJsaCaseDb(result._matchedCases || []);
    renderJsaHistoryFromApi();

    if (typeof showToast === 'function') {
      const fromCache = result._fromCache ? ' (캐시)' : '';
      showToast('success', `✅ 분석 완료${fromCache} — 총 ${result.총작업수}개 작업, 고위험 ${result.고위험작업수}건`);
    }
  } catch (err) {
    console.error('[JSA] 분석 오류:', err);
    if (typeof showToast === 'function') showToast('error', `분석 오류: ${err.message}`);
    showJsaEmptyState();
  } finally {
    showJsaLoading(false);
  }
}

/* 수동 입력 탭 — 기존 로직과 연동 (텍스트로 변환 후 분석) */
async function startManualAnalysis() {
  const workName  = (document.getElementById('jsaWorkName')?.value   || '').trim();
  const workType  = document.getElementById('jsaWorkType')?.value    || '';
  const workLoc   = document.getElementById('jsaWorkLoc')?.value     || '';
  const workerCnt = document.getElementById('jsaWorkerCount')?.value || '';
  const workDate  = document.getElementById('jsaWorkDate')?.value    || '';
  const envFactors = [];
  document.querySelectorAll('.jsa-env-checkbox:checked').forEach(cb => envFactors.push(cb.value));

  if (!workName) { showToast('warning', '작업명을 입력해 주세요.'); return; }
  if (!workType) { showToast('warning', '작업 종류를 선택해 주세요.'); return; }
  if (!workLoc)  { showToast('warning', '작업 장소를 선택해 주세요.'); return; }

  // 수동 입력을 속보 텍스트 형식으로 조합
  const text = [
    `[수동 입력 작업 - ${workDate || new Date().toLocaleDateString('ko-KR')}]`,
    `1. ${workName} (${workerCnt ? workerCnt + '명' : ''})`,
    `   - 장소: ${workLoc}`,
    `   - 작업종류: ${workType}`,
    envFactors.length ? `   - 환경요소: ${envFactors.join(', ')}` : '',
  ].filter(Boolean).join('\n');

  showJsaLoading(true);
  hideJsaEmptyState();

  try {
    const result = await window.runJsaAnalysis(text, onJsaProgress);
    renderJsaResultNew(result);
    renderJsaHistoryFromApi();
    if (typeof showToast === 'function') {
      showToast('success', `✅ 분석 완료 — 위험성 등급: ${result.작업목록[0]?.위험성등급 || '-'}`);
    }
  } catch (err) {
    console.error('[JSA] 분석 오류:', err);
    if (typeof showToast === 'function') showToast('error', `분석 오류: ${err.message}`);
    showJsaEmptyState();
  } finally {
    showJsaLoading(false);
  }
}

/* ─────────────────────────────────────────────
   로딩 UI 제어
   ───────────────────────────────────────────── */
function showJsaLoading(show) {
  const loading = document.getElementById('jsaLoadingSection');
  const result  = document.getElementById('jsaResultSection');
  if (show) {
    if (loading) loading.style.display = 'flex';
    if (result)  result.style.display  = 'none';
    // 버튼 비활성화
    ['jsaAnalyzeBtn', 'jsaManualAnalyzeBtn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 분석 중...'; }
    });
  } else {
    if (loading) loading.style.display = 'none';
    if (result)  result.style.display  = 'block';
    // 버튼 복원
    const b1 = document.getElementById('jsaAnalyzeBtn');
    const b2 = document.getElementById('jsaManualAnalyzeBtn');
    if (b1) { b1.disabled = false; b1.innerHTML = '<i class="fas fa-search-plus"></i> AI 자동 분석'; }
    if (b2) { b2.disabled = false; b2.innerHTML = '<i class="fas fa-bolt"></i> 위험성 분석 시작'; }
  }
}

function hideJsaEmptyState() {
  const empty = document.getElementById('jsaEmptyState');
  if (empty) empty.style.display = 'none';
}

function showJsaEmptyState() {
  const empty = document.getElementById('jsaEmptyState');
  if (empty) empty.style.display = '';
}

/* 진행 콜백 */
function onJsaProgress(step, message, percent) {
  const stepEl = document.getElementById('jsaLoadingStep');
  const fillEl = document.getElementById('jsaProgressFill');
  if (stepEl) stepEl.textContent = message;
  if (fillEl) fillEl.style.width = percent + '%';
}

/* ─────────────────────────────────────────────
   ★ 신규 결과 렌더링 (jsa_api.js 결과용)
   ───────────────────────────────────────────── */
function renderJsaResultNew(data) {
  const section = document.getElementById('jsaResultSection');
  if (!section) return;

  // ── data 유효성 검사 ──────────────────────────────
  if (!data || typeof data !== 'object') {
    console.error('[JSA] renderJsaResultNew: data가 undefined/null입니다.', data);
    if (typeof showToast === 'function') showToast('error', '분석 결과를 받아오지 못했습니다. 다시 시도해 주세요.');
    showJsaEmptyState();
    return;
  }
  if (!Array.isArray(data.작업목록)) {
    console.error('[JSA] renderJsaResultNew: 작업목록 필드가 없습니다.', data);
    if (typeof showToast === 'function') showToast('error', '분석 결과 형식 오류: 작업목록이 없습니다.');
    showJsaEmptyState();
    return;
  }
  // ─────────────────────────────────────────────────

  // 요약 카드 3개
  const avgScore = data.평균위험성점수 || 0;
  const summaryHtml = `
    <div class="jsa-summary-grid">
      <div class="jsa-summary-card">
        <div class="jsa-summary-num">${data.총작업수}</div>
        <div class="jsa-summary-label"><i class="fas fa-clipboard-list"></i> 총 작업 수</div>
      </div>
      <div class="jsa-summary-card jsa-summary-danger">
        <div class="jsa-summary-num">${data.고위험작업수}</div>
        <div class="jsa-summary-label"><i class="fas fa-exclamation-triangle"></i> 고위험 작업</div>
      </div>
      <div class="jsa-summary-card">
        <div class="jsa-summary-num">${avgScore}<span class="jsa-summary-unit">점</span></div>
        <div class="jsa-summary-label"><i class="fas fa-chart-bar"></i> 평균 위험성</div>
      </div>
    </div>`;

  // 작업별 카드
  const workCardsHtml = (data.작업목록 || []).map((w, idx) => {
    const rc = RISK_CONFIG[w.위험성등급] || RISK_CONFIG['낮음'];
    const hazardTags = (w.예상위험요인 || []).map(h =>
      `<span class="jsa-hazard-tag">${escHtml(h)}</span>`
    ).join('');

    const caseHtml = (w.유사재해사례 || []).slice(0, 2).map(c => `
      <div class="jsa-matched-case">
        <div class="jsa-matched-case-title"><i class="fas fa-database"></i> ${escHtml(c.사고개요 || '').slice(0, 60)}...</div>
        <div class="jsa-matched-case-body">
          <span><b>원인:</b> ${escHtml(c.원인 || '').slice(0,50)}</span>
          <span><b>교훈:</b> ${escHtml(c.교훈 || '').slice(0,50)}</span>
        </div>
      </div>`).join('') || '<div class="jsa-no-case">매칭된 재해사례 없음</div>';

    const measures = w.안전조치 || {};
    const measuresHtml = `
      <div class="jsa-measures-grid">
        ${[['작업전','fas fa-clipboard-check','작업 전'],['작업중','fas fa-hard-hat','작업 중'],['작업후','fas fa-broom','작업 후']].map(([key, icon, label]) => `
          <div class="jsa-measure-col">
            <div class="jsa-measure-header"><i class="${icon}"></i> ${label}</div>
            <ul class="jsa-measure-list">
              ${(measures[key] || []).map(m => `<li>${escHtml(m)}</li>`).join('') || '<li>기본 안전수칙 준수</li>'}
            </ul>
          </div>`).join('')}
      </div>`;

    const ppeHtml = (w.필수보호구 || []).map(p => `<span class="jsa-ppe-tag"><i class="fas fa-hard-hat"></i> ${escHtml(p)}</span>`).join('');
    const lawHtml = (w.관련법규 || []).map(l => `<li><i class="fas fa-gavel"></i> ${escHtml(l)}</li>`).join('');

    return `
    <div class="jsa-work-card" id="jsaWork${idx}" style="border-left: 4px solid ${rc.color};">
      <div class="jsa-work-card-header" onclick="toggleWorkCard(${idx})" style="cursor:pointer;">
        <div class="jsa-work-card-title">
          <span class="jsa-work-num">${w.순번}</span>
          <span class="jsa-work-name">${escHtml(w.작업명)}</span>
          ${w.작업장소 ? `<span class="jsa-work-loc"><i class="fas fa-map-marker-alt"></i> ${escHtml(w.작업장소)}</span>` : ''}
        </div>
        <div class="jsa-work-card-right">
          <span class="jsa-risk-badge-v2" style="background:${rc.bg};color:${rc.color};border:1px solid ${rc.border};">
            <i class="${rc.icon}"></i> ${rc.label}
          </span>
          <span class="jsa-work-score" style="color:${rc.color};">${w.위험성점수}점</span>
          <i class="fas fa-chevron-down jsa-work-toggle-icon" id="jsaWorkIcon${idx}"></i>
        </div>
      </div>
      <div class="jsa-work-hazards">${hazardTags}</div>
      <div class="jsa-work-detail" id="jsaWorkDetail${idx}" style="display:none;">
        ${w.권고사항 ? `<div class="jsa-recommendation"><i class="fas fa-lightbulb"></i> ${escHtml(w.권고사항)}</div>` : ''}

        <div class="jsa-detail-section">
          <div class="jsa-detail-title"><i class="fas fa-exclamation-triangle"></i> 위험성 분석</div>
          <div class="jsa-risk-matrix">
            <span>빈도 <b>${w.빈도}</b></span>
            <span class="jsa-matrix-x">×</span>
            <span>강도 <b>${w.강도}</b></span>
            <span class="jsa-matrix-eq">=</span>
            <span class="jsa-matrix-result" style="color:${rc.color}"><b>${w.위험성점수}점 (${w.위험성등급})</b></span>
          </div>
        </div>

        <div class="jsa-detail-section">
          <div class="jsa-detail-title"><i class="fas fa-database"></i> 유사 재해사례 (RAG 매칭)</div>
          ${caseHtml}
        </div>

        <div class="jsa-detail-section">
          <div class="jsa-detail-title"><i class="fas fa-shield-alt"></i> 단계별 안전조치</div>
          ${measuresHtml}
        </div>

        ${ppeHtml ? `
        <div class="jsa-detail-section">
          <div class="jsa-detail-title"><i class="fas fa-hard-hat"></i> 필수 보호구</div>
          <div class="jsa-ppe-list">${ppeHtml}</div>
        </div>` : ''}

        ${lawHtml ? `
        <div class="jsa-detail-section">
          <div class="jsa-detail-title"><i class="fas fa-gavel"></i> 관련 법규</div>
          <ul class="jsa-law-list">${lawHtml}</ul>
        </div>` : ''}

        <div class="jsa-card-actions">
          <button class="jsa-permit-btn" onclick="generateWorkPermit(${idx})">
            <i class="fas fa-file-signature"></i> 작업허가서 생성
          </button>
        </div>
      </div>
    </div>`;
  }).join('');

  // 종합의견
  const opinionHtml = data.종합의견 ? `
    <div class="jsa-overall-opinion">
      <div class="jsa-opinion-header"><i class="fas fa-comment-alt"></i> 종합의견</div>
      <div class="jsa-opinion-body">${escHtml(data.종합의견)}</div>
    </div>` : '';

  // 액션 버튼
  const actionBtns = `
    <div class="jsa-action-btns">
      <button class="jsa-print-btn" onclick="window.print()">
        <i class="fas fa-print"></i> 인쇄
      </button>
      <button class="jsa-pdf-btn" onclick="jsaPdfDownload('JSA_분석결과')">
        <i class="fas fa-file-pdf"></i> PDF 저장
      </button>
      <button class="jsa-json-btn" onclick="downloadJsaJson()" title="JSON 다운로드 (Google Drive 연동용)">
        <i class="fas fa-download"></i> JSON 내보내기
      </button>
    </div>`;

  // 분석 방식 배지
  const modeBadge = data.분석방식 === 'llm'
    ? `<span class="jsa-mode-tag jsa-mode-llm"><i class="fas fa-brain"></i> LLM 분석</span>`
    : `<span class="jsa-mode-tag jsa-mode-rule"><i class="fas fa-microchip"></i> 규칙기반</span>`;

  section.innerHTML = `
    <div class="jsa-result-wrap">
      <div class="jsa-result-topbar">
        <div class="jsa-result-topbar-left">
          <i class="fas fa-shield-alt" style="color:var(--posco-light-blue)"></i>
          <strong>JSA 분석 결과</strong>
          <span class="jsa-datetime">${escHtml(data.분석일시)}</span>
          ${modeBadge}
        </div>
        ${actionBtns}
      </div>
      ${summaryHtml}
      <div class="jsa-work-cards-section">
        <div class="jsa-section-title">
          <i class="fas fa-list-alt"></i> 작업별 위험성평가 결과 <span class="jsa-section-sub">(위험도 높은 순)</span>
        </div>
        <div class="jsa-work-cards">${workCardsHtml}</div>
      </div>
      ${opinionHtml}
    </div>`;

  section.style.display = 'block';

  // 저장용 전역 변수
  window._lastJsaResult = data;
}

/* 작업 카드 펼치기/접기 */
function toggleWorkCard(idx) {
  const detail = document.getElementById(`jsaWorkDetail${idx}`);
  const icon   = document.getElementById(`jsaWorkIcon${idx}`);
  if (!detail) return;
  const isOpen = detail.style.display !== 'none';
  detail.style.display = isOpen ? 'none' : 'block';
  if (icon) icon.className = isOpen
    ? 'fas fa-chevron-down jsa-work-toggle-icon'
    : 'fas fa-chevron-up jsa-work-toggle-icon';
}

/* 작업허가서 생성 (간단한 인쇄용 출력) */
function generateWorkPermit(idx) {
  const data = window._lastJsaResult;
  if (!data) return;
  const w = data.작업목록[idx];
  if (!w) return;

  const measures = w.안전조치 || {};
  const printWin = window.open('', '_blank');
  printWin.document.write(`
    <html><head><title>작업허가서 - ${w.작업명}</title>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Malgun Gothic', sans-serif; padding: 20px; font-size: 13px; }
      h1 { text-align: center; border-bottom: 2px solid #05507D; padding-bottom: 10px; color: #05507D; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      td, th { border: 1px solid #ddd; padding: 8px; }
      th { background: #05507D; color: white; }
      .risk { font-weight: bold; color: ${RISK_CONFIG[w.위험성등급]?.color || '#333'}; }
      ul { margin: 0; padding-left: 16px; }
    </style></head><body>
    <h1>작 업 허 가 서 (JSA)</h1>
    <table>
      <tr><th>작업명</th><td>${w.작업명}</td><th>작업장소</th><td>${w.작업장소}</td></tr>
      <tr><th>작업인원</th><td>${w.작업인원}명</td><th>분석일시</th><td>${data.분석일시}</td></tr>
      <tr><th>위험성 등급</th><td class="risk">${w.위험성등급} (${w.위험성점수}점)</td><th>위험요인</th><td>${(w.예상위험요인||[]).join(', ')}</td></tr>
    </table>
    <table>
      <tr><th>작업 전</th><th>작업 중</th><th>작업 후</th></tr>
      <tr>
        <td><ul>${(measures.작업전||[]).map(m=>`<li>${m}</li>`).join('')}</ul></td>
        <td><ul>${(measures.작업중||[]).map(m=>`<li>${m}</li>`).join('')}</ul></td>
        <td><ul>${(measures.작업후||[]).map(m=>`<li>${m}</li>`).join('')}</ul></td>
      </tr>
    </table>
    <table>
      <tr><th>필수 보호구</th><td>${(w.필수보호구||[]).join(', ')}</td></tr>
      <tr><th>관련 법규</th><td>${(w.관련법규||[]).join('<br>')}</td></tr>
    </table>
    <table>
      <tr><th>작업자 서명</th><td style="height:50px"></td><th>관리감독자 서명</th><td style="height:50px"></td></tr>
    </table>
    <script>window.print();window.close();<\/script>
    </body></html>`);
  printWin.document.close();
}

/* JSON 내보내기 (Google Drive 연동용) */
function downloadJsaJson() {
  const data = window._lastJsaResult;
  if (!data) { if (typeof showToast === 'function') showToast('warning', '분석 결과가 없습니다.'); return; }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `JSA_${data.분석일시.replace(/[: ]/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
  if (typeof showToast === 'function') showToast('success', 'JSON 파일이 다운로드되었습니다. Google Drive에 업로드하세요.');
}

/* ─────────────────────────────────────────────
   분석 이력 렌더링 (jsa_api.js 이력 활용)
   ───────────────────────────────────────────── */
function renderJsaHistoryFromApi() {
  const container = document.getElementById('jsaHistoryList');
  if (!container) return;
  const history = typeof getJsaHistory === 'function' ? getJsaHistory() : [];

  if (!history.length) {
    container.innerHTML = '<div class="jsa-history-empty"><i class="fas fa-history"></i> 분석 이력이 없습니다.</div>';
    return;
  }

  container.innerHTML = history.map(h => {
    // jsa_api.js 형식과 기존 jsa.js 형식 모두 처리
    const riskLevel = h.result?.작업목록?.[0]?.위험성등급 || h.riskLevel || '낮음';
    const totalWorks = h.총작업수 || 1;
    const highRisk = h.고위험작업수 || 0;
    const rc = RISK_CONFIG[riskLevel] || RISK_CONFIG['낮음'];
    const dt = h.분석일시 || (h.analyzedAt ? new Date(h.analyzedAt).toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}) : '-');
    const preview = h.inputPreview || h.workName || '미상';

    return `
    <div class="jsa-history-item" onclick="replayHistoryItem('${h.id}')">
      <div class="jsa-history-risk-dot" style="background:${rc.color};" title="${rc.label}"></div>
      <div class="jsa-history-body">
        <div class="jsa-history-name">${escHtml(preview)}</div>
        <div class="jsa-history-meta">${escHtml(dt)} · 작업 ${totalWorks}건 · 고위험 ${highRisk}건</div>
      </div>
      <span class="jsa-history-badge" style="background:${rc.bg};color:${rc.color};">${rc.label}</span>
    </div>`;
  }).join('');
}

function replayHistoryItem(id) {
  const history = typeof getJsaHistory === 'function' ? getJsaHistory() : [];
  const h = history.find(x => String(x.id) === String(id));
  if (!h || !h.result) return;
  renderJsaResultNew(h.result);
  document.getElementById('jsaResultSection')?.scrollIntoView({ behavior: 'smooth' });
  if (typeof showToast === 'function') showToast('info', `📋 이전 분석 결과를 불러왔습니다.`);
}

/* ─────────────────────────────────────────────
   위험도 점수 계산
   ───────────────────────────────────────────── */
/* jsa_api.js의 calcRiskScore(hazards) 와 충돌 방지 → _legacy 접미사 */
function calcRiskScore_legacy(matchedCases, selectedEnvFactors) {
  let score = 0;
  matchedCases.forEach(c => {
    score += ((c.victims && c.victims.death)   || 0) * 5;
    score += ((c.victims && c.victims.serious) || 0) * 3;
    score += ((c.victims && c.victims.minor)   || 0) * 1;
    // 환경 요소 일치 수
    const envMatch = (c.environmentFactors || []).filter(ef => selectedEnvFactors.includes(ef)).length;
    score += envMatch * 2;
  });
  return score;
}

function scoreToRiskLevel_legacy(score) {
  if (score >= 15) return '매우높음';
  if (score >= 10) return '높음';
  if (score >= 5)  return '보통';
  return '낮음';
}

/* ─────────────────────────────────────────────
   재해사례 매칭
   ───────────────────────────────────────────── */
/* jsa_api.js 와 충돌 방지 → _legacy 접미사 */
function matchAccidentCases_legacy(workType, workLocation, envFactors) {
  if (typeof ACCIDENT_CASES === 'undefined') return [];
  return ACCIDENT_CASES.filter(c => {
    const typeMatch   = c.workType     === workType;
    const locMatch    = c.workLocation === workLocation;
    const envMatch    = envFactors.some(ef => (c.environmentFactors || []).includes(ef));
    return typeMatch || locMatch || envMatch;
  });
}

/* ─────────────────────────────────────────────
   JSA 3단계 통합 데이터 빌드
   ───────────────────────────────────────────── */
/* jsa_api.js 와 충돌 방지 → _legacy 접미사 */
function buildJsaStepsData_legacy(matchedCases, workType, envFactors) {
  const stepNames = ['작업 전 준비', '본 작업 수행', '작업 후 정리'];
  const stepIcons = ['fas fa-clipboard-check', 'fas fa-hard-hat', 'fas fa-broom'];

  return stepNames.map((stepName, si) => {
    const hazardSet   = new Set();
    const controlSet  = new Set();
    let   maxRisk     = '낮음';
    const lawSet      = new Set();

    matchedCases.forEach(c => {
      // jsaSteps에서 해당 단계 데이터 추출
      const stepData = (c.jsaSteps || []).find(s => s.step === stepName);
      if (stepData) {
        (stepData.hazards  || []).forEach(h => hazardSet.add(h));
        (stepData.controls || []).forEach(ct => controlSet.add(ct));
        // 최고 위험도 취합
        const rl = stepData.riskLevel;
        const rlPriority = { '매우높음': 4, '높음': 3, '보통': 2, '낮음': 1 };
        if ((rlPriority[rl] || 0) > (rlPriority[maxRisk] || 0)) maxRisk = rl;
      }
      if (c.relatedLaw) lawSet.add(c.relatedLaw);
    });

    // 환경 요소 기반 추가 체크리스트
    const envChecklist = buildEnvChecklist(envFactors, stepName);

    return {
      name:      stepName,
      icon:      stepIcons[si],
      riskLevel: maxRisk,
      hazards:   [...hazardSet],
      controls:  [...controlSet],
      laws:      [...lawSet],
      checklist: envChecklist
    };
  });
}

/* 환경 요소별 체크리스트 아이템 */
function buildEnvChecklist(envFactors, stepName) {
  const items = [];
  const isPrep = stepName === '작업 전 준비';
  const isMain = stepName === '본 작업 수행';
  const isPost = stepName === '작업 후 정리';

  if (envFactors.includes('밀폐공간') || envFactors.includes('산소결핍 우려')) {
    if (isPrep) { items.push('산소농도(18% 이상) 및 유해가스 측정', '강제환기 실시', '구조용 3각대·윈치 준비'); }
    if (isMain) { items.push('연속 가스 모니터링', '2인 1조 + 감시인 배치'); }
    if (isPost) { items.push('작업자 전원 퇴장 확인', '환기 유지 및 출입금지'); }
  }
  if (envFactors.includes('유해가스(CO/H2S 등)')) {
    if (isPrep) { items.push('CO/H2S 농도 기준치 이하 확인', '송기마스크 지급'); }
    if (isMain) { items.push('휴대용 가스감지기 휴대', '비상 대피경로 숙지'); }
  }
  if (envFactors.includes('고소(2m 이상)')) {
    if (isPrep) { items.push('안전대 걸이설비 설치 확인', '작업발판 점검'); }
    if (isMain) { items.push('안전대 착용 상태 수시 확인', '하부 출입통제'); }
    if (isPost) { items.push('자재·공구 정리 후 하강', '지상에서 안전대 해제'); }
  }
  if (envFactors.includes('고온(200℃ 이상)')) {
    if (isPrep) { items.push('방열복/방열장갑 착용', '냉각수·소화기 준비'); }
    if (isMain) { items.push('열 스트레스 예방 수분 보충', '30분 간격 휴식'); }
    if (isPost) { items.push('고온 잔류물 냉각 확인 후 접근'); }
  }
  if (envFactors.includes('전기 활선')) {
    if (isPrep) { items.push('검전기로 잔류전압 확인', 'LOTO 시행', '절연 보호구 착용'); }
    if (isMain) { items.push('절연공구 사용', '절연 방호구 설치'); }
    if (isPost) { items.push('작업자 전원 철수 후 통전'); }
  }
  if (envFactors.includes('화기 사용')) {
    if (isPrep) { items.push('화기작업 허가서 발행', '소화기 비치', '가연성 물질 제거'); }
    if (isMain) { items.push('화기감시인 배치', '인근 가연물 방호 조치'); }
  }
  if (envFactors.includes('중량물(1톤 이상)')) {
    if (isPrep) { items.push('인양장비 용량 확인', '달기기구 점검'); }
    if (isMain) { items.push('신호수 배치', '작업반경 내 출입통제'); }
  }
  if (envFactors.includes('회전체 근접')) {
    if (isPrep) { items.push('LOTO 적용', '방호덮개 설치 확인'); }
    if (isMain) { items.push('헐거운 의복·장신구 제거', '안전거리 유지'); }
  }
  if (envFactors.includes('분진')) {
    if (isPrep) { items.push('방진마스크(1급 이상) 착용', '국소배기장치 가동'); }
  }
  if (envFactors.includes('소음(85dB 이상)')) {
    if (isMain) { items.push('귀마개/귀덮개 착용 의무화'); }
  }
  if (envFactors.includes('위험물 취급')) {
    if (isPrep) { items.push('MSDS 확인', '안전용기 사용'); }
    if (isPost) { items.push('잔여 위험물 안전처리'); }
  }

  // 중복 제거
  return [...new Set(items)];
}

/* ─────────────────────────────────────────────
   레거시 분석 실행 (구버전 — 수동입력탭 직접 폼에서만 사용)
   jsa_api.js의 window.runJsaAnalysis 를 덮어쓰지 않도록
   함수명을 runJsaAnalysisLegacy 로 변경
   ───────────────────────────────────────────── */
function runJsaAnalysisLegacy() {
  // 입력값 수집
  const workName   = (document.getElementById('jsaWorkName')?.value   || '').trim();
  const workType   = document.getElementById('jsaWorkType')?.value   || '';
  const workLoc    = document.getElementById('jsaWorkLoc')?.value    || '';
  const workerCnt  = document.getElementById('jsaWorkerCount')?.value || '';
  const workDate   = document.getElementById('jsaWorkDate')?.value   || '';

  // 환경 요소 다중 선택
  const envFactors = [];
  document.querySelectorAll('.jsa-env-checkbox:checked').forEach(cb => {
    envFactors.push(cb.value);
  });

  // 유효성 검사
  if (!workName) {
    showToast('warning', '작업명을 입력해 주세요.');
    document.getElementById('jsaWorkName')?.focus();
    return;
  }
  if (!workType) {
    showToast('warning', '작업 종류를 선택해 주세요.');
    return;
  }
  if (!workLoc) {
    showToast('warning', '작업 장소를 선택해 주세요.');
    return;
  }

  // 버튼 로딩 상태
  const btn = document.getElementById('jsaAnalyzeBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 분석 중...'; }

  setTimeout(() => {
    try {
      const matchedCases = matchAccidentCases_legacy(workType, workLoc, envFactors);
      const score        = calcRiskScore_legacy(matchedCases, envFactors);
      const riskLevel    = scoreToRiskLevel_legacy(score);
      const jsaSteps     = buildJsaStepsData_legacy(matchedCases, workType, envFactors);

      const analysisData = {
        id:           Date.now(),
        workName, workType, workLoc, workerCnt, workDate, envFactors,
        score, riskLevel, matchedCount: matchedCases.length,
        jsaSteps, matchedCases,
        analyzedAt: new Date().toISOString()
      };

      // 결과 렌더링
      renderJsaResult(analysisData);
      renderJsaCaseDb(matchedCases);

      // 이력 저장
      saveJsaHistory(analysisData);
      renderJsaHistory();

      // 결과 영역으로 스크롤
      document.getElementById('jsaResultSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (typeof showToast === 'function') {
        showToast('success', `✅ JSA 분석 완료 — ${riskLevel} 수준 (점수: ${score}점, 재해사례 ${matchedCases.length}건 매칭)`);
      }
    } catch (e) {
      console.error('[JSA] 분석 오류:', e);
      if (typeof showToast === 'function') showToast('error', '분석 중 오류가 발생했습니다.');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-bolt"></i> 위험성 분석 시작'; }
    }
  }, 600);
}

/* ─────────────────────────────────────────────
   결과 렌더링
   ───────────────────────────────────────────── */
function renderJsaResult(data) {
  const section = document.getElementById('jsaResultSection');
  if (!section) return;

  const rc   = RISK_CONFIG[data.riskLevel] || RISK_CONFIG['낮음'];
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const stepsHtml = data.jsaSteps.map((step, idx) => {
    const src = RISK_CONFIG[step.riskLevel] || RISK_CONFIG['낮음'];
    const hazHtml  = step.hazards.length
      ? step.hazards.map(h => `<li><i class="fas fa-exclamation-triangle" style="color:#E67E22;margin-right:5px;"></i>${escHtml(h)}</li>`).join('')
      : '<li class="jsa-empty-item">매칭된 위험요인 없음</li>';
    const ctrlHtml = step.controls.length
      ? step.controls.map(c => `<li><i class="fas fa-check-circle" style="color:#27AE60;margin-right:5px;"></i>${escHtml(c)}</li>`).join('')
      : '<li class="jsa-empty-item">기본 안전수칙 준수</li>';
    const lawHtml  = step.laws.length
      ? step.laws.map(l => `<li><i class="fas fa-gavel" style="color:#1B3A5C;margin-right:5px;"></i>${escHtml(l)}</li>`).join('')
      : '<li class="jsa-empty-item">관련 법령 확인 필요</li>';
    const chkHtml  = step.checklist.length
      ? step.checklist.map(c => `
          <label class="jsa-checklist-item">
            <input type="checkbox" class="jsa-chk">
            <span>${escHtml(c)}</span>
          </label>`).join('')
      : '<div class="jsa-empty-item">기본 체크리스트 준수</div>';

    return `
    <div class="jsa-step-card jsa-step-${idx}">
      <div class="jsa-step-header" style="background:linear-gradient(135deg,${src.color}18,${src.color}08);border-left:4px solid ${src.color};">
        <div class="jsa-step-title">
          <i class="${step.icon}" style="color:${src.color};"></i>
          <span>STEP ${idx + 1}</span>
          <strong>${escHtml(step.name)}</strong>
        </div>
        <span class="jsa-risk-badge" style="background:${src.bg};color:${src.color};border:1px solid ${src.border};">
          <i class="${src.icon}"></i> ${src.label}
        </span>
      </div>
      <div class="jsa-step-body">
        <div class="jsa-step-col">
          <div class="jsa-col-title"><i class="fas fa-exclamation-triangle"></i> ⚠️ 잠재 위험요인</div>
          <ul class="jsa-list">${hazHtml}</ul>
        </div>
        <div class="jsa-step-col">
          <div class="jsa-col-title"><i class="fas fa-shield-alt"></i> ✅ 필수 안전조치</div>
          <ul class="jsa-list">${ctrlHtml}</ul>
        </div>
        <div class="jsa-step-col">
          <div class="jsa-col-title"><i class="fas fa-gavel"></i> 📋 관련 법령</div>
          <ul class="jsa-list">${lawHtml}</ul>
        </div>
        <div class="jsa-step-col jsa-col-full">
          <div class="jsa-col-title"><i class="fas fa-tasks"></i> ☑️ 안전 체크리스트</div>
          <div class="jsa-checklist-wrap">${chkHtml}</div>
        </div>
      </div>
    </div>`;
  }).join('');

  const noMatchNote = data.matchedCount === 0
    ? `<div class="jsa-no-match-note"><i class="fas fa-info-circle"></i> 해당 조건과 일치하는 재해사례가 없습니다. 일반 안전수칙을 표시합니다.</div>`
    : '';

  section.innerHTML = `
    <div class="jsa-result-wrap">
      <!-- 위험도 헤더 -->
      <div class="jsa-result-header" style="border-left:5px solid ${rc.color};">
        <div class="jsa-result-meta">
          <div class="jsa-result-title">
            <i class="fas fa-search-plus" style="color:${rc.color};"></i>
            JSA 분석 결과 — <strong>${escHtml(data.workName)}</strong>
          </div>
          <div class="jsa-result-info">
            <span><i class="fas fa-tools"></i> ${escHtml(data.workType)}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${escHtml(data.workLoc)}</span>
            ${data.workerCnt ? `<span><i class="fas fa-users"></i> ${escHtml(data.workerCnt)}명</span>` : ''}
            ${data.workDate  ? `<span><i class="fas fa-calendar"></i> ${escHtml(data.workDate)}</span>` : ''}
            <span><i class="fas fa-calendar-check"></i> 분석일: ${today}</span>
          </div>
        </div>
        <div class="jsa-overall-risk" style="background:${rc.bg};border:2px solid ${rc.border};">
          <div class="jsa-risk-score">${data.score}<span>점</span></div>
          <div class="jsa-risk-level" style="color:${rc.color};">
            <i class="${rc.icon}"></i> 종합 위험도 ${rc.label}
          </div>
          <div class="jsa-case-count">재해사례 ${data.matchedCount}건 매칭</div>
        </div>
      </div>

      ${data.envFactors.length ? `
      <div class="jsa-env-tags">
        <span class="jsa-env-label"><i class="fas fa-tag"></i> 작업 환경:</span>
        ${data.envFactors.map(ef => `<span class="jsa-env-tag">${escHtml(ef)}</span>`).join('')}
      </div>` : ''}

      ${noMatchNote}

      <!-- 3단계 카드 -->
      <div class="jsa-steps-grid">${stepsHtml}</div>

      <!-- 액션 버튼 -->
      <div class="jsa-action-btns">
        <button class="jsa-print-btn" onclick="window.print()">
          <i class="fas fa-print"></i> 인쇄
        </button>
        <button class="jsa-pdf-btn" onclick="jsaPdfDownload('${escHtml(data.workName)}')">
          <i class="fas fa-file-pdf"></i> PDF 다운로드
        </button>
      </div>
    </div>`;

  section.style.display = 'block';
}

function updateJsaResultArea(state) {
  const section = document.getElementById('jsaResultSection');
  if (!section) return;
  if (state === 'empty') {
    section.innerHTML = `
      <div class="jsa-result-empty">
        <i class="fas fa-search-plus"></i>
        <p>작업일보를 입력하고 <strong>"위험성 분석 시작"</strong>을 클릭하면<br>재해사례 기반 JSA 분석 결과가 여기에 표시됩니다.</p>
      </div>`;
  }
}

/* ─────────────────────────────────────────────
   재해사례 DB 섹션 렌더링
   ───────────────────────────────────────────── */
let jsaCurrentFilter = { type: 'all', severity: 'all', keyword: '' };
let jsaCurrentCases  = [];
let jsaAccordionOpen = false;

function renderJsaCaseDb(cases) {
  jsaCurrentCases = cases;
  const container = document.getElementById('jsaCaseDbSection');
  if (!container) return;
  container.style.display = 'block';
  applyJsaCaseFilter();
}

function applyJsaCaseFilter() {
  const f = jsaCurrentFilter;
  let filtered = jsaCurrentCases.filter(c => {
    if (f.type !== 'all' && c.accidentType !== f.type) return false;
    if (f.severity === '사망' && c.victims.death === 0) return false;
    if (f.severity === '중상' && c.victims.serious === 0) return false;
    if (f.severity === '경상' && c.victims.minor  === 0 && c.victims.serious === 0 && c.victims.death === 0) return false;
    if (f.keyword) {
      const kw = f.keyword.toLowerCase();
      const hay = (c.workplace + c.cause + c.preventiveMeasures + c.accidentType).toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });
  renderCaseCards(filtered);
}

function onJsaFilterChange() {
  const typeEl    = document.getElementById('jsaCaseTypeFilter');
  const sevEl     = document.getElementById('jsaCaseSevFilter');
  const kwEl      = document.getElementById('jsaCaseKeyword');
  jsaCurrentFilter.type     = typeEl?.value     || 'all';
  jsaCurrentFilter.severity = sevEl?.value      || 'all';
  jsaCurrentFilter.keyword  = kwEl?.value?.trim()|| '';
  applyJsaCaseFilter();
}

function renderCaseCards(cases) {
  const grid = document.getElementById('jsaCaseGrid');
  if (!grid) return;
  const countEl = document.getElementById('jsaCaseCount');
  if (countEl) countEl.textContent = cases.length;

  if (!cases.length) {
    grid.innerHTML = `
      <div class="jsa-case-empty">
        <i class="fas fa-search-minus"></i>
        <p>조건에 맞는 재해사례가 없습니다.</p>
      </div>`;
    return;
  }

  grid.innerHTML = cases.map(c => {
    const icon    = ACCIDENT_TYPE_ICONS[c.accidentType] || 'fas fa-exclamation';
    const sev     = c.victims.death > 0 ? '사망' : c.victims.serious > 0 ? '중상' : '경상';
    const sevCls  = c.victims.death > 0 ? 'sev-death' : c.victims.serious > 0 ? 'sev-serious' : 'sev-minor';
    return `
    <div class="jsa-case-card" onclick="openCaseModal(${c.id})" role="button" tabindex="0">
      <div class="jsa-case-card-top">
        <span class="jsa-case-type-badge"><i class="${icon}"></i> ${escHtml(c.accidentType)}</span>
        <span class="jsa-sev-badge ${sevCls}">${sev}</span>
        <span class="jsa-case-date">${escHtml(c.date)}</span>
      </div>
      <div class="jsa-case-title">${escHtml(c.workplace)}</div>
      <div class="jsa-case-meta">
        <span><i class="fas fa-tools"></i> ${escHtml(c.workType)}</span>
        <span><i class="fas fa-map-marker-alt"></i> ${escHtml(c.workLocation)}</span>
      </div>
      <div class="jsa-case-victims">
        <span class="victim-death"><i class="fas fa-skull-crossbones"></i> 사망 ${c.victims.death}명</span>
        <span class="victim-serious"><i class="fas fa-ambulance"></i> 중상 ${c.victims.serious}명</span>
        <span class="victim-minor"><i class="fas fa-band-aid"></i> 경상 ${c.victims.minor}명</span>
      </div>
      <div class="jsa-case-cause">${escHtml(c.cause)}</div>
    </div>`;
  }).join('');
}

/* 재해사례 상세 모달 */
function openCaseModal(caseId) {
  const c = (ACCIDENT_CASES || []).find(x => x.id === caseId);
  if (!c) return;

  const icon    = ACCIDENT_TYPE_ICONS[c.accidentType] || 'fas fa-exclamation';
  const stepsHtml = (c.jsaSteps || []).map(s => {
    const src = RISK_CONFIG[s.riskLevel] || RISK_CONFIG['낮음'];
    return `
    <div class="modal-jsa-step" style="border-left:3px solid ${src.color};">
      <div class="modal-jsa-step-title" style="color:${src.color};">
        <i class="${src.icon}"></i> ${escHtml(s.step)}
        <span class="modal-jsa-risk-badge" style="background:${src.bg};color:${src.color};">${src.label}</span>
      </div>
      <div class="modal-jsa-row">
        <div>
          <strong>위험요인:</strong>
          <ul>${(s.hazards||[]).map(h=>`<li>${escHtml(h)}</li>`).join('')}</ul>
        </div>
        <div>
          <strong>안전조치:</strong>
          <ul>${(s.controls||[]).map(ct=>`<li>${escHtml(ct)}</li>`).join('')}</ul>
        </div>
      </div>
    </div>`;
  }).join('');

  const envTags = (c.environmentFactors||[]).map(ef => `<span class="jsa-env-tag">${escHtml(ef)}</span>`).join('');

  const body = document.getElementById('jsaCaseModalBody');
  if (body) {
    body.innerHTML = `
      <div class="modal-case-header">
        <span class="jsa-case-type-badge large"><i class="${icon}"></i> ${escHtml(c.accidentType)}</span>
        <h3>${escHtml(c.workplace)}</h3>
        <div class="modal-case-meta-row">
          <span><i class="fas fa-calendar-alt"></i> ${escHtml(c.date)}</span>
          <span><i class="fas fa-tools"></i> ${escHtml(c.workType)}</span>
          <span><i class="fas fa-map-marker-alt"></i> ${escHtml(c.workLocation)}</span>
        </div>
      </div>
      <div class="modal-case-victims">
        <span class="victim-death"><i class="fas fa-skull-crossbones"></i> 사망 <strong>${c.victims.death}</strong>명</span>
        <span class="victim-serious"><i class="fas fa-ambulance"></i> 중상 <strong>${c.victims.serious}</strong>명</span>
        <span class="victim-minor"><i class="fas fa-band-aid"></i> 경상 <strong>${c.victims.minor}</strong>명</span>
      </div>
      <div class="modal-case-section">
        <div class="modal-case-label"><i class="fas fa-search"></i> 발생 원인</div>
        <div class="modal-case-body">${escHtml(c.cause)}</div>
      </div>
      <div class="modal-case-section">
        <div class="modal-case-label"><i class="fas fa-shield-alt"></i> 재발방지대책</div>
        <div class="modal-case-body">${escHtml(c.preventiveMeasures)}</div>
      </div>
      <div class="modal-case-section">
        <div class="modal-case-label"><i class="fas fa-tag"></i> 환경 요인</div>
        <div>${envTags || '해당 없음'}</div>
      </div>
      <div class="modal-case-section">
        <div class="modal-case-label"><i class="fas fa-gavel"></i> 관련 법령</div>
        <div class="modal-case-body">${escHtml(c.relatedLaw)}</div>
      </div>
      <div class="modal-case-section">
        <div class="modal-case-label"><i class="fas fa-list-ol"></i> JSA 단계별 분석</div>
        <div class="modal-jsa-steps">${stepsHtml}</div>
      </div>`;
  }
  openJsaModal();
}

function openJsaModal() {
  const modal   = document.getElementById('jsaCaseModal');
  const overlay = document.getElementById('jsaModalOverlay');
  if (modal)   { modal.style.display = 'flex'; }
  if (overlay) { overlay.style.display = 'block'; }
  document.body.style.overflow = 'hidden';
}

function closeJsaModal() {
  const modal   = document.getElementById('jsaCaseModal');
  const overlay = document.getElementById('jsaModalOverlay');
  if (modal)   { modal.style.display = 'none'; }
  if (overlay) { overlay.style.display = 'none'; }
  document.body.style.overflow = '';
}

function toggleJsaAccordion() {
  jsaAccordionOpen = !jsaAccordionOpen;
  const body = document.getElementById('jsaAccordionBody');
  const icon = document.getElementById('jsaAccordionIcon');
  if (body) body.style.display = jsaAccordionOpen ? 'block' : 'none';
  if (icon) {
    icon.className = jsaAccordionOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
  }
}

/* ─────────────────────────────────────────────
   분석 이력 (LocalStorage)
   ───────────────────────────────────────────── */
function saveJsaHistory(data) {
  try {
    let history = getJsaHistory();
    // 최신 항목을 앞으로
    history.unshift({
      id:           data.id,
      workName:     data.workName,
      workType:     data.workType,
      workLoc:      data.workLoc,
      workerCnt:    data.workerCnt,
      workDate:     data.workDate,
      envFactors:   data.envFactors,
      score:        data.score,
      riskLevel:    data.riskLevel,
      matchedCount: data.matchedCount,
      analyzedAt:   data.analyzedAt,
      // 전체 데이터 포함 (결과 재현용)
      jsaSteps:     data.jsaSteps,
      matchedCases: data.matchedCases.map(c => c.id) // ID만 저장 (용량 절약)
    });
    // 최대 20건
    if (history.length > JSA_MAX_HISTORY) history = history.slice(0, JSA_MAX_HISTORY); // eslint-disable-line
    localStorage.setItem(JSA_HISTORY_KEY_V1, JSON.stringify(history));
  } catch (e) {
    console.warn('[JSA] 이력 저장 실패:', e);
  }
}

function getJsaHistory() {
  try {
    const raw = localStorage.getItem(JSA_HISTORY_KEY_V1);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function renderJsaHistory() {
  const container = document.getElementById('jsaHistoryList');
  if (!container) return;
  const history = getJsaHistory();

  if (!history.length) {
    container.innerHTML = '<div class="jsa-history-empty"><i class="fas fa-history"></i> 분석 이력이 없습니다.</div>';
    return;
  }

  container.innerHTML = history.map(h => {
    const rc    = RISK_CONFIG[h.riskLevel] || RISK_CONFIG['낮음'];
    const dt    = h.analyzedAt ? new Date(h.analyzedAt).toLocaleString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '-';
    return `
    <div class="jsa-history-item" onclick="replayJsaHistory('${h.id}')">
      <div class="jsa-history-risk" style="background:${rc.bg};color:${rc.color};border:1px solid ${rc.border};">
        <i class="${rc.icon}"></i> ${rc.label}
      </div>
      <div class="jsa-history-body">
        <div class="jsa-history-name">${escHtml(h.workName)}</div>
        <div class="jsa-history-meta">${escHtml(h.workType)} · ${escHtml(h.workLoc)} · ${dt}</div>
      </div>
      <div class="jsa-history-score">${h.score}점</div>
    </div>`;
  }).join('');
}

function replayJsaHistory(historyId) {
  const history = getJsaHistory();
  const h = history.find(x => String(x.id) === String(historyId));
  if (!h) return;

  // 입력 폼 복원
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  setVal('jsaWorkName',    h.workName);
  setVal('jsaWorkType',    h.workType);
  setVal('jsaWorkLoc',     h.workLoc);
  setVal('jsaWorkerCount', h.workerCnt);
  setVal('jsaWorkDate',    h.workDate);

  // 환경 요소 체크박스 복원
  document.querySelectorAll('.jsa-env-checkbox').forEach(cb => {
    cb.checked = (h.envFactors || []).includes(cb.value);
  });

  // JSA 결과 재렌더링 (저장된 matchedCases ID → 원본 데이터 복원)
  const matchedCases = (ACCIDENT_CASES || []).filter(c => (h.matchedCases || []).includes(c.id));
  const replayData   = { ...h, matchedCases };
  renderJsaResult(replayData);
  renderJsaCaseDb(matchedCases);

  document.getElementById('jsaResultSection')?.scrollIntoView({ behavior: 'smooth' });
  if (typeof showToast === 'function') showToast('info', `📋 이전 분석 이력을 불러왔습니다: ${h.workName}`);
}

function clearJsaHistory() {
  if (!confirm('분석 이력을 모두 삭제하시겠습니까?')) return;
  localStorage.removeItem(JSA_HISTORY_KEY_V1);
  // jsa_api.js 이력도 삭제
  if (typeof clearJsaHistoryApi === 'function') clearJsaHistoryApi();
  else if (typeof window.clearJsaHistory === 'function' && window.clearJsaHistory !== clearJsaHistory) window.clearJsaHistory();
  else localStorage.removeItem('jsa_history');
  renderJsaHistoryFromApi();
  if (typeof showToast === 'function') showToast('success', '분석 이력이 삭제되었습니다.');
}

/* ─────────────────────────────────────────────
   필터 적용 (HTML onclick 호환 래퍼)
   ───────────────────────────────────────────── */
function applyJsaFilter() {
  const typeEl = document.getElementById('jsaFilterType');
  const sevEl  = document.getElementById('jsaFilterSeverity');
  const kwEl   = document.getElementById('jsaFilterKeyword');
  jsaCurrentFilter.type     = typeEl?.value     || 'all';
  jsaCurrentFilter.severity = sevEl?.value      || 'all';
  jsaCurrentFilter.keyword  = kwEl?.value?.trim()|| '';
  applyJsaCaseFilter();
}

/* ─────────────────────────────────────────────
   아코디언 토글 (HTML onclick 호환)
   ───────────────────────────────────────────── */
function toggleCaseDbAccordion(btn) {
  const body = document.getElementById('jsaAccordionBody');
  if (!body) return;
  jsaAccordionOpen = !jsaAccordionOpen;
  body.style.display = jsaAccordionOpen ? 'block' : 'none';
  const icon = btn ? btn.querySelector('.jsa-accordion-icon') : null;
  if (icon) {
    icon.className = jsaAccordionOpen
      ? 'fas fa-chevron-up jsa-accordion-icon'
      : 'fas fa-chevron-down jsa-accordion-icon';
  }
}

/* ─────────────────────────────────────────────
   PDF 다운로드 (인쇄 대화상자 활용)
   ───────────────────────────────────────────── */
function jsaPdfDownload(workName) {
  if (typeof showToast === 'function') {
    showToast('info', '인쇄 대화상자에서 "PDF로 저장"을 선택하면 PDF로 저장됩니다.');
  }
  setTimeout(() => window.print(), 400);
}

/* ─────────────────────────────────────────────
   유틸: HTML 이스케이프 (chatbot.js와 독립)
   ───────────────────────────────────────────── */
function escHtml(text) {
  if (text === null || text === undefined) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
