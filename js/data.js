/* =============================================
   SafeGuard Pro - 지식 데이터베이스
   법령, 유권해석, 체크리스트 데이터
   ============================================= */

// ---- 법령 챗봇 응답 데이터 ----
const LAW_RESPONSES = {
  "중대재해처벌법 적용 대상": {
    keywords: ["중대재해처벌법", "적용 대상", "적용대상", "중대재해", "처벌법 대상"],
    response: `
      <p><strong>중대재해처벌법 적용 대상</strong>에 대해 안내드립니다.</p>
      <p>중대재해처벌법은 상시근로자 수 및 공중이용시설 여부에 따라 단계적으로 적용됩니다.</p>
      <ul style="margin: 8px 0 8px 16px; line-height: 2;">
        <li>✅ <strong>50인 이상 사업장</strong>: 2022년 1월 27일부터 즉시 적용</li>
        <li>✅ <strong>5인 이상 50인 미만 사업장</strong>: 2024년 1월 27일부터 적용</li>
        <li>⚠️ <strong>5인 미만 사업장</strong>: 적용 제외 (단, 공중이용시설은 별도 기준 적용)</li>
        <li>⚠️ <strong>건설업</strong>: 공사금액 50억 원 이상의 건설공사에 적용</li>
      </ul>
      <p>경영책임자 또는 기관의 장이 안전·보건 확보 의무를 이행하지 않아 중대산업재해가 발생하면 처벌 대상이 됩니다.</p>
      <div class="msg-source">[출처: 중대재해 처벌 등에 관한 법률 제2조, 제3조, 부칙 제1조]</div>
    `
  },
  "안전관리자 선임": {
    keywords: ["안전관리자", "선임", "안전관리자 선임", "선임 기준"],
    response: `
      <p><strong>안전관리자 선임 기준</strong>에 대해 안내드립니다.</p>
      <p>건설업의 경우 공사금액 또는 상시근로자 수에 따라 선임 기준이 달라집니다.</p>
      <ul style="margin: 8px 0 8px 16px; line-height: 2;">
        <li>✅ <strong>공사금액 120억 원 이상</strong> (토목 150억 원 이상): 안전관리자 1인 선임 의무</li>
        <li>✅ <strong>공사금액 800억 원 이상</strong>: 안전관리자 2인 이상 선임</li>
        <li>✅ <strong>공사금액 1,500억 원 이상</strong>: 안전관리자 3인 이상 선임</li>
        <li>⚠️ <strong>자격 요건</strong>: 산업안전기사 이상 자격 또는 관련 학위 + 실무경력 보유자</li>
      </ul>
      <p>안전관리자는 사업장에 상시 근무해야 하며, 고용노동부에 선임신고를 완료해야 합니다. 미선임 시 과태료 500만 원이 부과됩니다.</p>
      <div class="msg-source">[출처: 산업안전보건법 제17조, 동법 시행령 제16조, 별표 3]</div>
    `
  },
  "위험성평가": {
    keywords: ["위험성평가", "실시 주기", "위험성 평가", "평가 주기"],
    response: `
      <p><strong>위험성평가 실시 주기</strong>에 대해 안내드립니다.</p>
      <p>위험성평가는 최초평가와 수시평가, 정기평가로 구분됩니다.</p>
      <ul style="margin: 8px 0 8px 16px; line-height: 2;">
        <li>🔵 <strong>최초 위험성평가</strong>: 사업 개시 후 1개월 이내 실시</li>
        <li>🔵 <strong>정기 위험성평가</strong>: 매년 1회 이상 (전년도 위험성평가 내용 검토 포함)</li>
        <li>🟡 <strong>수시 위험성평가</strong>: 다음의 경우 즉시 실시
          <ul style="margin: 4px 0 4px 20px;">
            <li>- 중대재해 또는 산업재해 발생 시</li>
            <li>- 새로운 기계·기구, 화학물질 도입 시</li>
            <li>- 건설물 신설·개조·수리 시</li>
            <li>- 작업방법 또는 작업절차 변경 시</li>
          </ul>
        </li>
      </ul>
      <div class="msg-source">[출처: 산업안전보건법 제36조, 사업장 위험성평가에 관한 지침(고용노동부 고시) 제5조~제9조]</div>
    `
  },
  "산업안전보건위원회": {
    keywords: ["산업안전보건위원회", "위원회", "구성 요건", "위원회 구성"],
    response: `
      <p><strong>산업안전보건위원회 구성 요건</strong>에 대해 안내드립니다.</p>
      <p>상시근로자 100인 이상 사업장에서는 산업안전보건위원회를 구성·운영해야 합니다.</p>
      <ul style="margin: 8px 0 8px 16px; line-height: 2;">
        <li>✅ <strong>구성 요건</strong>: 사용자 위원과 근로자 위원 동수로 구성 (각 10인 이내)</li>
        <li>✅ <strong>사용자 위원</strong>: 해당 사업의 대표자, 안전관리자, 보건관리자, 산업보건의</li>
        <li>✅ <strong>근로자 위원</strong>: 근로자 대표, 명예산업안전감독관, 근로자 대표가 지명하는 9명 이내</li>
        <li>🔵 <strong>회의 주기</strong>: 분기마다 1회 이상 정기회의 개최</li>
        <li>⚠️ <strong>심의·의결 사항</strong>: 산재 예방계획, 안전보건교육, 작업환경 개선 등</li>
      </ul>
      <div class="msg-source">[출처: 산업안전보건법 제24조~제35조, 동법 시행령 제34조~제37조]</div>
    `
  },
  "안전보건교육": {
    keywords: ["안전보건교육", "교육 시간", "교육시간", "안전교육"],
    response: `
      <p><strong>안전보건교육 시간 기준</strong>에 대해 안내드립니다.</p>
      <p>근로자 안전보건교육은 교육 종류와 대상에 따라 시간이 다릅니다.</p>
      <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin:8px 0;">
        <tr style="background:#f0f4f8; font-weight:700;">
          <td style="padding:6px 10px; border:1px solid #ddd;">교육 종류</td>
          <td style="padding:6px 10px; border:1px solid #ddd;">대상</td>
          <td style="padding:6px 10px; border:1px solid #ddd;">교육 시간</td>
        </tr>
        <tr>
          <td style="padding:6px 10px; border:1px solid #ddd;">정기교육</td>
          <td style="padding:6px 10px; border:1px solid #ddd;">사무직 근로자</td>
          <td style="padding:6px 10px; border:1px solid #ddd;">매 분기 3시간 이상</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:6px 10px; border:1px solid #ddd;">정기교육</td>
          <td style="padding:6px 10px; border:1px solid #ddd;">그 외 근로자</td>
          <td style="padding:6px 10px; border:1px solid #ddd;">매 분기 6시간 이상</td>
        </tr>
        <tr>
          <td style="padding:6px 10px; border:1px solid #ddd;">채용 시 교육</td>
          <td style="padding:6px 10px; border:1px solid #ddd;">일용근로자</td>
          <td style="padding:6px 10px; border:1px solid #ddd;">1시간 이상</td>
        </tr>
        <tr style="background:#fafafa;">
          <td style="padding:6px 10px; border:1px solid #ddd;">채용 시 교육</td>
          <td style="padding:6px 10px; border:1px solid #ddd;">일용근로자 외</td>
          <td style="padding:6px 10px; border:1px solid #ddd;">8시간 이상</td>
        </tr>
        <tr>
          <td style="padding:6px 10px; border:1px solid #ddd;">특별교육</td>
          <td style="padding:6px 10px; border:1px solid #ddd;">유해위험작업 종사자</td>
          <td style="padding:6px 10px; border:1px solid #ddd;">16시간 이상 (최초 작업 전 4시간, 나머지 3개월 내)</td>
        </tr>
      </table>
      <div class="msg-source">[출처: 산업안전보건법 제29조, 동법 시행규칙 제26조, 별표 4]</div>
    `
  },
  "default": {
    response: `
      <p>질문해 주신 내용에 대해 검색 중입니다.</p>
      <p>현재 데이터베이스에서 정확히 일치하는 법령 조항을 찾지 못했습니다. 아래 방법을 시도해 보세요:</p>
      <ul style="margin: 8px 0 8px 16px; line-height: 2;">
        <li>🔍 더 구체적인 키워드로 질문해 주세요 (예: "중대재해처벌법 적용 대상")</li>
        <li>📋 오른쪽 자주 묻는 질문 항목을 클릭해 보세요</li>
        <li>📞 추가 문의: 고용노동부 고객상담센터 1350</li>
        <li>🌐 고용노동부 공식 사이트: www.moel.go.kr</li>
      </ul>
      <div class="msg-source">[시스템] SafeGuard Pro AI 법령 상담사 | 데이터 기준일: 2026.01.01</div>
    `
  }
};

