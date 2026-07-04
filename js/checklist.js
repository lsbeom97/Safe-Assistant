/* =============================================
   SafeGuard Pro - 인허가 체크리스트 로직 (v3.1)
   제철산업 제선·고로 플랜트 특화 버전
   2026 NEW 배지 반영
   ============================================= */

// ---- 상태 변수 ----
let checkedItems = new Set();
let expandedCategories = new Set(); // 펼쳐진 카테고리

// ---- 공사구분별 추천 항목 매핑 ----
const RECOMMENDATION_MAP = {
  "고로신설":     [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,29],
  "고로개수":     [1,3,4,7,8,9,11,14,19,26,27,28,29],
  "열풍로신설보수": [1,3,4,7,8,9,10,14,29],
  "소결설비신설증설": [1,2,3,4,5,6,7,9,10,12,13,14,15,16,21,22,23,25,26,29],
  "코크스설비신설증설": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,29],
  "가스정제설비교체증설": [1,3,4,7,8,10,11,17,18,19,20,24,29],
  "부생가스배관설치교체": [1,3,4,7,8,9,11,18,19,27,29],
  "원료처리설비증설": [2,3,4,5,9,10,14,15,16,21,23,26,27,28,29],
  "기타부대설비": [3,4,10,16,23,29],
  // ── 노후설비 교체: 해체+재설치 성격 → 신규 부지 인허가(15 환경영향평가·22 에너지협의·26 건축허가·27 도로점용·28 토지형질변경)는 제외,
  //    설비 변경/해체/재설치 관련 인허가 중심으로 구성 (규모에 따라 항목 가감 필요)
  "열풍로노후교체":     [1,3,4,7,8,9,10,14,29],
  "소결설비노후교체":   [1,2,3,4,5,6,7,9,10,12,13,14,16,21,23,25,29],
  "코크스설비노후교체": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,23,24,25,29],
  "원료처리설비노후교체": [2,3,4,5,9,10,14,16,21,23,29]
};

// ---- 카테고리 정의 ----
const CATEGORIES = [
  { id: "산업안전보건", icon: "fas fa-hard-hat",   label: "산업안전보건",     color: "#1B3A5C", bgColor: "#EBF0F7" },
  { id: "환경",         icon: "fas fa-leaf",         label: "환경",             color: "#2E7D4F", bgColor: "#E8F5EE" },
  { id: "화학·가스",   icon: "fas fa-flask",         label: "화학·가스",       color: "#C0392B", bgColor: "#FBEAEA" },
  { id: "에너지·전기·소방", icon: "fas fa-bolt",    label: "에너지·전기·소방", color: "#D35400", bgColor: "#FDF0E6" },
  { id: "건설행정·기타", icon: "fas fa-building",   label: "건설행정·기타",   color: "#6C3483", bgColor: "#F4EBF8" }
];

// ---- 공사구분 value → name 변환 ----
const CONSTRUCTION_TYPE_MAP = {
  "고로신설": "고로 신설",
  "고로개수": "고로 개수(릴라이닝)",
  "열풍로신설보수": "열풍로 신설·보수",
  "소결설비신설증설": "소결설비 신설·증설",
  "코크스설비신설증설": "코크스설비 신설·증설",
  "가스정제설비교체증설": "가스정제설비 교체·증설",
  "부생가스배관설치교체": "부생가스 배관 설치·교체",
  "원료처리설비증설": "원료처리설비 증설",
  "기타부대설비": "기타 부대설비",
  "열풍로노후교체": "열풍로 노후설비 교체",
  "소결설비노후교체": "소결설비 노후설비 교체",
  "코크스설비노후교체": "코크스설비 노후설비 교체",
  "원료처리설비노후교체": "원료처리설비 노후설비 교체"
};

