/* =============================================
   SafeGuard Pro – 알림 설정 로직 v5.0
   체크리스트 ↔ 알림 설정 완전 연동
   ============================================= */

/* ──────────────────────────────────────────
   전역 상태
────────────────────────────────────────── */
let savedNotifications = [];
let completedPermitItems = new Set();
let alertSettings = null;          // 현재 저장된 설정
let notifCheckedItems = new Set(); // 하위 호환용

/* ──────────────────────────────────────────
   LocalStorage 헬퍼
────────────────────────────────────────── */
function _lsGet(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
}
function _lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function loadAllStorage() {
  savedNotifications   = _lsGet('sg_notifications', []);
  completedPermitItems = new Set(_lsGet('sg_completed_items', []));
  alertSettings        = _lsGet('alertSettings', null);
}
function saveNotificationsToStorage() { _lsSet('sg_notifications', savedNotifications); }
function saveCompletedToStorage()     { _lsSet('sg_completed_items', [...completedPermitItems]); }
function saveAlertSettings()          { _lsSet('alertSettings', alertSettings); }

/* ──────────────────────────────────────────
   날짜 유틸
────────────────────────────────────────── */
function addDays(dateStr, days) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDateKR(dateStr) {
  if (!dateStr || dateStr === '-') return '-';
  const parts = (dateStr || '').split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

function daysFromNow(dateStr) {
  if (!dateStr) return null;
  const t = new Date(dateStr);
  if (isNaN(t)) return null;
  const now = new Date(); now.setHours(0,0,0,0); t.setHours(0,0,0,0);
  return Math.ceil((t - now) / 86400000);
}

/**
 * submitTiming 문자열 → 착공일 기준 마감일 계산
 * 예) "착공 30일 전" → 착공일 - 30일
 *     "착공과 동시" → 착공일
 *     "착공 후 1개월" → 착공일 + 30일
 *     "착공 후 90일" → 착공일 + 90일
 */
/**
 * submitTiming 문자열 → 착공일 기준 마감일 계산
 * 1순위: data.js의 submitTimingDays 구조화 필드 사용
 * 2순위: submitTiming 자연어 파싱 (구버전 호환)
 *
 * 지원 패턴:
 *   "착공 30일 전"  → 착공일 - 30
 *   "착공과 동시"   → 착공일
 *   "착공 후 1개월" → 착공일 + 30
 *   "착공 후 90일"  → 착공일 + 90
 *   "준공 N개월 전" → 준공일 - N*30
 *   "가동 전"       → 착공일 - 3 (안전 마진)
 *   "계약 체결 전"  → 착공일 - 7 (안전 마진)
 *   "설치 후 N일"   → 착공일 + N
 */
function getDeadlineDate(startDate, submitTiming, item) {
  if (!startDate || !submitTiming) return null;

  // ===== 1순위: data.js의 구조화 필드 사용 =====
  if (item && item.submitTimingDays) {
    const td = item.submitTimingDays;
    const days = typeof td.days === 'number' ? td.days : 0;
    const ref = td.reference || '착공전';

    // 준공 기준
    if (ref === '준공전' || ref === '준공후') {
      const endDateInput = document.getElementById('endDate');
      const endDate = endDateInput ? endDateInput.value : '';
      if (endDate) {
        return ref === '준공전'
          ? addDays(endDate, -Math.abs(days))
          : addDays(endDate, Math.abs(days));
      }
      // 준공일 미입력 시 fallback: 착공일 기준 처리 안 함
      return null;
    }

    // 가동 전 (착공일 기준 -3일 안전 마진)
    if (ref === '가동전') {
      return addDays(startDate, -Math.abs(days || 3));
    }

    // 계약 전 (착공일 기준 -7일 안전 마진)
    if (ref === '계약전') {
      return addDays(startDate, -Math.abs(days || 7));
    }

    // 착공 기준 (기본)
    // 양수면 착공 후, 음수면 착공 전
    if (ref === '착공후' || (ref === '착공전' && td.direction === 'after')) {
      return addDays(startDate, Math.abs(days));
    }
    return addDays(startDate, -Math.abs(days));
  }

  // ===== 2순위: 자연어 파싱 (fallback) =====
  const s = submitTiming.trim();

  // 착공 N일 전
  const mBefore = s.match(/착공\s*(\d+)\s*일\s*전/);
  if (mBefore) return addDays(startDate, -parseInt(mBefore[1]));

  // 착공과 동시 / 착공일
  if (s.includes('착공과 동시') || s === '착공일') return startDate;

  // 착공 후 N개월
  const mMonths = s.match(/착공\s*후\s*(\d+)\s*개월/);
  if (mMonths) return addDays(startDate, parseInt(mMonths[1]) * 30);

  // 착공 후 N일
  const mAfterDays = s.match(/착공\s*후\s*(\d+)\s*일/);
  if (mAfterDays) return addDays(startDate, parseInt(mAfterDays[1]));

  // 설치 후 N일
  const mInstallDays = s.match(/설치\s*후\s*(\d+)\s*일/);
  if (mInstallDays) return addDays(startDate, parseInt(mInstallDays[1]));

  // 가동 전 (안전 마진 -3일)
  if (s.includes('가동 전') || s.includes('가동전')) return addDays(startDate, -3);

  // 계약 체결 전 / 계약 전 (안전 마진 -7일)
  if (s.includes('계약 체결 전') || s.includes('계약 전') || s.includes('계약전')) {
    return addDays(startDate, -7);
  }

  // 착공 전 (일수 불명확 - 안전 마진 -3일)
  if (s.includes('착공 전') || s.includes('착공전')) return addDays(startDate, -3);

  // 준공 N개월 전
  const mEnd = s.match(/준공\s*(\d+)\s*개월\s*전/);
  if (mEnd) {
    const endDateInput = document.getElementById('endDate');
    const endDate = endDateInput ? endDateInput.value : '';
    if (endDate) return addDays(endDate, -parseInt(mEnd[1]) * 30);
  }

  // 준공 N일 전
  const mEndDays = s.match(/준공\s*(\d+)\s*일\s*전/);
  if (mEndDays) {
    const endDateInput = document.getElementById('endDate');
    const endDate = endDateInput ? endDateInput.value : '';
    if (endDate) return addDays(endDate, -parseInt(mEndDays[1]));
  }

  return null;
}

/* ──────────────────────────────────────────
   체크리스트 → selectedPermits 저장
   (checklist.js 에서도 호출)
────────────────────────────────────────── */
function syncSelectedPermitsToStorage() {
  if (typeof CHECKLIST_ITEMS === 'undefined' || typeof checkedItems === 'undefined') return [];
  const selected = CHECKLIST_ITEMS.filter(it => checkedItems.has(it.id)).map(it => ({
    id: it.id,
    num: it.num,
    name: it.name,
    category: it.category,
    icon: it.icon,
    submitTiming: it.submitTiming,
    submitTimingDays: it.submitTimingDays || null,
    submitTo: it.submitTo,
    relatedLaw: it.relatedLaw
  }));
  _lsSet('selectedPermits', selected);
  return selected;
}

function loadSelectedPermits() {
  return _lsGet('selectedPermits', []);
}

/* ──────────────────────────────────────────
   알림 설정 페이지 초기화
────────────────────────────────────────── */
function initNotificationPage() {
  loadAllStorage();

  // 저장된 alertSettings 있으면 폼에 복원
  if (alertSettings) {
    const pn = document.getElementById('notifProjectName');
    if (pn && !pn.value) pn.value = alertSettings.projectName || '';
    const sd = document.getElementById('startDate');
    if (sd && !sd.value) sd.value = alertSettings.startDate || '';
    const ed = document.getElementById('endDate');
    if (ed && !ed.value) ed.value = alertSettings.endDate || '';

    // 채널 복원
    if (alertSettings.telegramToken) {
      const tc = document.getElementById('telegramCheck');
      if (tc) { tc.checked = true; toggleChannel('telegram'); }
      const tb = document.getElementById('telegramBotToken');
      if (tb) tb.value = alertSettings.telegramToken;
      const ti = document.getElementById('telegramChatId');
      if (ti) ti.value = alertSettings.telegramChatId || '';
    }
    if (alertSettings.emailAddress) {
      const ec = document.getElementById('emailCheck');
      if (ec) { ec.checked = true; toggleChannel('email'); }
      const ea = document.getElementById('emailAddr');
      if (ea) ea.value = alertSettings.emailAddress;
    }

    // 타이밍 복원
    if (alertSettings.globalAlertDays && alertSettings.globalAlertDays.length > 0) {
      ['dMinus30','dMinus14','dMinus7','dMinus3','dMinus1'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = alertSettings.globalAlertDays.includes(parseInt(el.value));
      });
    }
  }

  renderPermitTable();
  renderSavedAlerts();
  updateSidebarWidget();
  updatePreview();
}

