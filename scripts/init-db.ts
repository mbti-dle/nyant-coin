import sql from '../lib/database'

async function initDb() {
  try {
    await sql`DROP TABLE IF EXISTS hints`

    await sql`
      CREATE TABLE IF NOT EXISTS hints (
        id SERIAL PRIMARY KEY,
        brief_content TEXT NOT NULL,
        full_content_match_big TEXT NOT NULL,
        full_content_match_small TEXT NOT NULL,
        full_content_mismatch_big TEXT NOT NULL,
        full_content_mismatch_small TEXT NOT NULL,
        category TEXT NOT NULL
      )`

    const hintsData = [
      {
        brief_content: '내일 지역 축제 예정! 생선 수요 급증 예상! (🔺예상)',
        full_content_match_big: '축제 대성공으로 생선 수요가 폭등했습니다',
        full_content_match_small: '축제에 방문한 사람들이 몰려들며 가격이 상승했습니다',
        full_content_mismatch_big: '폭우로 축제가 취소되며 생선 땡처리로 가격이 폭락했습니다',
        full_content_mismatch_small: '축제가 예상보다 조용하게 끝나 생선 가격이 하락했습니다',
        category: '상승',
      },
      {
        brief_content: '태풍이 가까워지고 있다… 어부들이 출항을 꺼릴지도? (🔺예상)',
        full_content_match_big: '태풍으로 인해 어부들이 출항을 중단하면서 생선 가격이 폭등했습니다',
        full_content_match_small: '태풍의 영향으로 어획량이 줄어 생선 가격이 상승했습니다',
        full_content_mismatch_big: '태풍에 수백 마리의 생선이 시장으로 날라와 가격이 폭락했습니다',
        full_content_mismatch_small: '태풍에도 일부 용감한 어부들이 출항해 가격이 하락했습니다',
        category: '상승',
      },
      {
        brief_content:
          '내일 해양 보호 단체인 참치보호단의 캠페인이 예정. 어획량 감소 예상 (🔺예상)',
        full_content_match_big: '캠페인으로 어부들이 조업을 대거 중단해 생선 가격이 급등했습니다',
        full_content_match_small: '소규모 어부들만 참여해 가격이 소폭 상승했습니다',
        full_content_mismatch_big: '캠페인이 취소되어 오히려 생선 가격이 폭락했습니다',
        full_content_mismatch_small: '기대했던 캠페인의 효과가 미미했습니다',
        category: '상승',
      },
      {
        brief_content: '저녁에 강풍 예보. 생선가게들이 일찍 닫을 수도 있어! (🔺예상)',
        full_content_match_big: '강풍으로 시장이 날아가 버려 생선 공급이 폭등 중입니다',
        full_content_match_small: '강풍에 가게들이 운영을 중단해 가격이 소폭 상승했습니다',
        full_content_mismatch_big: '시원한 바람에 시장이 인산인해입니다',
        full_content_mismatch_small: '강풍이 예상보다 약해 가게들이 운영을 계속하고 있습니다',
        category: '상승',
      },
      {
        brief_content: '주변 해역에서 상어 출몰 경고! (🔺예상)',
        full_content_match_big: '상어의 위협으로 어부들이 출항을 포기해 가격이 폭등했습니다',
        full_content_match_small: '상어 경고로 일부만 조업에 나서 공급이 줄고 가격이 상승했습니다',
        full_content_mismatch_big: '상어 출몰 경고는 헛소문으로 오히려 가격이 폭락했습니다',
        full_content_mismatch_small: '출몰한 상어는 알고 보니 죠스바였습니다',
        category: '상승',
      },
      {
        brief_content: '내일 해양 오염 경고! 어부들이 조업을 중단할 예정 (🔺예상)',
        full_content_match_big: '해양 오염 주의로 조업이 전면 중단돼 가격이 폭등했습니다',
        full_content_match_small: '오염 경고 출항 취소로 공급이 줄어 가격이 소폭 상승했습니다',
        full_content_mismatch_big: '오염 경고 오보로 어부들이 조업을 진행하며 가격이 폭락했습니다',
        full_content_mismatch_small: '오염이 예상보다 심하지 않아 어부들이 대부분 출항했습니다',
        category: '상승',
      },
      {
        brief_content: '어부들이 파업에 들어갔다. 생선 가격이 급등할 수도! (🔺예상)',
        full_content_match_big: '파업 장기화로 공급이 중단돼 생선은 귀한 식재료가 되었습니다',
        full_content_match_small: '어부들의 파업으로 공급에 갈등을 겪어 가격이 소폭 상승했습니다',
        full_content_mismatch_big: '파업이 끝나 어부들이 조업에 복귀해 가격이 대폭 증가했습니다',
        full_content_mismatch_small:
          '파업은 취소지만 출항은 예상보다 적어 가격이 소폭 하락했습니다',
        category: '상승',
      },
      {
        brief_content: '신비로운 해양 생물이 나타나면 생선 가격이 요동친다는 전설이… (🔺예상)',
        full_content_match_big: '전설의 해양 생물 출현으로 가격이 요동쳐 가격이 폭등했습니다',
        full_content_match_small: '신비로운 소문에 어부들이 출항을 망설여 가격이 소폭 상승했습니다',
        full_content_mismatch_big: '전설의 해양 생물이 출현했지만 가격이 폭락했습니다',
        full_content_mismatch_small: '해양 생물의 전설은 헛소문으로 밝혀져 가격이 하락했습니다',
        category: '상승',
      },
      {
        brief_content: '건강 보고서: 오메가-3 섭취 권장! 생선 수요 급증할까? (🔺예상)',
        full_content_match_big: '오메가-3 효능의 뉴스보도로 수요가 급증해 가격이 폭등했습니다',
        full_content_match_small: '웰빙 열풍으로 생선 소비가 늘어나 가격이 소폭 상승했습니다',
        full_content_mismatch_big: '오메가-3가 질병을 유발한다는 뉴스보도로 가격이 폭락했습니다',
        full_content_mismatch_small: '오메가-3 수요가 미미하게 줄어 가격이 소폭 하락했습니다',
        category: '상승',
      },
      {
        brief_content: '요리 프로그램 냥멍요리사 대박! 생선 재고 부족 사태 올까? (🔺예상)',
        full_content_match_big: '방송이 인기를 끌며 팬들의 인산인해로 가격이 폭등했습니다',
        full_content_match_small: '방송의 인기로 생선 수요가 증가해 가격이 소폭 상승했습니다',
        full_content_mismatch_big: '이번 주 방송 주제는 고기여서, 생선 가격이 폭락했습니다',
        full_content_mismatch_small:
          '방송의 효과가 미미해 생선 수요가 줄어 가격이 소폭 하락했습니다',
        category: '상승',
      },
      {
        brief_content: '밤하늘에 보름달! 어부들이 더 열심히 일할 듯? (🔻예상)',
        full_content_match_big: '보름달로 밤새 조업에 성공해 생선 가격이 폭락했습니다',
        full_content_match_small:
          '보름달로 어부들의 작업량이 증가해 공급과다로 가격이 하락했습니다',
        full_content_mismatch_big:
          '보름달에 불구하고 어부들이 조업을 하지 않아 가격이 폭등했습니다',
        full_content_mismatch_small: '보름달에도 생선이 잘 잡히지 않아 가격이 소폭 상승했습니다',
        category: '하강',
      },
      {
        brief_content: '새로운 대규모 냉동창고 완공! (🔻예상)',
        full_content_match_big: '대형 냉동창고로 생선 보관! 공급 안정으로 가격이 폭락했습니다',
        full_content_match_small: '새로운 냉동창고로 보관 용량 증가! 생선 가격이 하락했습니다',
        full_content_mismatch_big: '창고는 완공됐지만 관리 문제로 생선 공급에 차질이 생겼습니다',
        full_content_mismatch_small:
          '냉동창고가 아직 가동 전이라 공급이 부족해 가격이 상승했습니다',
        category: '하강',
      },
      {
        brief_content: '냥이 뉴스 : 생선 가격이 곧 폭락할 거라는 소문이 퍼지고 있어! (🔻예상)',
        full_content_match_big: '생선 가격 폭락 소문이 현실로! 공급이 넘쳐 가격이 폭락했습니다',
        full_content_match_small: '소문대로 공급이 다소 증가해 가격이 소폭 하락했습니다',
        full_content_mismatch_big: '소문과는 반대로 생선 가격이 급등해 가격이 폭등했습니다',
        full_content_mismatch_small: '폭락 소문이 무색하게 가격이 오름세를 보였습니다',
        category: '하강',
      },
      {
        brief_content: '인근 어부들이 새로운 고효율 그물을 사용 중! (🔻예상)',
        full_content_match_big: '엄청난 양의 생선이 잡혔습니다. 이로 인해 가격이 폭락했습니다.',
        full_content_match_small: '고효율 그물 도입! 생선량 공급 대폭 증가로 가격이 하락했습니다',
        full_content_mismatch_big: '돌고래 떼가 나타나 생선을 다 쫓아버렸습니다',
        full_content_mismatch_small: '새 그물에 문제가 생겨 조업이 지연되었습니다',
        category: '하강',
      },
      {
        brief_content: '어민들이 최신 물고기 탐지 장비를 도입했다! (🔻예상)',
        full_content_match_big: '최신 탐지 장비로 물고기를 쉽게 찾아내 대량 포획에 성공했습니다',
        full_content_match_small: '최신 장비로 더 많은 물고기가 잡혀 가격이 하락했습니다',
        full_content_mismatch_big: '최신 장비가 고장이 나면 공급이 줄어 가격이 폭등했습니다',
        full_content_mismatch_small:
          '최신 장비 도입이 기대에 미치지 못해 생선 공급이 부족해졌습니다',
        category: '하강',
      },
      {
        brief_content: '별똥별이 떨어지는 날에는 물고기가 신비롭게 많이 잡힌다는 소문이.. (🔻예상)',
        full_content_match_big: '실제로 별똥별이 떨어진 후 엄청난 양의 물고기들이 잡혔습니다!',
        full_content_match_small: '별똥별의 신비한 힘? 생선 공급이 늘어 가격이 하락했습니다',
        full_content_mismatch_big: '떨어진 건 별똥별이 아닌 우주 쓰레기였습니다.',
        full_content_mismatch_small:
          '별똥별은 헛소문이었습니다. 공급이 적어 가격이 소폭 상승했습니다',
        category: '하강',
      },
      {
        brief_content: '내일은 폭염 주의보가 발령됩니다 (🔻예상)',
        full_content_match_big: '폭염으로 대량 포획 성공! 공급 과잉으로 가격이 폭락했습니다',
        full_content_match_small: '잠깐 더운 날씨로 생선이 많이 잡혀 가격이 소폭 하락했습니다',
        full_content_mismatch_big: '폭염 대신 태풍이 불어 조업이 중단되었습니다!',
        full_content_mismatch_small: '시원한 바람이 불어 공급이 줄고 가격이 소폭 상승했습니다',
        category: '하강',
      },
      {
        brief_content: '인접 국가와의 어업 협정이 체결되었습니다 (🔻예상)',
        full_content_match_big: '어업 협정으로 대량 포획 성공! 공급이 넘쳐 가격이 폭락했습니다',
        full_content_match_small: '협정으로 생선 공급이 늘어나 가격이 하락했습니다',
        full_content_mismatch_big: '협정 대신 해양 분쟁이 일어나 조업이 중단되었습니다!',
        full_content_mismatch_small:
          '협정이 체결되지 않았고, 생선 공급이 감소해 가격이 상승했습니다',
        category: '하강',
      },
      {
        brief_content: '인공지능 어군 탐지 시스템이 도입됩니다 (🔻예상)',
        full_content_match_big: '탐지 시스템의 대량 포획으로 공급이 넘쳐 가격이 폭락했습니다',
        full_content_match_small: '탐지 시스템으로 공급이 늘어나 가격이 하락했습니다',
        full_content_mismatch_big:
          '시스템 오류로 조업이 중단되었습니다! 이로인해 가격이 폭등했습니다',
        full_content_mismatch_small: 'AI가 기대만큼 성과를 내지 못했습니다. 가격이 상승했습니다',
        category: '하강',
      },
      {
        brief_content: '수산물 시장에 새로운 경쟁자가 등장했다! (🔻예상)',
        full_content_match_big: '경쟁자가 생선을 대량으로 공급해 가격이 폭락했습니다',
        full_content_match_small: '경쟁자가 가격을 낮추면서 공급이 늘어나 가격이 하락했습니다',
        full_content_mismatch_big:
          '경쟁자 소문은 헛소문이었습니다. 공급 부족으로 가격이 폭등했습니다',
        full_content_mismatch_small:
          '경쟁자가 시장에 큰 영향을 미치지 못해 가격이 소폭 상승했습니다',
        category: '하강',
      },
    ]

    await sql`
      INSERT INTO hints ${sql(
        hintsData,
        'brief_content',
        'full_content_match_big',
        'full_content_match_small',
        'full_content_mismatch_big',
        'full_content_mismatch_small',
        'category'
      )}
    `

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
  } finally {
    await sql.end()
  }
}

initDb()