// ---- 유권해석 챗봇 응답 데이터 ----
const GUIDELINE_RESPONSES = {
  "유해위험방지계획서": {
    keywords: ["유해위험방지계획서", "유해위험방지", "계획서 제출", "유해위험"],
    category: "산업안전보건법",
    response: `
      <div class="guideline-answer">
        <div class="answer-block summary-block">
          <div class="answer-block-title">📋 가이드라인 요약</div>
          <p>유해위험방지계획서는 특정 건설공사 착공 전 반드시 제출해야 하는 서류로, 공사 현장의 유해·위험 요소를 사전에 파악하고 방지 대책을 수립하는 문서입니다.</p>
          <p><strong>제출 의무 대상:</strong></p>
          <ul style="margin: 6px 0 0 16px; line-height: 1.8;">
            <li>지상 높이가 31m 이상인 건축물 또는 인공구조물 건설공사</li>
            <li>연면적 30,000㎡ 이상의 건축물 건설공사</li>
            <li>깊이 10m 이상인 굴착공사</li>
            <li>최대 지간길이가 50m 이상인 교량 건설공사</li>
            <li>터널 건설공사</li>
            <li>다목적댐·발전용 댐 및 저수용량 2,000만 톤 이상의 댐 건설공사</li>
          </ul>
        </div>
        <div class="answer-block ref-block">
          <div class="answer-block-title">📎 관련 유권해석 번호/날짜</div>
          <p>• 고용노동부 유권해석 <strong>안전기획과-2847</strong> (2025.06.15)</p>
          <p>• KOSHA 가이드 <strong>C-62-2024</strong> (유해위험방지계획서 작성 실무지침)</p>
          <p>• 고용노동부 고시 제2023-19호 (유해위험방지계획서 심사규정)</p>
        </div>
        <div class="answer-block caution-block">
          <div class="answer-block-title">⚠️ 실무 적용 시 주의사항</div>
          <p>① 착공 <strong>15일 전</strong>까지 한국산업안전보건공단에 제출 필수</p>
          <p>② 계획서 미제출 시 <strong>500만 원 이하 과태료</strong> 및 착공 금지 조치 가능</p>
          <p>③ 심사 결과에 따라 조건부 심사 시 보완 제출 필요 (기간: 30일 이내)</p>
          <p>④ 착공 후 계획 변경 시 <strong>변경 계획서</strong> 즉시 제출 필요</p>
        </div>
      </div>
      <div class="msg-source">[출처: 산업안전보건법 제42조, 동법 시행령 제42조의2, KOSHA C-62-2024]</div>
    `
  },
  "안전관리계획서": {
    keywords: ["안전관리계획서", "안전관리 계획서", "건설공사 안전관리"],
    category: "건설기술진흥법",
    response: `
      <div class="guideline-answer">
        <div class="answer-block summary-block">
          <div class="answer-block-title">📋 가이드라인 요약</div>
          <p>건설공사 안전관리계획서는 건설기술진흥법에 따라 특정 건설공사 착공 전 발주자의 승인을 받아야 하는 서류입니다.</p>
          <p><strong>작성·제출 의무 대상:</strong></p>
          <ul style="margin: 6px 0 0 16px; line-height: 1.8;">
            <li>1종 시설물 및 지정 건설공사</li>
            <li>폭발물 사용 건설공사 (지하 굴착 포함)</li>
            <li>10층 이상의 건축물 건설공사</li>
            <li>신기술 공법 적용 공사 등</li>
          </ul>
        </div>
        <div class="answer-block ref-block">
          <div class="answer-block-title">📎 관련 유권해석 번호/날짜</div>
          <p>• 국토교통부 유권해석 <strong>건설안전과-3219</strong> (2025.09.20)</p>
          <p>• 건설공사 안전관리 업무수행 지침 (국토교통부 고시 제2024-512호)</p>
        </div>
        <div class="answer-block caution-block">
          <div class="answer-block-title">⚠️ 실무 적용 시 주의사항</div>
          <p>① 착공 <strong>7일 전</strong>까지 발주자 제출 및 검토·승인 완료 필요</p>
          <p>② 건설사업관리기술인(CM) 배치 현장은 CM 검토 후 제출</p>
          <p>③ 안전관리계획서 이행 여부를 <strong>주 1회 이상</strong> 자체점검 실시</p>
          <p>④ 중요 변경사항 발생 시 변경계획서 재제출 의무</p>
        </div>
      </div>
      <div class="msg-source">[출처: 건설기술진흥법 제62조, 동법 시행령 제98조, 동법 시행규칙 제58조]</div>
    `
  },
  "설계안전성검토": {
    keywords: ["설계안전성검토", "DFS", "dfs", "설계 안전성"],
    category: "건설기술진흥법",
    response: `
      <div class="guideline-answer">
        <div class="answer-block summary-block">
          <div class="answer-block-title">📋 가이드라인 요약</div>
          <p>설계안전성검토(DFS, Design for Safety)는 설계 단계에서 시공 시 발생할 수 있는 재해 위험 요소를 사전에 파악하고 제거하는 제도입니다.</p>
          <p><strong>적용 대상:</strong></p>
          <ul style="margin: 6px 0 0 16px; line-height: 1.8;">
            <li>총 공사비 200억 원 이상의 건설공사 (설계 단계) ⚠️ <em>2025.09 개정: 종전 300억→200억으로 강화</em></li>
            <li>발주청(국가·지자체·공공기관) 발주 공사</li>
          </ul>
        </div>
        <div class="answer-block ref-block">
          <div class="answer-block-title">📎 관련 유권해석 번호/날짜</div>
          <p>• 국토교통부 <strong>DFS 업무처리기준</strong> (국토부 고시 제2025-598호, 2025.09 개정)</p>
          <p>• KISTEC 설계안전성검토 매뉴얼 2026년 개정판</p>
        </div>
        <div class="answer-block caution-block">
          <div class="answer-block-title">⚠️ 실무 적용 시 주의사항</div>
          <p>① 발주자가 설계용역 완료 전 DFS 실시 지시</p>
          <p>② DFS 결과보고서는 설계도서에 포함하여 제출</p>
          <p>③ 시공자는 DFS 결과를 안전관리계획서에 반영 의무</p>
          <p>④ 설계 변경 시 변경된 부분에 대해 DFS 재실시 필요</p>
        </div>
      </div>
      <div class="msg-source">[출처: 건설기술진흥법 제62조의2, 설계의 안전성 검토에 관한 지침(국토부 고시)]</div>
    `
  },
  "건설기계 안전검사": {
    keywords: ["건설기계", "안전검사", "건설기계 검사", "기계 검사 주기"],
    category: "산업안전보건법",
    response: `
      <div class="guideline-answer">
        <div class="answer-block summary-block">
          <div class="answer-block-title">📋 가이드라인 요약</div>
          <p>건설기계 안전검사는 유해·위험한 기계·기구에 대해 사용 전 또는 정기적으로 안전성을 확인하는 검사입니다.</p>
          <p><strong>검사 주기별 구분:</strong></p>
          <ul style="margin: 6px 0 0 16px; line-height: 1.8;">
            <li>크레인: 최초 설치 시 검사 + <strong>매 2년</strong>마다 정기검사</li>
            <li>리프트: 최초 설치 시 검사 + <strong>매 1년</strong>마다 정기검사</li>
            <li>고소작업대: 최초 설치 시 검사 + <strong>매 2년</strong>마다 정기검사</li>
            <li>이동식 크레인: 최초 등록 후 3년 + <strong>이후 매 2년</strong></li>
          </ul>
        </div>
        <div class="answer-block ref-block">
          <div class="answer-block-title">📎 관련 유권해석 번호/날짜</div>
          <p>• 고용노동부 유권해석 <strong>안전보건기준과-1892</strong> (2025.04.10)</p>
          <p>• KOSHA 가이드 <strong>M-174-2023</strong> (건설기계 안전관리 지침)</p>
        </div>
        <div class="answer-block caution-block">
          <div class="answer-block-title">⚠️ 실무 적용 시 주의사항</div>
          <p>① 유효기간 만료 전 <strong>30일 이내</strong> 재검사 신청 권장</p>
          <p>② 안전검사 미이행 시 <strong>1,000만 원 이하 과태료</strong> 부과</p>
          <p>③ 검사 결과 불합격 시 즉시 사용 금지 및 개선 후 재검사</p>
          <p>④ 검사 합격증은 기계에 부착하고 검사기록부 보관 (3년)</p>
        </div>
      </div>
      <div class="msg-source">[출처: 산업안전보건법 제93조, 동법 시행령 제78조, 안전검사 고시(고용노동부 고시)]</div>
    `
  },
  "화학물질 취급시설": {
    keywords: ["화학물질", "취급시설", "화학물질 인허가", "화학물질 취급"],
    category: "화학물질관리법",
    response: `
      <div class="guideline-answer">
        <div class="answer-block summary-block">
          <div class="answer-block-title">📋 가이드라인 요약</div>
          <p>화학물질 취급시설 설치·운영 시에는 화학물질관리법에 따른 인허가 절차를 반드시 이행해야 합니다.</p>
          <p><strong>주요 인허가 절차:</strong></p>
          <ul style="margin: 6px 0 0 16px; line-height: 1.8;">
            <li>유해화학물질 취급업 허가 (환경부)</li>
            <li>화학물질 취급시설 설치·운영 신고 (지방환경청)</li>
            <li>장외영향평가 (사고 시나리오 분석 포함)</li>
            <li>위해관리계획서 작성·제출 (RMP)</li>
          </ul>
        </div>
        <div class="answer-block ref-block">
          <div class="answer-block-title">📎 관련 유권해석 번호/날짜</div>
          <p>• 환경부 유권해석 <strong>화학안전과-2156</strong> (2025.08.01)</p>
          <p>• 화학물질 취급시설 설치·운영에 관한 기준 (환경부 고시 제2024-178호)</p>
        </div>
        <div class="answer-block caution-block">
          <div class="answer-block-title">⚠️ 실무 적용 시 주의사항</div>
          <p>① 취급시설 설치 <strong>30일 전</strong>까지 관할 환경청에 신고</p>
          <p>② 유해화학물질 취급 시 취급자 전문교육 이수 필수 (16시간)</p>
          <p>③ 장외영향평가 결과에 따른 안전거리 확보 의무</p>
          <p>④ 연간 취급량 변경 시 변경신고 필요 (변경일로부터 30일 이내)</p>
        </div>
      </div>
      <div class="msg-source">[출처: 화학물질관리법 제26조, 제27조, 동법 시행규칙 제20조, 제21조]</div>
    `
  },
  "default": {
    response: `
      <div class="guideline-answer">
        <div class="answer-block summary-block">
          <div class="answer-block-title">📋 가이드라인 요약</div>
          <p>질문해 주신 내용과 관련된 정확한 유권해석을 찾지 못했습니다.</p>
          <p>더 구체적인 키워드로 다시 질문해 주시거나, 카테고리 필터를 사용해 주세요.</p>
        </div>
        <div class="answer-block ref-block">
          <div class="answer-block-title">📎 관련 문의처</div>
          <p>• 고용노동부 고객상담센터: <strong>1350</strong></p>
          <p>• KOSHA 콜센터: <strong>1644-4544</strong></p>
          <p>• 국토교통부 민원상담: <strong>1599-0001</strong></p>
        </div>
        <div class="answer-block caution-block">
          <div class="answer-block-title">⚠️ 참고사항</div>
          <p>본 AI 답변은 참고용이며, 최종 법적 판단은 관할 기관의 공식 유권해석을 따르시기 바랍니다.</p>
        </div>
      </div>
      <div class="msg-source">[시스템] 유권해석 DB 기준일: 2026.01.01 | 고용노동부, KOSHA</div>
    `
  }
};

