/* =============================================
   SafeGuard Pro – 로그인 / 인증 모듈 (Firebase 이메일/비밀번호)
   auth.js
   ---------------------------------------------
   실제 인증/세션은 Firebase(cloud.js)가 담당한다.
   이 파일은 로그인 화면 UI와 폼 처리만 맡는다.
   ============================================= */

let sgAuthMode = 'login';   // 'login' | 'signup'

/* 로그인 여부 (Firebase 사용자 기준) */
function authIsLoggedIn() { return !!(typeof sgUser !== 'undefined' && sgUser); }

/* ────────────────────────────────────────────
   로그아웃
──────────────────────────────────────────── */
function authLogout() {
  if (typeof cloudSignOut === 'function') {
    cloudSignOut().catch(function () {});
  } else {
    showLoginScreen();
  }
}

/* ────────────────────────────────────────────
   로그인 화면 표시 / 숨김
──────────────────────────────────────────── */
function showLoginScreen() {
  const loginWrap = document.getElementById('loginScreen');
  const appLayout = document.getElementById('appLayout');
  if (loginWrap) loginWrap.style.display = 'flex';
  if (appLayout) appLayout.style.display = 'none';
  const idEl = document.getElementById('loginId');
  const pwEl = document.getElementById('loginPw');
  const erEl = document.getElementById('loginError');
  if (pwEl) pwEl.value = '';
  if (erEl) { erEl.textContent = ''; erEl.style.display = 'none'; }
  if (idEl) idEl.focus();
}

function hideLoginScreen() {
  const loginWrap = document.getElementById('loginScreen');
  const appLayout = document.getElementById('appLayout');
  if (loginWrap) loginWrap.style.display = 'none';
  if (appLayout) appLayout.style.display = 'flex';
}

/* ────────────────────────────────────────────
   로그인/회원가입 모드 전환
──────────────────────────────────────────── */
function authToggleMode() {
  sgAuthMode = (sgAuthMode === 'login') ? 'signup' : 'login';
  _authUpdateModeUI();
  const erEl = document.getElementById('loginError');
  if (erEl) erEl.style.display = 'none';
}

function _authUpdateModeUI() {
  const btn = document.getElementById('loginBtn');
  const link = document.getElementById('authToggleLink');
  const sub = document.getElementById('loginModeHint');
  if (sgAuthMode === 'signup') {
    if (btn) btn.innerHTML = '<i class="fas fa-user-plus"></i> 회원가입';
    if (link) link.textContent = '이미 계정이 있으신가요? 로그인';
    if (sub) sub.textContent = '이메일과 비밀번호(6자 이상)로 계정을 만드세요.';
  } else {
    if (btn) btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> 로그인';
    if (link) link.textContent = '처음이신가요? 회원가입';
    if (sub) sub.textContent = '가입한 이메일과 비밀번호로 로그인하세요.';
  }
}

function _authShowError(msg) {
  const erEl = document.getElementById('loginError');
  if (erEl) { erEl.textContent = msg; erEl.style.display = 'block'; }
}
function _authShake() {
  const card = document.getElementById('loginCard');
  if (card) { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
}

/* ────────────────────────────────────────────
   로그인/회원가입 폼 제출
──────────────────────────────────────────── */
function handleLoginSubmit(e) {
  if (e) e.preventDefault();
  const email = (document.getElementById('loginId')?.value || '').trim();
  const pw = document.getElementById('loginPw')?.value || '';
  const btn = document.getElementById('loginBtn');

  if (!email || !pw) { _authShowError('이메일과 비밀번호를 입력해 주세요.'); _authShake(); return; }
  if (typeof cloudSignIn !== 'function') { _authShowError('로그인 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.'); return; }

  const erEl = document.getElementById('loginError');
  if (erEl) erEl.style.display = 'none';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...'; }

  const promise = (sgAuthMode === 'signup') ? cloudSignUp(email, pw) : cloudSignIn(email, pw);
  promise
    .then(function () { /* 화면 전환은 cloudOnAuthChanged 가 처리 */ })
    .catch(function (err) {
      _authShowError(typeof cloudAuthErrorMsg === 'function' ? cloudAuthErrorMsg(err) : '로그인에 실패했습니다.');
      _authShake();
    })
    .finally(function () { if (btn) { btn.disabled = false; _authUpdateModeUI(); } });
}

/* ────────────────────────────────────────────
   비밀번호 표시 토글
──────────────────────────────────────────── */
function togglePwVisibility() {
  const pw = document.getElementById('loginPw');
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
  const name = (typeof sgUser !== 'undefined' && sgUser && sgUser.email) ? sgUser.email : '사용자';
  const el = document.getElementById('sidebarUserName');
  if (el) el.textContent = name;
  const badge = document.querySelector('.user-badge');
  if (badge) badge.innerHTML = `<i class="fas fa-user-circle"></i> ${name}`;
}

/* ────────────────────────────────────────────
   로그아웃 확인 모달
──────────────────────────────────────────── */
function confirmLogout() {
  const modal = document.getElementById('logoutConfirmModal');
  const overlay = document.getElementById('logoutConfirmOverlay');
  if (modal) modal.classList.add('active');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function cancelLogout() {
  const modal = document.getElementById('logoutConfirmModal');
  const overlay = document.getElementById('logoutConfirmOverlay');
  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}
function executeLogout() {
  cancelLogout();
  authLogout();
}

/* ────────────────────────────────────────────
   진입점 – 로그인 화면 표시.
   실제 로그인 복원은 Firebase(cloud.js) onAuthStateChanged 가 처리한다.
──────────────────────────────────────────── */
function authInit() {
  _authUpdateModeUI();
  showLoginScreen();
}

document.addEventListener('DOMContentLoaded', function () {
  authInit();

  ['loginId', 'loginPw'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleLoginSubmit(e);
      });
    }
  });

  const ov = document.getElementById('logoutConfirmOverlay');
  if (ov) ov.addEventListener('click', cancelLogout);
});
