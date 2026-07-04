/* =============================================
   SafeGuard Pro - 메인 앱 로직
   네비게이션, 공통 기능, LocalStorage 영속성
   ============================================= */

// ---- 현재 날짜 표시 ----
function setCurrentDate() {
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    dateEl.textContent = now.toLocaleDateString('ko-KR', options);
  }
}

// ---- 사이드바 법령 기준일 / 데이터 최신화 날짜 주입 ----
// constants.js의 SG_LAW_DATE · SG_DATA_DATE 상수를 참조합니다.
// 법령·데이터를 최신화할 때 constants.js 두 상수만 수정하면 자동 반영됩니다.
function setSidebarVersionDates() {
  const lawEl  = document.getElementById('footer-law-date');
  const dataEl = document.getElementById('footer-data-date');
  if (lawEl  && typeof SG_LAW_DATE  !== 'undefined') lawEl.textContent  = SG_LAW_DATE;
  if (dataEl && typeof SG_DATA_DATE !== 'undefined') dataEl.textContent = SG_DATA_DATE;
}

// ---- 페이지 제목 맵 ----
const PAGE_TITLES = {
  'dashboard':          '프로젝트 대시보드',
  'law-chatbot':        '안전법령 AI 상담',
  'guideline-chatbot':  '인허가 가이드라인 상담',
  'jsa-analysis':       'JSA 위험성평가',
  'checklist':          '인허가 체크리스트',
  'notification':       '알림 설정'
};

// ---- 네비게이션 ----
function navigateTo(pageId, el) {
  // 모든 페이지 비활성화
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // 대상 페이지 활성화
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');

  // 네비게이션 아이템 활성화
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  else {
    // el 없을 때 data-page 기준으로 찾기
    const navEl = document.querySelector(`[data-page="${pageId}"]`);
    if (navEl) navEl.classList.add('active');
  }

  // 상단 제목 업데이트
  const titleEl = document.getElementById('topBarTitle');
  if (titleEl) titleEl.textContent = PAGE_TITLES[pageId] || '';

  // 사이드바 닫기 (모바일)
  closeSidebar();

  // 페이지별 초기화
  switch (pageId) {
    case 'checklist':
      initChecklistGrid();
      updateSelectedCount();
      loadChecklistStateFromStorage();
      break;
    case 'notification':
      initNotificationPage();
      break;
    case 'dashboard':
      refreshDashboard();
      break;
    case 'jsa-analysis':
      if (typeof initJsaPage === 'function') initJsaPage();
      break;
  }

  // 스크롤 상단으로
  if (target) target.scrollTop = 0;

  return false;
}

// ---- 사이드바 열기/닫기 ----
function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ---- 토스트 알림 ----
function showToast(type, message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: 'fa-check-circle',
    error:   'fa-times-circle',
    warning: 'fa-exclamation-triangle',
    info:    'fa-info-circle'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${icons[type] || 'fa-bell'}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  // 애니메이션 후 제거
  setTimeout(() => {
    toast.style.opacity    = '0';
    toast.style.transform  = 'translateX(100%)';
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 3500);
}

// ---- 텍스트에어리어 자동 높이 ----
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 150) + 'px';
}

function bindTextareaAutoResize() {
  document.querySelectorAll('.chat-input').forEach(ta => {
    ta.addEventListener('input', function() { autoResize(this); });
  });
}

/* ──────────────────────────────────────────
   체크리스트 LocalStorage 영속성
────────────────────────────────────────── */
function saveChecklistStateToStorage() {
  try {
    const state = {
      projectName:         document.getElementById('projectName')?.value         || '',
      constructionType:    document.getElementById('constructionType')?.value    || '',
      constructionCost:    document.getElementById('constructionCost')?.value    || '',
      workerCount:         document.getElementById('workerCount')?.value         || '',
      peakWorkerCount:     document.getElementById('peakWorkerCount')?.value     || '',
      hazChemCheck:        document.getElementById('hazChemCheck')?.checked      || false,
      highGasCheck:        document.getElementById('highGasCheck')?.checked      || false,
      confinedSpaceCheck:  document.getElementById('confinedSpaceCheck')?.checked || false,
      checkedItems:        typeof checkedItems !== 'undefined' ? [...checkedItems] : []
    };
    localStorage.setItem('sg_checklist_state', JSON.stringify(state));
  } catch (e) {
    console.warn('[SafeGuard] 체크리스트 상태 저장 실패:', e);
  }
}

