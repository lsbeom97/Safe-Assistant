/* =============================================
   SafeGuard Pro – 로그인 / 인증 모듈
   auth.js
   ============================================= */

/* ── 계정 정보 (하드코딩 단일 관리자) ── */
const AUTH_ACCOUNT = { id: 'admin', pw: 'admin', name: '관리자' };

/* ── sessionStorage 키 ── */
const SESSION_KEY = 'sg_session';

/* ────────────────────────────────────────────
   세션 헬퍼
──────────────────────────────────────────── */
function authGetSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function authSetSession(data) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function authClearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function authIsLoggedIn() {
  const s = authGetSession();
  return !!(s && s.loggedIn === true);
}

/* ────────────────────────────────────────────
   로그인 / 로그아웃
──────────────────────────────────────────── */
function authLogin(id, pw) {
  if (id === AUTH_ACCOUNT.id && pw === AUTH_ACCOUNT.pw) {
    authSetSession({ loggedIn: true, loginTime: Date.now(), name: AUTH_ACCOUNT.name });
    return true;
  }
  return false;
}

function authLogout() {
  authClearSession();
  showLoginScreen();
}

/* ────────────────────────────────────────────
   로그인 화면 표시 / 숨김
──────────────────────────────────────────── */
function showLoginScreen() {
  const loginWrap  = document.getElementById('loginScreen');
  const appLayout  = document.getElementById('appLayout');
  if (loginWrap) loginWrap.style.display = 'flex';
  if (appLayout)  appLayout.style.display = 'none';
  // 입력 초기화
  const idEl = document.getElementById('loginId');
  const pwEl = document.getElementById('loginPw');
  const erEl = document.getElementById('loginError');
  if (idEl) idEl.value = '';
  if (pwEl) pwEl.value = '';
  if (erEl) { erEl.textContent = ''; erEl.style.display = 'none'; }
  if (idEl) idEl.focus();
}

function hideLoginScreen() {
  const loginWrap = document.getElementById('loginScreen');
  const appLayout = document.getElementById('appLayout');
  if (loginWrap) loginWrap.style.display = 'none';
  if (appLayout)  appLayout.style.display = 'flex';
}

/* ────────────────────────────────────────────
   로그인 폼 제출 핸들러
──────────────────────────────────────────── */
function handleLoginSubmit(e) {
  if (e) e.preventDefault();

  const id   = (document.getElementById('loginId')?.value || '').trim();
  const pw   = document.getElementById('loginPw')?.value || '';
  const erEl = document.getElementById('loginError');
  const btn  = document.getElementById('loginBtn');

  // 버튼 로딩 상태
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 확인 중...'; }

  setTimeout(() => {
    if (authLogin(id, pw)) {
      // 성공
      hideLoginScreen();
      // 사이드바 사용자명 업데이트
      updateSidebarUserInfo();
      // 앱 초기화 (최초 1회)
      if (typeof initApp === 'function') initApp();
    } else {
      // 실패
      if (erEl) {
        erEl.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
        erEl.style.display = 'block';
      }
      // 입력 필드 흔들기 애니메이션
      const card = document.getElementById('loginCard');
      if (card) {
        card.classList.remove('shake');
        void card.offsetWidth; // reflow
        card.classList.add('shake');
      }
    }
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> 로그인'; }
  }, 400); // 짧은 딜레이로 자연스러운 UX
}

/* ────────────────────────────────────────────
   비밀번호 표시 토글
──────────────────────────────────────────── */
function togglePwVisibility() {
  const pw   = document.getElementById('loginPw');
  const icon = document.getElementById('pwToggleIcon');
  if (!pw) return;
  if (pw.type === 'password') {
    pw.type = 'text';
    if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
  } else {
    pw.type = 'password';
    if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
  }
}

/* ────────────────────────────────────────────
   사이드바 사용자 정보 업데이트
──────────────────────────────────────────── */
function updateSidebarUserInfo() {
  const s = authGetSession();
  const name = s?.name || '관리자';

  // 사이드바 사용자 표시 영역
  const el = document.getElementById('sidebarUserName');
  if (el) el.textContent = name;

  // 상단 헤더 user-badge
  const badge = document.querySelector('.user-badge');
  if (badge) badge.innerHTML = `<i class="fas fa-user-circle"></i> ${name}`;
}

/* ────────────────────────────────────────────
   로그아웃 확인 모달
──────────────────────────────────────────── */
function confirmLogout() {
  const modal = document.getElementById('logoutConfirmModal');
  const overlay = document.getElementById('logoutConfirmOverlay');
  if (modal)   modal.classList.add('active');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cancelLogout() {
  const modal = document.getElementById('logoutConfirmModal');
  const overlay = document.getElementById('logoutConfirmOverlay');
  if (modal)   modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function executeLogout() {
  cancelLogout();
  authLogout();
}

/* ────────────────────────────────────────────
   진입점 – DOM 준비 후 인증 체크
──────────────────────────────────────────── */
function authInit() {
  if (authIsLoggedIn()) {
    // 이미 로그인 → 앱 바로 시작
    hideLoginScreen();
    updateSidebarUserInfo();
    // initApp 은 main.js DOMContentLoaded 에서 호출됨
  } else {
    // 미로그인 → 로그인 화면
    showLoginScreen();
  }
}

/* Enter 키 바인딩 (loginPw 필드) */
document.addEventListener('DOMContentLoaded', function () {
  authInit();

  // 로그인 폼 Enter
  ['loginId', 'loginPw'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleLoginSubmit(e);
      });
    }
  });

  // 로그아웃 오버레이 클릭
  const ov = document.getElementById('logoutConfirmOverlay');
  if (ov) ov.addEventListener('click', cancelLogout);
});