/* ──────────────────────────────────────────
   핵심: 인허가 연동 테이블 렌더링
────────────────────────────────────────── */
function renderPermitTable() {
  const wrap = document.getElementById('notifPermitTableWrap');
  if (!wrap) return;

  const permits = loadSelectedPermits();
  const startDateEl = document.getElementById('startDate');
  const startDate = startDateEl ? startDateEl.value : '';

  if (permits.length === 0) {
    wrap.innerHTML = `
      <div class="notif-empty-state">
        <i class="fas fa-clipboard-list"></i>
        <p>선택된 인허가 항목이 없습니다.<br>
        <strong>[인허가 체크리스트]</strong> 페이지에서 항목을 선택하면<br>
        여기에 자동으로 반영됩니다.</p>
        <button class="btn-primary-sm" onclick="navigateTo('checklist', document.querySelector('[data-page=checklist]'))">
          <i class="fas fa-check-square"></i> 인허가 체크리스트로 이동
        </button>
      </div>`;
    updatePreview();
    return;
  }

  const timingCols = ['30','14','7','3','1'];

  let rows = permits.map(p => {
    const deadline = startDate ? getDeadlineDate(startDate, p.submitTiming || '', p) : null;
    const dl = deadline ? daysFromNow(deadline) : null;

    let dlCell = '<span class="tbl-dash">-</span>';
    if (deadline) {
      const color = dl === null ? '#888' :
                    dl < 0 ? '#9B59B6' :
                    dl <= 7 ? '#E74C3C' :
                    dl <= 14 ? '#F39C12' : '#27AE60';
      const dlLabel = dl === null ? '' : dl < 0 ? 'D+경과' : dl === 0 ? 'D-Day' : `D-${dl}`;
      dlCell = `<span style="font-weight:700;color:${color};font-size:0.82rem;">${formatDateKR(deadline)}</span>
                ${dl !== null ? `<br><small style="color:${color};font-weight:700;">${dlLabel}</small>` : ''}`;
    }

    // 항목별 알림 시점: alertSettings 우선, 없으면 기본값 [14, 7]
    const ap = alertSettings && alertSettings.permits
      ? alertSettings.permits.find(a => a.id === p.id)
      : null;
    const alertDays = ap && ap.alertDays && ap.alertDays.length > 0 ? ap.alertDays : [14, 7];

    const timingChecks = timingCols.map(d => {
      const checked = alertDays.includes(parseInt(d));
      return `<td class="tbl-center">
        <input type="checkbox" class="timing-cb" data-id="${p.id}" data-days="${d}"
          ${checked ? 'checked' : ''} onchange="onTimingChange(${p.id}, ${d}, this.checked)" />
      </td>`;
    }).join('');

    const isDone = completedPermitItems.has(p.id);
    const urgCls = isDone ? 'row-done' :
                   dl !== null && dl < 0 ? 'row-overdue-t' :
                   dl !== null && dl <= 7 ? 'row-urgent-t' :
                   dl !== null && dl <= 14 ? 'row-warning-t' : '';

    return `
      <tr class="${urgCls}">
        <td class="tbl-num">${p.num}</td>
        <td>
          <div class="tbl-name">
            <i class="${p.icon || 'fas fa-file'}" style="color:#1B3A5C;font-size:0.75rem;flex-shrink:0;"></i>
            <span>${p.name}</span>
            ${isDone ? '<span class="badge-done-inline">✓ 완료</span>' : ''}
          </div>
          <div class="tbl-cat">${p.category || ''}</div>
        </td>
        <td class="tbl-timing">${p.submitTiming || '-'}</td>
        <td style="min-width:90px;">${dlCell}</td>
        ${timingChecks}
        <td class="tbl-center">
          <button class="tbl-action-btn ${isDone ? 'done' : ''}"
            onclick="togglePermitCompleteFromNotif(${p.id}, this)"
            title="${isDone ? '완료 취소' : '완료 처리'}">
            <i class="fas ${isDone ? 'fa-check-circle' : 'fa-circle'}"></i>
          </button>
        </td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <div class="notif-link-guide">
      <i class="fas fa-info-circle"></i>
      체크리스트에서 선택된 <strong>${permits.length}개 항목</strong>이 자동 반영되었습니다.
      항목 변경은 체크리스트 페이지에서 수정하세요.
      <button class="link-btn" onclick="navigateTo('checklist', document.querySelector('[data-page=checklist]'))">
        체크리스트 수정 →
      </button>
    </div>
    <div class="permit-table-wrap">
      <table class="permit-notif-table">
        <thead>
          <tr>
            <th style="width:36px;">#</th>
            <th>인허가 항목</th>
            <th>제출 시기</th>
            <th>제출 마감일</th>
            <th class="tbl-center" title="D-30일 전 알림">D-30</th>
            <th class="tbl-center" title="D-14일 전 알림">D-14</th>
            <th class="tbl-center" title="D-7일 전 알림">D-7</th>
            <th class="tbl-center" title="D-3일 전 알림">D-3</th>
            <th class="tbl-center" title="D-1일 전 알림">D-1</th>
            <th class="tbl-center">완료</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  updatePreview();
}

/* 타이밍 체크 변경 처리 */
function onTimingChange(itemId, days, checked) {
  if (!alertSettings) alertSettings = { permits: [] };
  if (!alertSettings.permits) alertSettings.permits = [];

  let ap = alertSettings.permits.find(p => p.id === itemId);
  if (!ap) {
    ap = { id: itemId, alertDays: [14, 7] };
    alertSettings.permits.push(ap);
  }

  const daysNum = parseInt(days);
  if (checked) {
    if (!ap.alertDays.includes(daysNum)) ap.alertDays.push(daysNum);
  } else {
    ap.alertDays = ap.alertDays.filter(d => d !== daysNum);
  }
  updatePreview();
}

/* 완료 처리 (알림 테이블에서) */
function togglePermitCompleteFromNotif(itemId, btn) {
  const numId = parseInt(itemId);
  if (completedPermitItems.has(numId)) {
    completedPermitItems.delete(numId);
  } else {
    completedPermitItems.add(numId);
  }
  saveCompletedToStorage();
  renderPermitTable();
  if (typeof refreshDashboard === 'function') refreshDashboard();
  if (typeof updateSidebarWidget === 'function') updateSidebarWidget();
  const isDone = completedPermitItems.has(numId);
  showToast(isDone ? 'success' : 'info',
    isDone ? '✅ 완료 처리되었습니다.' : '↩️ 완료가 취소되었습니다.');
}

/* ──────────────────────────────────────────
   채널 토글
────────────────────────────────────────── */
function toggleChannel(channel) {
  const inp = document.getElementById(`${channel}Input`);
  const chk = document.getElementById(`${channel}Check`);
  if (inp && chk) inp.style.display = chk.checked ? 'block' : 'none';
  updatePreview();
}

/* ──────────────────────────────────────────
   알림 시점 읽기 (전역 타이밍)
────────────────────────────────────────── */
function getSelectedTimings() {
  const r = [];
  ['dMinus30','dMinus14','dMinus7','dMinus3','dMinus1'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.checked) r.push(parseInt(el.value));
  });
  return r;
}

/* ──────────────────────────────────────────
   미리보기 업데이트
────────────────────────────────────────── */
function updatePreview() {
  const previewCards = document.getElementById('previewCards');
  const previewCount = document.getElementById('previewCount');
  if (!previewCards) return;

  const startDateEl = document.getElementById('startDate');
  const startDate = startDateEl ? startDateEl.value : '';
  const permits = loadSelectedPermits();
  const globalTimings = getSelectedTimings();

  if (!startDate || permits.length === 0) {
    previewCards.innerHTML = `
      <div class="preview-empty">
        <i class="fas fa-bell-slash"></i>
        <p>${!startDate ? '착공예정일을 입력하면' : '인허가 항목을 선택하면'}<br>알림 미리보기가 표시됩니다</p>
      </div>`;
    if (previewCount) previewCount.textContent = '';
    return;
  }

  const cards = [];

  permits.forEach(p => {
const deadline = getDeadlineDate(startDate, p.submitTiming || '', p);
    if (!deadline) return;
    const dLeft = daysFromNow(deadline);

    // 항목별 알림 시점: alertSettings 우선, 없으면 전역
    const ap = alertSettings && alertSettings.permits
      ? alertSettings.permits.find(a => a.id === p.id)
      : null;
    const timings = ap && ap.alertDays && ap.alertDays.length > 0
      ? ap.alertDays
      : globalTimings;

    if (timings.length === 0) return;

    timings.forEach(days => {
      const alertDate = addDays(deadline, -days);
      if (!alertDate) return;
      const urgency = dLeft === null ? 'normal' :
                      dLeft < 0 ? 'overdue' :
                      dLeft <= 7 ? 'urgent' :
                      dLeft <= 14 ? 'warning' : 'normal';
      cards.push({ p, deadline, alertDate, dLeft, days, urgency });
    });
  });

  if (cards.length === 0) {
    previewCards.innerHTML = `
      <div class="preview-empty">
        <i class="fas fa-clock"></i>
        <p>알림 시점(D-30 등)을 선택하거나<br>테이블에서 체크박스를 선택해 주세요</p>
      </div>`;
    if (previewCount) previewCount.textContent = '';
    return;
  }

  // 알림일 순 정렬
  cards.sort((a, b) => new Date(a.alertDate || '9999') - new Date(b.alertDate || '9999'));
  if (previewCount) previewCount.textContent = `총 ${cards.length}건`;

  const urgColor = { overdue:'#9B59B6', urgent:'#E74C3C', warning:'#F39C12', normal:'#27AE60' };

  previewCards.innerHTML = cards.map(c => {
    const uc = urgColor[c.urgency] || '#888';
    const dTag = c.dLeft === null ? '' :
      c.dLeft < 0 ? `<span class="preview-dday overdue" style="background:#9B59B6;">기한경과</span>` :
      c.dLeft === 0 ? `<span class="preview-dday" style="background:#E74C3C;">D-Day!</span>` :
      `<span class="preview-dday" style="background:${uc}">D-${c.dLeft}</span>`;

    const dBadgeColor = {30:'#2980B9', 14:'#F39C12', 7:'#E74C3C', 3:'#C0392B', 1:'#922B21'}[c.days] || '#888';

    return `
    <div class="preview-card ${c.urgency}">
      <div class="preview-bell">🔔</div>
      <div class="preview-body">
        <div class="preview-title">
          [${c.p.name}] 제출기간이 <strong>${c.days}일</strong> 남았습니다.
          <span class="preview-d-badge" style="background:${dBadgeColor};">D-${c.days} 알림</span>
        </div>
        <div class="preview-sub">
          📅 제출 기한: <strong>${formatDateKR(c.deadline)}</strong> ${dTag}
          &nbsp;|&nbsp; 📝 제출처: ${c.p.submitTo || '-'}
        </div>
        <div class="preview-alert-date">
          ⏰ 알림 발송 예정: ${formatDateKR(c.alertDate)}
          &nbsp;|&nbsp; 🗂️ ${c.p.category || ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ──────────────────────────────────────────
   알림 저장 (alertSettings 구조)
────────────────────────────────────────── */
function saveNotification() {
  const projectName  = (document.getElementById('notifProjectName') || {}).value?.trim() || '';
  const startDate    = (document.getElementById('startDate') || {}).value || '';
  const endDate      = (document.getElementById('endDate') || {}).value || '';
  const emailChk     = document.getElementById('emailCheck')?.checked || false;
  const tgChk        = document.getElementById('telegramCheck')?.checked || false;
  const emailAddr    = (document.getElementById('emailAddr') || {}).value?.trim() || '';
  const tgToken      = (document.getElementById('telegramBotToken') || {}).value?.trim() || '';
  const tgChatId     = (document.getElementById('telegramChatId') || {}).value?.trim() || '';
  const globalTimings = getSelectedTimings();
  const permits      = loadSelectedPermits();

  // 유효성 검사
  if (!projectName) {
    showToast('warning', '⚠️ 프로젝트명을 입력해 주세요.');
    document.getElementById('notifProjectName')?.focus();
    return;
  }
  if (!startDate) {
    showToast('warning', '⚠️ 착공예정일을 입력해 주세요.');
    document.getElementById('startDate')?.focus();
    return;
  }
  if (permits.length === 0) {
    showToast('warning', '⚠️ 체크리스트에서 인허가 항목을 먼저 선택해 주세요.');
    return;
  }
  if (!emailChk && !tgChk) {
    showToast('warning', '⚠️ 알림 채널을 1개 이상 선택해 주세요.');
    return;
  }
  if (emailChk && !emailAddr) {
    showToast('warning', '⚠️ 이메일 주소를 입력해 주세요.');
    return;
  }
  if (tgChk && (!tgToken || !tgChatId)) {
    showToast('warning', '⚠️ 텔레그램 Bot Token과 Chat ID를 모두 입력해 주세요.');
    return;
  }
  if (globalTimings.length === 0) {
    showToast('warning', '⚠️ 기본 알림 시점을 1개 이상 선택해 주세요.');
    return;
  }

  // alertSettings 구조 생성
  const permitsData = permits.map(p => {
const deadline = getDeadlineDate(startDate, p.submitTiming || '', p);
    const ap = alertSettings && alertSettings.permits
      ? alertSettings.permits.find(a => a.id === p.id)
      : null;
    const alertDays = ap && ap.alertDays && ap.alertDays.length > 0
      ? ap.alertDays
      : globalTimings;
    const alertDates = deadline
      ? alertDays.map(d => addDays(deadline, -d)).filter(Boolean)
      : [];
    return {
      id: p.id,
      num: p.num,
      name: p.name,
      category: p.category,
      submitTo: p.submitTo,
      submitTiming: p.submitTiming,
      deadline,
      alertDays,
      alertDates
    };
  });

  alertSettings = {
    projectName,
    startDate,
    endDate,
    telegramToken: tgChk ? tgToken : '',
    telegramChatId: tgChk ? tgChatId : '',
    emailAddress: emailChk ? emailAddr : '',
    globalAlertDays: globalTimings,
    permits: permitsData,
    savedAt: new Date().toISOString()
  };
  saveAlertSettings();

  // sg_notifications 에도 추가 (대시보드 하위호환)
  const notifObj = {
    id: Date.now(),
    projectName,
    startDate,
    endDate: endDate || null,
    items: permits.map(p => p.id),
    channels: [
      ...(emailChk ? [`이메일(${emailAddr})`] : []),
      ...(tgChk ? ['텔레그램'] : [])
    ],
    timings: globalTimings.map(t => `D-${t}`),
    createdAt: new Date().toLocaleDateString('ko-KR')
  };
  savedNotifications = savedNotifications.filter(n => n.projectName !== projectName);
  savedNotifications.push(notifObj);
  saveNotificationsToStorage();

  renderSavedAlerts();
  updateSidebarWidget();
  if (typeof refreshDashboard === 'function') refreshDashboard();
  showToast('success', `✅ "${projectName}" 알림 설정이 저장되었습니다! ${permitsData.length}개 항목`);
}

/* ──────────────────────────────────────────
   저장된 알림 목록 렌더링
────────────────────────────────────────── */
function renderSavedAlerts() {
  const list = document.getElementById('savedAlertsList');
  if (!list) return;

  if (!alertSettings) {
    list.innerHTML = `<div class="preview-empty small"><i class="fas fa-inbox"></i><p>저장된 알림 설정이 없습니다</p></div>`;
    return;
  }

  const a = alertSettings;
  const channels = [
    a.telegramToken ? '<span class="channel-badge tg">📱 텔레그램</span>' : '',
    a.emailAddress  ? `<span class="channel-badge em">✉️ ${a.emailAddress}</span>` : ''
  ].filter(Boolean).join(' ');

  const urgentCount = (a.permits || []).filter(p => {
    const dl = daysFromNow(p.deadline);
    return !completedPermitItems.has(p.id) && dl !== null && dl >= 0 && dl <= 7;
  }).length;

  const savedDateStr = a.savedAt
    ? new Date(a.savedAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

  list.innerHTML = `
    <div class="saved-alert-card">
      <div class="saved-alert-icon"><i class="fas fa-bell"></i></div>
      <div class="saved-alert-info">
        <div class="saved-alert-name">${a.projectName}</div>
        <div class="saved-alert-meta">
          <span>📅 착공: ${a.startDate}</span>
          ${a.endDate ? `<span>🏁 준공: ${a.endDate}</span>` : ''}
          <span>📋 항목: <strong>${(a.permits || []).length}개</strong></span>
        </div>
        <div class="saved-alert-meta">
          ${channels}
          ${urgentCount > 0 ? `<span class="channel-badge urgent-badge-sm">🚨 D-7 긴급 ${urgentCount}건</span>` : ''}
        </div>
        <div class="saved-alert-meta">
          <span>⏰ 전역 알림: ${(a.globalAlertDays || []).sort((x,y)=>y-x).map(d => 'D-'+d).join(', ')}</span>
          <span style="color:#aaa;">🕐 저장: ${savedDateStr}</span>
        </div>
      </div>
      <button class="saved-alert-delete" onclick="deleteAlertSettings()" title="알림 설정 삭제">
        <i class="fas fa-trash"></i>
      </button>
    </div>`;
}

function deleteAlertSettings() {
  if (!confirm('저장된 알림 설정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
  alertSettings = null;
  saveAlertSettings();
  savedNotifications = [];
  saveNotificationsToStorage();
  renderSavedAlerts();
  renderPermitTable();
  updateSidebarWidget();
  if (typeof refreshDashboard === 'function') refreshDashboard();
  showToast('info', '🗑️ 알림 설정이 삭제되었습니다.');
}

/* ──────────────────────────────────────────
   전체선택/해제 (레거시 호환)
────────────────────────────────────────── */
function selectAllNotifItems(selectAll) {
  const cbs = document.querySelectorAll('.timing-cb');
  cbs.forEach(cb => {
    cb.checked = selectAll;
    const id   = parseInt(cb.dataset.id);
    const days = parseInt(cb.dataset.days);
    onTimingChange(id, days, selectAll);
  });
  updatePreview();
}

/* ──────────────────────────────────────────
   사이드바 위젯 업데이트
────────────────────────────────────────── */
function updateSidebarWidget() {
  const widget = document.getElementById('todayAlertWidget');
  const urgBadgeWrap  = document.getElementById('urgentBadgeWrap');
  const urgBadgeCount = document.getElementById('urgentBadgeCount');
  if (!widget) return;

  if (!alertSettings || !alertSettings.permits || alertSettings.permits.length === 0) {
    widget.innerHTML = `
      <div class="widget-item normal">
        <span class="widget-dot"></span>
        <span>알림 설정을 등록하세요</span>
      </div>`;
    if (urgBadgeWrap) urgBadgeWrap.style.display = 'none';
    return;
  }

  const alerts = alertSettings.permits.map(p => {
    const dl = daysFromNow(p.deadline);
    const isDone = completedPermitItems.has(p.id);
    return { name: p.name, id: p.id, dl, isDone };
  }).filter(a => a.dl !== null && a.dl >= 0 && a.dl <= 30)
    .sort((a, b) => a.dl - b.dl);

  const urgentCount = alerts.filter(a => a.dl <= 7 && !a.isDone).length;
  if (urgBadgeWrap) urgBadgeWrap.style.display = urgentCount > 0 ? 'block' : 'none';
  if (urgBadgeCount) urgBadgeCount.textContent = urgentCount;

  if (alerts.length === 0) {
    widget.innerHTML = `
      <div class="widget-item normal">
        <span class="widget-dot"></span>
        <span>30일 내 마감 없음 ✓</span>
      </div>`;
    return;
  }

  widget.innerHTML = alerts.slice(0, 5).map(a => {
    const cls = a.isDone ? 'completed' :
                a.dl <= 3 ? 'urgent' :
                a.dl <= 7 ? 'urgent' :
                a.dl <= 14 ? 'warning' : 'normal';
    const nm  = a.name.length > 13 ? a.name.slice(0, 13) + '…' : a.name;
    const dLabel = a.dl === 0 ? 'D-Day!' : `D-${a.dl}`;
    return `
      <div class="widget-item ${cls}">
        <span class="widget-dot"></span>
        <span>${a.isDone ? '✅ ' : ''}${nm} <strong>${dLabel}</strong></span>
      </div>`;
  }).join('');
}

/* ──────────────────────────────────────────
   텔레그램 테스트 발송
────────────────────────────────────────── */
async function sendTestTelegram() {
  const token  = document.getElementById('telegramBotToken')?.value.trim() || '';
  const chatId = document.getElementById('telegramChatId')?.value.trim() || '';
  const proj   = document.getElementById('notifProjectName')?.value.trim() || '테스트 프로젝트';

  if (!token || !chatId) {
    showToast('warning', '⚠️ Bot Token과 Chat ID를 모두 입력해 주세요.');
    return;
  }

  const text = `🔔 [SafeGuard Pro] 연결 테스트 성공!\n\n✅ 텔레그램 봇이 정상 연결되었습니다!\n\n🏭 프로젝트: ${proj}\n📋 제철·제선 플랜트 인허가 알림 시스템\n\n📌 실제 알림 예시:\n🔔 [유해위험방지계획서] 제출기간이 14일 남았습니다.\n📅 제출 기한: 2026-05-01\n📝 제출처: 한국산업안전보건공단\n⚠️ 관련 법령: 산업안전보건법 제42조`;

  showToast('info', '📡 텔레그램 테스트 메시지 발송 중...');
  try {
    const res  = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
    const data = await res.json();
    if (data.ok) {
      showToast('success', '✅ 텔레그램 메시지가 성공적으로 발송되었습니다!');
    } else {
      showToast('error', `❌ 발송 실패: ${data.description || '알 수 없는 오류'}`);
    }
  } catch (err) {
    showToast('error', '❌ 네트워크 오류. Token / Chat ID를 확인해 주세요.');
  }
}

/* ──────────────────────────────────────────
   CSV 내보내기
────────────────────────────────────────── */
function exportNotifCSV() {
  const permits = loadSelectedPermits();
  const startDateEl = document.getElementById('startDate');
  const startDate = startDateEl ? startDateEl.value : '';
  const projectName = document.getElementById('notifProjectName')?.value.trim() || '-';

  if (permits.length === 0) {
    showToast('warning', '⚠️ 선택된 인허가 항목이 없습니다. 먼저 체크리스트에서 항목을 선택해 주세요.');
    return;
  }

  const headers = ['프로젝트명', '항목번호', '인허가명', '카테고리', '제출시기', '제출처', '착공일', '제출마감일', 'D-day', '알림일정', '완료여부', '관련법령'];
  const rows = [headers.join(',')];

  permits.forEach(p => {
    const deadline = startDate ? getDeadlineDate(startDate, p.submitTiming || '', p) : null;
    const dl = deadline ? daysFromNow(deadline) : null;
    const ap = alertSettings?.permits?.find(a => a.id === p.id);
    const alertDays = ap?.alertDays || [14, 7];
    const alertDates = deadline
      ? alertDays.sort((a,b) => b-a).map(d => addDays(deadline, -d)).filter(Boolean).join('; ')
      : '-';
    const isDone = completedPermitItems.has(p.id) ? '완료' : '미완료';
    const relatedLaw = typeof CHECKLIST_ITEMS !== 'undefined'
      ? (CHECKLIST_ITEMS.find(i => i.id === p.id)?.relatedLaw || '')
      : '';

    rows.push([
      `"${projectName}"`,
      p.num,
      `"${p.name}"`,
      `"${p.category || ''}"`,
      `"${p.submitTiming || ''}"`,
      `"${p.submitTo || ''}"`,
      startDate || '-',
      deadline || '-',
      dl !== null ? (dl < 0 ? `경과 ${Math.abs(dl)}일` : `D-${dl}`) : '-',
      `"${alertDates}"`,
      isDone,
      `"${relatedLaw}"`
    ].join(','));
  });

  const bom  = '\uFEFF';
  const blob = new Blob([bom + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `SafeGuard_인허가알림일정_${projectName}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('success', `📊 인허가 알림 일정 CSV가 다운로드되었습니다. (${permits.length}개 항목)`);
}

/* ──────────────────────────────────────────
   모달
────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  const ov = document.getElementById('modalOverlay');
  if (el) el.classList.add('active');
  if (ov) ov.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  const ov = document.getElementById('modalOverlay');
  if (ov) ov.classList.remove('active');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────
   레거시 호환 래퍼
────────────────────────────────────────── */
function renderNotifItems()  { renderPermitTable(); }
function syncNotifItems()    {
  if (typeof syncSelectedPermitsToStorage === 'function') {
    syncSelectedPermitsToStorage();
  }
  // 알림 페이지가 현재 보이면 테이블 리렌더
  const notifPage = document.getElementById('page-notification');
  if (notifPage && notifPage.classList.contains('active')) {
    renderPermitTable();
  }
}

function deleteNotification(id) {
  savedNotifications = savedNotifications.filter(n => n.id !== id);
  saveNotificationsToStorage();
  renderSavedAlerts();
  updateSidebarWidget();
  if (typeof refreshDashboard === 'function') refreshDashboard();
  showToast('info', '🗑️ 삭제되었습니다.');
}
