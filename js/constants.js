/**
 * SafeGuard Pro - 공통 상수 정의
 * 카테고리, 색상, D-day 임계값 등 여러 파일에서 공유하는 값을 한 곳에 모음
 * @version 1.0
 */

// ============================================
// 카테고리 정의
// ============================================
const SG_CATEGORIES = [
  {
    id: 'safety',
    name: '산업안전보건',
    icon: 'fa-hard-hat',
    color: '#3b82f6',
    colorLight: '#dbeafe'
  },
  {
    id: 'env',
    name: '환경',
    icon: 'fa-leaf',
    color: '#10b981',
    colorLight: '#d1fae5'
  },
  {
    id: 'chem',
    name: '화학·가스',
    icon: 'fa-flask',
    color: '#f59e0b',
    colorLight: '#fef3c7'
  },
  {
    id: 'energy',
    name: '에너지·전기·소방',
    icon: 'fa-bolt',
    color: '#ef4444',
    colorLight: '#fee2e2'
  },
  {
    id: 'etc',
    name: '건설행정·기타',
    icon: 'fa-folder',
    color: '#8b5cf6',
    colorLight: '#ede9fe'
  }
];

// ============================================
// 카테고리 헬퍼 함수
// ============================================

function getCategoryByName(name) {
  return SG_CATEGORIES.find(c => c.name === name) || null;
}

function getCategoryById(id) {
  return SG_CATEGORIES.find(c => c.id === id) || null;
}

function getCategoryColor(name) {
  const cat = getCategoryByName(name);
  return cat ? cat.color : '#6b7280';
}

function getCategorySlug(name) {
  const cat = getCategoryByName(name);
  return cat ? cat.id : 'unknown';
}

// ============================================
// D-day 임계값 및 색상
// ============================================
const SG_DDAY = {
  URGENT: 7,
  WARNING: 30,
  NORMAL: 90,

  COLOR_URGENT: '#ef4444',
  COLOR_WARNING: '#f59e0b',
  COLOR_NORMAL: '#3b82f6',
  COLOR_SAFE: '#10b981',
  COLOR_PAST: '#6b7280'
};

function getDdayColor(daysLeft) {
  if (daysLeft < 0) return SG_DDAY.COLOR_PAST;
  if (daysLeft <= SG_DDAY.URGENT) return SG_DDAY.COLOR_URGENT;
  if (daysLeft <= SG_DDAY.WARNING) return SG_DDAY.COLOR_WARNING;
  if (daysLeft <= SG_DDAY.NORMAL) return SG_DDAY.COLOR_NORMAL;
  return SG_DDAY.COLOR_SAFE;
}

function getDdayLabel(daysLeft) {
  if (daysLeft < 0) return `D+${Math.abs(daysLeft)}`;
  if (daysLeft === 0) return 'D-DAY';
  return `D-${daysLeft}`;
}

// ============================================
// LocalStorage 키 (오타 방지용 상수화)
// ============================================
const SG_STORAGE_KEYS = {
  SCHEMA_VERSION: 'sg_schema_version',
  CHECKED_ITEMS: 'sg_checked_items',
  CONSTRUCTION_TYPE: 'sg_construction_type',
  PROJECT_END_DATE: 'sg_project_end_date',
  ALERT_SETTINGS: 'sg_alert_settings',
  SAVED_ALERTS: 'sg_saved_alerts',
  TELEGRAM_TOKEN: 'sg_telegram_token',
  TELEGRAM_CHAT_ID: 'sg_telegram_chat_id'
};

const SG_SCHEMA_VERSION = '5.1';

// ============================================
// 데이터 버전 / 최신화 날짜
// ─────────────────────────────────────────────
// 법령·체크리스트 데이터를 업데이트할 때마다
// 아래 두 값만 수정하면 사이드바 footer와
// 모든 연동 UI에 자동 반영됩니다.
// ============================================
const SG_LAW_DATE    = '2026.06.24';  // 법령 기준일  (law_db.js 최신화 날짜)
const SG_DATA_DATE   = '2026.06.24';  // 데이터 최신화 (data.js / accident_db.js 최신화 날짜)

// ============================================
// 전역 노출
// ============================================
window.SG_CATEGORIES = SG_CATEGORIES;
window.SG_DDAY = SG_DDAY;
window.SG_STORAGE_KEYS = SG_STORAGE_KEYS;
window.SG_SCHEMA_VERSION = SG_SCHEMA_VERSION;
window.SG_LAW_DATE   = SG_LAW_DATE;
window.SG_DATA_DATE  = SG_DATA_DATE;
window.getCategoryByName = getCategoryByName;
window.getCategoryById = getCategoryById;
window.getCategoryColor = getCategoryColor;
window.getCategorySlug = getCategorySlug;
window.getDdayColor = getDdayColor;
window.getDdayLabel = getDdayLabel;

console.log('[SafeGuard] constants.js loaded - schema v' + SG_SCHEMA_VERSION + ' | 법령기준일: ' + SG_LAW_DATE);
