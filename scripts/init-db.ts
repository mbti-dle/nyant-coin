import sql from '../lib/database'

async function initDb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS hints (
        id SERIAL PRIMARY KEY,
        brief_content TEXT NOT NULL,
        full_content_match TEXT NOT NULL,
        full_content_mismatch TEXT NOT NULL,
        category TEXT NOT NULL
      )
    `

    await sql`DELETE FROM hints`

    const hintsData = [
      {
        brief_content: '태풍이 가까워지고 있다… 어부들이 출항을 꺼릴지도?',
        full_content_match:
          '태풍으로 인해 어부들이 출항을 줄여 어획량이 감소했습니다. 생선 가격이 특등했습니다!',
        full_content_mismatch: '태풍의 영향으로 사람들이 불안해했지만 가격이 상승하지 않았습니다.',
        category: '상승',
      },
      {
        brief_content: '대형 어시장 출제! 생선 수요 급증 예상!',
        full_content_match: '수제에 맞물린 사람들이 물리듯이 가격이 상승했습니다!',
        full_content_mismatch: '축제가 예상보다 조용하게 꾸니 생선 가격이 하락했습니다.',
        category: '상승',
      },
      {
        brief_content: '대형 해양 보호 단체의 불법어업 단속! 어획이 감소 예상.',
        full_content_match: '대대적인 단속으로 어부들이 조업을 자제 생선 가격이 급등했습니다!',
        full_content_mismatch: '단속이 허술하여 어획량 감소가 없어 생선 가격이 하락했습니다.',
        category: '상승',
      },
      {
        brief_content: '치어에 강풍 예보. 성선가게들이 일찍 문을 수도 있어!',
        full_content_match: '강풍에 가게들이 운영을 중단해 가격이 소폭 상승했습니다.',
        full_content_mismatch: '강풍이 예상보다 약해 가게들이 운영을 계속하고 있습니다.',
        category: '상승',
      },
      {
        brief_content: '주변 해역에서 상어 출몰 경고!',
        full_content_match: '상어의 위험으로 어부들이 출항을 포기했습니다. 가격이 특등했습니다.',
        full_content_mismatch: '상어 경고는 과도 했고 보니 조업에 문제가 없어 가격이 하락했습니다.',
        category: '상승',
      },
      {
        brief_content: '대형 해양 오염 경고! 어부들이 조업을 중단할 예정.',
        full_content_match:
          '해양 오염이 심각해져 어부들이 조업을 전면 중단했습니다. 공급이 급감해 가격이 특등했습니다.',
        full_content_mismatch:
          '오염 경고배 과부 어부들이 출항을 하소했습니다. 공급이 늘어 가격이 소폭 상승했습니다.',
        category: '상승',
      },
      {
        brief_content: '어부들이 바다에 돌아갔다. 생선 가격이 급등할 수도!',
        full_content_match:
          '바다 어부들이 파업에 참여해 생선 공급이 줄었습니다. 가격이 소폭 상승했습니다.',
        full_content_mismatch:
          '바다의 회복로 물트가 풍성해 공급이 늘었습니다. 가격이 대폭 하락했습니다.',
        category: '상승',
      },
      {
        brief_content: '신비로운 해양 생물이 나타나면 생선 가격이 요동친다는 설이…',
        full_content_match:
          '전설의 해양 생물이 나타났습니다! 가격이 급등지면서 가격이 특등했습니다!',
        full_content_mismatch:
          '해양 생물의 정체는 천조국으로 드러났는데, 어부들이 조업에 나서면서 가격이 하락했습니다.',
        category: '상승',
      },
      {
        brief_content: '지난 보고서: 오메가3가 자가 경의! 생선 수요 급증했까?',
        full_content_match:
          '오메가-3의 효능이 알려져 엄청난게 건강 관련 열풍이 일었습니다. 수요가 급증해 가격이 특등했습니다.',
        full_content_mismatch:
          '건강에 대한 관심이 높아져 생선 소비가 조금 늘었습니다. 가격이 소폭 상승했습니다.',
        category: '상승',
      },
      {
        brief_content:
          '우리 대형 프로그램 담당요리사 대박! 생선 가격에 불리드는 편봐, 재고 부족 사태 올까?',
        full_content_match:
          '프로그램의 인기로 엄청난 인기를 끌며 생선 가게 앞은 인산인해에 수요 급등으로 가격이 특등했습니다.',
        full_content_mismatch:
          '방송의 효과가 크지 않아 생선 수요가 조금 늘었습니다. 가격이 소폭 하락했습니다.',
        category: '상승',
      },
      {
        brief_content: '발전소에 보름달! 어부들이 더 열심히 일할 듯?',
        full_content_match:
          '보름달의 환한 빛줄기로 어부들이 밤새 조업을 이어갔습니다. 공급이 급증해 생선 가격이 폭락했습니다.',
        full_content_mismatch:
          '보름달에도 생선이 잘 잡히지 않아 공급이 부족했습니다. 가격이 소폭 상승했습니다.',
        category: '하강',
      },
      {
        brief_content: '새로운 대규모 냉동창고 완공!',
        full_content_match:
          '대형 냉동창고가 완공되어 생선을 대량 보관할 수 있게 되었습니다. 공급이 안정되며 가격이 폭락했습니다.',
        full_content_mismatch:
          '냉동창고는 완공됐지만 전력공급 문제로 운영이 제대로 되지 않아 생선 공급에 차질이 생기면서 가격이 특등했습니다.',
        category: '하강',
      },
      {
        brief_content: '대어 뉴스 : 생선 가격이 곧 폭락할 거라는 소문이 파다고 있어!',
        full_content_match:
          '생선 기껍 소식 조업이 원활해 공급량이 많았습니다. 공급이 늘자 가격이 폭락했습니다.',
        full_content_mismatch:
          '소문대로 공급이 많해 생선 가격이 급등했습니다. 수요가 많아져 가격이 특등했습니다.',
        category: '하강',
      },
      {
        brief_content: '어민 어부들이 새로운 고효율 그물을 사용 중!',
        full_content_match:
          '고효율 그물의 덕분으로 어부들이 많은 생선을 잡아 가격이 대폭 하락했습니다.',
        full_content_mismatch:
          '고효율 그물의 성능으로 어부들이 더 많은 실신을 잡아 가격이 하락했습니다.',
        category: '하강',
      },
      {
        brief_content: '어민들의 최신 물고기 탐지 장비를 도입했대!',
        full_content_match:
          '최신 탐지 장비 덕분에 어부들이 물고기를 쉽게 잡아내 대량으로 잡았습니다.',
        full_content_mismatch:
          '새 장비가 기대에 미치지 못해 어부들이 조업을 제대로 못 했습니다. 공급이 줄어 가격이 특등했습니다.',
        category: '하강',
      },
      {
        brief_content: '밸등해이 어려운는 날씨는 물고기들이 산란하기에 좋다는데 소문이…',
        full_content_match:
          '밸등해이 따뜻한 물고기들이 대거 잡혔습니다! 생선 공급 과잉으로 가격이 폭락했습니다.',
        full_content_mismatch:
          '밸등해이 물어져면서 물고기들이 잡기 힘들었습니다. 공급 감소로 가격이 소폭 상승했습니다.',
        category: '하강',
      },
      {
        brief_content: '새해를 특별 주간보다 개장되었습니다.',
        full_content_match:
          '새해 맘데에 생선이 소급 너 잡혀 공급과잉 되었습니다! 공급 부족으로 가격이 폭락했습니다.',
        full_content_mismatch:
          '새해 대목 특수에 맞춰 생선 수요가 급증했습니다. 가격이 대폭 상승했습니다.',
        category: '하강',
      },
      {
        brief_content: '인근 국가와의 어업 협정이 체결되었습니다.',
        full_content_match:
          '어업 협정 덕분에 물고기가 대량으로 잡혔습니다! 공급이 늘어 가격이 하락했습니다.',
        full_content_mismatch:
          '협정 대상 해역에 물고기 없어나 조업이 중단되었습니다! 공급 부족으로 가격이 특등했습니다.',
        category: '하강',
      },
      {
        brief_content: '인공지능 어군 탐지 시스템이 도입됐대!',
        full_content_match:
          'AI 시스템이 물고기 무리를 잘 찾아 조업이 원활했습니다! 공급 부족으로 가격이 특등했습니다.',
        full_content_mismatch:
          'AI가 기대만큼 성능을 내지 못해 물고기가 잘 잡히지 않았습니다. 가격이 상승했습니다.',
        category: '하강',
      },
      {
        brief_content: '수산물 시장에 새로운 경쟁자가 등장했대!',
        full_content_match: '경쟁자가 가격을 낮춤으로써 시장에 공급이 늘어나 가격이 하락했습니다.',
        full_content_mismatch:
          '경쟁자가 등장했지만 큰 영향을 미치지 못했습니다. 가격이 소폭 상승했습니다.',
        category: '하강',
      },
    ]

    await sql`
      INSERT INTO hints ${sql(hintsData, 'brief_content', 'full_content_match', 'full_content_mismatch', 'category')}
    `

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
  } finally {
    await sql.end()
  }
}

initDb()