// ---- HTML 속성용 텍스트 이스케이프 (툴팁/title 안전 출력) ----
function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---- 체크리스트 그리드 초기화 (아코디언 카테고리) ----
function initChecklistGrid() {
  const grid = document.getElementById('checklistGrid');
  if (!grid) return;

  grid.innerHTML = '';

  // 현재 공사 구분 가져오기
  const constructionType = document.getElementById('constructionType')
    ? document.getElementById('constructionType').value
    : '';

  const recommendedIds = constructionType && RECOMMENDATION_MAP[constructionType]
    ? new Set(RECOMMENDATION_MAP[constructionType])
    : new Set();

  // 카테고리별 그룹핑
  const grouped = {};
  CATEGORIES.forEach(cat => { grouped[cat.id] = []; });
  CHECKLIST_ITEMS.forEach(item => {
    if (grouped[item.category] !== undefined) {
      grouped[item.category].push(item);
    }
  });

  // 카테고리별 아코디언 렌더링
  CATEGORIES.forEach((cat, catIdx) => {
    const items = grouped[cat.id];
    if (!items || items.length === 0) return;

    const isExpanded = expandedCategories.has(cat.id) || catIdx === 0;
    if (catIdx === 0 && !expandedCategories.has(cat.id)) {
      expandedCategories.add(cat.id);
    }

    const recommendedInCat = items.filter(i => recommendedIds.has(i.id)).length;
    const checkedInCat = items.filter(i => checkedItems.has(i.id)).length;
    const newInCat = items.filter(i => i.isNew2026).length;

    const accordion = document.createElement('div');
    accordion.className = 'checklist-accordion';
    accordion.id = `accordion-${cat.id.replace(/·/g, '-')}`;

    // 다크모드 여부에 따라 헤더 색상 분기
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const headerBg    = isDark ? 'var(--bg-card)'         : cat.bgColor;
    const headerColor = isDark ? 'var(--posco-light-blue)' : cat.color;

    accordion.innerHTML = `
      <div class="accordion-header" onclick="toggleAccordion('${cat.id.replace(/·/g, '-')}', '${cat.id}')" style="--cat-color: ${headerColor}; --cat-bg: ${headerBg};">
        <div class="accordion-header-left">
          <i class="${cat.icon}" style="color: ${headerColor};"></i>
          <span class="accordion-title">${cat.label}</span>
          <span class="accordion-count">${items.length}개</span>
          ${newInCat > 0 ? `<span class="accordion-new-badge" title="2026년 개정 반영 항목 ${newInCat}개">NEW ${newInCat}</span>` : ''}
          ${checkedInCat > 0 ? `<span class="accordion-checked-badge">${checkedInCat}개 선택</span>` : ''}
          ${recommendedInCat > 0 && constructionType ? `<span class="accordion-rec-badge">추천 ${recommendedInCat}개</span>` : ''}
        </div>
        <div class="accordion-header-right">
          <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'} accordion-arrow" id="arrow-${cat.id.replace(/·/g, '-')}"></i>
        </div>
      </div>
      <div class="accordion-body ${isExpanded ? 'expanded' : 'collapsed'}" id="body-${cat.id.replace(/·/g, '-')}">
        <div class="accordion-items" id="items-${cat.id.replace(/·/g, '-')}">
          ${items.map(item => renderChecklistItem(item, recommendedIds)).join('')}
        </div>
      </div>
    `;

    grid.appendChild(accordion);
  });
}

// ---- 테마 변경 시 아코디언 헤더 색상 실시간 갱신 ----
function updateAccordionHeaderTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  CATEGORIES.forEach(cat => {
    const safeCatId = cat.id.replace(/·/g, '-');
    const header = document.querySelector(`#accordion-${safeCatId} .accordion-header`);
    if (!header) return;
    const bg    = isDark ? 'var(--bg-card)'          : cat.bgColor;
    const color = isDark ? 'var(--posco-light-blue)'  : cat.color;
    header.style.setProperty('--cat-bg',    bg);
    header.style.setProperty('--cat-color', color);
    // 아이콘 인라인 color 업데이트
    const icon = header.querySelector('.accordion-header-left > i');
    if (icon) icon.style.color = color;
  });
}