function loadChecklistStateFromStorage() {
  try {
    const raw = localStorage.getItem('sg_checklist_state');
    if (!raw) return;
    const state = JSON.parse(raw);

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && !el.value) el.value = val || '';
    };
    const setChk = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.checked = !!val;
    };

    setVal('projectName',      state.projectName);
    setVal('constructionCost', state.constructionCost);
    setVal('workerCount',      state.workerCount);
    setVal('peakWorkerCount',  state.peakWorkerCount);
    setChk('hazChemCheck',     state.hazChemCheck);
    setChk('highGasCheck',     state.highGasCheck);
    setChk('confinedSpaceCheck', state.confinedSpaceCheck);

    // 공사 구분 복원 (변경 이벤트 트리거)
    if (state.constructionType) {
      const el = document.getElementById('constructionType');
      if (el && !el.value) {
        el.value = state.constructionType;
        onConstructionTypeChange();
      }
    }

    // 체크 아이템 복원
    if (state.checkedItems && Array.isArray(state.checkedItems) && typeof checkedItems !== 'undefined') {
      state.checkedItems.forEach(id => {
        const numId = parseInt(id);
        if (!isNaN(numId)) checkedItems.add(numId);
      });
      if (typeof initChecklistGrid === 'function') initChecklistGrid();
      if (typeof updateSelectedCount === 'function') updateSelectedCount();
    }
  } catch (e) {
    console.warn('[SafeGuard] 체크리스트 상태 복원 실패:', e);
  }
}

// ---- 체크리스트 폼 자동저장 바인딩 ----
function bindChecklistAutoSave() {
  const ids = [
    'projectName', 'constructionType', 'constructionCost',
    'workerCount', 'peakWorkerCount',
    'hazChemCheck', 'highGasCheck', 'confinedSpaceCheck'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', saveChecklistStateToStorage);
      el.addEventListener('input',  saveChecklistStateToStorage);
    }
  });
}


/* ============================================
   데이터 스키마 버전 관리
   - 저장된 데이터의 버전이 다르면 자동 정리
   - 5명 사용자 환경에서 호환성 보장
   ============================================ */
function checkSchemaVersion() {
  try {
    // constants.js가 로드되었는지 확인
    if (typeof SG_SCHEMA_VERSION === 'undefined') {
      console.warn('[SafeGuard] constants.js 미로드 - 버전 체크 건너뜀');
      return;
    }

    // constants.js의 SG_STORAGE_KEYS 활용 (오타 방지)
    const STORAGE_KEY = (typeof SG_STORAGE_KEYS !== 'undefined' && SG_STORAGE_KEYS.SCHEMA_VERSION)
      ? SG_STORAGE_KEYS.SCHEMA_VERSION
      : 'sg_schema_version';
    const currentVersion = SG_SCHEMA_VERSION;
    const savedVersion = localStorage.getItem(STORAGE_KEY);

    // 첫 사용자 (저장된 버전 없음)
    if (!savedVersion) {
      localStorage.setItem(STORAGE_KEY, currentVersion);
      console.log('[SafeGuard] 신규 설치 - 스키마 v' + currentVersion + ' 저장');
      return;
    }

    // 버전이 같으면 정상
    if (savedVersion === currentVersion) {
      console.log('[SafeGuard] 스키마 버전 일치: v' + currentVersion);
      return;
    }

    // 버전 다름 - 마이그레이션 필요
    console.warn('[SafeGuard] 스키마 버전 변경: v' + savedVersion + ' → v' + currentVersion);

    // 호환성 깨질 가능성이 있는 키만 정리 (구버전 + 신버전 모두 포함)
    const RESET_KEYS = [
      // 구버전 키 (옛날 호환)
      'checkedItems',
      'expandedCategories',
      'selectedPermits',
      'alertSettings',
      'completedPermits',
      'globalAlertDays',
      // 신버전 키 (sg_ 접두사)
      'sg_checked_items',
      'sg_alert_settings',
      'sg_saved_alerts'
    ];

    RESET_KEYS.forEach(function(key) {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        console.log('[SafeGuard] 초기화: ' + key);
      }
    });

    // 새 버전 기록
    localStorage.setItem(STORAGE_KEY, currentVersion);

    // 사용자에게 알림 (인자 순서: type, message)
    if (typeof showToast === 'function') {
      showToast('info', '데이터 구조가 업데이트되어 일부 설정이 초기화되었습니다.');
    }
  } catch (e) {
    console.error('[SafeGuard] 스키마 버전 체크 실패:', e);
  }
}


