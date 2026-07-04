/* =============================================
   SafeGuard Pro – Firebase 클라우드 연동 + 다중 프로젝트
   js/cloud.js
   ---------------------------------------------
   - 이메일/비밀번호 로그인(Firebase Auth)
   - 프로젝트별 데이터를 Firestore(users/{uid})에 저장
   - 기존 모듈은 그대로 localStorage를 사용하고,
     이 계층이 localStorage ↔ 클라우드 동기화를 담당한다.
   ============================================= */

/* ── Firebase 설정값 (클라이언트 공개용 – 비밀 아님, 보안은 Firestore 규칙으로) ── */
const SG_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBXvmAb75FJx9gIUqT8gGJlbHmnFsi1lE8",
  authDomain: "safeguard-pro-45071.firebaseapp.com",
  projectId: "safeguard-pro-45071",
  storageBucket: "safeguard-pro-45071.firebasestorage.app",
  messagingSenderId: "17522903387",
  appId: "1:17522903387:web:1ed1dd621941a3fa3f727e"
};

/* ── 프로젝트별로 클라우드에 저장할 localStorage 키 ── */
const SG_PROJECT_KEYS = [
  'sg_checklist_state',
  'sg_checked_items',
  'selectedPermits',
  'alertSettings',
  'sg_alert_settings',
  'sg_notifications',
  'sg_completed_items',
  'sg_saved_alerts',
  'sg_construction_type',
  'sg_project_end_date',
  'jsa_history',
  'jsaHistory'
];
/* ── 계정 전체 공용(프로젝트 무관) 키 ── */
const SG_GLOBAL_KEYS = ['sg_telegram_token', 'sg_telegram_chat_id'];

/* ── 상태 ── */
let sgAuth = null;
let sgDB = null;
let sgUser = null;
let sgCloudDoc = null;          // { currentProjectId, projects:{pid:{name,order,data}}, settings }
let sgCurrentProjectId = null;
let sgCloudReady = false;
let __sgSaveTimer = null;
let __sgApplyingBundle = false; // 번들 적용 중에는 클라우드 저장 트리거 방지

/* =============================================
   초기화
   ============================================= */
function cloudInit() {
  if (typeof firebase === 'undefined' || !firebase.initializeApp) {
    console.error('[SafeGuard] Firebase SDK 미로드');
    return false;
  }
  try {
    firebase.initializeApp(SG_FIREBASE_CONFIG);
    sgAuth = firebase.auth();
    sgDB = firebase.firestore();
    try { sgAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) {}
    _installLocalStorageHook();
    sgAuth.onAuthStateChanged(cloudOnAuthChanged);
    console.log('[SafeGuard] Firebase 초기화 완료');
    return true;
  } catch (e) {
    console.error('[SafeGuard] Firebase 초기화 실패:', e);
    return false;
  }
}

/* localStorage.setItem 후킹: 프로젝트 키가 바뀌면 클라우드 저장 예약 */
function _installLocalStorageHook() {
  const orig = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key, value) {
    orig(key, value);
    if (__sgApplyingBundle) return;
    if (!sgUser) return;
    if (SG_PROJECT_KEYS.indexOf(key) !== -1) scheduleCloudSave();
    if (SG_GLOBAL_KEYS.indexOf(key) !== -1) scheduleGlobalSave();
  };
}

/* =============================================
   인증 (이메일/비밀번호)
   ============================================= */
function cloudSignUp(email, pw) {
  return sgAuth.createUserWithEmailAndPassword(email, pw);
}
function cloudSignIn(email, pw) {
  return sgAuth.signInWithEmailAndPassword(email, pw);
}
function cloudSignOut() {
  return sgAuth.signOut();
}

/* Firebase 오류 코드 → 한국어 메시지 */
function cloudAuthErrorMsg(err) {
  const c = (err && err.code) || '';
  const map = {
    'auth/invalid-email': '이메일 형식이 올바르지 않습니다.',
    'auth/user-not-found': '등록되지 않은 이메일입니다. 회원가입을 먼저 해주세요.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 가입된 이메일입니다. 로그인해 주세요.',
    'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
    'auth/too-many-requests': '시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    'auth/network-request-failed': '네트워크 오류입니다. 인터넷 연결을 확인해 주세요.'
  };
  return map[c] || ('오류가 발생했습니다. (' + c + ')');
}

/* 로그인 상태 변화 처리 */
async function cloudOnAuthChanged(user) {
  sgUser = user;
  if (user) {
    try {
      await cloudLoadUserDoc();          // 클라우드 → localStorage
      if (typeof hideLoginScreen === 'function') hideLoginScreen();
      if (typeof updateSidebarUserInfo === 'function') updateSidebarUserInfo();
      renderProjectSelector();
      if (typeof initApp === 'function') { window.__sgAppInited = false; initApp(); }
    } catch (e) {
      console.error('[SafeGuard] 클라우드 로드 실패:', e);
      if (typeof showToast === 'function') showToast('error', '클라우드 데이터를 불러오지 못했습니다.');
    }
  } else {
    sgCloudDoc = null; sgCurrentProjectId = null; sgCloudReady = false;
    if (typeof showLoginScreen === 'function') showLoginScreen();
  }
}