// MutationObserver로 data-theme 속성 변경 감지
(function initThemeObserver() {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.type === 'attributes' && m.attributeName === 'data-theme') {
        updateAccordionHeaderTheme();
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });
})();

// ---- 개별 체크리스트 아이템 렌더링 ----
function renderChecklistItem(item, recommendedIds) {
  const isChecked = checkedItems.has(item.id);
  const isRecommended = recommendedIds && recommendedIds.has(item.id);
  const isNew = item.isNew2026;
  const updateReason = item.updateReason || '2026년 최신 개정 반영';

  return `
    <div class="checklist-item ${isChecked ? 'checked' : ''} ${isRecommended ? 'recommended' : ''} ${isNew ? 'is-new-2026' : ''}"
         id="check-card-${item.id}"
         onclick="toggleCheckItem(${item.id})">
      <div class="checklist-item-top">
        <div class="checklist-checkbox ${isChecked ? 'checked' : ''}" id="check-box-${item.id}">
          <i class="fas fa-check" style="font-size:0.7rem; display:${isChecked ? 'block' : 'none'};" id="check-icon-${item.id}"></i>
        </div>
        <div class="checklist-item-content">
          <div class="checklist-item-title-row">
            <span class="checklist-num">${item.num}.</span>
            <i class="${item.icon}" style="margin: 0 5px; color: #1B3A5C; font-size: 0.85rem;"></i>
            <span class="checklist-item-name">${item.name}</span>
            <div class="checklist-badges">
              ${isNew ? `<span class="badge-new2026" title="${escapeAttr(updateReason)}">🆕 NEW 2026</span>` : ''}
              ${isRecommended ? '<span class="badge-recommended">추천</span>' : ''}
            </div>
          </div>
          <div class="checklist-item-desc">${item.desc}</div>
          ${isNew ? `<div class="checklist-item-update-reason"><i class="fas fa-circle-info"></i> ${updateReason}</div>` : ''}
          <div class="checklist-item-meta">
            <span class="meta-chip"><i class="fas fa-clock"></i> ${item.submitTiming}</span>
            <span class="meta-chip"><i class="fas fa-building"></i> ${item.submitTo}</span>
          </div>
        </div>
      </div>
      <div class="checklist-item-footer">
        <span class="item-law-tag"><i class="fas fa-gavel"></i> ${item.relatedLaw}</span>
        <span class="item-last-updated">법령 확인 기준: ${item.lastUpdated.replace(/-/g, '.')}</span>
      </div>
    </div>
  `;
}

// ---- 아코디언 토글 ----
function toggleAccordion(catIdSafe, catId) {
  const body = document.getElementById(`body-${catIdSafe}`);
  const arrow = document.getElementById(`arrow-${catIdSafe}`);

  if (!body || !arrow) return;

  if (expandedCategories.has(catId)) {
    expandedCategories.delete(catId);
    body.classList.remove('expanded');
    body.classList.add('collapsed');
    arrow.className = 'fas fa-chevron-down accordion-arrow';
  } else {
    expandedCategories.add(catId);
    body.classList.remove('collapsed');
    body.classList.add('expanded');
    arrow.className = 'fas fa-chevron-up accordion-arrow';
  }
}

// ---- 체크 토글 ----
function toggleCheckItem(id) {
  const card = document.getElementById(`check-card-${id}`);
  const box = document.getElementById(`check-box-${id}`);
  const icon = document.getElementById(`check-icon-${id}`);

  if (!card) return;

  if (checkedItems.has(id)) {
    checkedItems.delete(id);
    card.classList.remove('checked');
    if (box) box.classList.remove('checked');
    if (icon) icon.style.display = 'none';
  } else {
    checkedItems.add(id);
    card.classList.add('checked');
    if (box) box.classList.add('checked');
    if (icon) icon.style.display = 'block';
  }

  // 아코디언 헤더의 선택 개수 업데이트
  updateAccordionHeaders();
  updateSelectedCount();
  syncNotifItems(); // selectedPermits 동기화
}

