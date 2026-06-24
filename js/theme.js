/* =============================================
   SafeGuard Pro – 다크모드 테마 토글
   js/theme.js  v1.0
   =============================================
   - LocalStorage "themeMode" 키 ("light" | "dark")
   - <html data-theme="dark"> 속성으로 CSS 변수 전환
   - 사이드바 상단 슬라이드 스위치 UI 연동
   ============================================= */

const THEME_KEY    = 'themeMode';
const DARK_VALUE   = 'dark';
const LIGHT_VALUE  = 'light';

/* ─── 현재 테마 반환 ─── */
function getThemeMode() {
  return localStorage.getItem(THEME_KEY) || LIGHT_VALUE;
}

/* ─── 테마 적용 ─── */
function applyTheme(mode) {
  const html = document.documentElement;
  if (mode === DARK_VALUE) {
    html.setAttribute('data-theme', 'dark');
  } else {
    html.removeAttribute('data-theme');
  }
  // 토글 스위치 UI 동기화
  const toggle = document.getElementById('themeToggleInput');
  if (toggle) toggle.checked = (mode === DARK_VALUE);
  // 툴팁 텍스트 업데이트
  const label = document.getElementById('themeToggleLabel');
  if (label) label.title = mode === DARK_VALUE ? '라이트모드로 전환' : '다크모드로 전환';
}

/* ─── 토글 실행 ─── */
function toggleTheme() {
  const current = getThemeMode();
  const next    = current === DARK_VALUE ? LIGHT_VALUE : DARK_VALUE;
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

/* ─── 초기 로드 ─── */
(function initTheme() {
  // FOUC(Flash Of Unstyled Content) 방지:
  // DOMContentLoaded 전에 즉시 실행
  applyTheme(getThemeMode());
})();

/* ─── DOMContentLoaded 후 이벤트 바인딩 ─── */
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('themeToggleInput');
  if (toggle) {
    toggle.addEventListener('change', function () {
      const mode = this.checked ? DARK_VALUE : LIGHT_VALUE;
      localStorage.setItem(THEME_KEY, mode);
      applyTheme(mode);
    });
  }
  // 초기 상태 동기화 (DOM 로드 완료 후 다시 한 번)
  applyTheme(getThemeMode());
});