/* =============================================
   Firestore 문서 로드 / 저장
   ============================================= */
function _userRef() { return sgDB.collection('users').doc(sgUser.uid); }

async function cloudLoadUserDoc() {
  sgCloudReady = false;
  const snap = await _userRef().get();
  if (!snap.exists) {
    // 최초 로그인: 기존 localStorage 데이터를 첫 프로젝트로 흡수
    const pid = 'p' + Date.now();
    const bundle = _gatherProjectBundle();
    sgCloudDoc = {
      email: sgUser.email || '',
      currentProjectId: pid,
      projects: { [pid]: { name: '기본 프로젝트', order: 0, data: bundle, updatedAt: Date.now() } },
      settings: _gatherGlobalBundle()
    };
    await _userRef().set(sgCloudDoc);
  } else {
    sgCloudDoc = snap.data();
    if (!sgCloudDoc.projects || Object.keys(sgCloudDoc.projects).length === 0) {
      const pid = 'p' + Date.now();
      sgCloudDoc.projects = { [pid]: { name: '기본 프로젝트', order: 0, data: {}, updatedAt: Date.now() } };
      sgCloudDoc.currentProjectId = pid;
      await _userRef().set(sgCloudDoc, { merge: true });
    }
  }
  sgCurrentProjectId = sgCloudDoc.currentProjectId || Object.keys(sgCloudDoc.projects)[0];
  _applyGlobalBundle(sgCloudDoc.settings || {});
  _applyProjectBundle((sgCloudDoc.projects[sgCurrentProjectId] || {}).data || {});
  sgCloudReady = true;
}

/* localStorage → 번들 수집 */
function _gatherProjectBundle() {
  const b = {};
  SG_PROJECT_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v !== null) b[k] = v; });
  return b;
}
function _gatherGlobalBundle() {
  const b = {};
  SG_GLOBAL_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v !== null) b[k] = v; });
  return b;
}
/* 번들 → localStorage (기존 프로젝트 키 제거 후 적용) */
function _applyProjectBundle(bundle) {
  __sgApplyingBundle = true;
  try {
    SG_PROJECT_KEYS.forEach(k => localStorage.removeItem(k));
    Object.keys(bundle || {}).forEach(k => { if (bundle[k] !== null && bundle[k] !== undefined) localStorage.setItem(k, bundle[k]); });
  } finally { __sgApplyingBundle = false; }
}
function _applyGlobalBundle(bundle) {
  __sgApplyingBundle = true;
  try { Object.keys(bundle || {}).forEach(k => { if (bundle[k] != null) localStorage.setItem(k, bundle[k]); }); }
  finally { __sgApplyingBundle = false; }
}

/* 저장 예약 (디바운스) */
function scheduleCloudSave() {
  if (!sgUser || !sgCloudReady) return;
  clearTimeout(__sgSaveTimer);
  __sgSaveTimer = setTimeout(cloudSaveCurrentProject, 1200);
  _setSyncStatus('saving');
}
let __sgGlobalTimer = null;
function scheduleGlobalSave() {
  if (!sgUser || !sgCloudReady) return;
  clearTimeout(__sgGlobalTimer);
  __sgGlobalTimer = setTimeout(async () => {
    try { await _userRef().set({ settings: _gatherGlobalBundle() }, { merge: true }); } catch (e) {}
  }, 1200);
}

async function cloudSaveCurrentProject() {
  if (!sgUser || !sgCloudReady || !sgCurrentProjectId) return;
  const bundle = _gatherProjectBundle();
  try {
    const upd = {};
    upd['projects.' + sgCurrentProjectId + '.data'] = bundle;
    upd['projects.' + sgCurrentProjectId + '.updatedAt'] = Date.now();
    await _userRef().update(upd);
    if (sgCloudDoc.projects[sgCurrentProjectId]) sgCloudDoc.projects[sgCurrentProjectId].data = bundle;
    _setSyncStatus('saved');
  } catch (e) {
    console.error('[SafeGuard] 클라우드 저장 실패:', e);
    _setSyncStatus('error');
  }
}

/* =============================================
   다중 프로젝트 관리
   ============================================= */
async function cloudCreateProject(name) {
  if (!sgUser) return;
  await cloudSaveCurrentProject();               // 현재 프로젝트 저장
  const pid = 'p' + Date.now();
  const order = Object.keys(sgCloudDoc.projects).length;
  sgCloudDoc.projects[pid] = { name: name || ('프로젝트 ' + (order + 1)), order: order, data: {}, updatedAt: Date.now() };
  sgCloudDoc.currentProjectId = pid;
  sgCurrentProjectId = pid;
  await _userRef().set(sgCloudDoc, { merge: true });
  _applyProjectBundle({});                        // 새 프로젝트는 빈 상태
  renderProjectSelector();
  window.__sgAppInited = false;
  if (typeof initApp === 'function') initApp();
  if (typeof showToast === 'function') showToast('success', "'" + sgCloudDoc.projects[pid].name + "' 프로젝트를 만들었습니다.");
}

