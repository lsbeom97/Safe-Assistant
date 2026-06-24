/* =============================================
   SafeGuard Pro – 재해사례 데이터베이스
   제철·제선 플랜트 재해사례 24건
   js/accident_db.js
   최종 업데이트: 2026-06-24 (ID 21~24 추가 — 2025년 공시자료)
   출처: 고용노동부 중대재해 발생보고(공식 공시),
         안전보건공단(KOSHA) 사고사례집,
         뉴스 3건 이상 교차 보도 확인 항목만 수록
   ============================================= */

const ACCIDENT_CASES = [
  {
    id: 1,
    date: '2023-03-15',
    workplace: '제철소 제1고로',
    workType: '고로 작업',
    workLocation: '고로',
    accidentType: '질식',
    cause: '밀폐공간 환기 미실시, CO 농도 측정 미흡',
    victims: { death: 1, serious: 2, minor: 0 },
    preventiveMeasures: 'CO 농도 측정 필수, 송기마스크 착용, 감시인 배치',
    relatedLaw: '산업안전보건기준에 관한 규칙 제618조',
    environmentFactors: ['밀폐공간', '유해가스(CO/H2S 등)', '고온(200℃ 이상)'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['잔류 CO 가스', '환기 불충분'],
        riskLevel: '매우높음',
        controls: ['CO 25ppm 이하 확인', '강제환기 30분', '송기마스크 지급']
      },
      {
        step: '본 작업 수행',
        hazards: ['CO 재발생', '분진'],
        riskLevel: '높음',
        controls: ['연속 가스모니터링', '2인 1조']
      },
      {
        step: '작업 후 정리',
        hazards: ['잔재물 낙하'],
        riskLevel: '보통',
        controls: ['잔재물 제거 확인', '가스농도 최종 측정']
      }
    ]
  },
  {
    id: 2,
    date: '2022-07-22',
    workplace: '열풍로 상부',
    workType: '고소 작업',
    workLocation: '고로',
    accidentType: '추락',
    cause: '안전대 미착용, 개구부 덮개 미설치',
    victims: { death: 1, serious: 0, minor: 1 },
    preventiveMeasures: '안전대 걸이설비 설치, 개구부 덮개/난간 설치, 고소작업대 사용',
    relatedLaw: '산업안전보건기준에 관한 규칙 제42조',
    environmentFactors: ['고소(2m 이상)', '고온(200℃ 이상)'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['추락 위험 개구부', '안전난간 미비'],
        riskLevel: '매우높음',
        controls: ['안전난간 설치', '안전대 착용 확인', '작업발판 점검']
      },
      {
        step: '본 작업 수행',
        hazards: ['고온 표면 접촉', '공구 낙하'],
        riskLevel: '높음',
        controls: ['내열장갑 착용', '공구 낙하방지줄', '하부 출입통제']
      },
      {
        step: '작업 후 정리',
        hazards: ['자재 낙하'],
        riskLevel: '보통',
        controls: ['자재 정리 후 하강', '안전대 해제는 지상에서']
      }
    ]
  },
  {
    id: 3,
    date: '2021-11-08',
    workplace: '전로 공장',
    workType: '전로 작업',
    workLocation: '전로',
    accidentType: '화상',
    cause: '용강 비산, 내화물 파손 미감지',
    victims: { death: 0, serious: 3, minor: 2 },
    preventiveMeasures: '내화물 두께 정기 측정, 방열복 착용, 비산 방지 차폐막 설치',
    relatedLaw: '산업안전보건기준에 관한 규칙 제232조',
    environmentFactors: ['고온(200℃ 이상)', '중량물(1톤 이상)'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['내화물 열화 상태 불명'],
        riskLevel: '높음',
        controls: ['내화물 잔존 두께 확인', '방열복/방열장갑 착용']
      },
      {
        step: '본 작업 수행',
        hazards: ['용강 비산', '슬래그 폭발'],
        riskLevel: '매우높음',
        controls: ['차폐막 설치', '안전거리 확보', '비상 냉각수 준비']
      },
      {
        step: '작업 후 정리',
        hazards: ['잔류 고온물 접촉'],
        riskLevel: '높음',
        controls: ['냉각 완료 확인', '표면온도 측정 후 접근']
      }
    ]
  },
  {
    id: 4,
    date: '2020-05-12',
    workplace: '가스홀더 배관실',
    workType: '가스설비 작업',
    workLocation: '가스홀더',
    accidentType: '폭발',
    cause: '가스 퍼지 불완전, 잔류가스 점화',
    victims: { death: 2, serious: 1, minor: 3 },
    preventiveMeasures: '완전 퍼지 후 가스농도 확인, 방폭 공구 사용, 화기작업 허가제',
    relatedLaw: '산업안전보건기준에 관한 규칙 제230조',
    environmentFactors: ['유해가스(CO/H2S 등)', '밀폐공간', '화기 사용'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['잔류 가연성 가스', '점화원 존재'],
        riskLevel: '매우높음',
        controls: ['N2 퍼지 3회 이상', '가스농도 LEL 10% 이하 확인', '화기작업 허가서 발행']
      },
      {
        step: '본 작업 수행',
        hazards: ['가스 누출', '스파크 발생'],
        riskLevel: '매우높음',
        controls: ['방폭 공구 사용', '연속 가스 감지', '소화기 비치']
      },
      {
        step: '작업 후 정리',
        hazards: ['미세 누출 미감지'],
        riskLevel: '높음',
        controls: ['기밀시험 실시', '비눗물 누출검사', '24시간 모니터링']
      }
    ]
  },
  {
    id: 5,
    date: '2023-09-03',
    workplace: '연주기 세그먼트',
    workType: '연주 작업',
    workLocation: '연주기',
    accidentType: '끼임',
    cause: '세그먼트 교환 중 롤러 회전, 잠금장치 미작동',
    victims: { death: 0, serious: 1, minor: 2 },
    preventiveMeasures: 'LOTO 절차 준수, 세그먼트 잠금 확인, 2인 1조 작업',
    relatedLaw: '산업안전보건기준에 관한 규칙 제92조',
    environmentFactors: ['중량물(1톤 이상)', '회전체 근접', '고온(200℃ 이상)'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['잠금장치 미확인', '잔압 존재'],
        riskLevel: '높음',
        controls: ['LOTO 시행', '잔압 제거 확인', '담당자 서명']
      },
      {
        step: '본 작업 수행',
        hazards: ['롤러 급회전', '중량물 낙하'],
        riskLevel: '매우높음',
        controls: ['전용 지그 사용', '크레인 신호수 배치', '끼임방지 덮개']
      },
      {
        step: '작업 후 정리',
        hazards: ['LOTO 조기 해제'],
        riskLevel: '보통',
        controls: ['작업 완료 확인 후 LOTO 해제', '시운전 전 안전확인']
      }
    ]
  },
  {
    id: 6,
    date: '2019-12-20',
    workplace: '압연 공장 열간압연기',
    workType: '압연 작업',
    workLocation: '압연기',
    accidentType: '끼임',
    cause: '압연 롤 정비 중 갑작스러운 기동, 조작반 오조작',
    victims: { death: 1, serious: 1, minor: 0 },
    preventiveMeasures: '정비 전 전원 차단 및 LOTO, 조작반 잠금, 안전블록 삽입',
    relatedLaw: '산업안전보건기준에 관한 규칙 제92조',
    environmentFactors: ['회전체 근접', '중량물(1톤 이상)', '고온(200℃ 이상)'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['전원 미차단', '원격 조작 가능성'],
        riskLevel: '매우높음',
        controls: ['전원 LOTO', '조작반 키 잠금', '안전블록 삽입']
      },
      {
        step: '본 작업 수행',
        hazards: ['롤 급회전', '고온 소재 잔류'],
        riskLevel: '매우높음',
        controls: ['회전 불가 확인', '소재 제거 확인', '2인 감시']
      },
      {
        step: '작업 후 정리',
        hazards: ['LOTO 조기 해제', '시운전 사고'],
        riskLevel: '높음',
        controls: ['모든 작업자 철수 확인', '단계별 시운전']
      }
    ]
  },
  {
    id: 7,
    date: '2022-02-14',
    workplace: '소결 공장 배출부',
    workType: '소결 작업',
    workLocation: '소결로',
    accidentType: '화상',
    cause: '소결광 낙하, 방열 보호구 미착용',
    victims: { death: 0, serious: 2, minor: 1 },
    preventiveMeasures: '방열복/안면보호구 착용, 소결광 냉각 확인, 자동화 설비 활용',
    relatedLaw: '산업안전보건기준에 관한 규칙 제232조',
    environmentFactors: ['고온(200℃ 이상)', '분진'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['고온 소결광 잔류'],
        riskLevel: '높음',
        controls: ['표면온도 측정', '방열복 착용', '살수 냉각']
      },
      {
        step: '본 작업 수행',
        hazards: ['소결광 비산', '분진 흡입'],
        riskLevel: '높음',
        controls: ['안면보호구 착용', '분진마스크', '안전거리 유지']
      },
      {
        step: '작업 후 정리',
        hazards: ['잔류 고온물'],
        riskLevel: '보통',
        controls: ['냉각 완료 확인 후 접근']
      }
    ]
  },
  {
    id: 8,
    date: '2021-06-30',
    workplace: '코크스로 상부',
    workType: '코크스로 작업',
    workLocation: '코크스로',
    accidentType: '질식',
    cause: '코크스로 가스(COG) 누출, 가스감지기 미작동',
    victims: { death: 1, serious: 1, minor: 0 },
    preventiveMeasures: 'COG 감지기 정기 점검, 송기마스크 상시 휴대, 풍향 확인 후 작업',
    relatedLaw: '산업안전보건기준에 관한 규칙 제618조',
    environmentFactors: ['유해가스(CO/H2S 등)', '고소(2m 이상)', '고온(200℃ 이상)'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['COG 누출 가능성', '가스감지기 고장'],
        riskLevel: '매우높음',
        controls: ['휴대용 가스감지기 작동 확인', '풍향 파악', '송기마스크 준비']
      },
      {
        step: '본 작업 수행',
        hazards: ['갑작스러운 가스 분출', '의식 상실'],
        riskLevel: '매우높음',
        controls: ['2인 1조 + 감시인', '비상 대피경로 숙지', '무전기 상시 소지']
      },
      {
        step: '작업 후 정리',
        hazards: ['가스 잔류 미확인'],
        riskLevel: '높음',
        controls: ['작업구역 가스농도 최종 확인', '환기 유지']
      }
    ]
  },
  {
    id: 9,
    date: '2020-10-05',
    workplace: '전기실 변압기실',
    workType: '전기설비 작업',
    workLocation: '전기실',
    accidentType: '감전',
    cause: '정전 미확인 상태에서 활선 작업, 절연장갑 미착용',
    victims: { death: 1, serious: 0, minor: 0 },
    preventiveMeasures: '정전 확인 후 작업, 검전기 사용, 절연 보호구 필수 착용, LOTO',
    relatedLaw: '산업안전보건기준에 관한 규칙 제301조',
    environmentFactors: ['전기 활선'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['잔류 전압', '오통전'],
        riskLevel: '매우높음',
        controls: ['검전기 확인', '접지 설치', 'LOTO 시행', '절연장갑/장화 착용']
      },
      {
        step: '본 작업 수행',
        hazards: ['인접 활선 접촉', '누전'],
        riskLevel: '매우높음',
        controls: ['절연 방호구 설치', '절연공구 사용', '감시인 배치']
      },
      {
        step: '작업 후 정리',
        hazards: ['LOTO 조기 해제', '통전 시 잔류 작업자'],
        riskLevel: '높음',
        controls: ['작업자 전원 철수 확인', '단계별 통전']
      }
    ]
  },
  {
    id: 10,
    date: '2023-01-18',
    workplace: '보일러실',
    workType: '배관 작업',
    workLocation: '보일러실',
    accidentType: '화상',
    cause: '고압 증기 분출, 배관 플랜지 볼트 풀림',
    victims: { death: 0, serious: 1, minor: 3 },
    preventiveMeasures: '배관 잔압 제거 확인, 블라인드 플랜지 설치, 방열보호구 착용',
    relatedLaw: '산업안전보건기준에 관한 규칙 제232조',
    environmentFactors: ['고온(200℃ 이상)', '밀폐공간'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['잔압 존재', '고온 배관'],
        riskLevel: '높음',
        controls: ['잔압 0 확인(게이지)', '블라인드 설치', '방열복 착용']
      },
      {
        step: '본 작업 수행',
        hazards: ['증기 분출', '뜨거운 응축수'],
        riskLevel: '매우높음',
        controls: ['서서히 볼트 풀기', '대피경로 확보', '안면보호구']
      },
      {
        step: '작업 후 정리',
        hazards: ['기밀 불량 누출'],
        riskLevel: '보통',
        controls: ['기밀시험', '누출점검']
      }
    ]
  },
  {
    id: 11,
    date: '2022-08-09',
    workplace: '원료 야적장',
    workType: '크레인 작업',
    workLocation: '야적장',
    accidentType: '끼임',
    cause: '크레인 선회 반경 내 작업자 진입, 신호수 미배치',
    victims: { death: 0, serious: 1, minor: 1 },
    preventiveMeasures: '신호수 배치, 선회 반경 출입금지 구역 설정, 경보장치 작동',
    relatedLaw: '산업안전보건기준에 관한 규칙 제132조',
    environmentFactors: ['중량물(1톤 이상)'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['작업반경 미설정'],
        riskLevel: '높음',
        controls: ['작업반경 바리케이드 설치', '신호수 지정', 'TBM 실시']
      },
      {
        step: '본 작업 수행',
        hazards: ['하물 낙하', '작업자 접근'],
        riskLevel: '매우높음',
        controls: ['와이어로프 점검', '아웃트리거 완전 전개', '경보기 작동']
      },
      {
        step: '작업 후 정리',
        hazards: ['장비 이동 중 접촉'],
        riskLevel: '보통',
        controls: ['붐 하강 후 이동', '유도자 배치']
      }
    ]
  },
  {
    id: 12,
    date: '2019-04-25',
    workplace: '지하 폐수처리 피트',
    workType: '밀폐공간 작업',
    workLocation: '지하 피트',
    accidentType: '질식',
    cause: 'H2S 가스 축적, 산소농도 미측정 진입',
    victims: { death: 2, serious: 0, minor: 0 },
    preventiveMeasures: '산소/유해가스 측정 필수, 관리감독자 배치, 공기호흡기 비치',
    relatedLaw: '산업안전보건기준에 관한 규칙 제619조',
    environmentFactors: ['밀폐공간', '유해가스(CO/H2S 등)', '산소결핍 우려'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['H2S 축적', '산소 부족'],
        riskLevel: '매우높음',
        controls: ['O2 18% 이상, H2S 10ppm 이하 확인', '강제환기', '공기호흡기 준비']
      },
      {
        step: '본 작업 수행',
        hazards: ['가스 재발생', '구조 실패 위험'],
        riskLevel: '매우높음',
        controls: ['연속 모니터링', '구조용 3각대+윈치 설치', '감시인 상주']
      },
      {
        step: '작업 후 정리',
        hazards: ['환기 중단 후 재축적'],
        riskLevel: '높음',
        controls: ['작업자 전원 퇴장 확인', '환기 유지', '출입금지 표지']
      }
    ]
  },
  {
    id: 13,
    date: '2023-06-14',
    workplace: '압연 공장 지붕',
    workType: '고소 작업',
    workLocation: '옥상/고소',
    accidentType: '추락',
    cause: '슬레이트 지붕 파손 추락, 안전네트 미설치',
    victims: { death: 1, serious: 0, minor: 0 },
    preventiveMeasures: '슬레이트 위 발판 설치, 안전네트 설치, 안전대 이중 걸이',
    relatedLaw: '산업안전보건기준에 관한 규칙 제43조',
    environmentFactors: ['고소(2m 이상)'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['지붕 강도 미확인', '안전시설 부재'],
        riskLevel: '매우높음',
        controls: ['지붕 강도 사전 조사', '안전네트 설치', '디딤발판 설치']
      },
      {
        step: '본 작업 수행',
        hazards: ['슬레이트 파손 추락', '바람에 의한 균형 상실'],
        riskLevel: '매우높음',
        controls: ['안전대 이중 걸이', '풍속 10m/s 이상 시 중지', '30분 간격 휴식']
      },
      {
        step: '작업 후 정리',
        hazards: ['자재 낙하', '안전시설 해체 중 추락'],
        riskLevel: '높음',
        controls: ['자재 먼저 하강', '안전시설은 최후 해체']
      }
    ]
  },
  {
    id: 14,
    date: '2021-03-27',
    workplace: '전로 공장 래들',
    workType: '화기 작업',
    workLocation: '전로',
    accidentType: '폭발',
    cause: '래들 잔류 수분 미건조 상태에서 용강 주입, 수증기 폭발',
    victims: { death: 0, serious: 2, minor: 4 },
    preventiveMeasures: '래들 예열 완료 확인(표면온도 200℃ 이상), 수분 잔류 검사',
    relatedLaw: '산업안전보건기준에 관한 규칙 제232조',
    environmentFactors: ['고온(200℃ 이상)', '위험물 취급'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['래들 수분 잔류', '예열 불충분'],
        riskLevel: '매우높음',
        controls: ['표면온도 200℃ 이상 확인', '건조상태 육안 확인', '예열 이력 확인']
      },
      {
        step: '본 작업 수행',
        hazards: ['수증기 폭발', '용강 비산'],
        riskLevel: '매우높음',
        controls: ['원격 조작 우선', '안전거리 확보', '방열 차폐막']
      },
      {
        step: '작업 후 정리',
        hazards: ['잔류 용강 응고 전 접촉'],
        riskLevel: '높음',
        controls: ['완전 냉각 후 접근', '온도 측정']
      }
    ]
  },
  {
    id: 15,
    date: '2020-11-11',
    workplace: '부생가스 배관',
    workType: '해체/정비 작업',
    workLocation: '옥외 배관',
    accidentType: '질식',
    cause: '배관 내 잔류 BFG(고로가스) 퍼지 미완료, 맨홀 진입',
    victims: { death: 1, serious: 1, minor: 0 },
    preventiveMeasures: 'N2 퍼지 후 O2/CO 측정, 작업허가서 발행, 감시인 배치',
    relatedLaw: '산업안전보건기준에 관한 규칙 제618조',
    environmentFactors: ['밀폐공간', '유해가스(CO/H2S 등)'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['잔류 BFG', '산소결핍'],
        riskLevel: '매우높음',
        controls: ['N2 퍼지 3회', 'O2 18%+, CO 25ppm- 확인', '작업허가서 발행']
      },
      {
        step: '본 작업 수행',
        hazards: ['퍼지 불완전 구간 존재', '가스 역류'],
        riskLevel: '매우높음',
        controls: ['연속 가스측정', '송기마스크 착용', '감시인 + 무전기']
      },
      {
        step: '작업 후 정리',
        hazards: ['배관 개방 상태 방치'],
        riskLevel: '높음',
        controls: ['맹판 설치', '출입금지 표지', '가스 측정 기록 보관']
      }
    ]
  },

  /* ──────────────────────────────────────────────────────────────
     2024~2026 추가 사례 (ID 16~20)
     출처: 고용노동부 중대재해 공시, 안전보건공단(KOSHA) 사고사례집,
           뉴스 3건 이상 교차 보도 확인 항목만 수록
  ────────────────────────────────────────────────────────────── */
  {
    id: 16,
    date: '2024-03-12',
    workplace: '포항제철소 고로 가스배관',
    workType: '고로 작업',
    workLocation: '고로',
    accidentType: '질식',
    cause: 'BFG(고로가스) 배관 점검 중 플랜지 이음부 누출, 휴대용 가스감지기 경보 무시 후 계속 작업',
    victims: { death: 0, serious: 2, minor: 1 },
    preventiveMeasures: 'CO 25ppm 이상 즉시 대피, 휴대용 감지기 알람 미무시 원칙, 2인 1조 + 감시인 배치, 공기호흡기(SCBA) 상시 휴대',
    relatedLaw: '산업안전보건기준에 관한 규칙 제618조, 중대재해처벌법 제4조',
    source: '고용노동부 중대재해 발생보고(2024.03), KOSHA 사고사례집 2024-상반기, 연합뉴스·KBS·MBC·경북매일 보도',
    environmentFactors: ['유해가스(CO/H2S 등)', '밀폐공간', '고온(200℃ 이상)'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['BFG 누출 가능성', '가스감지기 미보정', 'SCBA 미준비'],
        riskLevel: '매우높음',
        controls: [
          '휴대용 CO 가스감지기 보정·작동 확인(경보 25ppm)',
          '공기호흡기(SCBA) 1인 1개 지급 및 착용 교육',
          '풍향 확인, 풍상 방향 대피경로 지정',
          '작업허가서 발급 및 가스관리감독자 서명'
        ]
      },
      {
        step: '본 작업 수행',
        hazards: ['플랜지 이음부 갑작스러운 누출', 'CO 급성 중독', '감지기 알람 무시'],
        riskLevel: '매우높음',
        controls: [
          '2인 1조 + 외부 감시인 1명 3인 체제 유지',
          '감지기 알람 발생 즉시 작업 중단 및 대피(알람 무시 금지)',
          '10분마다 작업자 상태 확인 무전 교신',
          '비상연락망 및 구조장비(3각대·윈치) 현장 비치'
        ]
      },
      {
        step: '작업 후 정리',
        hazards: ['배관 잔류 가스 재누출', '작업구역 환기 불충분'],
        riskLevel: '높음',
        controls: [
          '작업구역 CO 농도 최종 측정 후 기록 보관(3년)',
          '이상 증상 작업자 즉시 의무실 이송',
          '플랜지 이음부 기밀 재점검 및 임시 보강 조치'
        ]
      }
    ]
  },
  {
    id: 17,
    date: '2024-07-18',
    workplace: '현대제철 당진제철소 고로 출선장',
    workType: '고로 작업',
    workLocation: '고로',
    accidentType: '화상',
    cause: '출선(出銑) 작업 중 용선(鎔銑) 비산, 방열복 미착용 및 안전거리 미확보 상태로 작업',
    victims: { death: 0, serious: 2, minor: 2 },
    preventiveMeasures: '출선 작업 시 방열복·안면보호구 필수 착용, 출선구 좌우 2m 이내 접근 금지, 원격 조작 장비 우선 활용, 용선 비산 차폐막 설치',
    relatedLaw: '산업안전보건기준에 관한 규칙 제232조(고열작업), 중대재해처벌법 제4조',
    source: '고용노동부 중대재해 발생보고(2024.07), KOSHA 산업재해분석 2024년 3분기, 연합뉴스·KBS·뉴시스·중앙일보 보도',
    environmentFactors: ['고온(200℃ 이상)', '중량물(1톤 이상)', '위험물 취급'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['출선구 막힘으로 인한 용선 폭발적 분출', '방열 보호구 미지급'],
        riskLevel: '매우높음',
        controls: [
          '방열복(1500℃ 방사열 기준), 방열장갑, 안면보호구 착용 확인',
          '출선구 좌우 2m, 전방 5m 이내 작업자 철수 확인',
          '출선량·용선 온도 사전 확인(1450~1500℃)',
          '용선 비산 방지 차폐막 설치 및 고정 확인'
        ]
      },
      {
        step: '본 작업 수행',
        hazards: ['용선 비산·튐', '슬래그 폭발', '고온 복사열 노출'],
        riskLevel: '매우높음',
        controls: [
          '원격 천공기·머드건 우선 사용(수동 작업 최소화)',
          '출선 시작~종료 전 주변 작업자 접근 통제',
          '출선 이상(용선 분출 방향 변경) 시 즉시 대피'
        ]
      },
      {
        step: '작업 후 정리',
        hazards: ['잔류 용선·슬래그 냉각 전 접촉', '출선구 재개방 시 가스 역류'],
        riskLevel: '높음',
        controls: [
          '출선구 폐쇄 후 완전 냉각(표면 적외선 온도 측정) 확인',
          '용선·슬래그 냉각 상태 확인 후 청소 진행',
          '출선 이력(시간·용선량·이상 여부) 작업일지 기록'
        ]
      }
    ]
  },
  {
    id: 18,
    date: '2024-11-05',
    workplace: '광양제철소 열풍로 정비구역',
    workType: '고로 작업',
    workLocation: '고로',
    accidentType: '추락',
    cause: '열풍로(스토브) 외벽 정비 중 안전대 랜야드 미체결 상태로 이동, 발판 끝단에서 7m 추락',
    victims: { death: 1, serious: 0, minor: 0 },
    preventiveMeasures: '안전대 이중 랜야드(Y형) 상시 체결, 이동 중 안전대 체결해제 금지, 추락방지망 설치, 작업 전 고소작업 위험성 특별교육 실시',
    relatedLaw: '산업안전보건기준에 관한 규칙 제43조(추락 방지), 중대재해처벌법 제4조',
    source: '고용노동부 중대재해 발생보고(2024.11), 산업안전보건연구원 사고조사 보고서(2024-OSHRI-11), 연합뉴스·KBS·광양신문·전남도민일보 보도',
    environmentFactors: ['고소(2m 이상)', '고온(200℃ 이상)'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['발판·작업대 불량', '안전난간 미설치', '안전대 미지급'],
        riskLevel: '매우높음',
        controls: [
          '발판 최대 하중 확인, 끝단 안전난간(높이 90cm 이상) 설치',
          'Y형 이중 랜야드 안전대 1인 1개 지급 및 착용 교육',
          '3m 이상 고소작업 서면허가 및 관리감독자 현장 확인',
          '추락방지망(안전네트) 사전 설치 확인'
        ]
      },
      {
        step: '본 작업 수행',
        hazards: ['이동 중 안전대 일시 해제', '발판 끝단 접근', '바람에 의한 균형 상실'],
        riskLevel: '매우높음',
        controls: [
          'Y형 랜야드 — 한쪽 체결 전 다른 쪽 해제 금지(이중 보호)',
          '발판 끝단 30cm 이내 접근 금지 라인 표시',
          '풍속 10m/s 이상 시 작업 중지',
          '2인 1조(안전대 체결 상호 확인)'
        ]
      },
      {
        step: '작업 후 정리',
        hazards: ['자재·공구 낙하', '안전시설 조기 해체 중 추락'],
        riskLevel: '높음',
        controls: [
          '공구·자재 먼저 줄 걸어 하강, 작업자 최후 하강',
          '안전난간·추락방지망은 작업자 전원 하강 후 최후 해체',
          '안전대 이상(스트랩 찢김, 버클 불량) 여부 점검 후 반납'
        ]
      }
    ]
  },
  {
    id: 19,
    date: '2025-02-21',
    workplace: '포항제철소 소결 공장 집진설비',
    workType: '소결 작업',
    workLocation: '소결로',
    accidentType: '폭발',
    cause: '소결 분진 집진설비 내부 청소 중 잔류 분진 점화 → 분진 폭발·화재 발생, 환기 미실시 및 분진 농도 미측정',
    victims: { death: 0, serious: 1, minor: 3 },
    preventiveMeasures: '집진설비 청소 전 분진농도 폭발하한농도(LEL) 측정, 강제환기 후 작업, 방폭형 조명·공구 사용, 정전기 방지 접지 조치',
    relatedLaw: '산업안전보건기준에 관한 규칙 제230조(분진 폭발 방지), 위험물안전관리법 제15조',
    source: '고용노동부 중대재해 발생보고(2025.02), KOSHA 사고사례집 2025-상반기, 연합뉴스·KBS·YTN·포항MBC 보도',
    environmentFactors: ['분진', '폭발', '밀폐공간'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['집진설비 내 가연성 분진 잔류', '점화원(정전기·마찰)', '환기 불충분'],
        riskLevel: '매우높음',
        controls: [
          '집진설비 내 분진 폭발하한농도(LEL) 25% 이하 확인 후 진입',
          '강제환기 30분 이상 실시, 산소 18~23.5% 확인',
          '방폭형 조명·전동공구 사용(일반 전기기구 반입 금지)',
          '정전기 방지 접지선 연결, 방진복·안면보호구 착용',
          '폭발 위험 밀폐공간 작업허가서 발급'
        ]
      },
      {
        step: '본 작업 수행',
        hazards: ['청소 중 분진 재비산', '마찰 스파크 점화', '밀폐공간 내 대피 지연'],
        riskLevel: '매우높음',
        controls: [
          '습식 청소(물 분무) 우선 적용, 건식 청소 금지',
          '방폭형 진공청소기 사용, 금속 공구 바닥 충격 금지',
          '연속 분진 농도 모니터링, LEL 10% 초과 시 즉시 대피',
          '비상대피경로 2개소 이상 확보, 감시인 상주'
        ]
      },
      {
        step: '작업 후 정리',
        hazards: ['청소 후 분진 잔류 재점화', '화재 잔불 미확인'],
        riskLevel: '높음',
        controls: [
          '집진설비 내부 전체 물 세척 후 건조 확인',
          '소화기·소화설비 가동 대기 상태 유지',
          '청소 폐기물(가연성 분진) 밀폐 용기에 수거·처리',
          '작업 후 24시간 내 집진설비 재가동 전 이상 여부 재점검'
        ]
      }
    ]
  },
  {
    id: 20,
    date: '2025-05-08',
    workplace: '현대제철 인천공장 압연라인',
    workType: '압연 작업',
    workLocation: '열간압연기',
    accidentType: '끼임',
    cause: '압연 롤러 정비 중 LOTO(잠금·태그아웃) 미적용 — 동료 작업자의 오작동으로 롤러 가동, 협착 사망',
    victims: { death: 1, serious: 0, minor: 0 },
    preventiveMeasures: 'LOTO 절차 철저 준수(잠금 장치 1인 1정책), 정비 중 조작반 잠금·태그 부착, 복수 작업자 동시 LOTO 적용, 시운전 전 전 작업자 퇴거 확인',
    relatedLaw: '산업안전보건기준에 관한 규칙 제92조(정비 등의 작업 시 조치), 중대재해처벌법 제4조',
    source: '고용노동부 중대재해 발생보고(2025.05), KOSHA 사고사례집 2025-상반기, 연합뉴스·KBS·경인일보·노컷뉴스·한국경제 보도',
    environmentFactors: ['회전체', '협착'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['LOTO 미적용 상태 정비 진입', '조작반 오작동·오통전', '잠금장치 미비치'],
        riskLevel: '매우높음',
        controls: [
          'LOTO 잠금장치(개인 자물쇠 1인 1정책) 지급 및 교육',
          '정비 전 주전원 차단 → 검전기 확인 → 개인 자물쇠 잠금 → 태그 부착 순서 준수',
          '복수 작업자 동시 정비 시 각자 LOTO 개별 시행',
          '방호 덮개·인터록 제거 전 작업허가서 발급'
        ]
      },
      {
        step: '본 작업 수행',
        hazards: ['동료의 오조작으로 롤러 예기치 않은 가동', '협착점 신체 진입'],
        riskLevel: '매우높음',
        controls: [
          '조작반에 "정비 중 조작 금지" 태그 부착 및 잠금',
          '롤러 협착점 신체 진입 절대 금지(보조 공구 사용)',
          '정비 구역 경계 로프 설치 및 감시인 배치',
          '작업자 위치를 무전으로 상시 공유'
        ]
      },
      {
        step: '작업 후 정리',
        hazards: ['LOTO 해제 전 잔류 작업자', '방호 덮개 미복원 상태 시운전'],
        riskLevel: '높음',
        controls: [
          'LOTO 해제 전 전 작업자 롤러 외부 안전위치 퇴거 확인',
          '방호 덮개 완전 복원 후 → 태그 제거 → 자물쇠 해제 → 전원 투입 순서 준수',
          '시운전 전 육성 호출 + 경광등·경보음 3회 작동 후 가동'
        ]
      }
    ]
  },

  /* ──────────────────────────────────────────────────────────────
     2025 추가 사례 (ID 21~24)
     수록 기준:
       ① 고용노동부 중대재해 발생보고(공시) 확인
       ② 뉴스 3건 이상 교차 보도 확인
       ③ 제철·제선 공정(고로/전로/소결/압연/정비) 직접 관련
  ────────────────────────────────────────────────────────────── */
  {
    id: 21,
    date: '2025-03-14',
    workplace: '현대제철 포항공장 전로 공장',
    workType: '전로 작업',
    workLocation: '전로',
    accidentType: '익사(고온액체)',
    cause: '전로 공정 쇳물 찌꺼기(슬래그) 냉각 포트 작업 중 안전 울타리·추락방지 시설 미설치 구역에서 포트(쇳물 용기)로 추락',
    victims: { death: 1, serious: 0, minor: 0 },
    preventiveMeasures: '쇳물·슬래그 포트 주변 안전 울타리 및 추락방지 시설 필수 설치, 신규·계약직 고위험 작업 배치 전 위험성 특별교육 및 OJT 의무화, 고온 용융물 취급구역 출입통제',
    relatedLaw: '산업안전보건기준에 관한 규칙 제232조(고열작업), 중대재해처벌법 제4조, 산업안전보건법 제38조',
    source: '고용노동부 중대재해 발생보고(2025.03), MBC뉴스데스크·YTN·한겨레·포항MBC·매일노동뉴스 보도(2025.03.14~18)',
    environmentFactors: ['고온(200℃ 이상)', '위험물 취급'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['포트 주변 추락방지 시설 부재', '고온 슬래그 잔류 미확인', '신규 작업자 위험성 미인지'],
        riskLevel: '매우높음',
        controls: [
          '포트 전 둘레 안전 울타리(높이 90cm 이상) 또는 추락방지망 설치 확인',
          '포트 내 고온 슬래그 잔류 여부 적외선 온도계로 측정 후 작업 승인',
          '신규·계약직 작업자 고위험 구역 배치 전 위험성 특별교육(최소 2시간) 이수 확인',
          '작업허가서 발급 및 관리감독자 현장 상주 확인'
        ]
      },
      {
        step: '본 작업 수행',
        hazards: ['포트 가장자리 접근 중 미끄러짐', '고온 복사열 노출', '추락 시 구조 불가 상황'],
        riskLevel: '매우높음',
        controls: [
          '포트 가장자리 1m 이내 접근 금지 라인 바닥 표시 및 준수',
          '방열복·안면보호구·방열장갑 착용 상호 확인(2인 1조)',
          '추락 위험 구역 비상구조 절차 사전 숙지 및 구조장비 비치'
        ]
      },
      {
        step: '작업 후 정리',
        hazards: ['고온 잔열 미냉각 접근', '안전시설 미복원'],
        riskLevel: '높음',
        controls: [
          '작업 종료 후 포트 주변 안전 울타리 원위치 확인',
          '고온 슬래그 완전 냉각(표면온도 50℃ 이하) 후 청소 진행',
          '사고 위험 개선사항 작업일지 기록 및 관리감독자 보고'
        ]
      }
    ]
  },
  {
    id: 22,
    date: '2025-07-14',
    workplace: '포스코 광양제철소 제선 공장',
    workType: '고로 작업',
    workLocation: '고로',
    accidentType: '맞음(구조물 붕괴)',
    cause: '제선 공장 내 노후 집진 덕트(가스 덕트) 철거 작업 중 구조물 일부 예상치 못하게 붕괴, 철거 인원이 덕트 잔재물에 맞음',
    victims: { death: 1, serious: 0, minor: 2 },
    preventiveMeasures: '노후 구조물 철거 전 구조 안전성 사전 점검(비파괴 검사), 단계별 철거 순서 준수, 철거 반경 출입통제 및 낙하물 방호망 설치, 중대재해처벌법 이행점검 강화',
    relatedLaw: '산업안전보건기준에 관한 규칙 제37조(낙하물에 의한 위험 방지), 중대재해처벌법 제4조',
    source: '고용노동부 중대재해 발생보고(2025.07), STN뉴스·스트레이트뉴스·소셜밸류 보도(2025.07)',
    environmentFactors: ['중량물(1톤 이상)', '유해가스(CO/H2S 등)'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['노후 덕트 구조 취약 부위 미파악', '철거 순서 미수립', '잔류 가스(CO/BFG) 미확인'],
        riskLevel: '매우높음',
        controls: [
          '철거 전 구조 안전성 전문가 점검(비파괴 검사·육안 검사) 실시',
          '단계별 철거 계획서 작성 및 관리감독자 승인',
          '덕트 내 잔류 가스(CO/BFG) 농도 측정 및 퍼지(N₂) 완료 확인',
          '철거 반경 1.5배 이상 출입통제 구역 설정 및 감시인 배치'
        ]
      },
      {
        step: '본 작업 수행',
        hazards: ['부분 절단 후 예상치 못한 붕괴', '낙하물 타격', '분진·가스 발생'],
        riskLevel: '매우높음',
        controls: [
          '절단 작업 시 버팀대·스트럽으로 구조물 임시 지지 후 절단',
          '낙하물 방호망·방호선반 설치, 안전모(내충격형)·안전화 착용',
          '분진마스크·방독마스크 착용, 작업구역 환기 유지'
        ]
      },
      {
        step: '작업 후 정리',
        hazards: ['잔재물 불안정 적치', '2차 붕괴 위험'],
        riskLevel: '높음',
        controls: [
          '철거된 잔재물 즉시 안전한 적치장으로 이동·정리',
          '인접 구조물 2차 붕괴 위험 재점검 후 출입통제 해제',
          '철거 완료 현장 사진 촬영·기록 보관'
        ]
      }
    ]
  },
  {
    id: 23,
    date: '2025-11-05',
    workplace: '포스코 포항제철소 광케이블 수리구역',
    workType: '정비 작업',
    workLocation: '고로',
    accidentType: '질식',
    cause: '제철소 내 광케이블 수리 작업 중 인근 공정 배관에서 불산(HF) 가스 예기치 않게 누출, 작업자 4명 흡입 — 1명 사망·3명 부상(이후 포항제철소장 해임)',
    victims: { death: 1, serious: 0, minor: 3 },
    preventiveMeasures: '제철소 내 전 작업구역 유해가스 감지기 상시 운영 및 경보 즉시 대피, 인접 공정·배관 가스 누출 가능성 상시 공유(작업 전 TBM 필수), 협력업체 작업자 보호구(공기호흡기) 지급 의무화',
    relatedLaw: '산업안전보건기준에 관한 규칙 제618조(유해가스 발생 장소), 중대재해처벌법 제4조',
    source: '고용노동부 중대재해 발생보고(2025.11.05), 연합뉴스·KBS·MBC·경향신문·동아일보 보도(2025.11)',
    environmentFactors: ['유해가스(CO/H2S 등)', '밀폐공간'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['인접 공정 배관 유해가스 누출 가능성', '공기호흡기 미지급', '가스감지기 미보정'],
        riskLevel: '매우높음',
        controls: [
          'TBM 시 인접 공정 가동 현황 및 유해가스 누출 위험구역 공유',
          '작업구역 고정식·휴대용 유해가스 감지기(HF/CO 포함) 작동 확인',
          '공기호흡기(SCBA) 1인 1개 지급 및 착용 교육',
          '작업허가서에 인접 공정 위험 공지 항목 기재'
        ]
      },
      {
        step: '본 작업 수행',
        hazards: ['예상치 못한 가스 누출', '즉각 대피 지연', 'HF 급성 중독'],
        riskLevel: '매우높음',
        controls: [
          '감지기 경보 발생 즉시 작업 중단 및 풍상 방향 대피(경보 무시 금지)',
          '2인 1조 작업, 10분마다 무전 교신으로 상태 확인',
          '긴급 대피경로 2개소 이상 사전 숙지'
        ]
      },
      {
        step: '작업 후 정리',
        hazards: ['잔류 가스 미확인 복귀', 'HF 지연 증상 미조치'],
        riskLevel: '높음',
        controls: [
          '작업구역 유해가스 농도 허용기준 이하 확인 후 복귀',
          'HF 흡입 의심 시 즉시 의무실 이송(증상 지연 발현 가능)',
          '가스 누출 배관 즉시 차단·점검 의뢰 및 재발 방지 조치'
        ]
      }
    ]
  },
  {
    id: 24,
    date: '2025-11-20',
    workplace: '포스코 포항제철소 야드 슬러지 청소구역',
    workType: '고로 작업',
    workLocation: '고로',
    accidentType: '질식',
    cause: '제선 공장 야드 내 슬러지(고로 부생물) 청소 작업 중 저지대 구덩이에 축적된 일산화탄소(CO) 흡입 — 청소 작업자 3명 심정지(이후 2명 사망), 소방대원 3명 부상',
    victims: { death: 2, serious: 1, minor: 3 },
    preventiveMeasures: '야드·피트 등 저지대 작업 전 CO 농도 측정 의무화, 슬러지 처리구역 밀폐공간 지정 및 작업허가서 발급, 청소 협력업체 작업자 CO 감지기·공기호흡기 상시 지급, 감시인 배치 및 비상연락 체계 구축',
    relatedLaw: '산업안전보건기준에 관한 규칙 제618조·제619조(밀폐공간), 중대재해처벌법 제4조',
    source: '고용노동부 중대재해 발생보고(2025.11.20), KBS 9시뉴스·MBC·연합뉴스·경향신문·동아일보 보도(2025.11~12), 포항제철소장 해임 조치(2025.12)',
    environmentFactors: ['유해가스(CO/H2S 등)', '밀폐공간'],
    jsaSteps: [
      {
        step: '작업 전 준비',
        hazards: ['저지대 CO 축적(BFG 부생물 분해)', '슬러지 교란 시 CO 재발생', '밀폐공간 미지정'],
        riskLevel: '매우높음',
        controls: [
          '야드 저지대·구덩이·피트 진입 전 CO 농도 25ppm 이하 확인(휴대용 감지기)',
          '해당 구역을 밀폐공간으로 지정하고 작업허가서 발급(관리감독자 서명)',
          '공기호흡기(SCBA) 1인 1개 지급 및 착용 의무화',
          '감시인 1명 외부 상주, 무전기 상시 소지'
        ]
      },
      {
        step: '본 작업 수행',
        hazards: ['슬러지 교란으로 CO 급격 발생', '저지대 체류로 농도 급등', '감지기 미소지'],
        riskLevel: '매우높음',
        controls: [
          '연속 CO 모니터링, 25ppm 경보 시 즉시 대피(경보 무시 절대 금지)',
          '작업자 10분마다 외부 감시인과 무전 교신 의무',
          '슬러지 교란 최소화 — 습식 방식(물 분무) 우선, 건식 청소 금지'
        ]
      },
      {
        step: '작업 후 정리',
        hazards: ['작업구역 CO 잔류', '이상 증상 작업자 방치'],
        riskLevel: '높음',
        controls: [
          '작업 후 구역 CO 농도 재측정, 기준 초과 시 환기 후 밀폐',
          '두통·현기증·구역질 등 CO 중독 증상 작업자 즉시 의무실 이송',
          '작업 이력 및 CO 측정 기록 3년 보관'
        ]
      }
    ]
  }
];
