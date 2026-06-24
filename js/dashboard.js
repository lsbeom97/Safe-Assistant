/* =============================================
   SafeGuard Pro – 대시보드 로직 v5.0
   alertSettings 기반 완전 구현
   ============================================= */

function refreshDashboard() {
  if (!document.getElementById('page-dashboard')) return;
  // notification.js 의 전역 상태 동기화
  if (typeof loadAllStorage === 'function') loadAllStorage();
  updateDashSummaryCards();
  updateDashUpcomingList();
  updateDashCategoryList();
  updateDashTimeline();
  updateDashJsaSummary();
}

/* ──────────────────────────────────────────
   JSA 위험성평가 요약 카드
────────────────────────────────────────── */
function updateDashJsaSummary() {
  if (typeof ACCIDENT_CASES === 'undefined' || !Array.isArray(ACCIDENT_CASES)) return;

  const cases = ACCIDENT_CASES;

  // 총 재해사례 수
  const totalEl = document.getElementById('dashJsaTotalCases');
  if (totalEl) totalEl.textContent = cases.length;

  // 사망사고 건수
  const deathCount = cases.filter(c => c.victims.death > 0).length;
  const deathEl = document.getElementById('dashJsaDeathCases');
  if (deathEl) deathEl.textContent = deathCount;

  // 작업유형별 집계 → TOP 3
  const workTypeMap = {};
  cases.forEach(c => {
    const score = (c.victims.death * 5) + (c.victims.serious * 3) + (c.victims.minor * 1);
    workTypeMap[c.workType] = (workTypeMap[c.workType] || 0) + score;
  });
  const topWork = Object.entries(workTypeMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topWorkEl = document.getElementById('dashJsaTopWork');
  if (topWorkEl) {
    topWorkEl.innerHTML = topWork.map(([name, score], i) => `
      <div class="jsa-dash-top-item">
        <span class="jsa-dash-top-rank">${i + 1}</span>
        <span class="jsa-dash-top-name">${name}</span>
        <span class="jsa-dash-top-score">${score}pt</span>
      </div>`).join('');
  }

  // 사고유형별 집계 → TOP 3
  const typeMap = {};
  cases.forEach(c => { typeMap[c.accidentType] = (typeMap[c.accidentType] || 0) + 1; });
  const topTypes = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topTypeEl = document.getElementById('dashJsaTopType');
  if (topTypeEl) {
    topTypeEl.innerHTML = topTypes.map(([name, cnt], i) => `
      <div class="jsa-dash-top-item">
        <span class="jsa-dash-top-rank">${i + 1}</span>
        <span class="jsa-dash-top-name">${name}</span>
        <span class="jsa-dash-top-score">${cnt}건</span>
      </div>`).join('');
  }
}

/* ──────────────────────────────────────────
   헬퍼: alertSettings.permits 에서 일정 추출
────────────────────────────────────────── */
function _getSchedules() {
  if (typeof alertSettings === 'undefined' || !alertSettings || !alertSettings.permits) return [];
  return alertSettings.permits.map(p => {
    const dl = typeof daysFromNow === 'function' ? daysFromNow(p.deadline) : null;
    const isDone = (typeof completedPermitItems !== 'undefined') && completedPermitItems.has(p.id);
    return { ...p, daysLeft: dl, isDone };
  });
}

/* ──────────────────────────────────────────
   1. 요약 카드 4개
────────────────────────────────────────── */
function updateDashSummaryCards() {
  const schedules = _getSchedules();

  // ① 등록된 프로젝트 (alertSettings 존재하면 1)
  const projEl = document.getElementById('dashTotalItems');
  if (projEl) projEl.textContent = (typeof alertSettings !== 'undefined' && alertSettings) ? 1 : 0;

  // ② 진행 중인 인허가 (마감 미도래, 미완료)
  const ongoingCount = schedules.filter(s => !s.isDone && (s.daysLeft === null || s.daysLeft > 0)).length;
  const activeEl = document.getElementById('dashActiveNotifs');
  if (activeEl) activeEl.textContent = ongoingCount;

  // ③ D-7 이내 긴급
  const urgentCount = schedules.filter(s =>
    !s.isDone && s.daysLeft !== null && s.daysLeft >= 0 && s.daysLeft <= 7
  ).length;
  const urgentEl = document.getElementById('dashUrgentCount');
  if (urgentEl) urgentEl.textContent = urgentCount;
  const urgentCard = document.getElementById('dashUrgentCard');
  if (urgentCard) urgentCard.classList.toggle('blink', urgentCount > 0);

  // ④ 완료
  const doneCount = (typeof completedPermitItems !== 'undefined') ? completedPermitItems.size : 0;
  const doneEl = document.getElementById('dashDoneCount');
  if (doneEl) doneEl.textContent = doneCount;

  // 헤더 긴급 배지
  const urgBadgeWrap  = document.getElementById('urgentBadgeWrap');
  const urgBadgeCount = document.getElementById('urgentBadgeCount');
  if (urgBadgeWrap)  urgBadgeWrap.style.display  = urgentCount > 0 ? 'block' : 'none';
  if (urgBadgeCount) urgBadgeCount.textContent    = urgentCount;

  // 대시보드 카드 1 레이블/아이콘 업데이트
  const card1Label = document.getElementById('dashCard1Label');
  const card1Sub   = document.getElementById('dashCard1Sub');
  const card1Icon  = document.getElementById('dashCard1Icon');
  if (alertSettings) {
    if (card1Label) card1Label.textContent = '등록된 프로젝트';
    if (card1Sub)   card1Sub.textContent   = alertSettings.projectName || '알림 설정 완료';
    if (card1Icon)  card1Icon.className    = 'fas fa-project-diagram';
  } else {
    if (card1Label) card1Label.textContent = '등록된 프로젝트';
    if (card1Sub)   card1Sub.textContent   = '알림 설정에서 등록하세요';
    if (card1Icon)  card1Icon.className    = 'fas fa-folder-open';
  }
}

/* ──────────────────────────────────────────
   2. 다가오는 인허가 일정 (상위 5개)
────────────────────────────────────────── */
function updateDashUpcomingList() {
  const container = document.getElementById('dashUpcomingList');
  if (!container) return;

  const schedules = _getSchedules();

  if (!alertSettings || schedules.length === 0) {
    container.innerHTML = `
      <div class="dash-empty">
        <i class="fas fa-calendar-times"></i>
        <p>알림 설정에서 착공일과 인허가 항목을 등록하면<br>다가오는 일정이 표시됩니다</p>
        <button class="btn-outline-sm" style="margin-top:12px;"
          onclick="navigateTo('notification', document.querySelector('[data-page=notification]'))">
          <i class="fas fa-bell"></i> 알림 설정하기
        </button>
      </div>`;
    return;
  }

  // 마감일 순 정렬 (미완료 우선, 그 다음 완료 항목)
  const sorted = [...schedules]
    .filter(s => s.deadline)
    .sort((a, b) => {
      if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
      return (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999);
    });

  const top5 = sorted.slice(0, 5);

  const _status = s => {
    if (s.isDone)             return { cls: 'status-done',    label: '완료' };
    if (s.daysLeft === null)  return { cls: 'status-pending', label: '미제출' };
    if (s.daysLeft < 0)       return { cls: 'status-overdue', label: '기한초과' };
    if (s.daysLeft <= 7)      return { cls: 'status-urgent',  label: '긴급' };
    if (s.daysLeft <= 14)     return { cls: 'status-warning', label: '준비중' };
    return                           { cls: 'status-pending', label: '미제출' };
  };

  const _dColor = s =>
    s.isDone ? '#27AE60' :
    s.daysLeft === null ? '#ADB5BD' :
    s.daysLeft < 0 ? '#9B59B6' :
    s.daysLeft <= 7 ? '#E74C3C' :
    s.daysLeft <= 14 ? '#F39C12' : '#2980B9';

  const _dLabel = s =>
    s.isDone ? '완료' :
    s.daysLeft === null ? '-' :
    s.daysLeft < 0 ? `+${Math.abs(s.daysLeft)}d` :
    s.daysLeft === 0 ? 'D-Day!' :
    `D-${s.daysLeft}`;

  container.innerHTML = `
    <table class="dash-schedule-table">
      <thead>
        <tr>
          <th style="width:36px;">#</th>
          <th>인허가 명칭</th>
          <th>제출 마감일</th>
          <th>D-day</th>
          <th>제출처</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        ${top5.map(s => {
          const st = _status(s);
          const rc = s.isDone ? 'row-done' :
                     s.daysLeft !== null && s.daysLeft < 0 ? 'row-overdue' :
                     s.daysLeft !== null && s.daysLeft <= 7 ? 'row-urgent' :
                     s.daysLeft !== null && s.daysLeft <= 14 ? 'row-warning' : '';
          const submitToShort = (s.submitTo || '-').length > 10
            ? (s.submitTo || '-').slice(0, 10) + '…'
            : (s.submitTo || '-');
          return `
            <tr class="${rc}">
              <td style="text-align:center;font-weight:700;color:#1B3A5C;font-size:0.78rem;">${s.num || ''}</td>
              <td>
                <div class="schedule-name ${s.isDone ? 'done-text' : ''}">${s.name}</div>
                <div class="schedule-project">${alertSettings.projectName || ''}</div>
              </td>
              <td style="font-size:0.78rem;color:#495057;">${_dashFmt(s.deadline)}</td>
              <td>
                <span class="dday-badge" style="background:${_dColor(s)};">
                  ${_dLabel(s)}
                </span>
              </td>
              <td class="schedule-submitto" style="font-size:0.73rem;">${submitToShort}</td>
              <td><span class="permit-status ${st.cls}">${st.label}</span></td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>
    ${sorted.length > 5 ? `
      <div class="dash-more-hint" onclick="navigateTo('notification', document.querySelector('[data-page=notification]'))">
        <i class="fas fa-chevron-down"></i> 외 ${sorted.length - 5}개 항목 더 있음 → 알림 설정에서 확인
      </div>` : ''}`;
}

function _dashFmt(d) {
  if (!d) return '-';
  const p = d.split('-');
  return p.length === 3 ? `${p[0]}.${p[1]}.${p[2]}` : d;
}

/* ──────────────────────────────────────────
   3. 카테고리별 현황
────────────────────────────────────────── */
function updateDashCategoryList() {
  const container = document.getElementById('dashCategoryList');
  if (!container) return;

  if (typeof CHECKLIST_ITEMS === 'undefined') {
    container.innerHTML = '<div class="dash-empty" style="padding:16px;"><p>데이터 로딩 중...</p></div>';
    return;
  }

  const catColors = {
    '산업안전보건':     '#1B3A5C',
    '환경':             '#2E7D4F',
    '화학·가스':        '#C0392B',
    '에너지·전기·소방': '#D35400',
    '건설행정·기타':    '#6C3483'
  };

  const catCounts = {};
  CHECKLIST_ITEMS.forEach(it => {
    catCounts[it.category] = (catCounts[it.category] || 0) + 1;
  });
  const total = CHECKLIST_ITEMS.length;

  const schedules = _getSchedules();
  const selectedInCat = {};
  const doneInCat     = {};
  const urgentInCat   = {};
  schedules.forEach(s => {
    const cat = s.category || '';
    selectedInCat[cat] = (selectedInCat[cat] || 0) + 1;
    if (s.isDone) doneInCat[cat] = (doneInCat[cat] || 0) + 1;
    if (!s.isDone && s.daysLeft !== null && s.daysLeft >= 0 && s.daysLeft <= 7) {
      urgentInCat[cat] = (urgentInCat[cat] || 0) + 1;
    }
  });

  container.innerHTML = Object.entries(catCounts).map(([cat, cnt]) => {
    const pct   = Math.round((cnt / total) * 100);
    const color = catColors[cat] || '#888';
    const sel   = selectedInCat[cat] || 0;
    const done  = doneInCat[cat]     || 0;
    const urg   = urgentInCat[cat]   || 0;
    const selPct = sel > 0 ? Math.round((sel / cnt) * 100) : 0;

    return `
      <div class="cat-stat-row">
        <div class="cat-stat-label">
          <span class="cat-dot" style="background:${color};"></span>
          <span>${cat}</span>
        </div>
        <div class="cat-stat-bar-wrap">
          <div class="cat-stat-bar" style="width:${pct}%;background:${color};opacity:0.3;"></div>
          ${sel > 0 ? `<div class="cat-stat-bar" style="position:absolute;left:0;width:${selPct}%;background:${color};"></div>` : ''}
        </div>
        <div class="cat-stat-num">
          <span style="color:${color};font-weight:700;">${cnt}</span>개
          ${sel > 0 ? `<span class="cat-sel-badge" style="background:${color}20;color:${color};">${sel}선택</span>` : ''}
          ${done > 0 ? `<span class="cat-done-badge">${done}완료</span>` : ''}
          ${urg > 0 ? `<span class="cat-urg-badge">${urg}긴급</span>` : ''}
        </div>
      </div>`;
  }).join('');
}

/* ──────────────────────────────────────────
   4. Gantt 타임라인
────────────────────────────────────────── */
function updateDashTimeline() {
  const container = document.getElementById('dashTimeline');
  const rangeEl   = document.getElementById('dashTimelineRange');
  if (!container) return;

  const schedules = _getSchedules().filter(s => s.deadline);

  if (!alertSettings || schedules.length === 0) {
    container.innerHTML = `
      <div class="dash-empty">
        <i class="fas fa-project-diagram"></i>
        <p>알림 설정 후 타임라인이 생성됩니다<br>
        <small>착공일과 인허가 항목을 등록하면 간트차트가 표시됩니다</small></p>
      </div>`;
    if (rangeEl) rangeEl.textContent = '';
    return;
  }

  schedules.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const earliest = schedules[0].deadline;
  const latest   = schedules[schedules.length - 1].deadline;
  const today    = new Date().toISOString().split('T')[0];

  if (rangeEl) rangeEl.textContent = `${_dashFmt(earliest)} ~ ${_dashFmt(latest)}`;

  // 타임라인 범위 계산 (앞뒤로 20일 여유)
  const startMs  = new Date(earliest).getTime() - 20 * 86400000;
  const endMs    = new Date(latest).getTime()   + 30 * 86400000;
  const totalMs  = endMs - startMs;
  const totalDays = totalMs / 86400000;

  const catColors = {
    '산업안전보건':     '#1B3A5C',
    '환경':             '#2E7D4F',
    '화학·가스':        '#C0392B',
    '에너지·전기·소방': '#D35400',
    '건설행정·기타':    '#6C3483'
  };

  const todayMs  = new Date(today).getTime();
  const todayPct = ((todayMs - startMs) / totalMs) * 100;

  // 월 눈금
  const months = [];
  const cur = new Date(startMs);
  const endDate = new Date(endMs);
  while (cur <= endDate && months.length < 20) {
    months.push(new Date(cur.getFullYear(), cur.getMonth(), 1));
    cur.setMonth(cur.getMonth() + 1);
  }

  const monthMarks = months.map(m => {
    const pct = ((m.getTime() - startMs) / totalMs) * 100;
    if (pct < 0 || pct > 102) return '';
    const label = `${m.getMonth() + 1}월`;
    return `<div class="gantt-month-mark" style="left:${pct.toFixed(1)}%;">${label}</div>`;
  }).join('');

  const rows = schedules.map(s => {
    const color    = catColors[s.category || ''] || '#888';
    const pct      = Math.max(1, Math.min(
      ((new Date(s.deadline).getTime() - startMs) / totalMs) * 100,
      98
    ));
    const isDone   = s.isDone;
    const isUrgent = !isDone && s.daysLeft !== null && s.daysLeft >= 0 && s.daysLeft <= 7;
    const isOverdue = !isDone && s.daysLeft !== null && s.daysLeft < 0;
    const finalColor = isDone ? '#27AE60' : isOverdue ? '#9B59B6' : color;

    const pinClass = isDone ? 'pin-done' : isUrgent ? 'pin-urgent' : isOverdue ? 'pin-overdue' : '';
    const nameShort = (s.name || '').length > 13 ? s.name.slice(0, 13) + '…' : s.name;
    const dLabel = isDone ? '완료' : s.daysLeft === null ? '' :
                   s.daysLeft < 0 ? `+${Math.abs(s.daysLeft)}d` :
                   s.daysLeft === 0 ? 'D-Day!' : `D-${s.daysLeft}`;

    // 알림 핀들
    const alertPins = (s.alertDates || []).map(ad => {
      if (!ad) return '';
      const aPct = Math.max(0, Math.min(
        ((new Date(ad).getTime() - startMs) / totalMs) * 100, 100
      ));
      return `<div class="gantt-alert-pin" style="left:${aPct.toFixed(1)}%;" title="🔔 알림: ${_dashFmt(ad)}">🔔</div>`;
    }).join('');

    return `
      <div class="gantt-row">
        <div class="gantt-label">
          <span class="gantt-num" style="color:${color};">${s.num || ''}</span>
          <span class="gantt-name ${isDone ? 'gantt-name-done' : ''}" title="${s.name}">${nameShort}</span>
          ${isDone ? '<i class="fas fa-check-circle" style="color:#27AE60;font-size:0.62rem;"></i>' : ''}
        </div>
        <div class="gantt-bar-area">
          ${monthMarks}
          ${todayPct >= 0 && todayPct <= 100 ?
            `<div class="gantt-today-line" style="left:${todayPct.toFixed(1)}%;"></div>` : ''}
          ${alertPins}
          <div class="gantt-pin ${pinClass}"
               style="left:${pct.toFixed(1)}%;"
               title="${s.name}\n마감: ${_dashFmt(s.deadline)}${s.daysLeft != null ? '\n' + dLabel : ''}">
            <div class="gantt-pin-dot" style="background:${finalColor};"></div>
            <div class="gantt-pin-label" style="color:${finalColor};">${_dashFmt(s.deadline)}</div>
          </div>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="gantt-container">
      <div class="gantt-legend">
        <span><span class="gantt-legend-dot" style="background:#1B3A5C;"></span>산업안전</span>
        <span><span class="gantt-legend-dot" style="background:#2E7D4F;"></span>환경</span>
        <span><span class="gantt-legend-dot" style="background:#C0392B;"></span>화학·가스</span>
        <span><span class="gantt-legend-dot" style="background:#D35400;"></span>에너지·소방</span>
        <span><span class="gantt-legend-dot" style="background:#6C3483;"></span>건설행정</span>
        <span><span class="gantt-legend-dot" style="background:#27AE60;"></span>완료</span>
        <span><span class="gantt-today-legend">│</span>오늘</span>
        <span>🔔 알림 발송일</span>
      </div>
      <div class="gantt-scroll-wrap">
        <div class="gantt-scroll">
          ${rows}
        </div>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────
   CSV 내보내기 (대시보드)
────────────────────────────────────────── */
function exportDashboardCSV() {
  if (typeof exportNotifCSV === 'function') {
    exportNotifCSV();
  } else {
    showToast('warning', '⚠️ 저장된 알림이 없습니다.');
  }
}