// ---- 아코디언 헤더 선택 수 업데이트 ----
function updateAccordionHeaders() {
  CATEGORIES.forEach(cat => {
    const catItems = CHECKLIST_ITEMS.filter(i => i.category === cat.id);
    const checkedCount = catItems.filter(i => checkedItems.has(i.id)).length;
    const catIdSafe = cat.id.replace(/·/g, '-');

    // 헤더를 다시 렌더링하는 대신 뱃지만 업데이트
    const headerLeft = document.querySelector(`#accordion-${catIdSafe} .accordion-header-left`);
    if (headerLeft) {
      const existingBadge = headerLeft.querySelector('.accordion-checked-badge');
      if (checkedCount > 0) {
        if (existingBadge) {
          existingBadge.textContent = `${checkedCount}개 선택`;
        } else {
          const badge = document.createElement('span');
          badge.className = 'accordion-checked-badge';
          badge.textContent = `${checkedCount}개 선택`;
          // NEW 배지 다음에 삽입 (없으면 count 다음)
          const newBadge = headerLeft.querySelector('.accordion-new-badge');
          const countSpan = headerLeft.querySelector('.accordion-count');
          const anchor = newBadge || countSpan;
          if (anchor) anchor.after(badge);
        }
      } else {
        if (existingBadge) existingBadge.remove();
      }
    }
  });
}

// ---- 전체선택/해제 ----
function selectAllChecklist(selectAll) {
  CHECKLIST_ITEMS.forEach(item => {
    const card = document.getElementById(`check-card-${item.id}`);
    const box = document.getElementById(`check-box-${item.id}`);
    const icon = document.getElementById(`check-icon-${item.id}`);
    if (!card) return;

    if (selectAll) {
      checkedItems.add(item.id);
      card.classList.add('checked');
      if (box) box.classList.add('checked');
      if (icon) icon.style.display = 'block';
    } else {
      checkedItems.delete(item.id);
      card.classList.remove('checked');
      if (box) box.classList.remove('checked');
      if (icon) icon.style.display = 'none';
    }
  });

  updateAccordionHeaders();
  updateSelectedCount();
  syncNotifItems();
  showToast('info', selectAll ? `✅ 전체 ${CHECKLIST_ITEMS.length}개 항목이 선택되었습니다.` : '⬜ 전체 선택이 해제되었습니다.');
}

// ---- 공사 구분 변경 시 추천 항목 자동 하이라이트 ----
function onConstructionTypeChange() {
  const constructionType = document.getElementById('constructionType').value;
  const recommendedIds = constructionType && RECOMMENDATION_MAP[constructionType]
    ? new Set(RECOMMENDATION_MAP[constructionType])
    : new Set();

  // 모든 아이템의 추천 뱃지 업데이트
  CHECKLIST_ITEMS.forEach(item => {
    const card = document.getElementById(`check-card-${item.id}`);
    if (!card) return;

    if (recommendedIds.has(item.id)) {
      card.classList.add('recommended');
      // 추천 뱃지 추가
      const badgesDiv = card.querySelector('.checklist-badges');
      if (badgesDiv && !badgesDiv.querySelector('.badge-recommended')) {
        const badge = document.createElement('span');
        badge.className = 'badge-recommended';
        badge.textContent = '추천';
        badgesDiv.appendChild(badge);
      }
    } else {
      card.classList.remove('recommended');
      const badge = card.querySelector('.badge-recommended');
      if (badge) badge.remove();
    }
  });

  // 아코디언 헤더 추천 수 업데이트
  CATEGORIES.forEach(cat => {
    const catItems = CHECKLIST_ITEMS.filter(i => i.category === cat.id);
    const recCount = catItems.filter(i => recommendedIds.has(i.id)).length;
    const catIdSafe = cat.id.replace(/·/g, '-');
    const headerLeft = document.querySelector(`#accordion-${catIdSafe} .accordion-header-left`);
    if (headerLeft) {
      const existingRecBadge = headerLeft.querySelector('.accordion-rec-badge');
      if (recCount > 0 && constructionType) {
        if (existingRecBadge) {
          existingRecBadge.textContent = `추천 ${recCount}개`;
        } else {
          const badge = document.createElement('span');
          badge.className = 'accordion-rec-badge';
          badge.textContent = `추천 ${recCount}개`;
          headerLeft.appendChild(badge);
        }
      } else {
        if (existingRecBadge) existingRecBadge.remove();
      }
    }
  });

  if (constructionType) {
    const typeName = CONSTRUCTION_TYPE_MAP[constructionType] || constructionType;

    // 추천 배너 표시
    const banner = document.getElementById('recommendBanner');
    const bannerText = document.getElementById('recommendBannerText');
    if (banner && bannerText) {
      bannerText.innerHTML = `<strong>[${typeName}]</strong> 공사에 추천되는 인허가 항목 <strong>${recommendedIds.size}개</strong>가 표시되었습니다. (주황색 테두리 = 추천 항목)`;
      banner.style.display = 'flex';
    }

    showToast('info', `📋 [${typeName}] 선택: 추천 항목 ${recommendedIds.size}개가 표시되었습니다.`);
  } else {
    const banner = document.getElementById('recommendBanner');
    if (banner) banner.style.display = 'none';
  }
}