/* ──────────────────────────────────────────
   앱 초기화
────────────────────────────────────────── */
let __sgAppInited = false;
function initApp() {
  // 중복 초기화 방지 (auth.js 와 DOMContentLoaded 이중 호출 대비)
  if (__sgAppInited) return;
  __sgAppInited = true;

  // 스키마 버전 체크 (호환성 깨지면 자동 정리)
  checkSchemaVersion();

  // 법령 API 초기화 (비동기 연결 상태 체크)
  if (typeof initLawApi === 'function') initLawApi();

  // 날짜 설정
  setCurrentDate();

  // 사이드바 법령 기준일 / 데이터 최신화 날짜 주입
  setSidebarVersionDates();

  // 전역 상태 먼저 로드
  if (typeof loadAllStorage === 'function') {
    loadAllStorage();
  }

  // 체크리스트 초기화
  if (typeof initChecklistGrid === 'function')    initChecklistGrid();
  if (typeof updateSelectedCount === 'function')  updateSelectedCount();
  loadChecklistStateFromStorage();
  bindChecklistAutoSave();

  // selectedPermits 동기화 (저장된 체크 아이템 → 알림 페이지 연동)
  if (typeof syncSelectedPermitsToStorage === 'function') {
    syncSelectedPermitsToStorage();
  }

  // 알림 초기화 (사이드바 위젯 & 저장 알림)
  if (typeof renderSavedAlerts === 'function')     renderSavedAlerts();
  if (typeof updateSidebarWidget === 'function')   updateSidebarWidget();

  // 대시보드 초기화
  if (typeof refreshDashboard === 'function')      refreshDashboard();

  // 챗봇 웰컴 메시지
  if (typeof appendAiMessage === 'function') {
    if (typeof buildLawWelcomeMsg === 'function')
      appendAiMessage('lawChatWindow', buildLawWelcomeMsg(), 'ai-avatar');
    if (typeof buildGuidelineWelcomeMsg === 'function')
      appendAiMessage('guidelineChatWindow', buildGuidelineWelcomeMsg(), 'ai-avatar guideline-avatar');
  }

  // 채팅 스크롤
  setTimeout(() => {
    if (typeof scrollToBottom === 'function') {
      scrollToBottom('lawChatWindow');
      scrollToBottom('guidelineChatWindow');
    }
  }, 100);

  // 텍스트에어리어 자동 높이
  bindTextareaAutoResize();

  // 날짜 매 분 갱신
  setInterval(setCurrentDate, 60000);

  // D-day 긴급 카운트 주기적 업데이트 (1분마다)
  setInterval(() => {
    if (typeof loadAllStorage === 'function') loadAllStorage();
    if (typeof updateSidebarWidget === 'function') updateSidebarWidget();
    // 대시보드가 표시 중일 때만 새로고침
    const dashPage = document.getElementById('page-dashboard');
    if (dashPage && dashPage.classList.contains('active')) {
      if (typeof refreshDashboard === 'function') refreshDashboard();
    }
  }, 60000);

  // 인허가 항목 수를 데이터에서 동적으로 계산 (하드코딩 제거)
  const permitCount    = (typeof CHECKLIST_ITEMS    !== 'undefined' && Array.isArray(CHECKLIST_ITEMS))    ? CHECKLIST_ITEMS.length    : 0;
  const lawCount       = (typeof LAW_DATABASE       !== 'undefined' && Array.isArray(LAW_DATABASE))       ? LAW_DATABASE.length       : 0;
  const guidelineCount = (typeof GUIDELINE_DATABASE !== 'undefined' && Array.isArray(GUIDELINE_DATABASE)) ? GUIDELINE_DATABASE.length : 0;
  const versionLabel   = (typeof SG_SCHEMA_VERSION !== 'undefined') ? SG_SCHEMA_VERSION : '5.1';

  console.log(
    '[SafeGuard Pro v' + versionLabel + '] 앱 초기화 완료 | ' +
    '제선·고로 인허가 ' + permitCount + '개 | ' +
    '법령 DB: ' + lawCount + '개 | ' +
    '유권해석 DB: ' + guidelineCount + '건'
  );
}

// ---- 키보드 단축키 ----
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeSidebar();
    if (typeof closeModal === 'function') closeModal();
  }
});

// ---- DOM 로드 시 실행 ----
// 초기화 진입점은 auth.js 의 authInit() 하나로 일원화한다.
// (auth.js 가 DOMContentLoaded 에서 authInit() 을 호출하고,
//  로그인되어 있으면 그 안에서 initApp() 을 실행한다.)
// 여기서 initApp 을 중복 호출하지 않는다 → 경쟁조건 제거.
// initApp() 은 __sgAppInited 가드로 이중 실행이 방지되어 있으므로 안전하다.