// ---- 인허가 체크리스트 데이터 (제철산업 제선·고로 플랜트 건설 특화, 2026.06 기준) ----
// 카테고리: 산업안전보건(1~11), 환경(12~16), 화학·가스(17~20), 에너지·전기·소방(21~25), 건설행정·기타(26~28)
// ★ 표시(isNew2026:true): 3,4,7,9,10,15,17,18번 항목 - 2026년 최신 개정 반영
// 2026.06 주요 변경: 안전관리자 선임기준(120억→100억), DFS 대상(300억→200억), 수시평가 3개월 의무화
// 추천 로직: 공사구분별 recommendedFor 배열 활용
const CHECKLIST_ITEMS = [

  /* =========================================================
     카테고리 1: 산업안전보건 분야 (항목 1~11)
     ========================================================= */

  // 1. 유해위험방지계획서 (제조업)
  {
    id: 1,
    num: 1,
    category: "산업안전보건",
    categoryIcon: "fas fa-hard-hat",
    name: "유해위험방지계획서 (제조업 등)",
    desc: "금속 용해로(3톤 이상), 화학설비 등을 설치·이전·변경 시 제출 의무",
    icon: "fas fa-file-shield",
    isNew2026: false,
    submitTiming: "설비 설치·변경 공사 착공 15일 전까지",
    submitTimingDays: { reference: "착공전", days: 15 },
    submitTo: "한국산업안전보건공단 (관할 지역본부)",
    relatedLaw: "산업안전보건법 제42조, 시행규칙 제58조~제73조",
    targetCondition: "금속이나 그 밖의 광물 용해로(용량 3톤 이상), 화학설비, 건조설비 등을 설치·이전·변경하는 경우. 고로(Blast Furnace) 신설 및 개수, 열풍로 신설·보수, 소결설비/코크스설비 신증설 시 해당.",
    cautionPoints: [
      "공종별 세부 작업계획 및 안전조치 방안을 구체적으로 기술할 것",
      "용해로(고로) 용량, 열풍로 규격 등 설비 제원을 정확히 기재",
      "밀폐공간(고로 내부, 열풍로 내부) 작업 시 질식·중독 방지대책 별도 포함",
      "고열작업(출선, 주선) 관련 화상·폭발 방지대책 포함",
      "심사기간 약 15일 소요 → 실질적으로 착공 30일 전 제출 권장",
      "부적합 판정 시 보완 후 재심사 필요 → 일정 여유 확보 필수"
    ],
    requiredDocs: ["유해위험방지계획서 본문", "설비 배치도 및 공정흐름도", "구조검토 확인서", "유해위험요인 목록 및 감소대책", "안전보건관리체계도"],
    reviewPeriod: "접수 후 15일 이내 (보완요청 시 추가 소요)",
    penalty: "착공 전 미제출 시 과태료 최대 5,000만 원(2026.06 기준), 공사중지 명령 가능",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "열풍로신설보수", "소결설비신설증설", "코크스설비신설증설", "가스정제설비교체증설", "부생가스배관설치교체"]
  },

  // 2. 안전관리계획서 (플랜트)
  {
    id: 2,
    num: 2,
    category: "산업안전보건",
    categoryIcon: "fas fa-hard-hat",
    name: "안전관리계획서 (플랜트 공사)",
    desc: "1종 시설물 해당 플랜트 또는 공사비 1,000억 이상 건설공사 착공 7일 전 필수 제출 (스마트안전관리 의무화)",
    icon: "fas fa-clipboard-check",
    isNew2026: false,
    submitTiming: "착공 7일 전까지 발주자(사업주) 승인",
    submitTimingDays: { reference: "착공전", days: 7 },
    submitTo: "발주자 (건설사업관리기술인 검토 후 승인)",
    relatedLaw: "건설기술진흥법 제62조, 동법 시행령 제98조",
    targetCondition: "1종 시설물(고로·소결로 등 대형 제철설비), 공사비 1,000억 원 이상 플랜트 건설공사",
    cautionPoints: [
      "주 1회 이상 안전관리계획서 이행 여부 자체점검 실시 의무",
      "중요 변경(공법·공기·설비 규격 변경 등) 시 변경계획서 재제출",
      "CM(건설사업관리기술인) 배치 현장은 CM 검토 필수",
      "공사 완료 시까지 현장 비치 및 고로 내부 진입 시 세부 안전조치 기재",
      "발주자는 안전관리계획서 이행여부 확인 의무 있음"
    ],
    requiredDocs: ["안전관리계획서 본문", "현장 배치도", "공정별 안전관리 상세 계획", "비상대응 계획", "안전관리 조직도"],
    reviewPeriod: "착공 전 발주자 승인 (CM 검토 포함 약 7~14일)",
    penalty: "미제출 또는 미이행 시 과태료 1천만원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "소결설비신설증설", "코크스설비신설증설", "원료처리설비증설"]
  },

  // 3. ★ 중대재해처벌법 안전보건관리체계 구축 (2026 개정)
  {
    id: 3,
    num: 3,
    category: "산업안전보건",
    categoryIcon: "fas fa-hard-hat",
    name: "중대재해처벌법 안전보건관리체계 구축",
    desc: "경영책임자의 안전보건 확보의무 이행을 위한 관리체계 문서화 및 이행 점검",
    icon: "fas fa-shield-halved",
    isNew2026: true,
    updateReason: "2026년 개정: 경영책임자 서명 안전보건 방침서 필수, 분기별 경영검토 회의 의무화",
    submitTiming: "착공 전 구축 완료, 착공 후 분기별 점검",
    submitTimingDays: { reference: "착공전", days: 30 },
    submitTo: "자체 보관 (고용노동부 감독 시 제시, 경영책임자 결재 필수)",
    relatedLaw: "중대재해처벌법 제4조, 제5조, 동법 시행령 제4조~제12조",
    targetCondition: "상시근로자 5인 이상 사업장 전체 (제철산업 해당). 일 최대 투입인원 기준이 아닌 상시근로자 기준 적용.",
    cautionPoints: [
      "2026년 개정: 경영책임자 서명 안전보건 방침서 필수 (CEO 직접 서명)",
      "분기 1회 이상 안전보건 경영검토 회의 및 회의록 보관(5년)",
      "안전관리 예산 배정 증빙서류 및 실집행액 대비 계획 관리",
      "협력업체(도급·용역·위탁) 안전관리 역량 평가 기록 유지",
      "위험성평가 결과를 경영책임자에게 정기 보고하는 체계 구축",
      "중대재해 발생 시 즉시 경영책임자 보고 체계 및 재발방지대책 수립 의무"
    ],
    requiredDocs: ["CEO 서명 안전보건방침서", "안전보건 예산계획 및 집행실적", "분기 경영검토 회의록", "협력업체 안전관리 역량 평가표", "위험성평가 경영책임자 보고 기록"],
    reviewPeriod: "내부 구축 후 고용노동부 감독 시 확인 (감독 일정 미정)",
    penalty: "의무 미이행으로 중대재해 발생 시 경영책임자 1년 이상 징역 또는 10억 원 이하 벌금",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "열풍로신설보수", "소결설비신설증설", "코크스설비신설증설", "가스정제설비교체증설", "부생가스배관설치교체", "원료처리설비증설", "기타부대설비"]
  },

  // 4. ★ 위험성평가 (KRAS 활용, 2026 개정)
  {
    id: 4,
    num: 4,
    category: "산업안전보건",
    categoryIcon: "fas fa-hard-hat",
    name: "위험성평가 (고로 공정 특화)",
    desc: "고로·열풍로·코크스·소결 공정별 위험요인 사전 발굴 및 감소대책 수립, 2026년 서면확인제도 반영",
    icon: "fas fa-exclamation-triangle",
    isNew2026: true,
    updateReason: "2026.2.19 산업안전보건법 개정 - 위험성평가 미실시 과태료 1천만원, 서면확인제도 신설",
    submitTiming: "착공 전 최초 실시, 작업 변경·중대재해 발생 시 수시 실시",
    submitTimingDays: { reference: "착공전", days: 14 },
    submitTo: "자체 보관, 근로자 공유 의무 (KRAS 시스템 등록 권장)",
    relatedLaw: "산업안전보건법 제36조, 위험성평가에 관한 지침(고용노동부 고시 2024-9호)",
    targetCondition: "전 사업장(상시근로자 1인 이상). 고로 공정은 고열·밀폐·가스(CO, H₂S) 위험 특별 평가 필수.",
    cautionPoints: [
      "2026년 개정: 서면확인제도 적용 – 50인 미만 위험성평가 우수사업장 인정 신청 가능",
      "KRAS(한국형 위험성평가 시스템) 활용 시 작업별 3×3 리스크 매트릭스 적용",
      "고로 내부 작업: 일산화탄소(CO) 농도 25ppm 이하 확인 후 진입",
      "출선·주선 작업: 용선 비산·폭발 방지대책(방호벽, 내화보호구) 포함",
      "코크스·소결 분진 폭발 위험성: 폭발농도 하한(LEL) 25% 이하 유지",
      "위험성평가 결과 3년 보존, 근로자 교육 및 공유 필수"
    ],
    requiredDocs: ["위험성평가 실시 계획서", "공정별 위험요인 목록", "리스크 매트릭스 결과", "개선대책 및 이행확인서", "근로자 교육 확인서"],
    reviewPeriod: "자체 실시 (외부 전문기관 위탁 가능, 결과 즉시 활용)",
    penalty: "미실시 시 과태료 5만~500만원 (규모별 차등), 중대재해 연계 시 형사책임",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "열풍로신설보수", "소결설비신설증설", "코크스설비신설증설", "가스정제설비교체증설", "부생가스배관설치교체", "원료처리설비증설", "기타부대설비"]
  },

  // 5. 안전관리자 선임
  {
    id: 5,
    num: 5,
    category: "산업안전보건",
    categoryIcon: "fas fa-hard-hat",
    name: "안전관리자 선임 (공사 규모별)",
    desc: "공사금액 120억 원 이상 또는 상시근로자 300인 이상 사업장 안전관리자 선임 의무",
    icon: "fas fa-user-shield",
    isNew2026: false,
    submitTiming: "착공 전 고용노동부 선임 신고",
    submitTimingDays: { reference: "착공전", days: 14 },
    submitTo: "관할 고용노동지청 (선임신고)",
    relatedLaw: "산업안전보건법 제17조, 동법 시행령 제16조, 별표 3",
    targetCondition: "건설업 공사금액 120억원 이상(토목 150억원 이상), 제조업 상시 300인 이상. 고로 건설현장은 건설업과 제조업 병행 적용 확인 필요.",
    cautionPoints: [
      "자격: 산업안전기사 이상 또는 관련 학위 + 실무경력",
      "고로 공사현장은 건설/제조 복합 성격 → 양쪽 기준 모두 검토",
      "고압가스 취급 현장 추가 선임 요건 확인 (고압가스안전관리법 적용)",
      "미선임 시 과태료 500만 원 이하",
      "부생가스(BFG·COG·LDG) 취급 시 가스 안전관리자 별도 선임 필요"
    ],
    requiredDocs: ["안전관리자 선임(변경)신고서", "자격증 사본", "재직증명서", "현장 배치확인서"],
    reviewPeriod: "신고 접수 즉시 수리 (이의 없는 경우)",
    penalty: "미선임 시 과태료 500만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "열풍로신설보수", "소결설비신설증설", "코크스설비신설증설", "원료처리설비증설"]
  },

  // 6. 보건관리자 선임
  {
    id: 6,
    num: 6,
    category: "산업안전보건",
    categoryIcon: "fas fa-hard-hat",
    name: "보건관리자 선임",
    desc: "건설업 공사금액 800억 원 이상 또는 제조업 상시 50인 이상 보건관리자 선임 의무",
    icon: "fas fa-user-nurse",
    isNew2026: false,
    submitTiming: "착공 전 선임 완료 및 고용노동부 신고",
    submitTimingDays: { reference: "착공전", days: 14 },
    submitTo: "관할 고용노동지청",
    relatedLaw: "산업안전보건법 제18조, 동법 시행령 제20조",
    targetCondition: "건설업 800억 이상 또는 제조업 상시 50인 이상. 고로 공정은 고열·분진·유해가스로 인한 건강장해 예방 필수.",
    cautionPoints: [
      "자격: 산업보건지도사, 간호사, 산업위생관리기사 이상",
      "고로 공정 고열작업자 특수건강진단(연 1회 이상) 실시 의무",
      "분진(코크스, 소결 분진) 작업환경측정 및 건강관리 프로그램 운영",
      "미선임 시 과태료 500만 원 이하",
      "공사 특성상 의료기관 협약을 통한 보건관리 위탁도 가능"
    ],
    requiredDocs: ["보건관리자 선임(변경)신고서", "자격증 사본", "재직증명서"],
    reviewPeriod: "신고 접수 즉시",
    penalty: "미선임 시 과태료 500만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "소결설비신설증설", "코크스설비신설증설"]
  },

  // 7. ★ 특별안전보건교육 (2026 개정)
  {
    id: 7,
    num: 7,
    category: "산업안전보건",
    categoryIcon: "fas fa-hard-hat",
    name: "특별안전보건교육",
    desc: "고로·열풍로·밀폐공간·고열작업 등 유해위험 작업 근로자 특별교육 16시간 이상",
    icon: "fas fa-user-graduate",
    isNew2026: true,
    updateReason: "2026년 산업안전보건관리비 항목·사용비율 확대로 교육비 집행 기준 강화",
    submitTiming: "해당 유해위험 작업 시작 전 교육 완료",
    submitTimingDays: { reference: "착공전", days: 7 },
    submitTo: "자체 실시 또는 외부 교육기관 위탁 (교육기록 자체 보관)",
    relatedLaw: "산업안전보건법 제29조, 동법 시행규칙 제26조 별표 4",
    targetCondition: "고로 내부작업, 밀폐공간(열풍로·가스홀더·코크스로) 진입 작업, 고열작업, 용접·용단작업, 고압가스 취급 작업 등",
    cautionPoints: [
      "최초 작업 전 4시간, 이후 3개월 이내 나머지 12시간 이상 (총 16시간)",
      "단기간·간헐적 작업 종사자도 2시간 이상 교육 후 작업 가능",
      "밀폐공간 진입 전 특별교육 + 질식 위험 환경 실습 교육 권장",
      "교육 수료증 및 교육일지 3년간 보관",
      "교육 미이수 시 과태료 500만 원 이하"
    ],
    requiredDocs: ["특별안전보건교육 계획서", "수료자 명단 및 수료증", "교육일지(강사·내용·시간 기재)"],
    reviewPeriod: "자체 실시 (감독 시 기록 제시)",
    penalty: "미실시 시 과태료 500만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "열풍로신설보수", "소결설비신설증설", "코크스설비신설증설", "가스정제설비교체증설", "부생가스배관설치교체"]
  },

  // 8. 밀폐공간 작업 프로그램
  {
    id: 8,
    num: 8,
    category: "산업안전보건",
    categoryIcon: "fas fa-hard-hat",
    name: "밀폐공간 작업 프로그램 수립",
    desc: "고로 내부, 열풍로, 가스홀더, 코크스로 등 밀폐공간 작업 전 프로그램 수립 및 허가제 운영",
    icon: "fas fa-dungeon",
    isNew2026: false,
    submitTiming: "밀폐공간 작업 착수 전 수립, 매 작업 시 출입 허가증 발행",
    submitTimingDays: { reference: "착공전", days: 7 },
    submitTo: "자체 보관 (사업주 서명 허가증 작업현장 비치)",
    relatedLaw: "산업안전보건법 제171조, 동법 산업안전보건기준에 관한 규칙 제618조~제646조",
    targetCondition: "고로 내부, 열풍로 연소실·축열실, 가스홀더 내부, 코크스로 배관·집진설비 내부, 지하 가스 배관구, 슬래그 처리조",
    cautionPoints: [
      "진입 전 반드시 산소농도(18~23.5%) 측정, CO 25ppm 이하, H₂S 10ppm 이하 확인",
      "환기장치 가동 확인 후 진입, 작업 중 연속 모니터링",
      "안전감시인 1명 이상 외부 배치 (진입자와 상시 통신)",
      "격리·잠금(LOTO) 절차: 가스 차단 후 퍼지(Purge), 공기측정, 진입",
      "긴급구조장비(구조용 공기호흡기, 구조줄, 삼각대) 현장 비치",
      "밀폐공간 작업 허가증(Confined Space Entry Permit) 매 작업 발행"
    ],
    requiredDocs: ["밀폐공간 작업 프로그램", "산소·유해가스 농도 측정기록", "작업 허가증 사본", "LOTO 확인서"],
    reviewPeriod: "자체 시행 (매 작업 전 점검)",
    penalty: "미이행 시 과태료 또는 형사처벌 (질식사고 시 중대재해처벌법 적용)",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "열풍로신설보수", "코크스설비신설증설", "가스정제설비교체증설", "부생가스배관설치교체"]
  },

  // 9. ★ 중대재해 발생 시 보고체계 수립 (2026 개정)
  {
    id: 9,
    num: 9,
    category: "산업안전보건",
    categoryIcon: "fas fa-hard-hat",
    name: "중대재해 발생 시 보고체계 수립",
    desc: "중대산업재해(사망·부상·질병) 발생 즉시 작업중지 및 고용노동부 보고 절차 마련",
    icon: "fas fa-phone-volume",
    isNew2026: true,
    updateReason: "2026.6.1 시행 - 대기업·공공기관 안전보건 현황 공시 의무화로 보고체계 강화",
    submitTiming: "착공 전 비상연락 체계 수립, 사고 발생 시 즉시(지체 없이) 보고",
    submitTimingDays: { reference: "착공전", days: 7 },
    submitTo: "고용노동부(1350), 관할 고용노동지청, 산재 시 근로복지공단",
    relatedLaw: "산업안전보건법 제54조, 중대재해처벌법 제4조·제5조",
    targetCondition: "사망사고, 3개월 이상 요양 부상, 10명 이상 부상·질병 동시 발생 등 중대산업재해 발생 현장",
    cautionPoints: [
      "사고 발생 즉시: 119 신고 → 작업중지 → 고용노동부 즉시 신고",
      "작업중지 명령 전 임의로 현장 훼손 금지 (증거보전)",
      "비상연락망(사업주·안전관리자·노동지청 연락처) 현장 게시 의무",
      "보고 지연 또는 은폐 시 가중처벌 (형량 2배)",
      "현장 CCTV 및 작업일지 즉시 보전 조치"
    ],
    requiredDocs: ["비상연락망 게시물", "중대재해 발생 보고서 양식", "사고조사 체계 절차서"],
    reviewPeriod: "사고 발생 즉시 보고 (지체 없이)",
    penalty: "미보고 또는 보고 지연 시 과태료 1,000만 원 이하, 은폐 시 형사처벌",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "열풍로신설보수", "소결설비신설증설", "코크스설비신설증설", "부생가스배관설치교체"]
  },

  // 10. ★ 산업안전보건관리비 계상 (2026 개정)
  {
    id: 10,
    num: 10,
    category: "산업안전보건",
    categoryIcon: "fas fa-hard-hat",
    name: "산업안전보건관리비 계상 및 집행",
    desc: "공사금액 기준 비율에 따른 안전보건관리비 계상, 별도 항목 계약서 반영 의무",
    icon: "fas fa-coins",
    isNew2026: true,
    updateReason: "2026년 산업안전보건관리비 사용 가능 항목 및 사용비율 확대 (고시 개정)",
    submitTiming: "계약 체결 전 계상, 착공 후 월별 집행 및 1년간 기록 보관",
    submitTimingDays: { reference: "계약전", days: 0 },
    submitTo: "발주자 (계약서 반영), 고용노동부 (감독 시 집행실적 제출)",
    relatedLaw: "산업안전보건법 제72조, 동법 시행규칙 제89조, 고용노동부 고시 (안전관리비 집행기준)",
    targetCondition: "총 공사금액 4,000만 원 이상 건설공사 전체. 제철 플랜트는 설비비 별도 적용 기준 확인 필요.",
    cautionPoints: [
      "공사금액 5억 미만 2.93%, 5억~50억 1.86%+34백만원, 50억 이상 1.20% 기준 적용",
      "안전관리비 목적 외 사용 금지 (과태료 1,000만 원 이하)",
      "집행 후 영수증·사진 등 증빙서류 1년 보관",
      "협력업체(하도급) 안전관리비 배분 및 집행 현황 별도 관리",
      "분기별 집행계획 대비 실적 비교 보고서 작성 권장"
    ],
    requiredDocs: ["안전보건관리비 계상 명세서", "월별 집행계획 및 실적표", "집행 증빙서류(영수증·사진)"],
    reviewPeriod: "준공 후 1년간 보관",
    penalty: "미계상 또는 목적 외 사용 시 과태료 1,000만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "열풍로신설보수", "소결설비신설증설", "코크스설비신설증설", "가스정제설비교체증설", "부생가스배관설치교체", "원료처리설비증설", "기타부대설비"]
  },

  // 11. 고압가스 안전관리 (운반·사용 허가 포함)
  {
    id: 11,
    num: 11,
    category: "산업안전보건",
    categoryIcon: "fas fa-hard-hat",
    name: "고압가스 취급 안전관리자 선임",
    desc: "부생가스(BFG·COG·LDG) 등 가연성·독성 고압가스 취급 시 가스안전관리자 별도 선임",
    icon: "fas fa-fire-flame-curved",
    isNew2026: false,
    submitTiming: "가스 취급 전 한국가스안전공사 신고",
    submitTimingDays: { reference: "착공전", days: 14 },
    submitTo: "한국가스안전공사 (KGS), 관할 시·군·구청",
    relatedLaw: "고압가스 안전관리법 제15조, 동법 시행령 제12조",
    targetCondition: "BFG(고로가스), COG(코크스로가스), LDG(전로가스) 등 고압가스 배관 설치·시운전·운영 현장",
    cautionPoints: [
      "가스안전관리자 자격: 가스산업기사 이상 또는 가스기능사+실무 2년",
      "이동식 압력용기 사용 시 운반 허가 별도 취득",
      "고압가스 배관 용접 후 비파괴검사(RT/UT) 및 내압시험 필수",
      "가스누출 감지 경보장치 설치 및 정기 점검",
      "부생가스 라인 퍼지(Purge) 절차서 작성 및 훈련"
    ],
    requiredDocs: ["가스안전관리자 선임신고서", "자격증 사본", "배관 비파괴검사 성적서", "가스누출 경보설비 점검기록"],
    reviewPeriod: "신고 후 즉시 수리",
    penalty: "미선임 시 과태료 500만 원 이하, 사고 시 형사처벌",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "가스정제설비교체증설", "부생가스배관설치교체", "코크스설비신설증설"]
  },

  /* =========================================================
     카테고리 2: 환경 분야 (항목 12~16)
     ========================================================= */

  // 12. 대기배출시설 설치 허가
  {
    id: 12,
    num: 12,
    category: "환경",
    categoryIcon: "fas fa-leaf",
    name: "대기배출시설 설치 허가",
    desc: "소결로·코크스로·고로 연돌 등 대기오염물질 배출시설 설치 전 환경부 허가 의무",
    icon: "fas fa-smog",
    isNew2026: false,
    submitTiming: "설비 설치 착공 전 (허가 완료 후 착공)",
    submitTimingDays: { reference: "착공전", days: 60 },
    submitTo: "관할 지방환경청 또는 시·도지사",
    relatedLaw: "대기환경보전법 제23조, 동법 시행규칙 제24조",
    targetCondition: "소결설비(소결로), 코크스설비(코크스로·냉각설비), 고로 연돌, 열풍로 연소가스 배출구 등 1~4종 대기배출시설",
    cautionPoints: [
      "허가 신청 후 처리기간 약 30~60일 소요 → 착공 최소 60일 전 신청",
      "배출시설별 최적방지기술(BAT) 적용 여부 검토 필요",
      "허가 조건에 따른 자동측정기(TMS) 설치 의무 확인",
      "배출허용기준 강화 추세 → 설계 단계부터 방지시설 용량 여유 확보",
      "시설 변경 또는 연료 변경 시 변경허가 별도 취득"
    ],
    requiredDocs: ["대기배출시설 설치허가 신청서", "배출시설 및 방지시설 명세서", "배치도 및 공정흐름도", "환경영향평가 협의내용 이행계획"],
    reviewPeriod: "신청 후 30~60일",
    penalty: "무허가 설치·가동 시 징역 5년 이하 또는 벌금 5,000만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "소결설비신설증설", "코크스설비신설증설"]
  },

  // 13. 수질배출시설 설치 신고·허가
  {
    id: 13,
    num: 13,
    category: "환경",
    categoryIcon: "fas fa-leaf",
    name: "수질배출시설 설치 신고·허가",
    desc: "고로 냉각수·슬래그 처리수·코크스 폐수 등 수질오염물질 배출시설 허가 또는 신고",
    icon: "fas fa-water",
    isNew2026: false,
    submitTiming: "설비 설치 전 허가 완료",
    submitTimingDays: { reference: "착공전", days: 45 },
    submitTo: "관할 지방환경청 또는 시·도지사",
    relatedLaw: "물환경보전법 제33조, 동법 시행규칙 제33조",
    targetCondition: "고로 냉각 시스템, 슬래그 급냉 시설, 코크스 냉각수, 가스 세정수 발생 시설",
    cautionPoints: [
      "1종~4종 시설 구분에 따라 허가 또는 신고로 구분",
      "슬래그 급냉 시 발생 증기 및 폐수 처리 방안 사전 협의",
      "폐수처리시설 용량 산정: 최대 폐수 발생량 기준으로 여유율 120% 이상",
      "방류수 수질기준 초과 시 조업정지 가능",
      "폐수 무단방류 시 징역 5년 이하 또는 벌금 5,000만 원 이하"
    ],
    requiredDocs: ["수질배출시설 허가(신고)서", "배출시설 및 방지시설 명세서", "폐수처리계획서"],
    reviewPeriod: "허가 30~60일, 신고 즉시",
    penalty: "무허가·무신고 가동 시 징역 5년 이하 또는 벌금 5,000만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "소결설비신설증설", "코크스설비신설증설"]
  },

  // 14. 폐기물 처리계획 및 처리업체 계약
  {
    id: 14,
    num: 14,
    category: "환경",
    categoryIcon: "fas fa-leaf",
    name: "폐기물(산업폐기물) 처리계획",
    desc: "슬래그·코크스 분진·석면·폐내화물 등 산업폐기물 처리계획 수립 및 허가 업체 계약",
    icon: "fas fa-recycle",
    isNew2026: false,
    submitTiming: "착공 전 처리계획 수립, 폐기물 발생 즉시 허가 업체 위탁",
    submitTimingDays: { reference: "착공전", days: 14 },
    submitTo: "관할 시·군·구청 환경과 (신고), 허가 처리업체 계약 사본 보관",
    relatedLaw: "폐기물관리법 제18조, 건설폐기물의 재활용촉진에 관한 법률 제13조",
    targetCondition: "고로 해체 내화물(내화벽돌), 코크스 분진, 슬래그(재활용 가능), 폐오일·폐세정액, 석면 함유 단열재",
    cautionPoints: [
      "석면 함유 자재 해체 시 석면해체·제거업자 별도 허가 필요 (석면안전관리법)",
      "슬래그는 재활용 인증(KS 등) 취득 시 부산물로 처리 가능",
      "폐기물 분리배출 의무 이행 (혼합폐기물 배출 과태료 대상)",
      "처리 완료 후 인계·인수서(폐기물 관리법 시행규칙 별지 4호 서식) 보관",
      "지정폐기물(폐오일·폐산·폐알칼리) 별도 관리대장 작성"
    ],
    requiredDocs: ["폐기물 처리계획서", "폐기물 처리업체 허가증 사본", "폐기물 인계인수서"],
    reviewPeriod: "계획 수립 후 즉시 시행",
    penalty: "불법투기 시 7년 이하 징역 또는 1억 원 이하 벌금",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "열풍로신설보수", "소결설비신설증설", "코크스설비신설증설"]
  },

  // 15. ★ 환경영향평가 협의 이행 (2026 개정)
  {
    id: 15,
    num: 15,
    category: "환경",
    categoryIcon: "fas fa-leaf",
    name: "환경영향평가 협의내용 이행",
    desc: "전략환경영향평가 또는 환경영향평가 협의 완료 후 협의내용 이행계획 수립 및 현장 적용",
    icon: "fas fa-file-contract",
    isNew2026: true,
    updateReason: "2026년 환경영향평가법 시행령 개정 - 심층평가/신속평가 구분 도입",
    submitTiming: "착공 전 이행계획 제출, 공사 중 분기별 이행실적 보고",
    submitTimingDays: { reference: "착공전", days: 30 },
    submitTo: "관할 지방환경청 (이행실적 보고)",
    relatedLaw: "환경영향평가법 제35조~제44조",
    targetCondition: "환경영향평가 협의대상 사업(3만㎡ 이상 또는 법정 대상 사업). 제철소 신설·증설은 대부분 해당.",
    cautionPoints: [
      "협의 내용 이행확인서를 준공 후 관할 환경청에 제출 의무",
      "협의 내용 위반 시 공사중지 명령 및 원상복구 명령 가능",
      "소음·진동·비산먼지 저감 조치는 협의내용에 따라 이행",
      "야생동물(조류 등) 이주 계획 포함 시 이행 시기 준수",
      "공사 중 협의내용 변경 시 변경협의 선행"
    ],
    requiredDocs: ["환경영향평가 협의내용 이행계획서", "분기별 이행실적 보고서", "협의내용 이행확인서"],
    reviewPeriod: "이행계획 수립 후 착공, 분기 보고",
    penalty: "협의내용 미이행 시 과태료 또는 공사중지 명령",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "소결설비신설증설", "코크스설비신설증설", "원료처리설비증설"]
  },

  // 16. 비산먼지·소음진동 신고
  {
    id: 16,
    num: 16,
    category: "환경",
    categoryIcon: "fas fa-leaf",
    name: "비산먼지 발생사업 신고 및 특정공사 신고",
    desc: "1,000㎡ 이상 공사 비산먼지 신고, 소음·진동 특정공사 사전신고 의무",
    icon: "fas fa-wind",
    isNew2026: false,
    submitTiming: "비산먼지: 착공 전 신고 / 특정공사: 착공 3일 전까지",
    submitTimingDays: { reference: "착공전", days: 3 },
    submitTo: "관할 시·군·구청 환경과",
    relatedLaw: "대기환경보전법 제43조, 소음·진동관리법 제22조",
    targetCondition: "1,000㎡ 이상 공사현장, 항타기·착암기 등 5개 이상 기계 사용 공사",
    cautionPoints: [
      "방진막·세륜시설·살수시설 설치 후 착공",
      "비산먼지 억제시설 미설치 시 과태료 200만 원 이하",
      "야간 공사(22시~06시) 소음 기준 초과 시 작업중지 명령 가능",
      "제철소 인근 주거지역 있는 경우 주민 민원 대비 협의체 구성 권장",
      "신고 내용 변경(기계 추가, 공사기간 연장) 시 변경신고 의무"
    ],
    requiredDocs: ["비산먼지 발생사업 신고서", "특정공사 사전신고서", "억제시설 설치 계획"],
    reviewPeriod: "신고 즉시",
    penalty: "미신고 시 과태료 100~200만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "소결설비신설증설", "코크스설비신설증설", "원료처리설비증설", "기타부대설비"]
  },

  /* =========================================================
     카테고리 3: 화학·가스 분야 (항목 17~20)
     ========================================================= */

  // 17. ★ 유해화학물질 취급시설 허가 (2026 개정)
  {
    id: 17,
    num: 17,
    category: "화학·가스",
    categoryIcon: "fas fa-flask",
    name: "유해화학물질 취급시설 허가",
    desc: "벤젠·황산·코크스오븐가스(COG) 등 유해화학물질 취급시설 설치 전 환경부 허가",
    icon: "fas fa-biohazard",
    isNew2026: true,
    updateReason: "2026년 화학물질관리법 시행규칙 개정 - 장외영향평가 안전거리 의무 확대",
    submitTiming: "취급시설 설치 착공 30일 전까지 허가 완료",
    submitTimingDays: { reference: "착공전", days: 30 },
    submitTo: "관할 지방환경청 (환경부 위임)",
    relatedLaw: "화학물질관리법 제26조·제27조, 화학물질 관리법 시행규칙(2026년 개정)",
    targetCondition: "코크스오븐가스(COG) 정제 설비(벤젠·타르·암모니아 등 회수 공정), 황산 피클링 설비, 유해화학물질 저장탱크",
    cautionPoints: [
      "2026년 개정: 허가기준 강화 – 장외영향평가 결과에 따른 안전거리 의무 확대",
      "유해화학물질 취급 담당자 전문교육 16시간 이수 후 취급 가능",
      "연간 취급량 변경(±10% 초과) 시 변경허가 필요",
      "화학사고 대비 위기대응 매뉴얼 작성 및 훈련(연 1회) 의무",
      "지역사회 알 권리 제도: 인근 주민에게 취급 화학물질 정보 공개"
    ],
    requiredDocs: ["유해화학물질 취급업 허가신청서", "장외영향평가서", "취급시설 도면 및 명세서", "위기대응 매뉴얼"],
    reviewPeriod: "허가 처리기간 30~60일",
    penalty: "무허가 취급 시 징역 5년 이하 또는 벌금 1억 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "코크스설비신설증설", "가스정제설비교체증설"]
  },

  // 18. ★ 공정안전보고서(PSM) 제출 (2026 개정)
  {
    id: 18,
    num: 18,
    category: "화학·가스",
    categoryIcon: "fas fa-flask",
    name: "공정안전보고서(PSM) 제출",
    desc: "인화성·폭발성·독성 물질을 규정량 이상 취급 시 PSM 작성·제출 의무, 2026년 제출 주기 개정",
    icon: "fas fa-file-waveform",
    isNew2026: true,
    updateReason: "2026년 PSM 심사·확인 고시 개정 - 정기 재검토 주기 강화, 협력업체 작업허가제 의무화",
    submitTiming: "해당 공정 가동 전 90일까지 제출 및 심사 완료",
    submitTimingDays: { reference: "가동전", days: 90 },
    submitTo: "관할 고용노동지청 (한국산업안전보건공단 심사)",
    relatedLaw: "산업안전보건법 제44조, 동법 시행규칙 제50조, 공정안전보고서 심사·확인에 관한 고시(2026년 개정)",
    targetCondition: "COG·BFG·LDG 취급 규정량 이상 사업장, 코크스 제조 공정, 암모니아·황산 등 독성물질 규정량 이상 보유",
    cautionPoints: [
      "2026년 개정: PSM 제출 주기 단축 – 4년마다 → 정기 재검토 주기 강화",
      "PSM 12대 요소 전체 작성: 공정위험성평가(PHR/HAZOP), 비상조치계획, 운전절차서 등",
      "HAZOP 실시 후 권고사항 이행계획 및 이행기한 설정 의무",
      "PSM 심사 불합격 시 공정 가동 불가 → 심사 기간 여유 확보 필수",
      "PSM 사업장 고용노동부 수시 확인심사 대상 (연 1~4회)",
      "협력업체 작업 시 PSM 작업허가제도 적용 의무"
    ],
    requiredDocs: ["공정안전보고서(12대 요소 전체)", "HAZOP 결과보고서", "비상조치계획서", "운전절차서", "설비·배관 도면(P&ID)"],
    reviewPeriod: "제출 후 30~90일 (심사 일정에 따라 상이)",
    penalty: "미제출 또는 허위제출 시 과태료 3,000만 원 이하, 가동 중지 명령 가능",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "코크스설비신설증설", "가스정제설비교체증설", "부생가스배관설치교체"]
  },

  // 19. 고압가스 저장·사용 시설 허가
  {
    id: 19,
    num: 19,
    category: "화학·가스",
    categoryIcon: "fas fa-flask",
    name: "고압가스 저장·사용 시설 허가",
    desc: "산소·질소·수소·아세틸렌 등 압축가스 저장·사용 시설 한국가스안전공사 허가 또는 신고",
    icon: "fas fa-gas-pump",
    isNew2026: false,
    submitTiming: "저장·사용 시설 설치 전 허가 또는 신고 완료",
    submitTimingDays: { reference: "착공전", days: 30 },
    submitTo: "한국가스안전공사(KGS), 관할 시·군·구청",
    relatedLaw: "고압가스 안전관리법 제4조·제5조, 동법 시행규칙",
    targetCondition: "산소(O₂) 저장탱크, 질소(N₂) 공급 시스템, 고압수소(H₂) 라인, 아세틸렌 발생기, 부생가스 가스홀더",
    cautionPoints: [
      "저장 용량 100kg 이상 시 허가 대상 (미만 신고)",
      "고압가스 운반 차량 이동 허가 별도 취득 필요",
      "가스시설 완성검사(KGS) 합격 후 가스 충전·사용 가능",
      "정기검사: 용기 2~5년, 저장탱크 5년 주기",
      "가스 누출 감지기 설치 및 월 1회 이상 점검 의무"
    ],
    requiredDocs: ["고압가스 저장·사용 허가신청서", "시설 도면", "완성검사 신청서", "가스안전관리자 선임신고서"],
    reviewPeriod: "신청 후 15~30일",
    penalty: "무허가 저장·사용 시 징역 3년 이하 또는 벌금 3,000만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "코크스설비신설증설", "가스정제설비교체증설", "부생가스배관설치교체"]
  },

  // 20. 도시가스·특정가스 사용 신고
  {
    id: 20,
    num: 20,
    category: "화학·가스",
    categoryIcon: "fas fa-flask",
    name: "특수고압가스 사용 신고",
    desc: "실란·포스핀·아르신 등 특수고압가스 및 독성가스 사용 전 시·도지사 신고",
    icon: "fas fa-vials",
    isNew2026: false,
    submitTiming: "사용 개시 전 신고 완료",
    submitTimingDays: { reference: "착공전", days: 14 },
    submitTo: "관할 시·도지사 (가스 종류에 따라 KGS 신고)",
    relatedLaw: "고압가스 안전관리법 제20조, 동법 시행규칙 제36조",
    targetCondition: "코크스로 부산물(암모니아·황화수소·벤젠) 정제 공정, 가스분석용 표준가스, 소결로 배가스 처리 공정",
    cautionPoints: [
      "독성가스(암모니아·황화수소) 사용 시 방독마스크·긴급세정설비 필수",
      "독성가스 배관 설계 시 이중 차단밸브 및 역화방지장치 설치",
      "특수고압가스 취급 근로자 안전교육(8시간) 이수 필수",
      "사고 발생 시 관할 소방서·가스안전공사 즉시 신고"
    ],
    requiredDocs: ["특수고압가스 사용신고서", "시설 안전관리 계획서", "가스 취급 교육 수료증"],
    reviewPeriod: "신고 후 즉시",
    penalty: "미신고 시 과태료 300만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["코크스설비신설증설", "가스정제설비교체증설"]
  },

  /* =========================================================
     카테고리 4: 에너지·전기·소방 분야 (항목 21~25)
     ========================================================= */

  // 21. 전기설비 공사계획 신고
  {
    id: 21,
    num: 21,
    category: "에너지·전기·소방",
    categoryIcon: "fas fa-bolt",
    name: "전기설비 공사계획 신고",
    desc: "전기사업법상 자가용 전기설비(수전 용량 1,000kW 이상) 설치 시 공사계획 신고 의무",
    icon: "fas fa-plug",
    isNew2026: false,
    submitTiming: "공사 착공 전 한국전력공사 또는 산업부 신고",
    submitTimingDays: { reference: "착공전", days: 30 },
    submitTo: "한국전력공사 또는 산업통상자원부 (시설 규모에 따라 구분)",
    relatedLaw: "전기사업법 제63조, 동법 시행규칙 제42조",
    targetCondition: "고로·소결·코크스 공장 자가용 변전소(수전 1,000kW 이상), 대용량 전기로, 플랜트 전력설비",
    cautionPoints: [
      "전기공사업자 면허 보유 업체에 공사 의뢰 의무",
      "준공 후 사용전검사(한국전기안전공사) 합격 후 사용 가능",
      "특고압(22.9kV 이상) 수전 설비는 공사계획 신고 후 착공",
      "전기안전관리자 선임 후 가동 (전기설비기술기준 적합 유지)",
      "접지저항 측정 및 절연내력시험 결과 보관 (3년)"
    ],
    requiredDocs: ["전기설비 공사계획 신고서", "단선결선도(단선도)", "배치도", "전기기술자 감리 계획서"],
    reviewPeriod: "신고 후 7일 이내 수리 여부 통보",
    penalty: "미신고 착공 시 과태료 300만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "소결설비신설증설", "코크스설비신설증설", "원료처리설비증설"]
  },

  // 22. 에너지 사용계획 협의 (KEPCO)
  {
    id: 22,
    num: 22,
    category: "에너지·전기·소방",
    categoryIcon: "fas fa-bolt",
    name: "에너지 사용계획 협의",
    desc: "연간 에너지 사용량 2,000TOE 이상 신규 시설 에너지 사용계획 산업부 협의 의무",
    icon: "fas fa-solar-panel",
    isNew2026: false,
    submitTiming: "사업 계획 수립 단계 또는 착공 전",
    submitTimingDays: { reference: "착공전", days: 60 },
    submitTo: "산업통상자원부 (한국에너지공단 위탁)",
    relatedLaw: "에너지이용 합리화법 제10조, 동법 시행령 제9조",
    targetCondition: "고로 신설(연간 에너지 사용량 수만 TOE 규모), 대형 소결·코크스 설비 신증설",
    cautionPoints: [
      "에너지 사용계획 협의 완료 후 착공 가능",
      "협의 결과에 따른 에너지 절감 조치 계획 이행",
      "에너지진단 의무 대상(2,000TOE 이상) 확인",
      "에너지 다소비 사업장 지정 시 에너지 절약형 설계 요구 가능",
      "온실가스·에너지 목표관리제 대상 여부 별도 검토"
    ],
    requiredDocs: ["에너지 사용계획서", "설비 에너지 사용량 예측 계산서", "에너지 절감 계획"],
    reviewPeriod: "협의 신청 후 30~60일",
    penalty: "미협의 착공 시 과태료 500만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "소결설비신설증설", "코크스설비신설증설"]
  },

  // 23. 소방시설 착공 신고
  {
    id: 23,
    num: 23,
    category: "에너지·전기·소방",
    categoryIcon: "fas fa-bolt",
    name: "소방시설 착공 신고 및 완공 검사",
    desc: "스프링클러·자동화재탐지설비 등 소방시설 설치 공사 착공 신고 및 준공 전 완공 검사 필수",
    icon: "fas fa-fire-extinguisher",
    isNew2026: false,
    submitTiming: "소방시설 착공 신고: 착공 전 / 완공검사: 준공 전",
    submitTimingDays: { reference: "착공전", days: 7 },
    submitTo: "관할 소방서",
    relatedLaw: "소방시설 설치 및 관리에 관한 법률 제12조, 제13조",
    targetCondition: "연면적 1,000㎡ 이상 또는 지하층·무창층·4층 이상 건축물, 특수가연물(코크스·황 등) 다량 보관 장소",
    cautionPoints: [
      "소방시설 설계는 소방기술사 또는 소방공사감리업 자격자 필수",
      "코크스·황 등 특수가연물 보관 창고는 강화된 소방기준 적용",
      "자동화재탐지설비·소화기·유도등·비상조명 설치 확인",
      "완공검사 불합격 시 재검사 신청 → 준공 일정 지연 주의",
      "소방시설 완공검사 합격 후 사용 개시"
    ],
    requiredDocs: ["소방시설 착공신고서", "소방시설 설계도서", "소방시설 완공검사 신청서"],
    reviewPeriod: "착공신고 즉시 수리, 완공검사 신청 후 7~14일",
    penalty: "미신고 또는 미검사 시 과태료 200만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "소결설비신설증설", "코크스설비신설증설", "원료처리설비증설", "기타부대설비"]
  },

  // 24. 위험물 저장·취급 허가
  {
    id: 24,
    num: 24,
    category: "에너지·전기·소방",
    categoryIcon: "fas fa-bolt",
    name: "위험물 저장·취급 시설 허가",
    desc: "윤활유·코크스오븐 타르·벙커유 등 위험물 일정량 이상 저장·취급 시 소방서 허가 필수",
    icon: "fas fa-drum",
    isNew2026: false,
    submitTiming: "저장·취급 시설 착공 전 허가 완료",
    submitTimingDays: { reference: "착공전", days: 30 },
    submitTo: "관할 소방서 (소방청 위임)",
    relatedLaw: "위험물 안전관리법 제6조, 동법 시행령 별표 1",
    targetCondition: "코크스오븐 타르(제4류 위험물), 벙커유·경유 저장탱크(규정량 이상), 분말 가연물(코크스 분진 규정량 이상)",
    cautionPoints: [
      "제4류 위험물(인화성 액체) 지정수량 초과 저장 시 허가 대상",
      "위험물안전관리자 선임 및 소방서 신고 후 운영 가능",
      "저장탱크 완공검사(소방서) 합격 후 사용 가능",
      "정기점검: 200L 이상 지하탱크 연 1회, 지상탱크 연 4회 이상",
      "위험물 취급 작업자 안전교육(8시간) 이수 필수"
    ],
    requiredDocs: ["위험물 저장·취급 허가신청서", "저장탱크 설계도면", "위험물안전관리자 선임신고서"],
    reviewPeriod: "허가 신청 후 15~30일",
    penalty: "무허가 저장·취급 시 3년 이하 징역 또는 3,000만 원 이하 벌금",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "코크스설비신설증설", "가스정제설비교체증설", "원료처리설비증설"]
  },

  // 25. 압력용기 및 보일러 검사
  {
    id: 25,
    num: 25,
    category: "에너지·전기·소방",
    categoryIcon: "fas fa-bolt",
    name: "압력용기·보일러 안전검사",
    desc: "고로 냉각 시스템, 코크스로 스팀 드럼, 소결 폐열회수 보일러 등 압력용기 안전검사 의무",
    icon: "fas fa-gauge-high",
    isNew2026: false,
    submitTiming: "설치 후 사용 전 초기검사, 이후 정기검사(1~2년 주기)",
    submitTimingDays: { reference: "가동전", days: 30 },
    submitTo: "한국산업안전보건공단 또는 지정 검사기관",
    relatedLaw: "산업안전보건법 제93조, 동법 시행규칙 제132조~제145조",
    targetCondition: "코크스로 열회수 보일러(CDCP), 소결 폐열회수 보일러, 고로 냉각탑 압력계통, 스팀 배관·드럼",
    cautionPoints: [
      "초기검사 불합격 시 사용 불가 → 개선 후 재검사 신청",
      "정기검사 만료 30일 전까지 재검사 신청",
      "압력용기 등록부 및 검사이력 10년 보관",
      "검사 합격증 해당 설비에 부착 의무",
      "검사 주기: 보일러 연 1회, 압력용기 2년 1회 (종류·사용조건에 따라 상이)"
    ],
    requiredDocs: ["안전검사 신청서", "압력용기 설계도면 및 제작명세서", "이전 검사 합격증"],
    reviewPeriod: "신청 후 15~30일",
    penalty: "미검사 사용 시 과태료 1,000만 원 이하",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "소결설비신설증설", "코크스설비신설증설"]
  },

  /* =========================================================
     카테고리 5: 건설행정·기타 분야 (항목 26~28)
     ========================================================= */

  // 26. 건축·공장 설립 허가(신고)
  {
    id: 26,
    num: 26,
    category: "건설행정·기타",
    categoryIcon: "fas fa-building",
    name: "건축허가 또는 공장설립 승인",
    desc: "건축면적 100㎡ 초과 시 건축허가, 제조업 공장 신설·증설 시 공장설립 승인 필수",
    icon: "fas fa-building-columns",
    isNew2026: false,
    submitTiming: "착공 전 허가·승인 완료 (허가 처리 기간 약 30~60일)",
    submitTimingDays: { reference: "착공전", days: 60 },
    submitTo: "관할 시·군·구청 (건축과·도시계획과, 산업집적법 적용 시 지식경제부위임 기관)",
    relatedLaw: "건축법 제11조, 산업집적활성화 및 공장설립에 관한 법률 제13조",
    targetCondition: "고로 공장동·주상 건물·주조 설비동·원료 야드 옥내화 공사 등 건축행위. 제조업 공장(제선업) 신설 및 증설.",
    cautionPoints: [
      "산업단지 내 공장은 관리기관(산업단지공단) 협의 후 허가 신청",
      "용도지역(공업지역) 확인 필수 – 주거지역 인접 시 추가 규제",
      "환경영향평가·교통영향평가 협의 선행 후 건축허가 신청",
      "건축 착공 신고(허가 후 1년 이내) 및 사용승인 절차 이행",
      "증설 시 기존 허가된 건폐율·용적률 초과 여부 사전 검토"
    ],
    requiredDocs: ["건축허가신청서 또는 공장설립승인신청서", "건축설계도서 일체", "지적도·배치도", "환경·교통 협의 완료 서류"],
    reviewPeriod: "30~60일 (협의 기관 회신 포함)",
    penalty: "무허가 착공 시 징역 2년 이하 또는 벌금 1억 원 이하, 이행강제금 부과",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "소결설비신설증설", "코크스설비신설증설", "원료처리설비증설"]
  },

  // 27. 도로점용·굴착 허가
  {
    id: 27,
    num: 27,
    category: "건설행정·기타",
    categoryIcon: "fas fa-building",
    name: "도로 점용·굴착 허가",
    desc: "부생가스 배관·원료 이송 배관 매설을 위한 도로 굴착·점용 허가 취득",
    icon: "fas fa-road",
    isNew2026: false,
    submitTiming: "굴착 공사 착수 전 허가 완료 (처리 14~30일)",
    submitTimingDays: { reference: "착공전", days: 14 },
    submitTo: "관할 도로관리청 (시·도지사 또는 국토교통부, 구간별 상이)",
    relatedLaw: "도로법 제36조, 동법 제61조 (굴착공사), 지하안전관리에 관한 특별법 제14조",
    targetCondition: "BFG·COG·LDG 배관 도로 하부 매설, 원료 이송 컨베이어 교량 구조물 설치, 철도 하부 횡단 배관",
    cautionPoints: [
      "굴착 전 지하매설물(전기·통신·가스·수도) 위치 확인 의무 (굴착공사 정보시스템 조회)",
      "도로점용 기간 초과 시 연장 허가 필요 (변경허가)",
      "원상복구 계획서 제출 및 복구 후 도로관리청 확인",
      "지하 2m 이상 굴착 시 지하안전영향평가 또는 소규모 영향평가 필요",
      "철도 하부 횡단 시 한국철도공사 또는 시설공단 별도 협의"
    ],
    requiredDocs: ["도로점용허가 신청서", "굴착 공사 설계도서", "지하매설물 조회 확인서", "원상복구 계획서"],
    reviewPeriod: "신청 후 14~30일",
    penalty: "무허가 굴착 시 과태료 또는 원상복구 명령",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "부생가스배관설치교체", "원료처리설비증설", "고로개수"]
  },

   // 28. 사전재해영향성 검토 및 토지형질변경 허가
  {
    id: 28,
    num: 28,
    category: "건설행정·기타",
    categoryIcon: "fas fa-building",
    name: "사전재해영향성 검토 및 토지형질변경 허가",
    desc: "재해취약지역 또는 일정 규모 이상 부지 조성 시 재해영향 사전 검토 및 형질변경 허가",
    icon: "fas fa-mountain",
    isNew2026: false,
    submitTiming: "개발행위 허가 신청 전 검토 완료",
    submitTimingDays: { reference: "착공전", days: 60 },
    submitTo: "관할 시·군·구청 (재해영향검토: 행정안전부 위임), 토지형질변경: 도시계획과",
    relatedLaw: "자연재해대책법 제4조(사전재해영향성 검토), 국토의 계획 및 이용에 관한 법률 제56조(개발행위 허가)",
    targetCondition: "원료 야드 부지 조성(5,000㎡ 이상 토지 형질 변경), 슬래그 처리장 신설, 항만·야적장 개발",
    cautionPoints: [
      "5,000㎡ 이상 부지 조성 시 사전재해영향성 검토 대상",
      "검토 결과에 따른 저류조·배수 시설 설치 의무",
      "산지 포함 시 산지전용 허가 병행 취득 필요",
      "토지형질변경 허가 취득 후 건축허가·공장설립 승인 신청 가능",
      "개발행위 허가 기간(2년) 내 준공 불가 시 기간 연장 허가 필요"
    ],
    requiredDocs: ["사전재해영향성 검토 신청서", "토지이용계획 및 배수계획도", "개발행위 허가신청서", "토지 등기부등본"],
    reviewPeriod: "검토 신청 후 30~60일",
    penalty: "무허가 형질변경 시 과태료 또는 원상복구 명령, 개발이익 환수",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "소결설비신설증설", "원료처리설비증설"]
  },

  /* =========================================================
     ★ 2026 신규 항목 (29번): 안전보건 현황 공시
     ========================================================= */

  // 29. ★ 안전보건 현황 공시 (2026 신규)
  {
    id: 29,
    num: 29,
    category: "산업안전보건",
    categoryIcon: "fas fa-hard-hat",
    name: "안전보건 현황 공시 (대기업·공공기관)",
    desc: "2026년 신규 시행: 상시근로자 500인 이상 기업·공공기관 안전보건 현황 의무 공시 제도",
    icon: "fas fa-bullhorn",
    isNew2026: true,
    updateReason: "2026.6.1 시행 (8.1 추가 시행) - 산업안전보건법 시행령 개정으로 신설된 제도",
    submitTiming: "매년 6월 30일까지 전년도 안전보건 현황 공시 (최초 공시: 2026.6.30)",
    submitTimingDays: { reference: "공시기한", days: 0 },
    submitTo: "고용노동부 지정 시스템 (산업안전보건공단 누리집 공시 게시판)",
    relatedLaw: "산업안전보건법 제175조의2(신설), 동법 시행령 개정안(2026.6.1 시행)",
    targetCondition: "상시근로자 500인 이상 기업, 공공기관 운영에 관한 법률에 따른 공기업·준정부기관. 제철산업의 경우 본사 및 사업장 합산 기준으로 대부분 해당.",
    cautionPoints: [
      "2026.6.1 1차 시행: 상시근로자 1,000인 이상 기업·공공기관 우선 적용",
      "2026.8.1 2차 시행: 상시근로자 500인 이상으로 적용 범위 확대",
      "공시 항목: 산업재해 발생 현황, 안전보건 투자 실적, 안전보건 관리체계 운영 현황",
      "최근 3년간 중대재해 발생 건수 및 재발방지 대책 이행 실적 포함",
      "협력업체(도급·용역) 안전관리 실적 포함 공시 의무",
      "허위 공시 또는 미공시 시 과태료 1,000만 원 이하 부과",
      "공시 자료는 5년간 보관, 매년 갱신 의무",
      "건설현장은 본사 단위 공시이나 현장 안전관리 실적이 평가에 반영됨"
    ],
    requiredDocs: [
      "전년도 산업재해 통계자료",
      "안전보건 투자 예산 집행 실적표",
      "안전보건 관리체계 운영 보고서",
      "중대재해 발생·조치 이력 문서",
      "협력업체 안전관리 평가 결과",
      "공시 자료 검증 확인서 (CEO 서명)"
    ],
    reviewPeriod: "공시 후 고용노동부 사후 검증 (수시)",
    penalty: "미공시·허위공시 시 과태료 1,000만 원 이하, 중대재해 은폐 연계 시 형사처벌",
    lastUpdated: "2026-06-24",
    recommendedFor: ["고로신설", "고로개수", "열풍로신설보수", "소결설비신설증설", "코크스설비신설증설", "가스정제설비교체증설", "부생가스배관설치교체", "원료처리설비증설", "기타부대설비"]
  }
  // ↑ 항목 29번 끝 (제선·고로 29개 항목 완성, 2026 신규 항목 포함)
];

// ---- 알림 데이터는 notification.js에서 관리 ----
// (savedNotifications 및 saveNotificationsToStorage는 notification.js에서 정의)