// ---- 확인하기 버튼 ----
function confirmChecklist() {
  const projectName = document.getElementById('projectName').value.trim();

  if (!projectName) {
    showToast('warning', '⚠️ 프로젝트명을 입력해 주세요.');
    document.getElementById('projectName').focus();
    return;
  }
  if (checkedItems.size === 0) {
    showToast('warning', '⚠️ 최소 1개 이상의 인허가 항목을 선택해 주세요.');
    return;
  }

  const resultArea = document.getElementById('checklistResult');
  const resultGrid = document.getElementById('resultGrid');

  resultGrid.innerHTML = '';

  const selectedItems = CHECKLIST_ITEMS.filter(item => checkedItems.has(item.id));

  selectedItems.forEach((item, idx) => {
    const card = document.createElement('div');
    const isDone = typeof completedPermitItems !== 'undefined' && completedPermitItems.has(item.id);
    card.className = `result-card${isDone ? ' permit-done' : ''}${item.isNew2026 ? ' is-new-2026' : ''}`;
    card.id = `result-card-${item.id}`;
    card.style.animationDelay = `${idx * 0.05}s`;

    const cautionHtml = item.cautionPoints.map(c => `<li>${c}</li>`).join('');
    const docHtml = item.requiredDocs ? item.requiredDocs.map(d => `<li>${d}</li>`).join('') : '';
    const updateReason = item.updateReason || '2026년 최신 개정 반영';

    card.innerHTML = `
      <div class="result-card-header">
        <div class="result-card-num">${item.num}</div>
        <i class="${item.icon}" style="font-size:1.1rem; color:#fff;"></i>
        <span class="result-card-title">${item.name}</span>
        ${item.isNew2026 ? `<span class="result-badge-new" title="${escapeAttr(updateReason)}">🆕 NEW 2026</span>` : ''}
        <button class="permit-complete-btn${isDone ? ' completed' : ''}" onclick="event.stopPropagation(); togglePermitComplete(${item.id}, this)" title="완료 처리">
          <i class="fas fa-check-circle"></i> ${isDone ? '완료됨 ✓' : '완료 처리'}
        </button>
      </div>
      <div class="result-card-body">
        ${item.isNew2026 ? `
        <div class="result-info-item result-update-reason">
          <span class="result-info-label">🆕 2026 개정 사유</span>
          <span class="result-info-value highlight-new">${updateReason}</span>
        </div>` : ''}
        <div class="result-info-item">
          <span class="result-info-label">📁 카테고리</span>
          <span class="result-info-value">${item.category}</span>
        </div>
        <div class="result-info-item">
          <span class="result-info-label">📅 제출 시기</span>
          <span class="result-info-value highlight">${item.submitTiming}</span>
        </div>
        <div class="result-info-item">
          <span class="result-info-label">📝 제출처</span>
          <span class="result-info-value">${item.submitTo}</span>
        </div>
        <div class="result-info-item">
          <span class="result-info-label">🎯 적용 대상</span>
          <span class="result-info-value">${item.targetCondition}</span>
        </div>
        <div class="result-info-item">
          <span class="result-info-label">⚠️ 유의사항</span>
          <span class="result-info-value">
            <ul class="bullet-list">${cautionHtml}</ul>
          </span>
        </div>
        ${docHtml ? `
        <div class="result-info-item">
          <span class="result-info-label">📋 필요 서류</span>
          <span class="result-info-value">
            <ul class="bullet-list">${docHtml}</ul>
          </span>
        </div>` : ''}
        <div class="result-info-item">
          <span class="result-info-label">⏳ 검토 기간</span>
          <span class="result-info-value">${item.reviewPeriod}</span>
        </div>
        <div class="result-info-item">
          <span class="result-info-label">🚫 위반 시 벌칙</span>
          <span class="result-info-value penalty-text">${item.penalty}</span>
        </div>
        <div class="result-info-item">
          <span class="result-info-label">📎 관련 법령</span>
          <span class="result-info-value">
            <span class="law-badge"><i class="fas fa-gavel"></i> ${item.relatedLaw}</span>
          </span>
        </div>
      </div>
      <div class="result-card-updated">법령 확인 기준: ${item.lastUpdated.replace(/-/g, '.')}</div>
    `;
    resultGrid.appendChild(card);
  });

  resultArea.style.display = 'block';
  resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // selectedPermits 동기화
  syncNotifItems();

  // "알림 설정으로 이동" 버튼 표시
  const notifLinkBtn = document.getElementById('goToNotifBtn');
  if (notifLinkBtn) notifLinkBtn.style.display = 'inline-flex';

  const newCount = selectedItems.filter(i => i.isNew2026).length;
  const newMsg = newCount > 0 ? ` (2026 개정 항목 ${newCount}개 포함)` : '';
  showToast('success', `✅ ${selectedItems.length}개 항목 확인 완료!${newMsg} 알림 설정으로 이동하여 일정을 등록하세요.`);
}