async function cloudSwitchProject(pid) {
  if (!sgUser || pid === sgCurrentProjectId || !sgCloudDoc.projects[pid]) return;
  await cloudSaveCurrentProject();
  sgCurrentProjectId = pid;
  sgCloudDoc.currentProjectId = pid;
  await _userRef().update({ currentProjectId: pid });
  _applyProjectBundle(sgCloudDoc.projects[pid].data || {});
  renderProjectSelector();
  window.__sgAppInited = false;
  if (typeof initApp === 'function') initApp();
  if (typeof showToast === 'function') showToast('info', "'" + sgCloudDoc.projects[pid].name + "' 프로젝트로 전환했습니다.");
}

async function cloudRenameProject(pid, name) {
  if (!sgUser || !sgCloudDoc.projects[pid] || !name) return;
  sgCloudDoc.projects[pid].name = name;
  await _userRef().update({ ['projects.' + pid + '.name']: name });
  renderProjectSelector();
}

async function cloudDeleteProject(pid) {
  if (!sgUser || !sgCloudDoc.projects[pid]) return;
  if (Object.keys(sgCloudDoc.projects).length <= 1) {
    if (typeof showToast === 'function') showToast('warning', '프로젝트가 하나뿐이라 삭제할 수 없습니다.');
    return;
  }
  delete sgCloudDoc.projects[pid];
  await _userRef().update({ ['projects.' + pid]: firebase.firestore.FieldValue.delete() });
  if (sgCurrentProjectId === pid) {
    const nextPid = Object.keys(sgCloudDoc.projects)[0];
    sgCurrentProjectId = nextPid;
    sgCloudDoc.currentProjectId = nextPid;
    await _userRef().update({ currentProjectId: nextPid });
    _applyProjectBundle(sgCloudDoc.projects[nextPid].data || {});
    window.__sgAppInited = false;
    if (typeof initApp === 'function') initApp();
  }
  renderProjectSelector();
}

/* =============================================
   프로젝트 선택 UI (상단바에 주입)
   ============================================= */
function renderProjectSelector() {
  const host = document.getElementById('sgProjectBar');
  if (!host || !sgCloudDoc) return;
  const projects = Object.keys(sgCloudDoc.projects)
    .map(pid => ({ pid, ...sgCloudDoc.projects[pid] }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const opts = projects.map(p =>
    `<option value="${p.pid}" ${p.pid === sgCurrentProjectId ? 'selected' : ''}>${_esc(p.name)}</option>`
  ).join('');
  host.innerHTML = `
    <i class="fas fa-folder-open" style="opacity:.7"></i>
    <select id="sgProjectSelect" onchange="cloudSwitchProject(this.value)" title="프로젝트 선택">${opts}</select>
    <button class="sg-proj-btn" onclick="sgPromptNewProject()" title="새 프로젝트"><i class="fas fa-plus"></i></button>
    <button class="sg-proj-btn" onclick="sgPromptRenameProject()" title="이름 변경"><i class="fas fa-pen"></i></button>
    <button class="sg-proj-btn" onclick="sgPromptDeleteProject()" title="프로젝트 삭제"><i class="fas fa-trash"></i></button>
    <span id="sgSyncStatus" class="sg-sync" title="클라우드 동기화 상태"></span>
  `;
}
function _esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function sgPromptNewProject() {
  const name = prompt('새 프로젝트 이름을 입력하세요:', '');
  if (name && name.trim()) cloudCreateProject(name.trim());
}
function sgPromptRenameProject() {
  const cur = sgCloudDoc.projects[sgCurrentProjectId];
  const name = prompt('프로젝트 이름 변경:', cur ? cur.name : '');
  if (name && name.trim()) cloudRenameProject(sgCurrentProjectId, name.trim());
}
function sgPromptDeleteProject() {
  const cur = sgCloudDoc.projects[sgCurrentProjectId];
  if (cur && confirm("'" + cur.name + "' 프로젝트를 삭제할까요? 이 프로젝트의 모든 데이터가 사라집니다.")) {
    cloudDeleteProject(sgCurrentProjectId);
  }
}

function _setSyncStatus(state) {
  const el = document.getElementById('sgSyncStatus');
  if (!el) return;
  if (state === 'saving') el.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> 저장 중…';
  else if (state === 'saved') el.innerHTML = '<i class="fas fa-cloud"></i> 저장됨';
  else if (state === 'error') el.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 저장 실패';
}

/* 앱 시작 시 Firebase 초기화 */
document.addEventListener('DOMContentLoaded', function () {
  cloudInit();
});