// ---- 결과 저장 ----
function exportChecklist() {
  const projectName = document.getElementById('projectName').value.trim() || '프로젝트';
  const constructionType = document.getElementById('constructionType')
    ? (CONSTRUCTION_TYPE_MAP[document.getElementById('constructionType').value] || '미선택')
    : '미선택';
  const selectedItems = CHECKLIST_ITEMS.filter(item => checkedItems.has(item.id));
  const newCount = selectedItems.filter(i => i.isNew2026).length;

  let text = `========================================\n`;
  text += `SafeGuard Pro - 제철·제선 플랜트 인허가 체크리스트\n`;
  text += `프로젝트: ${projectName}\n`;
  text += `공사 구분: ${constructionType}\n`;
  text += `생성일시: ${new Date().toLocaleString('ko-KR')}\n`;
  text += `법령 기준일: ${typeof SG_LAW_DATE !== 'undefined' ? SG_LAW_DATE : '2026.06.24'}\n`;
  text += `2026 개정 반영 항목: ${newCount}개\n`;
  text += `========================================\n\n`;

  // 카테고리별로 묶어서 출력
  CATEGORIES.forEach(cat => {
    const catItems = selectedItems.filter(i => i.category === cat.id);
    if (catItems.length === 0) return;

    text += `\n[${cat.label}]\n`;
    text += `${'─'.repeat(40)}\n`;

    catItems.forEach((item) => {
      text += `\n${item.num}. ${item.name}${item.isNew2026 ? ' 🆕 NEW 2026' : ''}\n`;
      if (item.isNew2026 && item.updateReason) {
        text += `   ▶ 2026 개정 사유: ${item.updateReason}\n`;
      }
      text += `   설명: ${item.desc}\n`;
      text += `   제출 시기: ${item.submitTiming}\n`;
      text += `   제출처: ${item.submitTo}\n`;
      text += `   관련 법령: ${item.relatedLaw}\n`;
      text += `   검토 기간: ${item.reviewPeriod}\n`;
      text += `   위반 시 벌칙: ${item.penalty}\n`;
      text += `   유의사항:\n`;
      item.cautionPoints.forEach(c => { text += `     ▸ ${c}\n`; });
      if (item.requiredDocs && item.requiredDocs.length) {
        text += `   필요 서류:\n`;
        item.requiredDocs.forEach(d => { text += `     • ${d}\n`; });
      }
    });
  });

  text += `\n${'='.repeat(40)}\n`;
  text += `총 ${selectedItems.length}개 항목 선택 / 전체 29개\n`;
  text += `2026년 개정 반영: ${newCount}개\n`;
  text += `본 체크리스트는 참고용이며, 최종 확인은 관할 기관에 문의하세요.\n`;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}_제선플랜트_인허가체크리스트.txt`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('success', '📄 체크리스트 파일이 저장되었습니다.');
}

// ---- 위험 여부 변경 시 추가 추천 ----
function onHazardChange() {
  const hazChem = document.getElementById('hazChemCheck')?.checked;
  const highGas = document.getElementById('highGasCheck')?.checked;
  const confined = document.getElementById('confinedSpaceCheck')?.checked;

  let tips = [];
  if (hazChem) tips.push('⚗️ 유해화학물질 취급 → 17번(유해화학물질 취급시설 허가), 18번(PSM) 필수 확인');
  if (highGas) tips.push('💨 고압가스 취급 → 11번(가스안전관리자 선임), 19번(고압가스 저장허가) 필수');
  if (confined) tips.push('🕳️ 밀폐공간 작업 → 8번(밀폐공간 작업 프로그램) 반드시 포함');

  const banner = document.getElementById('recommendBanner');
  const bannerText = document.getElementById('recommendBannerText');
  if (banner && bannerText) {
    if (tips.length > 0) {
      bannerText.innerHTML = tips.join('<br>');
      banner.style.display = 'flex';
    } else {
      const constructionType = document.getElementById('constructionType')?.value;
      if (!constructionType) banner.style.display = 'none';
    }
  }
}

// ---- 선택 항목 수 표시 업데이트 ----
function updateSelectedCount() {
  const display = document.getElementById('selectedCountDisplay');
  if (display) {
    display.textContent = `선택된 항목: ${checkedItems.size}개 / 전체 ${CHECKLIST_ITEMS.length}개`;
    display.style.color = checkedItems.size > 0 ? 'var(--accent)' : 'var(--gray-500)';
  }
}

// ---- 알림 설정 페이지 연동 ----
function syncNotifItems() {
  // selectedPermits 를 LocalStorage 에 동기화
  if (typeof syncSelectedPermitsToStorage === 'function') {
    syncSelectedPermitsToStorage();
  }
}

// ---- 개별 인허가 완료 처리 (결과 카드) ----
function togglePermitComplete(itemId, btn) {
  if (typeof completedPermitItems === 'undefined') return;

  const numId = typeof itemId === 'string' ? parseInt(itemId) : itemId;

  if (completedPermitItems.has(numId)) {
    completedPermitItems.delete(numId);
    if (btn) {
      btn.classList.remove('completed');
      btn.innerHTML = '<i class="fas fa-check-circle"></i> 완료 처리';
    }
    // 결과 카드 스타일
    const card = document.getElementById(`result-card-${numId}`);
    if (card) card.classList.remove('permit-done');
  } else {
    completedPermitItems.add(numId);
    if (btn) {
      btn.classList.add('completed');
      btn.innerHTML = '<i class="fas fa-check-circle"></i> 완료됨 ✓';
    }
    const card = document.getElementById(`result-card-${numId}`);
    if (card) card.classList.add('permit-done');
  }

  // LocalStorage 저장
  if (typeof saveCompletedToStorage === 'function') saveCompletedToStorage();
  // 대시보드 업데이트
  if (typeof refreshDashboard === 'function') refreshDashboard();
  if (typeof updateSidebarWidget === 'function') updateSidebarWidget();
}
